import assert from 'node:assert/strict';
import { test } from 'node:test';
import { answerDaily, currentDailyQuestion, emptyDailyState, prepareDaily } from '../lib/daily-journey';
import { dailyStorageKey, loadDailyState, saveDailyState } from '../lib/daily-journey-storage';
import { mergeDailyStates, syncDailyState, type DailyRepository, type DailyRow } from '../lib/daily-journey-sync';

const now = new Date('2026-09-06T03:00:00Z');
function answered() {
  const state = prepareDaily(emptyDailyState(), now);
  const q = currentDailyQuestion(state);
  assert.ok(state.session && q);
  return answerDaily({ ...state, session: { ...state.session, input: q.answer, startedAt: now.toISOString() } }, now);
}

test('guest and two accounts have separate storage keys', () => {
  assert.equal(new Set([dailyStorageKey(null), dailyStorageKey('a'), dailyStorageKey('b')]).size, 3);
  assert.equal(dailyStorageKey(null), 'tajawang_daily_v1');
});

test('an empty device does not overwrite a completed answer', () => {
  const merged = mergeDailyStates(prepareDaily(emptyDailyState(), now), answered());
  assert.equal(merged.session?.answers.length, 1);
});

test('newer review wins even when it has an earlier due date', () => {
  const older = answered();
  const id = Object.keys(older.reviews)[0];
  const newer = { ...older, reviews: { [id]: { dueDate: '2026-09-07', streak: 0, updatedAt: '2026-09-06T04:00:00Z' } } };
  assert.equal(mergeDailyStates(older, newer).reviews[id].streak, 0);
});

test('equal progress preserves hint and mistake flags from either device', () => {
  const a = prepareDaily(emptyDailyState(), now);
  assert.ok(a.session);
  const b = { ...a, session: { ...a.session, hintUsed: true, mistaken: true } };
  const merged = mergeDailyStates(a, b);
  assert.equal(merged.session?.hintUsed, true);
  assert.equal(merged.session?.mistaken, true);
});

test('sync strips draft text and retries a concurrent revision conflict', async () => {
  const local = answered();
  assert.ok(local.session);
  local.session.input = 'private draft';
  let row: DailyRow | null = null;
  let writes = 0;
  const repository: DailyRepository = {
    read: async () => row,
    write: async (state, revision) => {
      writes++;
      if (writes === 1) { row = { state: answered(), revision: 1 }; return false; }
      assert.equal(revision, 1);
      assert.equal(state.session?.input, '');
      row = { state, revision: 2 };
      return true;
    },
  };
  const synced = await syncDailyState(local, repository);
  assert.equal(synced.session?.answers.length, 1);
  assert.ok(writes >= 1);
  assert.equal((await repository.read())?.state.session?.input, '');
});

test('opening an unused account does not write a database row', async () => {
  const repository: DailyRepository = { read: async () => null, write: async () => { assert.fail('unexpected write'); } };
  await syncDailyState(prepareDaily(emptyDailyState(), now), repository);
});

test('a hint on one device cannot become an independent answer on another', () => {
  const hinted = prepareDaily(emptyDailyState(), now);
  assert.ok(hinted.session);
  hinted.session.hintUsed = true;
  const merged = mergeDailyStates(answered(), hinted);
  assert.equal(merged.session?.answers[0].independent, false);
  assert.equal(merged.session.answers[0].hintUsed, true);
  assert.equal(merged.reviews[merged.session.answers[0].id].dueDate, '2026-09-07');
});

test('saving one account leaves the guest and other account untouched', () => {
  const values = new Map<string, string>();
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  } });
  try {
    saveDailyState(answered());
    const guestBefore = values.get(dailyStorageKey(null));
    saveDailyState(answered(), 'account-a');
    assert.equal(loadDailyState(now, 'account-a').session?.answers.length, 1);
    assert.equal(loadDailyState(now, 'account-b').session?.answers.length, 0);
    assert.equal(values.get(dailyStorageKey(null)), guestBefore);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});

test('repeated revision conflicts fail without claiming synchronization', async () => {
  let attempts = 0;
  const repository: DailyRepository = { read: async () => null, write: async () => { attempts++; return false; } };
  await assert.rejects(syncDailyState(answered(), repository));
  assert.equal(attempts, 3);
});

test('unavailable cloud storage does not mutate the local record', async () => {
  const state = answered();
  const original = JSON.stringify(state);
  const repository: DailyRepository = { read: async () => { throw new Error('offline'); }, write: async () => false };
  await assert.rejects(syncDailyState(state, repository));
  assert.equal(JSON.stringify(state), original);
});

test('merging yesterday does not reset a review already practiced after KST midnight', () => {
  const previous = answered();
  assert.ok(previous.session);
  const id = previous.session.answers[0].id;
  previous.session.answers[0].independent = false;
  const current = { ...previous, reviews: { [id]: { dueDate: '2026-09-10', streak: 1, updatedAt: '2026-09-06T15:01:00Z' } } };
  assert.equal(mergeDailyStates(previous, current).reviews[id].streak, 1);
});
