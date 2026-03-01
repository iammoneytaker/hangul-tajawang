"use client";

import React from "react";
import { Mail, MessageSquareHeart, ExternalLink } from "lucide-react";

export const BetaFeedback: React.FC = () => {
  return (
    <section className="w-full max-w-2xl mx-auto mt-12 mb-8 px-4 flex flex-col items-center">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 md:p-10 shadow-xl border border-blue-100 dark:border-zinc-800 relative overflow-hidden w-full text-center">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <MessageSquareHeart size={120} className="text-blue-600" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <h3 className="text-3xl font-black mb-3 flex items-center gap-2 justify-center">
            <span className="text-blue-600 text-4xl">💡</span> 한글타자왕에게 제안하기
          </h3>
          <p className="text-zinc-500 mb-10 leading-relaxed max-w-md mx-auto">
            오픈 베타 기간 동안 여러분의 소중한 의견을 듣고 있습니다. <br/>
            추가되었으면 하는 기능이나 불편한 점을 아래 이메일로 보내주세요!
          </p>

          <div className="w-full max-w-md bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-700 group transition-all hover:border-blue-200">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">Feedback Email</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <span className="text-xl md:text-2xl font-black text-zinc-800 dark:text-zinc-100 select-all">
                    withanalog@gmail.com
                </span>
                <a 
                    href="mailto:withanalog@gmail.com?subject=[한글타자왕 웹] 기능 제안 및 피드백"
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95"
                >
                    <Mail size={16} />
                    메일 보내기
                </a>
            </div>
          </div>

          <p className="mt-8 text-xs text-zinc-400 font-medium flex items-center gap-1">
            보내주신 의견은 서비스 발전에 큰 도움이 됩니다. 감사합니다! <ExternalLink size={12} />
          </p>
        </div>
      </div>
    </section>
  );
};
