"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { TypingUtils, TypingReport } from "@/lib/typing-speed";

const SAMPLE_QUOTES = [
  "천재는 1%의 영감과 99%의 노력으로 이루어진다.",
  "내일은 내일의 태양이 뜬다.",
  "삶이 있는 한 희망은 있다.",
  "꿈을 꾸는 자만이 그 꿈을 이룰 수 있다.",
  "시작이 반이다.",
  "실패는 성공의 어머니이다.",
  "노력하는 자에게 복이 있나니.",
  "한글은 세계에서 가장 과학적인 문자이다.",
  "세종대왕님 만세!",
  "타자 연습은 재미있어요."
];

export const ShortPractice: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [report, setReport] = useState<TypingReport | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFlying, setIsFlying] = useState(false);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // 키 입력 수 증가 (간단하게 문자열 길이 변화로 측정)
    setTotalKeystrokes(prev => prev + 1);

    if (!startTime && value.length > 0) {
      setStartTime(Date.now());
    }

    const target = SAMPLE_QUOTES[currentIndex];
    if (value === target) {
      const timeTakenSec = (Date.now() - (startTime || Date.now())) / 1000;
      
      // 최신 TypingUtils 로직 기반 리포트 생성
      const finalReport = TypingUtils.generateReport(
        target,
        value,
        totalKeystrokes + 1, // 현재 입력 포함
        timeTakenSec
      );
      
      setReport(finalReport);
      setIsCorrect(true);
      setIsFlying(true);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % SAMPLE_QUOTES.length);
        setInputValue("");
        setStartTime(null);
        setTotalKeystrokes(0);
        setIsCorrect(false);
        setIsFlying(false);
      }, 800);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-2xl mx-auto p-4 overflow-hidden">
      <div className="mb-12 flex flex-wrap justify-center gap-4">
        <MetricCard label="현재 타수" value={report?.grossSpeed || 0} unit="타/분" color="text-blue-600" />
        <MetricCard label="정확도" value={report?.accuracy || 0} unit="%" color="text-green-600" />
        <MetricCard label="등급" value={report?.grade.split(' ')[0] || '-'} unit="" color="text-purple-600" />
      </div>

      <div className={`relative transition-all duration-500 transform ${isFlying ? 'translate-x-[150%] -translate-y-24 rotate-12 opacity-0' : 'translate-x-0'}`}>
        {/* Post-it UI */}
        <div className="w-full min-w-[320px] md:min-w-[500px] aspect-video bg-yellow-100 shadow-xl p-8 flex flex-col justify-center items-center text-center rounded-sm border-l-4 border-yellow-200 rotate-[-1deg]">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-black/5 rounded-full blur-sm"></div>
          <p className="text-2xl font-medium text-gray-800 leading-relaxed mb-4">
            {SAMPLE_QUOTES[currentIndex]}
          </p>
          <div className="h-1 w-24 bg-yellow-200 rounded-full"></div>
        </div>
      </div>

      <div className="w-full mt-16 relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className={`w-full h-16 px-8 text-xl bg-white border-2 rounded-2xl shadow-sm outline-hidden transition-all text-center ${isCorrect ? 'border-green-400 bg-green-50' : 'border-gray-100 focus:border-blue-400'}`}
          placeholder="위 문장을 그대로 입력하세요"
        />
        <div className="absolute -bottom-8 left-0 w-full flex justify-center">
            <div className="h-1 bg-gray-100 w-full max-w-md rounded-full overflow-hidden">
                <div 
                    className="h-full bg-blue-400 transition-all duration-300" 
                    style={{ width: `${(inputValue.length / SAMPLE_QUOTES[currentIndex].length) * 100}%` }}
                ></div>
            </div>
        </div>
      </div>
      
      <p className="mt-12 text-sm text-gray-400 italic">
        "문장을 완성하면 다음 포스트잇이 나타납니다."
      </p>
    </div>
  );
};

function MetricCard({ label, value, unit, color }: { label: string; value: string | number; unit: string; color: string }) {
  return (
    <div className="bg-white px-6 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center min-w-[120px]">
      <span className="text-gray-400 text-xs font-bold mb-1">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-black ${color}`}>{value}</span>
        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{unit}</span>
      </div>
    </div>
  );
}
