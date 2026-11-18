import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyDiffLine, parseUnifiedDiff } from './diffParser';

test('classifyDiffLine distinguishes metadata headers from additions and deletions', () => {
  assert.equal(classifyDiffLine('diff --git a/app.ts b/app.ts'), 'meta');
  assert.equal(classifyDiffLine('+++ b/app.ts'), 'meta');
  assert.equal(classifyDiffLine('--- a/app.ts'), 'meta');
  assert.equal(classifyDiffLine('@@ -10,4 +10,5 @@ export function test()'), 'hunk');
  assert.equal(classifyDiffLine('+const added = true;'), 'add');
  assert.equal(classifyDiffLine('-const removed = false;'), 'del');
  assert.equal(classifyDiffLine(' const unchanged = 1;'), 'context');
});

test('parseUnifiedDiff counts additions, deletions, and hunks in O(N)', () => {
  const patch = [
    '@@ -1,3 +1,4 @@',
    ' import React from "react";',
    '-const oldVal = 1;',
    '+const newVal = 2;',
    '+const extra = 3;',
    ' export { newVal };',
  ].join('\n');

  const parsed = parseUnifiedDiff(patch);
  assert.equal(parsed.hunks, 1);
  assert.equal(parsed.additions, 2);
  assert.equal(parsed.deletions, 1);
  assert.equal(parsed.lines.length, 6);
  assert.equal(parsed.lines[0].kind, 'hunk');
  assert.equal(parsed.lines[2].kind, 'del');
  assert.equal(parsed.lines[3].kind, 'add');
});

test('parseUnifiedDiff handles empty patches cleanly', () => {
  const parsed = parseUnifiedDiff('');
  assert.deepEqual(parsed, { lines: [], additions: 0, deletions: 0, hunks: 0 });
});
