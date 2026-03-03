import React from "react";
import Link from "next/link";
import { ChevronLeft, Scale, Mail } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans py-12 px-4">
      <div className="container mx-auto max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 flex flex-col items-center text-center">
          <Link href="/" className="mb-6 self-start flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-blue-600 transition-colors">
            <ChevronLeft size={16} /> 홈으로 돌아가기
          </Link>
          <Scale size={48} className="text-blue-600 mb-4" />
          <h1 className="text-3xl font-black mb-2">이용약관</h1>
          <p className="text-zinc-500 text-sm font-medium">최종 업데이트: 2026. 03. 01</p>
        </div>

        {/* Content */}
        <div className="p-8 md:p-12 space-y-12 text-zinc-700 dark:text-zinc-300 leading-relaxed break-keep">
          <section>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제 1 조 (목적)
            </h2>
            <p>본 약관은 '한글타자왕'(이하 "서비스")이 제공하는 타자 연습 및 관련 제반 서비스의 이용과 관련하여, 회사(운영자)와 회원(이용자) 간의 권리, 의무, 책임사항 및 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제 2 조 (베타 서비스의 특성 및 면책)
            </h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>현재 본 서비스는 <strong>'오픈 베타(Open Beta)'</strong> 기간으로 운영되고 있습니다.</li>
              <li>서비스는 "있는 그대로(AS-IS)" 제공되며, 시스템 오류, 데이터 손실, 접속 장애, 타수 기록의 누락 등이 발생할 수 있습니다.</li>
              <li>회사는 서비스의 무결성이나 완전성을 보증하지 않으며, 이로 인해 발생한 <strong>직·간접적인 손해에 대해 어떠한 법적 책임도 지지 않습니다.</strong></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제 3 조 (사용자 생성 콘텐츠 UGC에 대한 책임)
            </h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>사용자가 '오픈 챌린지' 등에 직접 작성하거나 등록한 텍스트, 댓글(이하 "게시물")에 대한 모든 <strong>법적 책임은 게시물을 등록한 사용자 본인</strong>에게 있습니다.</li>
              <li>사용자는 저작권, 초상권 등 타인의 권리를 침해하거나, 불법적이고 명예를 훼손하는 내용을 게시할 수 없습니다.</li>
              <li>회사는 제3자의 권리 침해 신고가 있거나 자체 판단에 따라 부적절하다고 여겨지는 게시물(신고 누적 포함)에 대해 <strong>사전 통보 없이 삭제, 블라인드 처리 또는 계정 이용을 제한</strong>할 수 있는 권리를 가집니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제 4 조 (서비스의 변경 및 중단)
            </h2>
            <p className="mb-4">회사는 운영상, 기술상의 필요에 따라 제공하고 있는 전부 또는 일부 서비스를 변경하거나 종료할 수 있습니다.</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>서비스 내용, 이용 방법, 이용 시간에 대한 변경 또는 종료 시, 회사는 이에 대해 사용자에게 사전 통지할 의무가 없으며 관련하여 어떠한 보상도 하지 않습니다.</li>
              <li>특히 베타 서비스 기간 중에는 테스트 목적에 따라 데이터(계정 정보, 타자 기록 등)가 예고 없이 초기화될 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제 5 조 (지적재산권)
            </h2>
            <p>서비스가 제공하는 디자인, UI/UX, 소프트웨어, 상표 등에 대한 지적재산권은 회사에 귀속됩니다. 사용자는 서비스를 이용함으로써 얻은 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포할 수 없습니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제 6 조 (기타 및 분쟁 해결)
            </h2>
            <p>본 약관에 명시되지 않은 사항은 관련 법령 및 상관례에 따릅니다. 서비스 이용과 관련하여 발생한 분쟁에 대해 소송이 제기될 경우, 회사의 본점 소재지를 관할하는 법원을 전속 관할법원으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              문의처
            </h2>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-700">
              <p className="text-sm mb-4 font-medium">이용약관, 저작권 신고 및 서비스 관련 문의는 아래 이메일로 연락해 주시기 바랍니다.</p>
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
        <div className="p-8 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 text-center flex justify-center gap-6 text-sm font-bold text-zinc-400">
          <Link href="/privacy" className="hover:text-zinc-600 transition-colors">개인정보처리방침</Link>
          <span>·</span>
          <span>© 2026 한글타자왕</span>
        </div>
      </div>
    </div>
  );
}
