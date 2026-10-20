import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  detectLinkKeyword,
  shouldLinkDevelopment,
  shouldReopenAfterMerge,
  runLinkMode,
  runReopenIfRefsClosed,
} from './link-pr-development.mjs';

describe('detectLinkKeyword', () => {
  it('detects Refs', () => {
    assert.equal(detectLinkKeyword('Refs #42', 42), 'refs');
  });

  it('detects Related to', () => {
    assert.equal(detectLinkKeyword('Related to #42', 42), 'related to');
  });

  it('detects Closes', () => {
    assert.equal(detectLinkKeyword('Closes #42', 42), 'closes');
  });

  it('ignores other issue numbers', () => {
    assert.equal(detectLinkKeyword('Refs #99', 42), null);
  });
});

describe('shouldLinkDevelopment', () => {
  it('links Refs and Related to only', () => {
    assert.equal(shouldLinkDevelopment('refs'), true);
    assert.equal(shouldLinkDevelopment('related to'), true);
    assert.equal(shouldLinkDevelopment('closes'), false);
    assert.equal(shouldLinkDevelopment(null), false);
  });
});

describe('shouldReopenAfterMerge', () => {
  it('reopens Refs/Related to, not Closes', () => {
    assert.equal(shouldReopenAfterMerge('refs'), true);
    assert.equal(shouldReopenAfterMerge('related to'), true);
    assert.equal(shouldReopenAfterMerge('closes'), false);
  });
});

describe('runLinkMode', () => {
  it('skips drafts', async () => {
    const result = await runLinkMode({
      token: 't',
      owner: 'NyumbanApp',
      repo: 'demo',
      pullNumber: 1,
      body: 'Refs #1',
      draft: true,
      author: 'dev',
      labels: [],
    });
    assert.equal(result.skipped, true);
    assert.equal(result.reason, 'draft PR');
  });

  it('skips skip-pr-template', async () => {
    const result = await runLinkMode({
      token: 't',
      owner: 'NyumbanApp',
      repo: 'demo',
      pullNumber: 1,
      body: 'Refs #1',
      draft: false,
      author: 'dev',
      labels: ['skip-pr-template'],
    });
    assert.equal(result.skipped, true);
  });

  it('skips Closes keyword', async () => {
    const result = await runLinkMode({
      token: 't',
      owner: 'NyumbanApp',
      repo: 'demo',
      pullNumber: 1,
      body: '## Linked issue\n\nCloses #8',
      draft: false,
      author: 'dev',
      labels: [],
    });
    assert.equal(result.skipped, true);
    assert.match(result.reason, /closes/i);
  });
});

describe('runReopenIfRefsClosed', () => {
  it('skips unmerged PRs', async () => {
    const result = await runReopenIfRefsClosed({
      token: 't',
      owner: 'NyumbanApp',
      repo: 'demo',
      pullNumber: 1,
      body: 'Refs #1',
      merged: false,
      draft: false,
      author: 'dev',
      labels: [],
    });
    assert.equal(result.skipped, true);
    assert.equal(result.reason, 'PR was not merged');
  });

  it('does not reopen Closes', async () => {
    const result = await runReopenIfRefsClosed({
      token: 't',
      owner: 'NyumbanApp',
      repo: 'demo',
      pullNumber: 1,
      body: '## Linked issue\n\nCloses #8',
      merged: true,
      draft: false,
      author: 'dev',
      labels: [],
    });
    assert.equal(result.skipped, true);
    assert.match(result.reason, /Closes/i);
  });
});
