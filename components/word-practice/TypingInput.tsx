"use client";

import React, { useEffect, useRef } from "react";

interface TypingInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const TypingInput: React.FC<TypingInputProps> = ({ value, onChange, onKeyDown, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  return (
    <div className="w-full max-w-sm mt-8">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
        className="w-full h-14 px-6 text-2xl text-center bg-gray-100 border-2 border-gray-300 rounded-lg outline-hidden focus:border-blue-500 focus:bg-white transition-all shadow-inner"
        placeholder="단어를 입력하세요"
        autoFocus
      />
    </div>
  );
};
