"use client";

import React, { useState } from "react";
import { Mail, MessageSquareHeart, Copy, Check, ExternalLink } from "lucide-react";

export const BetaFeedback: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const email = "withanalog@gmail.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full max-w-2xl mx-auto mt-12 mb-8 px-4 flex flex-col items-center">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 md:p-10 shadow-xl border border-blue-100 dark:border-zinc-800 relative overflow-hidden w-full text-center">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <MessageSquareHeart size={120} className="text-blue-600" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <h3 className="text-3xl font-black mb-3 flex items-center gap-2 justify-center text-zinc-900 dark:text-zinc-50">
            <span className="text-blue-600 text-4xl">💡</span> 한글타자왕에게 제안하기
          </h3>
          <p className="text-zinc-500 mb-10 leading-relaxed max-w-md mx-auto">
            오픈 베타 기간 동안 여러분의 소중한 의견을 듣고 있습니다. <br/>
            추가되었으면 하는 기능이나 불편한 점을 아래 이메일로 보내주세요!
          </p>

          <div className="w-full max-w-lg bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-700 group transition-all hover:border-blue-200">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Feedback Contact</p>
            
            <div className="flex flex-col gap-4">
                {/* Email Address Display */}
                <div className="bg-white dark:bg-zinc-900 py-4 px-6 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-between group/email">
                    <span className="text-lg md:text-xl font-black text-zinc-800 dark:text-zinc-100">
                        {email}
                    </span>
                    <button 
                        onClick={handleCopy}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                            copied 
                            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-blue-50 hover:text-blue-600"
                        }`}
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? "복사됨!" : "복사하기"}
                    </button>
                </div>

                {/* Direct Action Button */}
                <a 
                    href={`mailto:${email}?subject=[한글타자왕 웹] 기능 제안 및 피드백`}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-lg shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Mail size={20} />
                    메일 앱으로 보내기
                </a>
            </div>
          </div>

          <p className="mt-8 text-xs text-zinc-400 font-medium flex items-center gap-1">
            메일 앱이 열리지 않는다면 이메일 주소를 복사해서 사용해 주세요. <ExternalLink size={12} />
          </p>
        </div>
      </div>
    </section>
  );
};
