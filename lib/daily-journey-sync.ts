import type { DailySession, DailyState } from './daily-journey';
import { addDays, getKstDateString } from './kst-date';

export interface DailyRow { state: DailyState; revision: number }
export interface DailyRepository {
  read(): Promise<DailyRow | null>;
  write(state: DailyState, expectedRevision: number | null): Promise<boolean>;
}

export function hasDailyWork(state: DailyState): boolean {
  return Boolean(state.session?.startedAt || state.session?.answers.length || Object.keys(state.reviews).length);
}

function selectSession(a: DailySession | null, b: DailySession | null): DailySession | null {
  if (!a) return b;
  if (!b) return a;
  if (a.date !== b.date) return a.date > b.date ? a : b;
  if (a.answers.length !== b.answers.length) return a.answers.length > b.answers.length ? a : b;
  if (Boolean(a.startedAt) !== Boolean(b.startedAt)) return a.startedAt ? a : b;
  return a.updatedAt > b.updatedAt ? a : b;
}

export function mergeDailyStates(a: DailyState, b: DailyState): DailyState {
  const reviews = { ...a.reviews };
  for (const [id, review] of Object.entries(b.reviews)) {
    const previous = reviews[id];
    if (!previous || (review.updatedAt || '') > (previous.updatedAt || '')
      || ((review.updatedAt || '') === (previous.updatedAt || '') && review.dueDate < previous.dueDate)) reviews[id] = review;
  }
  let session = selectSession(a.session, b.session);
  if (a.session && b.session && session && a.session.date === b.session.date
    && a.session.questionIds.join() === b.session.questionIds.join()) {
    const other = session === a.session ? b.session : a.session;
    session = { ...session, answers: session.answers.map((answer, i) => {
      const duplicate = other.answers[i];
      if (duplicate) return { ...answer, independent: answer.independent && duplicate.independent,
        hintUsed: answer.hintUsed || duplicate.hintUsed };
      if (i === other.answers.length && (other.hintUsed || other.mistaken)) {
        return { ...answer, independent: false, hintUsed: answer.hintUsed || other.hintUsed };
      }
      return answer;
    }) };
    if (a.session.answers.length === b.session.answers.length) {
      session.hintUsed = a.session.hintUsed || b.session.hintUsed;
      session.mistaken = a.session.mistaken || b.session.mistaken;
    }
    for (const answer of session.answers) {
      const review = reviews[answer.id];
      if (!answer.independent && review && (!review.updatedAt || getKstDateString(new Date(review.updatedAt)) <= session.date)) {
        reviews[answer.id] = { ...review, streak: 0, dueDate: [review.dueDate, addDays(session.date, 1)].sort()[0] };
      }
    }
  }
  return { version: 1, session, reviews };
}

export function cloudDailyState(state: DailyState): DailyState {
  return { ...state, session: state.session ? { ...state.session, input: '' } : null };
}

export async function syncDailyState(local: DailyState, repository: DailyRepository): Promise<DailyState> {
  let merged = cloudDailyState(local);
  for (let attempt = 0; attempt < 3; attempt++) {
    const remote = await repository.read();
    if (remote) merged = cloudDailyState(mergeDailyStates(merged, remote.state));
    if (!hasDailyWork(merged) || (remote && JSON.stringify(merged) === JSON.stringify(remote.state))) return merged;
    if (await repository.write(merged, remote?.revision ?? null)) return merged;
  }
  throw new Error('다른 기기의 저장과 겹쳤습니다. 다시 동기화해 주세요.');
}
