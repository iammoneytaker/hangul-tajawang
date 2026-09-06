import { supabase } from './supabase';
import { parseDailyState } from './daily-journey-storage';
import type { DailyRepository } from './daily-journey-sync';

export function dailyRepository(userId: string, signal: AbortSignal): DailyRepository {
  async function checkAccount() {
    signal.throwIfAborted();
    const { data } = await supabase.auth.getSession();
    if (data.session?.user.id !== userId) throw new Error('로그인 계정이 변경되었습니다.');
  }
  return {
    async read() {
      await checkAccount();
      const { data, error } = await supabase.from('daily_journey_progress').select('state,revision')
        .eq('user_id', userId).abortSignal(signal).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      if (!Number.isSafeInteger(data.revision) || data.revision < 1) throw new Error('저장 기록을 확인할 수 없습니다.');
      return { state: parseDailyState(JSON.stringify(data.state)), revision: Number(data.revision) };
    },
    async write(state, expectedRevision) {
      await checkAccount();
      const values = { user_id: userId, state, revision: (expectedRevision ?? 0) + 1 };
      const query = expectedRevision === null
        ? supabase.from('daily_journey_progress').insert(values)
        : supabase.from('daily_journey_progress').update(values).eq('user_id', userId).eq('revision', expectedRevision);
      const { data, error } = await query.select('revision').abortSignal(signal);
      if (error?.code === '23505') return false;
      if (error) throw error;
      return Boolean(data?.length);
    },
  };
}
