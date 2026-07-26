#!/usr/bin/env node
/**
 * Generate release notes from issues closed in a time window (Done ≈ closed after QA).
 *
 * Env / CLI:
 *   REPO=owner/name          required for fetch
 *   SINCE=ISO date           required for fetch
 *   UNTIL=ISO date           optional (default: now)
 *   MODE=product|internal    product excludes Docs/Process (default: product)
 *   GITHUB_TOKEN             required for fetch
 *
 * Local:
 *   GITHUB_TOKEN=… node scripts/generate-release-notes.mjs --repo NyumbanApp/foo --since 2026-01-01
 */

import { fileURLToPath } from 'node:url';

const EXCLUDED_AREA_LABELS = new Set(['area/docs', 'area/process']);
const EXCLUDED_AREA_NAMES = new Set(['docs', 'process']);

/** @param {string} title */
export function parseIssueTitle(title) {
  const parts = String(title ?? '')
    .split('|')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 3) {
    return { type: parts[0], area: parts[1], summary: parts.slice(2).join(' | ') };
  }
  if (parts.length === 2) {
    return { type: parts[0], area: parts[1], summary: '' };
  }
  return { type: '', area: '', summary: String(title ?? '').trim() };
}

/** @param {{ name?: string }[] | string[]} labels */
export function labelNames(labels = []) {
  return labels.map((l) => (typeof l === 'string' ? l : l?.name ?? '')).filter(Boolean);
}

/**
 * @param {{ title?: string, labels?: unknown[] }} issue
 * @param {'product' | 'internal'} mode
 */
export function shouldIncludeIssue(issue, mode = 'product') {
  if (mode === 'internal') return true;

  const labels = labelNames(issue.labels ?? []).map((n) => n.toLowerCase());
  if (labels.some((n) => EXCLUDED_AREA_LABELS.has(n))) return false;

  const { area } = parseIssueTitle(issue.title ?? '');
  if (area && EXCLUDED_AREA_NAMES.has(area.toLowerCase())) return false;

  return true;
}

/**
 * @param {Array<{ number: number, title: string, html_url?: string, labels?: unknown[] }>} issues
 * @param {'product' | 'internal'} mode
 */
export function filterIssues(issues, mode = 'product') {
  return issues.filter((issue) => shouldIncludeIssue(issue, mode));
}

/**
 * @param {string} type
 * @returns {'Feature' | 'Bug' | 'Task' | 'Other'}
 */
export function normalizeType(type) {
  const t = String(type ?? '').trim().toLowerCase();
  if (t === 'feature' || t === 'feat') return 'Feature';
  if (t === 'bug' || t === 'fix') return 'Bug';
  if (t === 'task') return 'Task';
  return 'Other';
}

/**
 * @param {Array<{ number: number, title: string, html_url?: string }>} issues
 */
export function groupIssuesByType(issues) {
  /** @type {Record<'Feature' | 'Bug' | 'Task' | 'Other', typeof issues>} */
  const groups = { Feature: [], Bug: [], Task: [], Other: [] };
  for (const issue of issues) {
    const { type } = parseIssueTitle(issue.title);
    groups[normalizeType(type)].push(issue);
  }
  return groups;
}

/**
 * @param {Array<{ number: number, title: string, html_url?: string, labels?: unknown[] }>} issues
 * @param {{ mode?: 'product' | 'internal', since?: string, until?: string, repo?: string }} opts
 */
export function formatReleaseNotesMarkdown(issues, opts = {}) {
  const mode = opts.mode ?? 'product';
  const filtered = filterIssues(issues, mode);
  const groups = groupIssuesByType(filtered);

  const lines = [];
  const heading = mode === 'internal' ? '## Internal changes' : '## Changes';
  lines.push(heading);
  lines.push('');

  if (opts.since || opts.until || opts.repo) {
    const bits = [];
    if (opts.repo) bits.push(`**Repo:** \`${opts.repo}\``);
    if (opts.since) bits.push(`**Since:** ${opts.since}`);
    if (opts.until) bits.push(`**Until:** ${opts.until}`);
    lines.push(bits.join(' · '));
    lines.push('');
  }

  if (filtered.length === 0) {
    lines.push('_No matching closed issues in this window._');
    lines.push('');
    return lines.join('\n');
  }

  const sections = [
    { key: 'Feature', title: "What's new" },
    { key: 'Bug', title: 'Fixes' },
    { key: 'Task', title: 'Tasks' },
    { key: 'Other', title: 'Other' },
  ];

  for (const { key, title } of sections) {
    const list = groups[key];
    if (!list.length) continue;
    lines.push(`### ${title}`);
    lines.push('');
    for (const issue of list) {
      const link = issue.html_url ? `[#${issue.number}](${issue.html_url})` : `#${issue.number}`;
      lines.push(`- ${issue.title} (${link})`);
    }
    lines.push('');
  }

  if (mode === 'product') {
    lines.push('_Docs and Process area issues are omitted from product notes._');
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * @param {string} closedAt
 * @param {string} sinceIso
 * @param {string} [untilIso]
 */
export function issueClosedInWindow(closedAt, sinceIso, untilIso) {
  if (!closedAt) return false;
  const closed = Date.parse(closedAt);
  const since = Date.parse(sinceIso);
  if (Number.isNaN(closed) || Number.isNaN(since)) return false;
  if (closed < since) return false;
  if (untilIso) {
    const until = Date.parse(untilIso);
    if (!Number.isNaN(until) && closed > until) return false;
  }
  return true;
}

/**
 * @param {{ token: string, owner: string, repo: string, since: string, until?: string }} args
 */
export async function fetchClosedIssues({ token, owner, repo, since, until }) {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const collected = [];
  let page = 1;
  const perPage = 100;

  while (page <= 10) {
    const url = new URL(`https://api.github.com/repos/${owner}/${repo}/issues`);
    url.searchParams.set('state', 'closed');
    url.searchParams.set('since', since);
    url.searchParams.set('per_page', String(perPage));
    url.searchParams.set('page', String(page));
    url.searchParams.set('sort', 'updated');
    url.searchParams.set('direction', 'desc');

    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`GitHub API HTTP ${res.status}: ${await res.text()}`);
    }
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;

    for (const item of batch) {
      if (item.pull_request) continue;
      if (!issueClosedInWindow(item.closed_at, since, until)) continue;
      collected.push({
        number: item.number,
        title: item.title,
        html_url: item.html_url,
        labels: item.labels,
        closed_at: item.closed_at,
      });
    }

    if (batch.length < perPage) break;
    page += 1;
  }

  collected.sort((a, b) => a.number - b.number);
  return collected;
}

function parseArgs(argv) {
  const out = { repo: '', since: '', until: '', mode: 'product' };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--repo') out.repo = argv[++i] ?? '';
    else if (a === '--since') out.since = argv[++i] ?? '';
    else if (a === '--until') out.until = argv[++i] ?? '';
    else if (a === '--mode') out.mode = argv[++i] ?? 'product';
  }
  return out;
}

export async function main(env = process.env, argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const repo = args.repo || env.REPO || '';
  const since = args.since || env.SINCE || '';
  const until = args.until || env.UNTIL || new Date().toISOString();
  const mode = /** @type {'product' | 'internal'} */ (
    (args.mode || env.MODE || 'product').toLowerCase() === 'internal' ? 'internal' : 'product'
  );
  const token = (env.GITHUB_TOKEN || '').trim();

  if (!repo || !since) {
    console.error(
      'Usage: generate-release-notes.mjs --repo owner/name --since ISO [--until ISO] [--mode product|internal]',
    );
    process.exit(1);
  }
  if (!token) {
    console.error('GITHUB_TOKEN is required');
    process.exit(1);
  }

  const [owner, name] = repo.split('/');
  if (!owner || !name) {
    console.error('REPO must be owner/name');
    process.exit(1);
  }

  const issues = await fetchClosedIssues({ token, owner, repo: name, since, until });
  const markdown = formatReleaseNotesMarkdown(issues, { mode, since, until, repo });
  process.stdout.write(markdown);
  return markdown;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
