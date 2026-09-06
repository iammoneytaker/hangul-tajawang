import assert from 'node:assert/strict';
import { test } from 'node:test';
import { track } from '../lib/analytics';

test('분석 준비 전 이벤트도 보존하고 완료 이벤트를 각 이름으로 한 번만 보낸다', () => {
  const fakeWindow: { location: { pathname: string }; dataLayer?: Record<string, unknown>[] } = { location: { pathname: '/transcription/test' } };
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: fakeWindow });
  try {
    track('pilsa_complete', { source: 'library', kpm: 200, accuracy: 98 });
    assert.equal(fakeWindow.dataLayer?.filter(e => e.event === 'pilsa_complete').length, 1);
    assert.equal(fakeWindow.dataLayer?.filter(e => e.event === 'activity_complete').length, 1);
    assert.equal(fakeWindow.dataLayer?.find(e => e.event === 'activity_complete')?.mode, 'library');
  } finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});
