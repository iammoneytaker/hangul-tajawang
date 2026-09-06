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

test('popularity loader shares a 30-day scan, filters hidden posts and reads past API page caps', async () => {
  const requests: URL[] = [];
  const pages = [[completion('1', 'a', 'u1')], [completion('2', 'b', 'u1'), completion('3', 'b', 'u2')], []];
  const client = createClient('https://example.supabase.co', 'test-key', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async (input) => {
      const url = new URL(String(input));
      requests.push(url);
      if (url.pathname.endsWith('/typing_contents')) return new Response(JSON.stringify([
        { id: 'a', like_count: 4, typing_comments: [{ count: 2 }] },
        { id: 'b', like_count: 9, typing_comments: [{ count: 3 }] },
      ]), { headers: { 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify(pages.shift()), { headers: { 'Content-Type': 'application/json' } });
    } },
  });
  const result = await loadWeeklyPopularity(client, new Date('2026-09-06T03:00:00Z'));
  assert.deepEqual(result.items.map(row => [row.id, row.participants]), [['b', 2], ['a', 1]]);
  assert.equal(result.asOf, '2026-09-06T03:00:00.000Z');
  assert.deepEqual(result.monthlyItems, result.items);
  assert.equal(result.items[0].likes, 9);
  assert.equal(result.items[0].comments, 3);
  assert.equal(requests.length, 4);
  for (const url of requests.slice(0, 3)) {
    assert.deepEqual(url.searchParams.getAll('created_at'), ['gte.2026-08-07T03:00:00.000Z', 'lt.2026-09-06T03:00:00.000Z']);
    assert.equal(url.searchParams.get('typing_contents.report_count'), 'lt.10');
    assert.equal(url.searchParams.get('order'), 'id.asc');
  }
  assert.equal(requests[1].searchParams.get('id'), 'gt.1');
  assert.equal(requests[2].searchParams.get('id'), 'gt.3');
});

test('monthly includes older completions while weekly excludes them at the exact seven-day boundary', async () => {
  const rows = [completion('1', 'older', 'u1', '2026-08-30T02:59:59Z'),
    completion('2', 'older', 'u2', '2026-08-20T00:00:00Z'), completion('3', 'recent', 'u3', '2026-08-30T03:00:00Z')];
  let calls = 0;
  const client = createClient('https://example.supabase.co', 'test-key', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async (input) => {
      const data = String(input).includes('/typing_contents?')
        ? ['older', 'recent'].map(id => ({ id, like_count: 0, typing_comments: [{ count: 0 }] }))
        : ++calls === 1 ? rows : [];
      return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
    } },
  });
  const result = await loadWeeklyPopularity(client, new Date('2026-09-06T03:00:00Z'));
  assert.deepEqual(result.items.map(row => row.id), ['recent']);
  assert.deepEqual(result.monthlyItems.map(row => row.id), ['older', 'recent']);
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
