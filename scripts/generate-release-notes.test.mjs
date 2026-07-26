import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  filterIssues,
  formatReleaseNotesMarkdown,
  groupIssuesByType,
  issueClosedInWindow,
  normalizeType,
  parseIssueTitle,
  shouldIncludeIssue,
} from './generate-release-notes.mjs';

describe('parseIssueTitle', () => {
  it('parses Type | Area | Summary', () => {
    assert.deepEqual(parseIssueTitle('Feature | Mobile | Push banner'), {
      type: 'Feature',
      area: 'Mobile',
      summary: 'Push banner',
    });
  });
});

describe('shouldIncludeIssue / filterIssues', () => {
  const feature = {
    number: 1,
    title: 'Feature | Mobile | Push banner',
    labels: [{ name: 'area/mobile' }, { name: 'type/feature' }],
  };
  const docsTitle = {
    number: 2,
    title: 'Task | Docs | Update contract pointer',
    labels: [{ name: 'type/task' }],
  };
  const docsLabel = {
    number: 3,
    title: 'Task | Mobile | Write runbook',
    labels: [{ name: 'area/docs' }],
  };
  const processArea = {
    number: 4,
    title: 'Task | Process | Weekly hygiene',
    labels: [{ name: 'area/process' }],
  };

  it('product mode keeps Features and drops Docs/Process', () => {
    assert.equal(shouldIncludeIssue(feature, 'product'), true);
    assert.equal(shouldIncludeIssue(docsTitle, 'product'), false);
    assert.equal(shouldIncludeIssue(docsLabel, 'product'), false);
    assert.equal(shouldIncludeIssue(processArea, 'product'), false);
    assert.deepEqual(
      filterIssues([feature, docsTitle, docsLabel, processArea], 'product').map((i) => i.number),
      [1],
    );
  });

  it('internal mode keeps Docs/Process', () => {
    assert.equal(shouldIncludeIssue(docsTitle, 'internal'), true);
    assert.equal(shouldIncludeIssue(processArea, 'internal'), true);
    assert.equal(filterIssues([feature, docsTitle, processArea], 'internal').length, 3);
  });
});

describe('normalizeType / groupIssuesByType', () => {
  it('normalizes types', () => {
    assert.equal(normalizeType('Feature'), 'Feature');
    assert.equal(normalizeType('bug'), 'Bug');
    assert.equal(normalizeType('task'), 'Task');
    assert.equal(normalizeType('Research'), 'Other');
  });

  it('groups by type', () => {
    const groups = groupIssuesByType([
      { number: 1, title: 'Feature | Mobile | A' },
      { number: 2, title: 'Bug | Backend | B' },
      { number: 3, title: 'Task | Mobile | C' },
      { number: 4, title: 'Weird title' },
    ]);
    assert.equal(groups.Feature.length, 1);
    assert.equal(groups.Bug.length, 1);
    assert.equal(groups.Task.length, 1);
    assert.equal(groups.Other.length, 1);
  });
});

describe('formatReleaseNotesMarkdown', () => {
  it('formats product notes and omits docs', () => {
    const md = formatReleaseNotesMarkdown(
      [
        { number: 10, title: 'Feature | Mobile | Banner', html_url: 'https://example.com/10' },
        { number: 11, title: 'Task | Docs | Pointer' },
        { number: 12, title: 'Bug | Backend | Null crash', html_url: 'https://example.com/12' },
      ],
      { mode: 'product', repo: 'NyumbanApp/demo', since: '2026-01-01' },
    );
    assert.match(md, /What's new/);
    assert.match(md, /Fixes/);
    assert.match(md, /Banner/);
    assert.match(md, /Null crash/);
    assert.doesNotMatch(md, /Pointer/);
    assert.match(md, /Docs and Process area issues are omitted/);
  });

  it('formats internal notes including docs', () => {
    const md = formatReleaseNotesMarkdown(
      [{ number: 11, title: 'Task | Docs | Pointer' }],
      { mode: 'internal' },
    );
    assert.match(md, /Internal changes/);
    assert.match(md, /Pointer/);
  });
});

describe('issueClosedInWindow', () => {
  it('includes closed_at within bounds', () => {
    assert.equal(
      issueClosedInWindow('2026-06-15T12:00:00Z', '2026-06-01T00:00:00Z', '2026-07-01T00:00:00Z'),
      true,
    );
    assert.equal(issueClosedInWindow('2026-05-01T00:00:00Z', '2026-06-01T00:00:00Z'), false);
  });
});
