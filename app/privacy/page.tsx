import React from "react";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, Mail } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans py-12 px-4">
      <div className="container mx-auto max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 flex flex-col items-center text-center">
          <Link href="/" className="mb-6 self-start flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-blue-600 transition-colors">
            <ChevronLeft size={16} /> 홈으로 돌아가기
          </Link>
          <ShieldCheck size={48} className="text-blue-600 mb-4" />
          <h1 className="text-3xl font-black mb-2">개인정보 처리방침</h1>
          <p className="text-zinc-500 text-sm font-medium">최종 업데이트: 2026. 03. 01</p>
        </div>

        {/* Content */}
        <div className="p-8 md:p-12 space-y-12 text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              1. 수집하는 개인정보 항목
            </h2>
            <p className="mb-4">'한글타자왕'(이하 "서비스")은 사용자의 서비스 이용을 위해 아래와 같은 개인정보를 수집합니다.</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>소셜 로그인 정보:</strong> 이메일, 닉네임, 프로필 이미지 (카카오 로그인 시 동의한 항목에 한함)</li>
              <li><strong>서비스 이용 기록:</strong> 타자 연습 기록(타수, 정확도, 오타 리스트), 최고 기록, 챌린지 등록 내용 및 댓글</li>
              <li><strong>자동 수집 항목:</strong> 쿠키, 방문 일시, 기기 정보, 광고 식별자 (서비스 개선 및 분석 목적)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              2. 개인정보의 사용 목적
            </h2>
            <p className="mb-4">수집된 정보는 다음의 목적으로만 사용됩니다.</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>회원 관리:</strong> 로그인 서비스 제공, 사용자 식별, 기존 연습 기록 연동</li>
              <li><strong>서비스 제공 및 품질 개선:</strong> 개인별 통계 데이터 제공, 서비스 버그 수정 및 최적화</li>
              <li><strong>분석 및 광고:</strong> Google Analytics 및 Clarity를 통한 이용 패턴 분석, 맞춤형 광고 제공</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              3. 개인정보의 공유 및 위탁
            </h2>
            <p className="mb-4">서비스는 원칙적으로 사용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 서비스 운영을 위해 아래와 같은 기술적 수단을 활용합니다.</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>데이터 저장:</strong> Supabase (데이터베이스 서비스)</li>
              <li><strong>분석 도구:</strong> Google Analytics, Microsoft Clarity</li>
              <li><strong>인증 제공:</strong> 카카오 (Kakao OAuth)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              4. 개인정보의 보안 및 보유 기간
            </h2>
            <p className="mb-4">서비스는 사용자의 개인정보를 보호하기 위해 적절한 기술적 보안 조치를 취하고 있습니다.</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>보유 기간:</strong> 회원 탈퇴 시까지 또는 서비스 종료 시까지 보유합니다.</li>
              <li><strong>파기 절차:</strong> 이용 목적이 달성된 정보는 지체 없이 파기합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              5. 사용자의 권리
            </h2>
            <p>사용자는 언제든지 자신의 개인정보를 조회, 수정하거나 삭제(탈퇴)를 요청할 수 있습니다. 관련 요청은 서비스 내 설정 또는 아래 이메일을 통해 가능합니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              6. 문의처
            </h2>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-700">
              <p className="text-sm mb-4 font-medium">개인정보 처리 방침 및 서비스 개선에 대한 문의는 아래 연락처로 해주시기 바랍니다.</p>
              <div className="flex items-center gap-3 text-zinc-900 dark:text-zinc-100 font-bold">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                  <Mail size={20} />
                </div>
                withanalog@gmail.com
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 text-center">
          <p className="text-xs text-zinc-400 font-medium">© 2026 한글타자왕. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
