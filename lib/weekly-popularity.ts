import type { SupabaseClient } from '@supabase/supabase-js';

export interface WeeklyCompletion {
  readonly id: string;
  readonly content_id: string;
  readonly user_id: string | null;
  readonly created_at: string;
  readonly typing_contents: { readonly title: string; readonly category: string | null } | null;
}

export interface PopularChallenge {
  readonly id: string;
  readonly title: string;
  readonly category: string | null;
  readonly participants: number;
  readonly lastCompletedAt: string;
}

export interface WeeklyPopularity {
  readonly items: readonly PopularChallenge[];
  readonly asOf: string;
}

export function rankWeeklyCompletions(rows: readonly WeeklyCompletion[]): PopularChallenge[] {
  const posts = new Map<string, { title: string; category: string | null; users: Set<string>; last: string }>();
  for (const row of rows) {
    if (!row.user_id || !row.typing_contents) continue;
    const post = posts.get(row.content_id) ?? {
      ...row.typing_contents, users: new Set<string>(), last: row.created_at,
    };
    post.users.add(row.user_id);
    if (Date.parse(row.created_at) > Date.parse(post.last)) post.last = row.created_at;
    posts.set(row.content_id, post);
  }
  return [...posts].map(([id, post]) => ({ id, title: post.title, category: post.category,
    participants: post.users.size, lastCompletedAt: post.last,
  })).sort((a, b) => b.participants - a.participants
    || Date.parse(b.lastCompletedAt) - Date.parse(a.lastCompletedAt) || a.id.localeCompare(b.id)).slice(0, 3);
}

export async function loadWeeklyPopularity(client: SupabaseClient, now = new Date()): Promise<WeeklyPopularity> {
  const asOf = now.toISOString();
  const since = new Date(now.getTime() - 7 * 86400000).toISOString();
  const rows: WeeklyCompletion[] = [];
  const signal = AbortSignal.timeout(15000);
  let after: string | null = null;
  for (;;) {
    let query = client.from('typing_results')
      .select('id,content_id,user_id,created_at,typing_contents!inner(title,category)')
      .gte('created_at', since).lt('created_at', asOf)
      .lt('typing_contents.report_count', 10).not('user_id', 'is', null)
      .order('id', { ascending: true }).limit(500).abortSignal(signal);
    if (after) query = query.gt('id', after);
    const { data, error } = await query.returns<WeeklyCompletion[]>();
    if (error) throw error;
    const page = data ?? [];
    if (!page.length) break;
    rows.push(...page);
    after = page[page.length - 1].id;
  }
  return { items: rankWeeklyCompletions(rows), asOf };
}
