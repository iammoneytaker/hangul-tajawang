/**
 * 표준 한국어 타자 속도 계산 및 텍스트 정규화 유틸리티
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
  /**
   * 텍스트 정규화 (Normalization)
   * 따옴표, 줄임표, 전각 숫자 등을 표준 형태로 변환
   */
  static normalize(text: string): string {
    return text
      .replace(/[“ ” 「 」]/g, '"')
      .replace(/[‘ ’ \`]/g, "'")
      .replace(/[… ⋯]/g, "...")
      .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
  }

  /**
   * 총 타수 속도 (Gross Speed) 계산
   * 한국어 1글자 평균 2.3 자소 가정
   */
  static calculateGrossSpeed(totalKeystrokes: number, elapsedSeconds: number): number {
    if (elapsedSeconds <= 0) return 0;
    return Math.round(((totalKeystrokes / 2.3) / elapsedSeconds) * 60);
  }

  /**
   * 순 타수 속도 (Net Speed) 계산
   */
  static calculateNetSpeed(correctChars: number, elapsedSeconds: number): number {
    if (elapsedSeconds <= 0) return 0;
    return Math.round((correctChars / elapsedSeconds) * 60);
  }

  /**
   * 등급 판정 (Grade)
   */
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

  /**
   * 결과 리포트 생성 및 오타 분석
   */
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

    const minLen = Math.min(normOriginal.length, normTyped.length);
    for (let i = 0; i < minLen; i++) {
      if (normOriginal[i] === normTyped[i]) {
        correctChars++;
      } else {
        errors.push({ index: i, expected: original[i], actual: typed[i] });
      }
    }

    const accuracy = Math.round((correctChars / normOriginal.length) * 100);
    const grossSpeed = this.calculateGrossSpeed(totalKeystrokes, elapsedSeconds);
    const netSpeed = this.calculateNetSpeed(correctChars, elapsedSeconds);
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
