"use client";

import React from "react";

interface FlashcardProps {
  word: string;
  isCorrect?: boolean;
  isError?: boolean;
}

export const Flashcard: React.FC<FlashcardProps> = ({ word, isCorrect, isError }) => {
  return (
    <div className={`relative w-64 h-40 flex items-center justify-center bg-white border-2 border-gray-200 rounded-xl shadow-lg transition-all duration-300 transform ${isCorrect ? 'scale-105 border-green-400' : ''} ${isError ? 'animate-shake border-red-400' : ''}`}>
      <div className="absolute top-0 left-0 w-full h-2 bg-blue-500 rounded-t-xl opacity-20"></div>
      <span className="text-4xl font-bold text-gray-800 tracking-wider">
        {word}
      </span>
      {/* Decorative hole for 'analog' feel */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-100 shadow-inner"></div>
    </div>
  );
};
