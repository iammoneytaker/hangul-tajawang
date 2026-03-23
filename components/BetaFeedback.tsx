"use client";

import React, { useState } from "react";
import { Mail, MessageSquareHeart, Copy, Check, ExternalLink, Sparkles } from "lucide-react";

export const BetaFeedback: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const email = "withanalog@gmail.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full max-w-4xl mx-auto py-24 px-6 flex flex-col items-center">
      <div className="glass-card p-8 md:p-16 relative overflow-hidden w-full text-center">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <MessageSquareHeart size={200} className="text-primary" />
        </div>
        <div className="absolute bottom-0 left-0 p-12 opacity-[0.03] pointer-events-none">
            <Sparkles size={120} className="text-secondary" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <span className="text-primary font-black text-[10px] uppercase tracking-[0.5em] mb-6 block">Feedback & Suggestions</span>
          <h3 className="display-lg !text-4xl md:!text-5xl mb-8 text-on-surface tracking-[-0.02em]">
            한글타자왕에게 제안하기
          </h3>
          <p className="text-zinc-500 mb-12 leading-relaxed max-w-xl mx-auto font-medium text-lg tracking-[-0.01em]">
            사용자분들의 소중한 의견을 기다리고 있습니다. <br className="hidden sm:block"/>
            추가되었으면 하는 기능이나 불편한 점을 자유롭게 들려주세요!
          </p>

          <div className="w-full max-w-2xl bg-surface-low rounded-[3rem] p-6 md:p-10 transition-all">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-8">Contact Channels</p>
            
            <div className="flex flex-col gap-4">
                {/* Email Address Display */}
                <div className="bg-surface-lowest p-4 md:py-5 md:px-8 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between group/email gap-4">
                    <span className="text-lg md:text-xl font-black text-on-surface tracking-tight break-all">
                        {email}
                    </span>
                    <button 
                        onClick={handleCopy}
                        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full font-black text-xs transition-all ${
                            copied 
                            ? "bg-green-100 text-green-600" 
                            : "bg-surface-low text-zinc-400 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20"
                        }`}
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? "복사 완료!" : "주소 복사하기"}
                    </button>
                </div>

                {/* Direct Action Button */}
                <a 
                    href={`mailto:${email}?subject=[한글타자왕 웹] 기능 제안 및 피드백`}
                    className="flex items-center justify-center gap-3 px-10 py-5 primary-gradient text-white rounded-full font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl hover:shadow-primary/30"
                >
                    <Mail size={22} />
                    메일 보내기
                </a>
            </div>
          </div>

          <p className="mt-10 text-xs text-zinc-400 font-black uppercase tracking-widest flex items-center gap-2 opacity-60">
            <ExternalLink size={14} /> 메일 앱이 열리지 않는다면 주소를 복사해서 사용해 주세요.
          </p>
        </div>
      </div>
    </section>
  );
};
