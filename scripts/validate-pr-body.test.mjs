import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  parseClosesIssueNumber,
  shouldSkip,
  validatePrBody,
  validateStructure,
} from './validate-pr-body.mjs';

const VALID_BODY = `## Linked issue

Closes #153

## Summary

Removes IDE tooling from git tracking.

## Steps to test

1. Checkout branch and run \`git ls-files | rg kiro\` — expect no output
2. Confirm local \`.kiro/\` still exists on disk
3. Confirm \`.gitignore\` lists \`.kiro/\` and \`.cursor/\`

## Checklist

- [x] Linked issue uses \`Closes #N\` and issue is on Nyumban V1 Launch board
- [x] Acceptance criteria on the issue are addressed
- [x] Steps to test above are complete and reproducible
- [x] CI passes (or explain why not applicable)
- [x] No secrets, \`.env\`, or credentials committed
- [x] Scope matches the issue — no drive-by refactors

## Notes for reviewer

None.
`;

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

describe('parseClosesIssueNumber', () => {
  it('parses single Closes #N', () => {
    assert.deepEqual(parseClosesIssueNumber('Closes #42'), { number: 42 });
  });

  it('fails when missing', () => {
    assert.ok(parseClosesIssueNumber('no link').error);
  });

  it('fails on multiple', () => {
    assert.ok(parseClosesIssueNumber('Closes #1\nCloses #2').error);
  });
});

describe('validateStructure', () => {
  it('passes valid body', () => {
    assert.deepEqual(validateStructure(VALID_BODY), []);
  });

  it('fails empty summary', () => {
    const body = VALID_BODY.replace('## Summary\n\nRemoves IDE tooling from git tracking.', '## Summary\n\n');
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

  it('fails unchecked checklist', () => {
    const body = VALID_BODY.replace('- [x] Linked issue', '- [ ] Linked issue');
    const errors = validateStructure(body);
    assert.ok(errors.some((e) => e.includes('unchecked')));
  });
});

describe('validatePrBody', () => {
  it('skips draft without API', async () => {
    const result = await validatePrBody({ body: '', draft: true });
    assert.equal(result.skipped, true);
  });

  it('fails closed issue via mock', async () => {
    const result = await validatePrBody({
      body: VALID_BODY,
      repo: 'NyumbanApp/nyumban-mobile-app-frontend',
      token: 'fake',
      fetchIssue: async () => [`Issue #153 is closed — link an open issue`],
    });
    assert.ok(result.errors.length > 0);
  });

  it('fails issue not on board via mock', async () => {
    const result = await validatePrBody({
      body: VALID_BODY,
      repo: 'NyumbanApp/nyumban-mobile-app-frontend',
      token: 'fake',
      fetchIssue: async () => [`Issue #153 is not on Project #3 (Nyumban V1 Launch board)`],
    });
    assert.ok(result.errors.some((e) => e.includes('Project #3')));
  });

  it('passes with mock API', async () => {
    const result = await validatePrBody({
      body: VALID_BODY,
      repo: 'NyumbanApp/nyumban-mobile-app-frontend',
      token: 'fake',
      fetchIssue: async () => [],
    });
    assert.deepEqual(result.errors, []);
  });
});
