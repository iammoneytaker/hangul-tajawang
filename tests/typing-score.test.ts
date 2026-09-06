import assert from 'node:assert/strict';
import { test } from 'node:test';
import { TypingUtils } from '../lib/typing-speed';

test('높은 타수만으로 부정확한 입력에 높은 등급을 주지 않는다', () => {
  assert.equal(TypingUtils.getGrade(750, 0), 'D급 (연습필요)');
  assert.equal(TypingUtils.getGrade(1000, 89), 'D급 (연습필요)');
  assert.equal(TypingUtils.getGrade(750, 94), 'B급 (중급자)');
  assert.equal(TypingUtils.getGrade(750, 95), 'SSS급 (신)');
  assert.equal(TypingUtils.getGrade(Number.NaN, 100), 'D급 (연습필요)');
});

test('낱말 결과는 오타를 수정한 단어를 구별하고 입력하지 않은 공백은 타수에서 제외한다', () => {
  const report = TypingUtils.generateWordReport(['나라', '나무'], 1, 60);
  assert.equal(report.accuracy, 50);
  assert.equal(report.kpm, TypingUtils.getStrokeCount('나라나무'));
  assert.equal(report.correctStrokes, report.totalStrokes);
});
