import { LONG_TEXT_DB, LongTextData } from './long-text-data';
import { getKstDateString } from './kst-date';
export { getKstDateString } from './kst-date';

// KST 기준 날짜 문자열 (YYYY-MM-DD) — 서버 타임존과 무관하게 한국 날짜로 고정

// 같은 날짜면 항상 같은 작품이 선택되도록 날짜 문자열을 해시해 결정
export function getDailyPilsa(now: Date = new Date()): LongTextData {
  const dateStr = getKstDateString(now);
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  return LONG_TEXT_DB[hash % LONG_TEXT_DB.length];
}

// 카드/미리보기용 발췌: 첫 문장 위주로 maxLength 이내로 자름
export function getPilsaExcerpt(text: LongTextData, maxLength = 90): string {
  const firstLine = text.content
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(' ');
  if (firstLine.length <= maxLength) return firstLine;
  return `${firstLine.slice(0, maxLength)}…`;
}
