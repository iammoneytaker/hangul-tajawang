import assert from 'node:assert/strict';
import { test } from 'node:test';
import { safeAuthReturn } from '../lib/i18n/auth-return';

test('sign-in preserves an English exercise path', () => {
  assert.equal(safeAuthReturn('/en/practice/word/step2'), '/en/practice/word/step2');
});
test('sign-in rejects off-site and malformed return paths', () => {
  for (const path of ['//evil.test', '/\\evil.test', 'https://evil.test', '/en/../auth/callback', '/en/%2e%2e/auth/callback', 'javascript:alert(1)', null]) {
    assert.equal(safeAuthReturn(path), '/');
  }
});
