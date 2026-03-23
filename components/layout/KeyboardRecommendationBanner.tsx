"use client";

import React from "react";
import { Keyboard, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface KeyboardRecommendationBannerProps {
  variant?: "light" | "dark" | "glass";
  className?: string;
  title?: string;
  description?: string;
}

export const KeyboardRecommendationBanner: React.FC<KeyboardRecommendationBannerProps> = ({ 
  variant = "light",
  className = "",
  title = "당신의 타자 리듬을 완성할 최적의 장비",
  description = "전문가가 엄선한 키보드 추천 컬렉션을 확인해 보세요."
}) => {
  const baseStyles = "relative overflow-hidden rounded-[2rem] p-6 transition-all hover:scale-[1.02] active:scale-[0.98] group flex flex-col sm:flex-row items-center justify-between gap-6 mt-8";
  
  const variants = {
    light: "bg-surface-low text-on-surface shadow-sm hover:shadow-xl",
    dark: "bg-on-surface text-white shadow-2xl",
    glass: "glass-card text-on-surface"
  };

  return (
    <Link href="/recommend" className={`${baseStyles} ${variants[variant]} ${className}`}>
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-700">
        <Keyboard size={100} />
      </div>
      
      <div className="flex items-center gap-5 relative z-10 text-center sm:text-left">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${variant === 'dark' ? 'bg-primary/20 text-primary-container' : 'bg-primary/10 text-primary'}`}>
          <Sparkles size={28} />
        </div>
        <div>
          <h4 className="font-black text-lg mb-1 tracking-tight">{title}</h4>
          <p className={`text-xs font-medium ${variant === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>{description}</p>
        </div>
      </div>

      <div className={`px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 relative z-10 whitespace-nowrap ${variant === 'dark' ? 'bg-white text-on-surface' : 'primary-gradient text-white'}`}>
        추천 장비 보기 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};
