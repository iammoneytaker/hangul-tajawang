import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createClient } from '@supabase/supabase-js';
import { loadWeeklyPopularity, rankWeeklyCompletions, type WeeklyCompletion } from '../lib/weekly-popularity';

function completion(id: string, contentId: string, userId: string | null, createdAt = '2026-09-06T00:00:00Z'): WeeklyCompletion {
  return { id, content_id: contentId, user_id: userId, created_at: createdAt,
    typing_contents: { title: `글 ${contentId}`, category: '수필' } };
}

test('weekly popularity counts distinct people per post, not repeat completions', () => {
  const rows = [completion('1', 'a', 'u1'), completion('2', 'a', 'u1'), completion('3', 'b', 'u1'), completion('4', 'b', 'u2')];
  const ranked = rankWeeklyCompletions(rows);
  assert.deepEqual(ranked.map(row => [row.id, row.participants]), [['b', 2], ['a', 1]]);
  assert.equal('user_id' in ranked[0], false);
});

test('weekly popularity ignores anonymous and deleted posts and has a genuine empty state', () => {
  const rows = [completion('1', 'a', null), { ...completion('2', 'b', 'u1'), typing_contents: null }];
  assert.deepEqual(rankWeeklyCompletions(rows), []);
});

test('weekly popularity breaks ties by recent completion then id and returns only three', () => {
  const rows = ['d', 'c', 'b', 'a'].map(id => completion(id, id, 'u1'));
  rows.push(completion('e', 'e', 'u2', '2026-09-06T01:00:00Z'));
  assert.deepEqual(rankWeeklyCompletions(rows).map(row => row.id), ['e', 'a', 'b']);
});

test('weekly loader fixes the seven-day window, filters hidden posts and reads past API page caps', async () => {
  const requests: URL[] = [];
  const pages = [[completion('1', 'a', 'u1')], [completion('2', 'b', 'u1'), completion('3', 'b', 'u2')], []];
  const client = createClient('https://example.supabase.co', 'test-key', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async (input) => {
      requests.push(new URL(String(input)));
      return new Response(JSON.stringify(pages.shift()), { headers: { 'Content-Type': 'application/json' } });
    } },
  });
  const result = await loadWeeklyPopularity(client, new Date('2026-09-06T03:00:00Z'));
  assert.deepEqual(result.items.map(row => [row.id, row.participants]), [['b', 2], ['a', 1]]);
  assert.equal(result.asOf, '2026-09-06T03:00:00.000Z');
  assert.equal(requests.length, 3);
  for (const url of requests) {
    assert.deepEqual(url.searchParams.getAll('created_at'), ['gte.2026-08-30T03:00:00.000Z', 'lt.2026-09-06T03:00:00.000Z']);
    assert.equal(url.searchParams.get('typing_contents.report_count'), 'lt.10');
    assert.equal(url.searchParams.get('order'), 'id.asc');
  }
  assert.equal(requests[1].searchParams.get('id'), 'gt.1');
  assert.equal(requests[2].searchParams.get('id'), 'gt.3');
});

test('weekly loader rejects a failed page rather than publishing a partial ranking', async () => {
  let calls = 0;
  const client = createClient('https://example.supabase.co', 'test-key', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async () => ++calls === 1
      ? new Response(JSON.stringify([completion('1', 'a', 'u1')]), { headers: { 'Content-Type': 'application/json' } })
      : new Response(JSON.stringify({ message: 'unavailable' }), { status: 503, headers: { 'Content-Type': 'application/json' } }),
    },
  });
  await assert.rejects(loadWeeklyPopularity(client));
});
