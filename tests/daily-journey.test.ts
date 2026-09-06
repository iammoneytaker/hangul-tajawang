import assert from 'node:assert/strict';
import { test } from 'node:test';
import { answerDaily, currentDailyQuestion, DAILY_QUESTIONS, emptyDailyState, hintDaily, prepareDaily } from '../lib/daily-journey';
import { parseDailyState } from '../lib/daily-journey-storage';
import { getKstDateString } from '../lib/kst-date';

const today = new Date('2026-09-06T03:00:00Z');
test('KST 자정에 새 날짜가 시작된다', () => {
  assert.equal(getKstDateString(new Date('2026-09-05T14:59:59Z')), '2026-09-05');
  assert.equal(getKstDateString(new Date('2026-09-05T15:00:00Z')), '2026-09-06');
});

test('하루의 다섯 문제는 고유하고 새로고침해도 변하지 않는다', () => {
  const state = prepareDaily(emptyDailyState(), today);
  assert.equal(new Set(state.session?.questionIds).size, 5);
  assert.deepEqual(prepareDaily(emptyDailyState(), today), state);
  assert.deepEqual(prepareDaily(parseDailyState(JSON.stringify(state)), today), state);
});

test('오답과 힌트는 새로고침 후에도 남고 다음날 복습이 우선된다', () => {
  let state = prepareDaily(emptyDailyState(), today);
  assert.ok(state.session);
  const question = currentDailyQuestion(state);
  assert.ok(question);
  state = answerDaily({ ...state, session: { ...state.session, input: '오답' } }, today);
  state = hintDaily(state, today);
  state = parseDailyState(JSON.stringify(state));
  assert.ok(state.session?.mistaken);
  assert.ok(state.session.hintUsed);
  state = answerDaily({ ...state, session: { ...state.session, input: question.answer } }, today);
  assert.equal(state.session?.answers[0].independent, false);
  assert.equal(state.reviews[question.id].dueDate, '2026-09-07');
  const tomorrow = prepareDaily(state, new Date('2026-09-07T03:00:00Z'));
  assert.equal(tomorrow.session?.questionIds[0], question.id);
});

test('다섯 문제를 완료하면 중복 제출해도 기록과 복습 간격이 바뀌지 않는다', () => {
  let state = prepareDaily(emptyDailyState(), today);
  for (let i = 0; i < 5; i++) {
    const q = currentDailyQuestion(state);
    assert.ok(q && state.session);
    state = answerDaily({ ...state, session: { ...state.session, input: q.answer } }, today);
  }
  assert.ok(state.session?.completedAt);
  assert.equal(state.session.answers.filter(a => a.independent).length, 5);
  assert.deepEqual(answerDaily(state, today), state);
  assert.deepEqual(prepareDaily(state, today), state);
  assert.equal(Object.values(state.reviews)[0].dueDate, '2026-09-09');
});

test('손상된 저장값은 안전하게 초기 상태로 읽는다', () => {
  for (const value of ['broken', '{}', '{"version":1,"reviews":{},"session":{"questionIds":["missing"]}}']) {
    assert.deepEqual(parseDailyState(value), emptyDailyState());
  }
});

test('새로운 오늘의 문제에는 국기를 보고 나라를 입력하는 문제가 포함된다', () => {
  const state = prepareDaily(emptyDailyState(), today);
  const flag = state.session?.questionIds.map(id => DAILY_QUESTIONS.find(q => q.id === id)).find(q => q?.courseId === 'flag-quiz');
  assert.ok(flag);
  assert.equal(flag.visual.kind, 'country-flag');
  assert.ok(!flag.prompt.includes(flag.answer));
  assert.ok(!('country' in flag.visual));
});

test('국기 문제가 추가되어도 저장된 오늘의 문제와 완료 결과는 바꾸지 않는다', () => {
  let state = prepareDaily(emptyDailyState(), today);
  assert.ok(state.session);
  state.session.questionIds = DAILY_QUESTIONS.filter(q => q.courseId === 'world-capitals').slice(0, 5).map(q => q.id);
  const restored = parseDailyState(JSON.stringify(state));
  assert.deepEqual(prepareDaily(restored, today), state);
  for (let i = 0; i < 5; i++) {
    const question = currentDailyQuestion(state);
    assert.ok(question && state.session);
    state = answerDaily({ ...state, session: { ...state.session, input: question.answer } }, today);
  }
  assert.ok(state.session?.completedAt);
  assert.deepEqual(prepareDaily(parseDailyState(JSON.stringify(state)), today), state);
});

test('나라 맞히기는 호주 같은 통용 이름도 정답으로 인정한다', () => {
  const state = prepareDaily(emptyDailyState(), today);
  assert.ok(state.session);
  state.session.questionIds = ['flag-quiz:au', ...state.session.questionIds.filter(id => id !== 'flag-quiz:au').slice(0, 4)];
  state.session.input = '호주';
  assert.equal(answerDaily(state, today).session?.answers.length, 1);
});
