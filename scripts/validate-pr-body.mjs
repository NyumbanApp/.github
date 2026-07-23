import { fileURLToPath } from 'node:url';

const SKIP_AUTHORS = new Set(['dependabot[bot]', 'renovate[bot]']);
const REQUIRED_HEADINGS = ['## Summary', '## Steps to test', '## Checklist'];
const MIN_CHECKLIST_ITEMS = 6;
const BRANCH_PATTERN = /^(feature|bug|task)\/(\d+)-[a-z0-9]+(-[a-z0-9]+)*$/;

export function validateBranchName(headRef, closesIssueNumber) {
  const errors = [];
  if (!headRef?.trim()) {
    errors.push('Missing PR head branch');
    return errors;
  }

  const match = headRef.match(BRANCH_PATTERN);
  if (!match) {
    errors.push(
      `Branch "${headRef}" must match feature|bug|task/<issue#>-<slug> (see Branch Naming Contract)`,
    );
    return errors;
  }

  const branchIssueNumber = Number.parseInt(match[2], 10);
  if (closesIssueNumber && branchIssueNumber !== closesIssueNumber) {
    errors.push(
      `Branch issue #${branchIssueNumber} must match Closes #${closesIssueNumber}`,
    );
  }

  return errors;
}

export function shouldSkip({ draft, author, labels }) {
  if (draft) return { skip: true, reason: 'draft PR' };
  if (SKIP_AUTHORS.has(author)) return { skip: true, reason: 'bot author' };
  const labelNames = labels.map((label) =>
    typeof label === 'string' ? label : label?.name,
  );
  if (labelNames.includes('skip-pr-template')) return { skip: true, reason: 'skip-pr-template label' };
  return { skip: false };
}

function findClosesIssueMatches(text) {
  return [...text.matchAll(/\bCloses\s+#(\d+)/gi)];
}

/** Normalize GitHub PR bodies that use Windows CRLF so heading matching works. */
export function normalizePrBody(body) {
  return String(body ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}

function isOptionalChecklistItem(line) {
  return /CI passes/i.test(line);
}

export function parseClosesIssueNumber(body) {
  const normalized = normalizePrBody(body);
  const linkedIssueSection = extractSection(normalized, 'Linked issue').trim();
  const searchText = linkedIssueSection || normalized;
  const matches = findClosesIssueMatches(searchText);

  if (matches.length === 0) {
    return { error: 'Missing `Closes #N` (link exactly one board issue)' };
  }
  if (matches.length > 1) {
    return { error: 'Multiple `Closes #N` links found — use exactly one issue per PR' };
  }
  return { number: Number.parseInt(matches[0][1], 10) };
}

export function extractSection(body, heading) {
  const normalized = normalizePrBody(body);
  const target = `## ${heading}`.toLowerCase();
  const lines = normalized.split('\n');
  let inSection = false;
  const collected = [];

  for (const line of lines) {
    const lower = line.replace(/\r$/, '').toLowerCase();
    if (lower.startsWith('## ') && lower !== target) {
      if (inSection) break;
      continue;
    }
    if (lower === target) {
      inSection = true;
      continue;
    }
    if (inSection) collected.push(line);
  }

  return collected.join('\n');
}

export function stripHtmlComments(text) {
  return text.replace(/<!--[\s\S]*?-->/g, '').trim();
}

export function validateStructure(body) {
  const errors = [];
  const normalized = normalizePrBody(body);

  for (const heading of REQUIRED_HEADINGS) {
    if (!normalized.includes(heading)) errors.push(`Missing section: ${heading}`);
  }

  const summary = stripHtmlComments(extractSection(normalized, 'Summary'));
  if (!summary) errors.push('Summary is empty');

  const stepsSection = extractSection(normalized, 'Steps to test');
  const firstStepLine = stepsSection
    .split('\n')
    .map((line) => line.trim())
    .find((line) => /^\d+\./.test(line));
  if (!firstStepLine || !/^\d+\.\s+\S/.test(firstStepLine)) {
    errors.push('Steps to test: add at least one filled numbered step (e.g. `1. ...`)');
  }

  const checklistPart = extractSection(normalized, 'Checklist');
  let unchecked = 0;
  let checked = 0;
  for (const rawLine of checklistPart.split('\n')) {
    const line = rawLine.trim();
    if (isOptionalChecklistItem(line)) continue;
    if (/^- \[ \]/.test(line)) unchecked += 1;
    else if (/^- \[x\]/i.test(line)) checked += 1;
  }

  if (unchecked > 0) {
    errors.push(`Checklist: ${unchecked} item(s) still unchecked`);
  }
  if (checked < MIN_CHECKLIST_ITEMS) {
    errors.push(`Checklist: need ${MIN_CHECKLIST_ITEMS} checked items, found ${checked}`);
  }

  return errors;
}

export async function validateLinkedIssue({ token, owner, repo, issueNumber }) {
  const errors = [];
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const issueRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
    { headers },
  );

  if (issueRes.status === 404) {
    errors.push(`Issue #${issueNumber} does not exist in ${owner}/${repo}`);
    return errors;
  }
  if (!issueRes.ok) {
    errors.push(`Failed to fetch issue #${issueNumber}: HTTP ${issueRes.status}`);
    return errors;
  }

  const issue = await issueRes.json();
  if (issue.state !== 'open') {
    errors.push(`Issue #${issueNumber} is ${issue.state} — link an open issue`);
  }

  return errors;
}

export async function validateIssueOnProjectBoard({
  token,
  owner,
  repo,
  issueNumber,
  projectNumber,
}) {
  const errors = [];
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const query = `
    query($owner: String!, $repo: String!, $number: Int!) {
      repository(owner: $owner, name: $repo) {
        issue(number: $number) {
          projectItems(first: 20) {
            nodes { project { number title } }
          }
        }
      }
    }
  `;

  const gqlRes = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables: { owner, repo, number: issueNumber },
    }),
  });

  if (!gqlRes.ok) {
    errors.push(`Failed to verify project board membership: GraphQL HTTP ${gqlRes.status}`);
    return errors;
  }

  const gql = await gqlRes.json();
  if (gql.errors?.length) {
    errors.push(`GraphQL error: ${gql.errors[0].message}`);
    return errors;
  }

  const items = gql.data?.repository?.issue?.projectItems?.nodes ?? [];
  const onProject = items.some((node) => node.project?.number === projectNumber);
  if (!onProject) {
    errors.push(
      `Issue #${issueNumber} is not on Project #${projectNumber}`,
    );
  }

  return errors;
}

/** @deprecated Use validateLinkedIssue + validateIssueOnProjectBoard */
export async function validateIssueOnBoard({ token, owner, repo, issueNumber, projectNumber }) {
  const errors = await validateLinkedIssue({ token, owner, repo, issueNumber });
  if (errors.length > 0) return errors;
  return validateIssueOnProjectBoard({ token, owner, repo, issueNumber, projectNumber });
}

export async function validatePrBody({
  body,
  draft = false,
  author = '',
  labels = [],
  headRef = '',
  repo = '',
  projectNumber = 3,
  githubToken = '',
  boardCheckToken = '',
  validateLinkedIssueFn = validateLinkedIssue,
  validateIssueOnProjectBoardFn = validateIssueOnProjectBoard,
  onBoardCheckSkipped = () => {},
}) {
  const skip = shouldSkip({ draft, author, labels });
  if (skip.skip) {
    return { skipped: true, reason: skip.reason, errors: [], boardCheckSkipped: false };
  }

  const errors = [];
  const normalizedBody = normalizePrBody(body ?? '');
  const closes = parseClosesIssueNumber(normalizedBody);

  if (closes.error) {
    errors.push(closes.error);
    return { skipped: false, errors, boardCheckSkipped: false };
  }

  errors.push(...validateBranchName(headRef, closes.number));
  errors.push(...validateStructure(normalizedBody));

  let boardCheckSkipped = false;
  const [owner, repoName] = repo.split('/');

  if (owner && repoName && githubToken) {
    const linkedErrors = await validateLinkedIssueFn({
      token: githubToken,
      owner,
      repo: repoName,
      issueNumber: closes.number,
    });
    errors.push(...linkedErrors);
  }

  if (owner && repoName && boardCheckToken) {
    const boardErrors = await validateIssueOnProjectBoardFn({
      token: boardCheckToken,
      owner,
      repo: repoName,
      issueNumber: closes.number,
      projectNumber,
    });
    errors.push(...boardErrors);
  } else if (owner && repoName) {
    boardCheckSkipped = true;
    onBoardCheckSkipped();
  }

  return { skipped: false, errors, boardCheckSkipped };
}

function failWithErrors(errors) {
  console.error('PR template check failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
    console.error(`::error::${error}`);
  }
  process.exit(1);
}

export async function main() {
  const body = process.env.PR_BODY ?? '';
  const draft = process.env.PR_DRAFT === 'true';
  const author = process.env.PR_AUTHOR ?? '';
  const labelsRaw = JSON.parse(process.env.PR_LABELS ?? '[]');
  const labels = labelsRaw.map((label) => (typeof label === 'string' ? label : label.name));
  const headRef = process.env.PR_HEAD_REF ?? '';
  const repo = process.env.REPO ?? '';
  const projectNumber = Number.parseInt(process.env.PROJECT_NUMBER ?? '3', 10);
  const githubToken = process.env.GITHUB_TOKEN ?? '';
  const boardCheckToken = (process.env.BOARD_CHECK_TOKEN ?? '').trim();

  const result = await validatePrBody({
    body,
    draft,
    author,
    labels,
    headRef,
    repo,
    projectNumber,
    githubToken,
    boardCheckToken,
    onBoardCheckSkipped: () => {
      console.log(
        'Board check skipped (PR_BOARD_CHECK_TOKEN not configured — lead verifies project board manually)',
      );
    },
  });

  if (result.skipped) {
    console.log(`Skipped PR template check (${result.reason})`);
    process.exit(0);
  }

  if (result.errors.length > 0) {
    failWithErrors(result.errors);
  }

  if (result.boardCheckSkipped) {
    console.log('PR template check passed (board membership not verified in CI)');
  } else {
    console.log('PR template check passed');
  }
  process.exit(0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`::error::${err.message}`);
    process.exit(1);
  });
}
