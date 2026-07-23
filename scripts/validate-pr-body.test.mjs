import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  formatAllowedProjects,
  parseClosesIssueNumber,
  parseLinkedIssueNumber,
  parseProjectNumbers,
  shouldSkip,
  validateBranchName,
  validatePrBody,
  validateStructure,
} from './validate-pr-body.mjs';

const VALID_HEAD_REF = 'task/153-removes-ide-tooling-from-git';

const VALID_BODY = `## Linked issue

Refs #153

## Summary

Removes IDE tooling from git tracking.

## Steps to test

1. Checkout branch and run \`git ls-files | rg kiro\` — expect no output
2. Confirm local \`.kiro/\` still exists on disk
3. Confirm \`.gitignore\` lists \`.kiro/\` and \`.cursor/\`

## Checklist

- [x] Linked issue is on the correct project board (Mobile #3 / Admin #4 / WebApp #5)
- [x] Branch name follows the Branch Naming Contract
- [x] Acceptance criteria on the issue are addressed
- [x] Steps to test above are complete and reproducible
- [x] CI passes (or explain why not applicable)
- [x] No secrets, \`.env\`, or credentials committed
- [x] Scope matches the issue — no drive-by refactors

## Notes for reviewer

None.
`;

const CRLF_BODY = VALID_BODY.replace(/\n/g, '\r\n').replace(
  '- [x] CI passes (or explain why not applicable)\r\n',
  '- [ ] CI passes (or explain why not applicable)\r\n',
);

describe('shouldSkip', () => {
  it('skips draft PRs', () => {
    assert.equal(shouldSkip({ draft: true, author: 'dev', labels: [] }).skip, true);
  });

  it('skips dependabot', () => {
    assert.equal(
      shouldSkip({ draft: false, author: 'dependabot[bot]', labels: [] }).skip,
      true,
    );
  });

  it('skips with label', () => {
    assert.equal(
      shouldSkip({ draft: false, author: 'dev', labels: ['skip-pr-template'] }).skip,
      true,
    );
  });

  it('skips with label objects', () => {
    assert.equal(
      shouldSkip({ draft: false, author: 'dev', labels: [{ name: 'skip-pr-template' }] }).skip,
      true,
    );
  });
});

describe('parseLinkedIssueNumber', () => {
  it('parses single Refs #N', () => {
    assert.deepEqual(parseLinkedIssueNumber('Refs #42'), { number: 42 });
  });

  it('parses Related to #N', () => {
    assert.deepEqual(parseLinkedIssueNumber('Related to #42'), { number: 42 });
  });

  it('parses Closes #N (docs/chore QA skip)', () => {
    assert.deepEqual(parseLinkedIssueNumber('Closes #42'), { number: 42 });
  });

  it('parses Refs #N only from Linked issue section', () => {
    const body = `## Linked issue

Refs #42

## Checklist

- [x] Linked issue uses Refs #99 and issue is on board`;
    assert.deepEqual(parseLinkedIssueNumber(body), { number: 42 });
  });

  it('fails when missing', () => {
    assert.ok(parseLinkedIssueNumber('no link').error);
  });

  it('fails when Linked issue section has no link keyword', () => {
    const body = `## Linked issue

See parent issue.

## Checklist

- [x] Closes #99 in checklist only`;
    assert.ok(parseLinkedIssueNumber(body).error);
  });

  it('fails on multiple in Linked issue section', () => {
    assert.ok(parseLinkedIssueNumber('## Linked issue\n\nRefs #1\nRefs #2').error);
  });

  it('parseClosesIssueNumber alias still works', () => {
    assert.deepEqual(parseClosesIssueNumber('Refs #7'), { number: 7 });
  });
});

describe('validateStructure', () => {
  it('passes valid body', () => {
    assert.deepEqual(validateStructure(VALID_BODY), []);
  });

  it('passes CRLF body with optional CI unchecked', () => {
    assert.deepEqual(validateStructure(CRLF_BODY), []);
  });

  it('fails empty summary', () => {
    const body = VALID_BODY.replace('## Summary\n\nRemoves IDE tooling from git tracking.', '## Summary\n\n');
    assert.ok(validateStructure(body).some((e) => e.includes('Summary is empty')));
  });

  it('fails empty summary even with CRLF', () => {
    const body = VALID_BODY.replace(
      '## Summary\n\nRemoves IDE tooling from git tracking.',
      '## Summary\n\n',
    ).replace(/\n/g, '\r\n');
    assert.ok(validateStructure(body).some((e) => e.includes('Summary is empty')));
  });

  it('fails placeholder steps', () => {
    const body = VALID_BODY.replace(
      '1. Checkout branch and run `git ls-files | rg kiro` — expect no output\n2. Confirm local `.kiro/` still exists on disk\n3. Confirm `.gitignore` lists `.kiro/` and `.cursor/`',
      '1.\n2.\n3.',
    );
    assert.ok(
      validateStructure(body).some((e) => e.includes('Steps to test: add at least one filled numbered step')),
    );
  });

  it('fails unchecked required checklist item', () => {
    const body = VALID_BODY.replace('- [x] Linked issue', '- [ ] Linked issue');
    const errors = validateStructure(body);
    assert.ok(errors.some((e) => e.includes('unchecked')));
  });

  it('allows unchecked CI passes item', () => {
    const body = VALID_BODY.replace(
      '- [x] CI passes (or explain why not applicable)',
      '- [ ] CI passes (or explain why not applicable)',
    );
    assert.deepEqual(validateStructure(body), []);
  });
});

describe('validateBranchName', () => {
  it('accepts valid branch matching issue', () => {
    assert.deepEqual(validateBranchName('feature/168-commercial-unit-floor-area', 168), []);
  });

  it('rejects invalid prefix', () => {
    assert.ok(validateBranchName('fix/168-login', 168).some((e) => e.includes('must match')));
  });

  it('rejects issue number mismatch', () => {
    assert.ok(
      validateBranchName('bug/168-login', 99).some((e) => e.includes('must match linked issue #99')),
    );
  });

  it('rejects missing slug segment', () => {
    assert.ok(validateBranchName('feature/168', 168).length > 0);
  });
});

describe('validatePrBody', () => {
  it('skips draft without API', async () => {
    const result = await validatePrBody({
      body: VALID_BODY,
      draft: true,
      headRef: VALID_HEAD_REF,
    });
    assert.equal(result.skipped, true);
  });

  it('fails closed issue via mock', async () => {
    const result = await validatePrBody({
      body: VALID_BODY,
      headRef: VALID_HEAD_REF,
      repo: 'NyumbanApp/nyumban-mobile-app-frontend',
      githubToken: 'fake',
      validateLinkedIssueFn: async () => ['Issue #153 is closed — link an open issue'],
    });
    assert.ok(result.errors.length > 0);
  });

  it('fails issue not on board when board token configured', async () => {
    const result = await validatePrBody({
      body: VALID_BODY,
      headRef: VALID_HEAD_REF,
      repo: 'NyumbanApp/nyumban-mobile-app-frontend',
      githubToken: 'fake',
      boardCheckToken: 'board-pat',
      validateLinkedIssueFn: async () => [],
      validateIssueOnProjectBoardFn: async () => [
        `Issue #153 is not on Project #3`,
      ],
    });
    assert.ok(result.errors.some((e) => e.includes('Project #3')));
  });

  it('passes projectNumbers list to board check', async () => {
    let received;
    await validatePrBody({
      body: VALID_BODY,
      headRef: VALID_HEAD_REF,
      repo: 'NyumbanApp/nyumban-app-backend',
      projectNumbers: [3, 4],
      githubToken: 'fake',
      boardCheckToken: 'board-pat',
      validateLinkedIssueFn: async () => [],
      validateIssueOnProjectBoardFn: async (args) => {
        received = args.projectNumbers;
        return [];
      },
    });
    assert.deepEqual(received, [3, 4]);
  });

  it('skips board check without board token', async () => {
    let boardCalled = false;
    const result = await validatePrBody({
      body: VALID_BODY,
      headRef: VALID_HEAD_REF,
      repo: 'NyumbanApp/nyumban-mobile-app-frontend',
      githubToken: 'fake',
      validateLinkedIssueFn: async () => [],
      validateIssueOnProjectBoardFn: async () => {
        boardCalled = true;
        return [];
      },
      onBoardCheckSkipped: () => {},
    });
    assert.deepEqual(result.errors, []);
    assert.equal(result.boardCheckSkipped, true);
    assert.equal(boardCalled, false);
  });

  it('passes with mock API and board token', async () => {
    const result = await validatePrBody({
      body: VALID_BODY,
      headRef: VALID_HEAD_REF,
      repo: 'NyumbanApp/nyumban-mobile-app-frontend',
      githubToken: 'fake',
      boardCheckToken: 'board-pat',
      validateLinkedIssueFn: async () => [],
      validateIssueOnProjectBoardFn: async () => [],
    });
    assert.deepEqual(result.errors, []);
    assert.equal(result.boardCheckSkipped, false);
  });

  it('fails invalid branch name', async () => {
    const result = await validatePrBody({
      body: VALID_BODY,
      headRef: 'fix/old-branch-name',
      repo: 'NyumbanApp/nyumban-mobile-app-frontend',
      githubToken: 'fake',
      validateLinkedIssueFn: async () => [],
    });
    assert.ok(result.errors.some((e) => e.includes('Branch Naming Contract')));
  });
});

describe('parseProjectNumbers', () => {
  it('reads comma-separated PROJECT_NUMBERS', () => {
    assert.deepEqual(
      parseProjectNumbers({ projectNumbersEnv: '3,4', projectNumberEnv: '3' }),
      [3, 4],
    );
  });

  it('falls back to single PROJECT_NUMBER', () => {
    assert.deepEqual(
      parseProjectNumbers({ projectNumbersEnv: '', projectNumberEnv: '5' }),
      [5],
    );
  });

  it('prefers explicit projectNumbers array', () => {
    assert.deepEqual(
      parseProjectNumbers({ projectNumbers: [3, 4], projectNumber: 5 }),
      [3, 4],
    );
  });
});

describe('formatAllowedProjects', () => {
  it('formats one, two, and many boards', () => {
    assert.equal(formatAllowedProjects([3]), 'Project #3');
    assert.equal(formatAllowedProjects([3, 4]), 'Project #3 or #4');
    assert.equal(formatAllowedProjects([3, 4, 5]), 'Project #3, #4, or #5');
  });
});
