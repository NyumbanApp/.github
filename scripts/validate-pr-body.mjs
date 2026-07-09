import { fileURLToPath } from 'node:url';

const SKIP_AUTHORS = new Set(['dependabot[bot]', 'renovate[bot]']);
const REQUIRED_HEADINGS = ['## Summary', '## Steps to test', '## Checklist'];
const MIN_CHECKLIST_ITEMS = 6;

export function shouldSkip({ draft, author, labels }) {
  if (draft) return { skip: true, reason: 'draft PR' };
  if (SKIP_AUTHORS.has(author)) return { skip: true, reason: 'bot author' };
  const labelNames = labels.map((label) =>
    typeof label === 'string' ? label : label?.name,
  );
  if (labelNames.includes('skip-pr-template')) return { skip: true, reason: 'skip-pr-template label' };
  return { skip: false };
}

export function parseClosesIssueNumber(body) {
  const matches = [...body.matchAll(/\bCloses\s+#(\d+)/gi)];
  if (matches.length === 0) return { error: 'Missing `Closes #N` (link exactly one board issue)' };
  if (matches.length > 1) {
    return { error: 'Multiple `Closes #N` links found — use exactly one issue per PR' };
  }
  return { number: Number.parseInt(matches[0][1], 10) };
}

export function extractSection(body, heading) {
  const target = `## ${heading}`.toLowerCase();
  const lines = body.split('\n');
  let inSection = false;
  const collected = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
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

  for (const heading of REQUIRED_HEADINGS) {
    if (!body.includes(heading)) errors.push(`Missing section: ${heading}`);
  }

  const summary = stripHtmlComments(extractSection(body, 'Summary'));
  if (!summary) errors.push('Summary is empty');

  const stepsSection = extractSection(body, 'Steps to test');
  const firstStepLine = stepsSection
    .split('\n')
    .map((line) => line.trim())
    .find((line) => /^\d+\./.test(line));
  if (!firstStepLine || !/^\d+\.\s+\S/.test(firstStepLine)) {
    errors.push('Steps to test: add at least one filled numbered step (e.g. `1. ...`)');
  }

  const checklistPart = extractSection(body, 'Checklist');
  const unchecked = (checklistPart.match(/- \[ \]/g) || []).length;
  const checked = (checklistPart.match(/- \[x\]/gi) || []).length;

  if (unchecked > 0) {
    errors.push(`Checklist: ${unchecked} item(s) still unchecked`);
  }
  if (checked < MIN_CHECKLIST_ITEMS) {
    errors.push(`Checklist: need ${MIN_CHECKLIST_ITEMS} checked items, found ${checked}`);
  }

  return errors;
}

export async function validateIssueOnBoard({ token, owner, repo, issueNumber, projectNumber }) {
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
      `Issue #${issueNumber} is not on Project #${projectNumber} (Nyumban V1 Launch board)`,
    );
  }

  return errors;
}

export async function validatePrBody({
  body,
  draft = false,
  author = '',
  labels = [],
  repo = '',
  projectNumber = 3,
  token = '',
  fetchIssue = validateIssueOnBoard,
}) {
  const skip = shouldSkip({ draft, author, labels });
  if (skip.skip) {
    return { skipped: true, reason: skip.reason, errors: [] };
  }

  const errors = [];
  const closes = parseClosesIssueNumber(body ?? '');

  if (closes.error) {
    errors.push(closes.error);
    return { skipped: false, errors };
  }

  errors.push(...validateStructure(body));

  if (repo && token) {
    const [owner, repoName] = repo.split('/');
    if (owner && repoName) {
      const issueErrors = await fetchIssue({
        token,
        owner,
        repo: repoName,
        issueNumber: closes.number,
        projectNumber,
      });
      errors.push(...issueErrors);
    }
  }

  return { skipped: false, errors };
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
  const repo = process.env.REPO ?? '';
  const projectNumber = Number.parseInt(process.env.PROJECT_NUMBER ?? '3', 10);
  const token = process.env.GITHUB_TOKEN ?? '';

  const result = await validatePrBody({
    body,
    draft,
    author,
    labels,
    repo,
    projectNumber,
    token,
  });

  if (result.skipped) {
    console.log(`Skipped PR template check (${result.reason})`);
    process.exit(0);
  }

  if (result.errors.length > 0) {
    failWithErrors(result.errors);
  }

  console.log('PR template check passed');
  process.exit(0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`::error::${err.message}`);
    process.exit(1);
  });
}
