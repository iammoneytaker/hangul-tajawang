import { localeAlternates } from '@/lib/i18n/alternates';
import React from "react";
import Link from "next/link";
import { ChevronLeft, Scale, Mail } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 | 한글타자왕",
  description: "한글타자왕의 서비스 이용약관입니다. 서비스 이용에 필요한 권리와 의무를 확인하세요.",
  alternates: localeAlternates('/terms', 'ko')
};

// 매시간 재생성(ISR) → 2026-09-01 00:00(KST) 이후 재생성 시점에 개정판으로 자동 전환
export const revalidate = 3600;


export default function TermsOfService() {
  // 영업양도 완료 — 운영자·문의처는 블루커뮤니케이션즈 주식회사로 고정
  const transferred = true;
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-900 font-sans py-12 px-4">
      <div className="container mx-auto max-w-3xl bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-zinc-100 bg-zinc-50/50 flex flex-col items-center text-center">
          <Link prefetch={false} href="/" className="mb-6 self-start flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-blue-600 transition-colors">
            <ChevronLeft size={16} /> 홈으로 돌아가기
          </Link>
          <Scale size={48} className="text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold mb-2">이용약관</h1>
          <p className="text-zinc-500 text-sm font-medium">시행일자: 2026. 08. 29</p>
        </div>

        {/* Content */}
        <div className="p-8 md:p-12 space-y-12 text-zinc-700 leading-relaxed break-keep">
          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제1조 (목적)
            </h2>
            <p>
              본 약관은 '한글타자왕'(이하 "서비스")이 제공하는 타자 연습 및 관련 제반 서비스의 이용과 관련하여, 운영자와 이용자 간의 권리·의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다. 본 약관에서 "서비스"란 웹사이트(hangul-tajawang.com)와 동일한 이름의 모바일 앱(Android·iOS)을 모두 포함하며, 웹과 앱은 하나의 계정으로 기록이 연동됩니다.
              {transferred && <> 본 약관에서 "운영자"란 서비스를 운영하는 블루커뮤니케이션즈 주식회사를 말합니다.</>}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제2조 (서비스의 구성)
            </h2>
            <p className="mb-4">서비스는 다음과 같은 기능으로 구성되며, 운영자는 필요에 따라 기능을 추가·변경할 수 있습니다.</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>타자 연습:</strong> 자리·낱말·긴글 등 한글 타자 연습 기능</li>
              <li><strong>게임:</strong> 타자 실력을 겨루는 게임 및 점수 기록</li>
              <li><strong>필사·서재:</strong> 글을 따라 쓰는 필사 기능과 개인 서재(필사 기록) 보관</li>
              <li><strong>지식타자:</strong> 지식·상식 콘텐츠를 타자로 익히는 학습 기능(지식 여정·퀴즈 포함)</li>
              <li><strong>챌린지:</strong> 이용자가 직접 글·댓글·좋아요 등을 등록하는 참여형 콘텐츠</li>
              <li><strong>모바일 앱:</strong> 위 기능을 동일하게 제공하는 Android·iOS 앱</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제3조 (계정 및 회원 가입)
            </h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>이용자는 로그인 없이도 서비스의 주요 기능을 이용할 수 있으며, 카카오·구글 소셜 로그인을 통해 회원으로 가입할 수 있습니다.</li>
              <li>회원 가입 시 이용 기록(타자 기록·게임 점수·서재 기록 등)이 계정과 연동되어 저장됩니다.</li>
              <li>이용자는 언제든지 서비스 내 설정 또는 문의를 통해 탈퇴할 수 있으며, 탈퇴 시 개인정보는 개인정보 처리방침에 따라 처리됩니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제4조 (이용자 생성 콘텐츠, UGC)
            </h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>이용자가 챌린지 등에 직접 작성·등록한 글, 댓글 등(이하 "게시물")의 <strong>저작권은 작성자 본인에게 귀속</strong>됩니다.</li>
              <li>이용자는 서비스 내 노출·운영을 위하여 필요한 범위에서 게시물을 이용(게재·복제·전송)하는 것을 서비스에 허락합니다.</li>
              <li>이용자는 타인의 저작권·초상권 등 권리를 침해하거나 불법·명예훼손·혐오 표현 등 부적절한 내용을 게시할 수 없습니다.</li>
              <li>게시물에 대한 모든 법적 책임은 이를 등록한 이용자 본인에게 있습니다.</li>
              <li>서비스는 권리 침해 신고가 있거나 신고가 누적되는 등 부적절하다고 판단되는 게시물에 대해 노출 제한(블라인드) 또는 삭제 조치를 할 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제5조 (서비스의 지적재산권)
            </h2>
            <p>서비스가 제공하는 디자인, UI/UX, 소프트웨어, 상표 및 운영자가 제작한 콘텐츠 등에 대한 지적재산권은 운영자에게 귀속됩니다. 이용자는 서비스를 이용함으로써 얻은 정보를 운영자 또는 권리자의 사전 승낙 없이 복제·송신·출판·배포할 수 없습니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제6조 (광고)
            </h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>서비스는 운영을 위하여 웹에서는 Google 애드센스(AdSense), 모바일 앱에서는 Google 애드몹(AdMob) 및 그 미디에이션 파트너(Pangle 등)를 통한 광고를 게재할 수 있습니다.</li>
              <li>광고 게재 과정에서 쿠키 및 광고 식별자가 이용될 수 있으며, 자세한 내용과 거부 방법은 <strong>개인정보 처리방침</strong>에서 확인할 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제7조 (면책조항)
            </h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>서비스는 무료로 제공되며, "있는 그대로(AS-IS)" 제공됩니다.</li>
              <li>시스템 오류, 접속 장애, 데이터 손실 등으로 기록이 유실될 수 있으며, 서비스는 이로 인해 발생한 직·간접적 손해에 대하여 관련 법령이 허용하는 범위 내에서 책임을 지지 않습니다.</li>
              <li>운영자는 운영상·기술상의 필요에 따라 서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제8조 (약관의 변경)
            </h2>
            <p>운영자는 관련 법령을 위반하지 않는 범위에서 본 약관을 변경할 수 있으며, 약관을 변경할 경우 변경 사항의 시행 7일 전부터 서비스 내 공지를 통하여 고지합니다. 이용자에게 불리한 중요한 변경의 경우에는 최소 30일 전에 고지합니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제9조 (준거법 및 관할)
            </h2>
            <p>본 약관은 대한민국 법령에 따라 규율되고 해석됩니다. 서비스 이용과 관련하여 분쟁이 발생할 경우, 운영자와 이용자는 상호 협의하여 해결하며, 협의가 이루어지지 않을 경우 관계 법령 및 상관례에 따릅니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              문의처
            </h2>
            <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
              <p className="text-sm mb-4 font-medium">이용약관, 저작권 신고 및 서비스 관련 문의는 아래 이메일로 연락해 주시기 바랍니다.</p>
              {transferred && (
                <ul className="text-sm space-y-1 mb-4 text-zinc-700">
                  <li><strong className="text-zinc-900">운영자:</strong> 블루커뮤니케이션즈 주식회사</li>
                  <li><strong className="text-zinc-900">개인정보 보호책임자:</strong> 홍상원</li>
                </ul>
              )}
              <div className="flex items-center gap-3 text-zinc-900 font-bold">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                  <Mail size={20} />
                </div>
                bluecomms.ailab@gmail.com
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-zinc-100 bg-zinc-50/30 text-center flex justify-center gap-6 text-sm font-bold text-zinc-400">
          <Link prefetch={false} href="/privacy" className="hover:text-zinc-600 transition-colors">개인정보처리방침</Link>
          <span>·</span>
          <span>© 2026 {transferred ? "블루커뮤니케이션즈 주식회사" : "한글타자왕"}</span>
        </div>
      </div>
    </div>
  );
}
