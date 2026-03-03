/**
 * 표준 한국어 타자 속도 계산 및 텍스트 정규화 유틸리티
 * korean_typing 앱 프로젝트의 TypingSpeedCalculator 로직과 100% 일치하도록 구현
 */

export interface TypingReport {
  grossSpeed: number;      
  netSpeed: number;        
  accuracy: number;        
  grade: string;           
  totalKeystrokes: number; 
  correctChars: number; 
  elapsedSeconds: number;
  errors: { index: number; expected: string; actual: string }[];
}

export class TypingUtils {
  // 앱(Flutter)과 동일한 기준값: 한국어 1글자 평균 2.3 자소
  private static AVG_KEYS_PER_CHAR = 2.3;

  static normalize(text: string): string {
    if (!text) return "";
    return text
      .replace(/[“ ” 「 」]/g, '"')
      .replace(/[‘ ’ \`]/g, "'")
      .replace(/[… ⋯]/g, "...")
      .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim();
  }

  static calculateGrossSpeed(totalKeystrokes: number, elapsedSeconds: number): number {
    if (elapsedSeconds <= 0) return 0;
    // 앱 로직: (총타수 / 2.3) / (초 / 60)
    const estimatedChars = totalKeystrokes / this.AVG_KEYS_PER_CHAR;
    return Math.round((estimatedChars / elapsedSeconds) * 60);
  }

  static getGrade(grossSpeed: number, accuracy: number): string {
    let adjustedSpeed = grossSpeed;
    if (accuracy < 90) adjustedSpeed *= 0.8;
    else if (accuracy < 95) adjustedSpeed *= 0.9;

    if (adjustedSpeed >= 500) return 'SSS급 (전문가)';
    if (adjustedSpeed >= 400) return 'SS급 (고수)';
    if (adjustedSpeed >= 300) return 'S급 (숙련자)';
    if (adjustedSpeed >= 250) return 'A급 (상급자)';
    if (adjustedSpeed >= 200) return 'B급 (중급자)';
    if (adjustedSpeed >= 150) return 'C급 (초급자)';
    if (adjustedSpeed >= 100) return 'D급 (입문자)';
    return 'E급 (연습 필요)';
  }

  static generateReport(
    original: string, 
    typed: string, 
    totalKeystrokes: number, 
    elapsedSeconds: number
  ): TypingReport {
    const normOriginal = this.normalize(original);
    const normTyped = this.normalize(typed);
    
    let correctChars = 0;
    const errors: { index: number; expected: string; actual: string }[] = [];

    // 앱 방식: 글자 단위 1:1 비교
    const maxLen = Math.max(normOriginal.length, normTyped.length);
    for (let i = 0; i < normOriginal.length; i++) {
      if (i < normTyped.length && normOriginal[i] === normTyped[i]) {
        correctChars++;
      } else {
        errors.push({ 
          index: i, 
          expected: normOriginal[i], 
          actual: i < normTyped.length ? normTyped[i] : "" 
        });
      }
    }

    const accuracy = Math.round((correctChars / normOriginal.length) * 100);
    const grossSpeed = this.calculateGrossSpeed(totalKeystrokes, elapsedSeconds);
    const netSpeed = Math.round((correctChars / elapsedSeconds) * 60); // 앱의 Net Speed 방식
    const grade = this.getGrade(grossSpeed, accuracy);

    return {
      grossSpeed,
      netSpeed,
      accuracy,
      grade,
      totalKeystrokes,
      correctChars,
      elapsedSeconds,
      errors
    };
  }
}
