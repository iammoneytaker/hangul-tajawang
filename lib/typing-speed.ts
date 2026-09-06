/**
 * 표준 한국어 타자 속도 및 정확도 계산 유틸리티
 * 한컴 타자연습 방식 (자소 단위) 계측 알고리즘 적용
 */

export interface TypingReport {
  kpm: number;             // 분당 타수 (Strokes Per Minute)
  accuracy: number;        // 정확도 (%)
  totalStrokes: number;    // 총 자소 입력 횟수
  correctStrokes: number;  // 정확하게 입력한 자소 횟수
  elapsedSeconds: number;
  grade: string;
  errors: { index: number; expected: string; actual: string }[];
}

export class TypingUtils {
  // 한글 자소별 타수 가중치 (한컴타자 표준)
  private static CHOSEONG_STROKES = [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1]; // ㄱㄲㄴㄷㄸㄹ...
  private static JOONGSEONG_STROKES = [1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 2, 2, 1, 1, 2, 2, 2, 1, 1, 2, 1]; // ㅏㅐㅑㅒㅓㅔ...
  private static JONGSEONG_STROKES = [0, 1, 2, 2, 1, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1]; // (없음)ㄱㄲㄳㄴ...

  /**
   * 텍스트의 총 자소(타수)를 계산합니다.
   * "한" -> ㅎ,ㅏ,ㄴ -> 3타
   */
  static getStrokeCount(text: string): number {
    let count = 0;
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code >= 0xAC00 && code <= 0xD7A3) { // 한글 완성형
        const index = code - 0xAC00;
        const choseong = Math.floor(index / 588);
        const joongseong = Math.floor((index % 588) / 28);
        const jongseong = index % 28;
        count += this.CHOSEONG_STROKES[choseong] + this.JOONGSEONG_STROKES[joongseong] + this.JONGSEONG_STROKES[jongseong];
      } else if (code >= 0x3131 && code <= 0x3163) { // 한글 자모
        count += 1;
      } else if (code === 32) { // 공백
        count += 1;
      } else if (code > 32) { // 숫자, 영문, 기호
        count += 1;
      }
    }
    return count;
  }

  static normalize(text: string): string {
    if (!text) return "";
    return text
      .replace(/[“”「」『』]/g, '"')
      .replace(/[‘’`]/g, "'")
      .replace(/[…⋯]/g, "...")
      .replace(/[—–―]/g, "-") // 줄표(일반 키보드로 입력 불가)는 하이픈으로 판정
      .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
      .trim();
  }

  /**
   * 정확도 계산: (정확한 글자 수 / 총 입력 글자 수) * 100
   */
  static calculateAccuracy(correctChars: number, totalTypedChars: number): number {
    if (totalTypedChars <= 0) return 100;
    return Math.min(100, Math.round((correctChars / totalTypedChars) * 100));
  }

  static getGrade(kpm: number, accuracy: number): string {
    if (!Number.isFinite(kpm) || !Number.isFinite(accuracy) || accuracy < 90) return 'D급 (연습필요)';
    const score = accuracy < 95 ? Math.min(kpm * 0.9, 299) : kpm;

    if (score >= 600) return 'SSS급 (신)';
    if (score >= 500) return 'SS급 (고수)';
    if (score >= 400) return 'S급 (숙련자)';
    if (score >= 300) return 'A급 (상급자)';
    if (score >= 200) return 'B급 (중급자)';
    if (score >= 100) return 'C급 (초급자)';
    return 'D급 (연습필요)';
  }

  static generateWordReport(words: string[], wordsWithMistakes: number, elapsedSeconds: number): TypingReport {
    const text = words.join('');
    const report = this.generateReport(text, text, 0, elapsedSeconds);
    const accuracy = this.calculateAccuracy(Math.max(0, words.length - wordsWithMistakes), words.length);
    return { ...report, accuracy, grade: this.getGrade(report.kpm, accuracy) };
  }

  static generateReport(
    original: string, 
    typed: string, 
    totalKeystrokes: number, // 키보드를 실제 누른 횟수 (오타 포함)
    elapsedSeconds: number
  ): TypingReport {
    const normOriginal = this.normalize(original);
    const normTyped = this.normalize(typed);
    
    let correctChars = 0;
    let correctStrokes = 0;
    const errors: { index: number; expected: string; actual: string }[] = [];

    // 글자 단위 비교 및 정확한 타수 계산
    for (let i = 0; i < normTyped.length; i++) {
      if (i < normOriginal.length) {
        if (normOriginal[i] === normTyped[i]) {
          correctChars++;
          correctStrokes += this.getStrokeCount(normOriginal[i]);
        } else {
          errors.push({ index: i, expected: normOriginal[i], actual: normTyped[i] });
        }
      }
    }

    // 타수(KPM) 공식: (총 입력 자소 / 시간) * 60
    // 실제 입력한 모든 자소 수 계산
    const totalInputStrokes = this.getStrokeCount(normTyped);
    const kpm = elapsedSeconds > 0 ? Math.round((totalInputStrokes / elapsedSeconds) * 60) : 0;
    const accuracy = this.calculateAccuracy(correctChars, normTyped.length);

    return {
      kpm,
      accuracy,
      totalStrokes: totalInputStrokes,
      correctStrokes,
      elapsedSeconds: Math.round(elapsedSeconds),
      grade: this.getGrade(kpm, accuracy),
      errors
    };
  }
}
