import { JOURNEY_COURSES } from './journey-data';
import { addDays, getKstDateString } from './kst-date';
import { TypingUtils } from './typing-speed';

export interface DailyQuestion {
  id: string;
  courseId: string;
  category: string;
  prompt: string;
  answer: string;
  aliases: string[];
  detail: string;
  visual: { kind: 'flag'; countryCode: string; country: string }
    | { kind: 'element'; symbol: string; atomicNumber: number }
    | { kind: 'history'; order: number; year: string };
}

const COURSE_IDS = ['world-capitals', 'joseon-kings', 'periodic-table'];
export const DAILY_QUESTIONS: DailyQuestion[] = COURSE_IDS.flatMap(courseId => {
  const course = JOURNEY_COURSES.find(item => item.id === courseId);
  if (!course) return [];
  return course.lines.flatMap(line => line.stations.map((station, index) => ({
    id: `${course.id}:${station.id}`,
    courseId: course.id,
    category: course.category,
    prompt: course.flow === 'quiz' ? `${station.name}${course.questionSuffix || ''}`
      : course.ui === 'periodic' ? `원자번호 ${index + 1}번 (${station.reading}), 이 원소는?`
      : `조선 ${index + 1}대 왕은?`,
    answer: course.flow === 'quiz' ? station.fact : station.name,
    aliases: course.flow === 'quiz' ? station.aliases || [] : [],
    detail: course.flow === 'quiz' ? station.detail || `${station.name}의 수도는 ${station.fact}입니다.` : station.fact,
    visual: course.id === 'world-capitals'
      ? { kind: 'flag' as const, countryCode: station.id, country: station.name }
      : course.id === 'periodic-table'
        ? { kind: 'element' as const, symbol: station.reading || '', atomicNumber: index + 1 }
        : { kind: 'history' as const, order: index + 1, year: station.year || '' },
  })));
});

export interface DailyAnswer {
  id: string;
  independent: boolean;
  hintUsed: boolean;
}

export interface DailySession {
  date: string;
  questionIds: string[];
  answers: DailyAnswer[];
  input: string;
  hintUsed: boolean;
  mistaken: boolean;
  startedAt: string | null;
  updatedAt: string;
  completedAt: string | null;
}

export interface DailyState {
  version: 1;
  session: DailySession | null;
  reviews: Record<string, { dueDate: string; streak: number; updatedAt?: string }>;
}

export function emptyDailyState(): DailyState {
  return { version: 1, session: null, reviews: {} };
}

function hash(value: string): number {
  let result = 2166136261;
  for (const char of value) result = Math.imul(result ^ char.charCodeAt(0), 16777619);
  return result >>> 0;
}

export function prepareDaily(state: DailyState, now = new Date()): DailyState {
  const date = getKstDateString(now);
  if (state.session?.date === date) return state;
  const due = DAILY_QUESTIONS.filter(q => state.reviews[q.id]?.dueDate <= date)
    .sort((a, b) => state.reviews[a.id].dueDate.localeCompare(state.reviews[b.id].dueDate) || a.id.localeCompare(b.id));
  const groups = COURSE_IDS.map(id => DAILY_QUESTIONS.filter(q => q.courseId === id)
    .sort((a, b) => hash(`${date}:${a.id}`) - hash(`${date}:${b.id}`)));
  const mixed = Array.from({ length: Math.max(...groups.map(group => group.length)) }, (_, i) => groups.flatMap(group => group[i] ? [group[i]] : [])).flat();
  const ids = [...new Set([...due, ...mixed].map(q => q.id))].slice(0, 5);
  return { ...state, session: { date, questionIds: ids, answers: [], input: '', hintUsed: false, mistaken: false,
    startedAt: null, updatedAt: now.toISOString(), completedAt: null } };
}

export function currentDailyQuestion(state: DailyState): DailyQuestion | undefined {
  const session = state.session;
  return DAILY_QUESTIONS.find(q => q.id === session?.questionIds[session.answers.length]);
}

export function answerDaily(state: DailyState, now = new Date()): DailyState {
  const session = state.session;
  const question = currentDailyQuestion(state);
  if (!session || !question || session.completedAt || !session.input.trim()) return state;
  const correct = [question.answer, ...question.aliases].some(answer => TypingUtils.normalize(answer) === TypingUtils.normalize(session.input));
  const independent = !session.hintUsed && !session.mistaken;
  const previousStreak = state.reviews[question.id]?.streak || 0;
  const reviews = { ...state.reviews, [question.id]: {
    dueDate: addDays(getKstDateString(now), correct && independent ? Math.min(14, 3 * (previousStreak + 1)) : 1),
    streak: correct && independent ? previousStreak + 1 : 0,
    updatedAt: now.toISOString(),
  } };
  if (!correct) return { ...state, reviews, session: { ...session, mistaken: true, updatedAt: now.toISOString() } };
  const answers = [...session.answers, { id: question.id, independent, hintUsed: session.hintUsed }];
  return { ...state, reviews, session: { ...session, answers, input: '', hintUsed: false, mistaken: false,
    updatedAt: now.toISOString(), completedAt: answers.length === session.questionIds.length ? now.toISOString() : null } };
}

export function hintDaily(state: DailyState, now = new Date()): DailyState {
  const session = state.session;
  const question = currentDailyQuestion(state);
  if (!session || !question || session.completedAt) return state;
  return { ...state, reviews: { ...state.reviews, [question.id]: { dueDate: addDays(getKstDateString(now), 1), streak: 0, updatedAt: now.toISOString() } },
    session: { ...session, hintUsed: true, updatedAt: now.toISOString() } };
}
