"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Check, ChevronRight, Loader2, ExternalLink } from "lucide-react";
import { SupabaseService } from "@/lib/supabase";
import Link from "next/link";

export const PrivacyConsentModal = () => {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [showFullText, setShowFullText] = useState(false);

  useEffect(() => {
    const checkConsent = async () => {
      const user = await SupabaseService.getCurrentUser();
      if (user) {
        const profile = await SupabaseService.getMyProfile();
        // 동의하지 않은 유저에게만 모달 표시
        if (profile && !profile.privacy_policy_accepted) {
          setShow(true);
        }
      }
    };
    checkConsent();
  }, []);

  const handleAccept = async () => {
    if (!accepted) return;
    setLoading(true);
    try {
      await SupabaseService.updatePrivacyConsent();
      setShow(false);
    } catch (error) {
      alert("처리에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-zinc-950/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in duration-500">
        <div className="p-10 flex flex-col items-center text-center">
          {showFullText ? (
            <div className="w-full text-left animate-in slide-in-from-right duration-300">
              <button 
                onClick={() => setShowFullText(false)}
                className="mb-6 flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-blue-600 transition-colors"
              >
                <ChevronRight className="rotate-180" size={16} /> 뒤로 가기
              </button>
              <h2 className="text-xl font-black mb-6">개인정보 처리방침 전문</h2>
              <div className="h-64 overflow-y-auto pr-4 space-y-6 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed custom-scrollbar">
                <section>
                  <h3 className="font-black text-zinc-900 dark:text-zinc-100 mb-2">1. 수집하는 개인정보 항목</h3>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>소셜 로그인 정보: 이메일, 닉네임, 프로필 이미지</li>
                    <li>서비스 이용 기록: 타자 연습 기록(타수, 정확도, 오타 리스트), 최고 기록 등</li>
                    <li>자동 수집 항목: 쿠키, 방문 일시, 기기 정보 등</li>
                  </ul>
                </section>
                <section>
                  <h3 className="font-black text-zinc-900 dark:text-zinc-100 mb-2">2. 개인정보의 사용 목적</h3>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>회원 관리 및 로그인 서비스 제공</li>
                    <li>서비스 제공 및 품질 개선 (통계 데이터, 버그 수정)</li>
                    <li>이용 패턴 분석 및 맞춤형 광고 제공</li>
                  </ul>
                </section>
                <section>
                  <h3 className="font-black text-zinc-900 dark:text-zinc-100 mb-2">3. 개인정보의 공유 및 위탁</h3>
                  <p>서비스 운영을 위해 Supabase, Google Analytics, Microsoft Clarity 등을 활용합니다.</p>
                </section>
                <section>
                  <h3 className="font-black text-zinc-900 dark:text-zinc-100 mb-2">4. 개인정보의 보안 및 보유 기간</h3>
                  <p>회원 탈퇴 시까지 또는 서비스 종료 시까지 보유하며, 목적 달성 시 지체 없이 파기합니다.</p>
                </section>
                <section>
                  <h3 className="font-black text-zinc-900 dark:text-zinc-100 mb-2">5. 문의처</h3>
                  <p>withanalog@gmail.com</p>
                </section>
              </div>
              <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                <button 
                  onClick={() => { setShowFullText(false); setAccepted(true); }}
                  className="w-full py-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-black rounded-2xl transition-all active:scale-95"
                >
                  확인 및 동의하기
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center text-blue-600 mb-6">
                <ShieldCheck size={32} />
              </div>
              
              <h2 className="text-2xl font-black mb-4">서비스 이용을 위한 <br/>개인정보처리방침 동의 안내</h2>
              <p className="text-zinc-500 font-medium mb-8 leading-relaxed">
                한글타자왕은 사용자의 개인정보를 소중히 다룹니다. <br/>
                안전한 서비스 이용을 위해 개정된 개인정보처리방침에 동의해 주세요.
              </p>

              <div className="w-full space-y-4 mb-10">
                <button 
                  onClick={() => setShowFullText(true)}
                  className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl group hover:bg-zinc-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white dark:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-400">
                      <ExternalLink size={14} />
                    </div>
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">개인정보처리방침 전문 보기</span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button 
                  onClick={() => setAccepted(!accepted)}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                    accepted 
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/10" 
                      : "border-zinc-100 dark:border-zinc-800 bg-transparent"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    accepted ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-transparent"
                  }`}>
                    <Check size={14} strokeWidth={4} />
                  </div>
                  <span className={`text-sm font-black ${accepted ? "text-blue-600" : "text-zinc-400"}`}>
                    개인정보처리방침을 읽었으며 이에 동의합니다. (필수)
                  </span>
                </button>
              </div>

              <button 
                disabled={!accepted || loading}
                onClick={handleAccept}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 text-white font-black rounded-2xl shadow-xl shadow-blue-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : "동의하고 시작하기"}
              </button>
              
              <p className="mt-6 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                Hangul Tajawang Web Edition
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
