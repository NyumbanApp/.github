import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  normalizePrBody,
  parseLinkedIssueNumber,
  shouldSkip,
} from './validate-pr-body.mjs';

const GITHUB_API = 'https://api.github.com/graphql';
const GITHUB_REST = 'https://api.github.com';

const QA_REOPEN_COMMENT =
  'Kept open for QA — product PRs use `Refs #N` / `Related to #N`. Delivery Lead or CTO closes after QA → Done.';

export function detectLinkKeyword(body, issueNumber) {
  const normalized = normalizePrBody(body);
  const re = new RegExp(`\\b(Refs|Related to|Closes)\\s+#${issueNumber}\\b`, 'i');
  const match = normalized.match(re);
  if (!match) return null;
  return match[1].toLowerCase();
}

export function shouldLinkDevelopment(keyword) {
  return keyword === 'refs' || keyword === 'related to';
}

export function shouldReopenAfterMerge(keyword) {
  return shouldLinkDevelopment(keyword);
}

async function githubGraphql({ token, query, variables }) {
  const res = await fetch(GITHUB_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await res.json();
  if (!res.ok) {
    throw new Error(`GraphQL HTTP ${res.status}: ${JSON.stringify(payload)}`);
  }
  if (payload.errors?.length) {
    throw new Error(`GraphQL errors: ${JSON.stringify(payload.errors)}`);
  }
  return payload.data;
}

async function githubRest({ token, method, path, body }) {
  const res = await fetch(`${GITHUB_REST}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const payload = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(`REST ${method} ${path} HTTP ${res.status}: ${text}`);
  }
  return payload;
}

export async function fetchIssueAndPullRequest({ token, owner, repo, issueNumber, pullNumber }) {
  const data = await githubGraphql({
    token,
    query: `
      query ($owner: String!, $repo: String!, $issueNumber: Int!, $pullNumber: Int!) {
        repository(owner: $owner, name: $repo) {
          issue(number: $issueNumber) {
            id
            number
            state
          }
          pullRequest(number: $pullNumber) {
            id
            number
            closingIssuesReferences(first: 20) {
              nodes { number }
            }
          }
        }
      }
    `,
    variables: { owner, repo, issueNumber, pullNumber },
  });
  return data?.repository ?? {};
}

export async function linkDevelopment({ token, issueId, pullRequestId }) {
  await githubGraphql({
    token,
    query: `
      mutation ($issueId: ID!, $pullRequestIds: [ID!]!) {
        addCloseIssueReferences(input: {
          issueId: $issueId
          pullRequestIds: $pullRequestIds
        }) {
          issue { number }
        }
      }
    `,
    variables: { issueId, pullRequestIds: [pullRequestId] },
  });
}

export async function reopenIssue({ token, owner, repo, issueNumber, comment }) {
  await githubRest({
    token,
    method: 'PATCH',
    path: `/repos/${owner}/${repo}/issues/${issueNumber}`,
    body: { state: 'open' },
  });
  if (comment) {
    await githubRest({
      token,
      method: 'POST',
      path: `/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
      body: { body: comment },
    });
  }
}

export async function runLinkMode({
  token,
  owner,
  repo,
  pullNumber,
  body,
  draft,
  author,
  labels,
}) {
  const skip = shouldSkip({ draft, author, labels });
  if (skip.skip) {
    return { skipped: true, reason: skip.reason };
  }

  const linked = parseLinkedIssueNumber(body);
  if (linked.error) {
    return { skipped: true, reason: linked.error };
  }

  const keyword = detectLinkKeyword(body, linked.number);
  if (!shouldLinkDevelopment(keyword)) {
    return {
      skipped: true,
      reason: `keyword "${keyword ?? 'none'}" already creates a Development link or is not Refs/Related to`,
    };
  }

  const { issue, pullRequest } = await fetchIssueAndPullRequest({
    token,
    owner,
    repo,
    issueNumber: linked.number,
    pullNumber,
  });

  if (!issue?.id || !pullRequest?.id) {
    return {
      skipped: true,
      reason: `could not resolve issue #${linked.number} or PR #${pullNumber} in ${owner}/${repo}`,
    };
  }

  const alreadyLinked = (pullRequest.closingIssuesReferences?.nodes ?? []).some(
    (node) => node.number === linked.number,
  );
  if (alreadyLinked) {
    return { skipped: true, reason: `already linked to #${linked.number}` };
  }

  await linkDevelopment({ token, issueId: issue.id, pullRequestId: pullRequest.id });
  return { skipped: false, linkedIssue: linked.number, keyword };
}

export async function runReopenIfRefsClosed({
  token,
  owner,
  repo,
  pullNumber,
  body,
  merged,
  draft,
  author,
  labels,
}) {
  if (!merged) {
    return { skipped: true, reason: 'PR was not merged' };
  }

  const skip = shouldSkip({ draft: false, author, labels });
  if (skip.skip && skip.reason !== 'draft PR') {
    return { skipped: true, reason: skip.reason };
  }
  if (draft) {
    return { skipped: true, reason: 'draft PR' };
  }

  const linked = parseLinkedIssueNumber(body);
  if (linked.error) {
    return { skipped: true, reason: linked.error };
  }

  const keyword = detectLinkKeyword(body, linked.number);
  if (!shouldReopenAfterMerge(keyword)) {
    return { skipped: true, reason: `keyword "${keyword ?? 'none'}" should stay closed if Closes` };
  }

  const { issue } = await fetchIssueAndPullRequest({
    token,
    owner,
    repo,
    issueNumber: linked.number,
    pullNumber,
  });

  if (!issue) {
    return { skipped: true, reason: `issue #${linked.number} not found` };
  }
  if (issue.state !== 'CLOSED') {
    return { skipped: true, reason: `issue #${linked.number} already open` };
  }

  await reopenIssue({
    token,
    owner,
    repo,
    issueNumber: linked.number,
    comment: QA_REOPEN_COMMENT,
  });
  return { skipped: false, reopened: linked.number, keyword };
}

export async function main() {
  const mode = process.env.MODE ?? 'link';
  const token = process.env.GITHUB_TOKEN ?? '';
  const repoFull = process.env.REPO ?? '';
  const [owner, repo] = repoFull.split('/');
  const pullNumber = Number.parseInt(process.env.PR_NUMBER ?? '', 10);
  const body = process.env.PR_BODY ?? '';
  const draft = process.env.PR_DRAFT === 'true';
  const author = process.env.PR_AUTHOR ?? '';
  const labelsRaw = JSON.parse(process.env.PR_LABELS ?? '[]');
  const labels = labelsRaw.map((label) => (typeof label === 'string' ? label : label.name));
  const merged = process.env.PR_MERGED === 'true';

  if (!token) throw new Error('GITHUB_TOKEN is required');
  if (!owner || !repo) throw new Error('REPO must be owner/name');
  if (!Number.isInteger(pullNumber) || pullNumber <= 0) {
    throw new Error('PR_NUMBER must be a positive integer');
  }

  const ctx = { token, owner, repo, pullNumber, body, draft, author, labels, merged };
  const result =
    mode === 'reopen-if-refs-closed'
      ? await runReopenIfRefsClosed(ctx)
      : await runLinkMode(ctx);

  if (result.skipped) {
    console.log(`Skipped (${mode}): ${result.reason}`);
    return;
  }
  if (result.linkedIssue) {
    console.log(`Linked Development: PR #${pullNumber} → issue #${result.linkedIssue} (${result.keyword})`);
  }
  if (result.reopened) {
    console.log(`Reopened issue #${result.reopened} for QA after merge`);
  }
}

function isExecutedDirectly() {
  if (!process.argv[1]) return Boolean(process.env.MODE);
  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return Boolean(process.env.MODE);
  }
}

if (isExecutedDirectly()) {
  main().catch((err) => {
    console.error(`::error::${err.message}`);
    process.exit(1);
  });
}
