import assert from 'node:assert/strict';
import { test } from 'node:test';
import { switchLocaleHref } from '../lib/i18n/routes';

test('English drill language switches preserve the selected exercise', () => {
  for (const path of ['/practice/word/step1', '/practice/short/proverb', '/transcription/poem_2']) {
    assert.equal(switchLocaleHref(`/en${path}`), path);
    assert.equal(switchLocaleHref(path), `/en${path}`);
  }
});
