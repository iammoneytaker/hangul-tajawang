import { DAILY_QUESTIONS, emptyDailyState, prepareDaily, type DailyState } from './daily-journey';

const STORAGE_KEY = 'tajawang_daily_v1';
export function dailyStorageKey(userId: string | null): string {
  return userId ? `${STORAGE_KEY}:user:${userId}` : STORAGE_KEY;
}
const ids = new Set(DAILY_QUESTIONS.map(q => q.id));
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isDate = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value));
const isTime = (value: unknown): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value));

export function parseDailyState(raw: string | null): DailyState {
  try {
    const value: unknown = JSON.parse(raw || 'null');
    if (!isObject(value) || value.version !== 1 || !isObject(value.reviews)) return emptyDailyState();
    const reviews: DailyState['reviews'] = {};
    for (const [id, review] of Object.entries(value.reviews)) {
      if (ids.has(id) && isObject(review) && isDate(review.dueDate) && typeof review.streak === 'number' && Number.isInteger(review.streak) && review.streak >= 0) {
        reviews[id] = { dueDate: review.dueDate, streak: review.streak,
          ...(isTime(review.updatedAt) ? { updatedAt: review.updatedAt } : {}) };
      }
    }
    const state: DailyState = { version: 1, session: null, reviews };
    const s = value.session;
    if (!isObject(s) || !isDate(s.date) || !isTime(s.updatedAt)
      || !(s.startedAt === null || isTime(s.startedAt)) || !(s.completedAt === null || isTime(s.completedAt))
      || typeof s.input !== 'string' || typeof s.hintUsed !== 'boolean' || typeof s.mistaken !== 'boolean'
      || !Array.isArray(s.questionIds) || s.questionIds.length !== 5 || new Set(s.questionIds).size !== 5
      || !s.questionIds.every((id: unknown): id is string => typeof id === 'string' && ids.has(id))
      || !Array.isArray(s.answers) || s.answers.length > 5) return state;
    const questionIds: string[] = s.questionIds;
    const answers: NonNullable<DailyState['session']>['answers'] = [];
    for (const [i, answer] of s.answers.entries()) {
      if (!isObject(answer) || answer.id !== questionIds[i] || typeof answer.id !== 'string'
        || typeof answer.independent !== 'boolean' || typeof answer.hintUsed !== 'boolean') return state;
      answers.push({ id: answer.id, independent: answer.independent, hintUsed: answer.hintUsed });
    }
    if ((answers.length === 5) !== (s.completedAt !== null)) return state;
    return { ...state, session: { date: s.date, questionIds, answers, input: s.input, hintUsed: s.hintUsed,
      mistaken: s.mistaken, startedAt: s.startedAt, updatedAt: s.updatedAt, completedAt: s.completedAt } };
  } catch { return emptyDailyState(); }
}

export function loadDailyState(now = new Date(), userId: string | null = null): DailyState {
  try { return prepareDaily(parseDailyState(localStorage.getItem(dailyStorageKey(userId))), now); }
  catch { return prepareDaily(emptyDailyState(), now); }
}

export function saveDailyState(state: DailyState, userId: string | null = null): boolean {
  try { localStorage.setItem(dailyStorageKey(userId), JSON.stringify(state)); return true; }
  catch { return false; }
}
