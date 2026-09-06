import { localeAlternates } from '@/lib/i18n/alternates';
import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ShieldCheck, Mail } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보 처리방침 | 한글타자왕',
  description:
    '한글타자왕의 개인정보 처리방침입니다. 사용자의 정보를 소중히 다룹니다.',
  alternates: localeAlternates('/privacy', 'ko'),
};

export const revalidate = 3600;

export default function PrivacyPolicy() {
  // 영업양도 완료 — 운영 주체·문의처는 블루커뮤니케이션즈 주식회사로 고정
  const transferred = true;
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-900 font-sans py-12 px-4">
      <div className="container mx-auto max-w-3xl bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-zinc-100 bg-zinc-50/50 flex flex-col items-center text-center">
          <Link
            prefetch={false}
            href="/"
            className="mb-6 self-start flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft size={16} /> 홈으로 돌아가기
          </Link>
          <ShieldCheck size={48} className="text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold mb-2">개인정보 처리방침</h1>
          <p className="text-zinc-500 text-sm font-medium">
            시행일자: 2026. 08. 29
          </p>
        </div>

        {/* Content */}
        <div className="p-8 md:p-12 space-y-12 text-zinc-700 leading-relaxed break-keep">
          <section>
            <p>
              {transferred ? (
                <>
                  블루커뮤니케이션즈 주식회사(이하 "운영자")가 운영하는
                  '한글타자왕'(이하 "서비스")은 「개인정보 보호법」 및
                  「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련
                  법령을 준수하며, 이용자의 개인정보를 보호하고 이와 관련한
                  고충을 신속하게 처리할 수 있도록 다음과 같이 개인정보
                  처리방침을 수립·공개합니다.
                </>
              ) : (
                <>
                  '한글타자왕'(이하 "서비스")은 「개인정보 보호법」 및
                  「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련
                  법령을 준수하며, 이용자의 개인정보를 보호하고 이와 관련한
                  고충을 신속하게 처리할 수 있도록 다음과 같이 개인정보
                  처리방침을 수립·공개합니다.
                </>
              )}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제1조 (수집하는 개인정보 항목 및 방법)
            </h2>
            <p className="mb-4">
              서비스는 회원 가입 및 서비스 제공을 위해 필요한 최소한의
              개인정보를 다음과 같이 수집합니다.
            </p>
            <ul className="list-disc ml-6 space-y-3">
              <li>
                <strong>소셜 로그인 정보 (선택적):</strong> 카카오·구글 계정을
                통한 로그인 시, Supabase 인증을 경유하여 이메일, 닉네임, 프로필
                이미지를 수집하며 회원 정보(profiles)로 저장합니다. 로그인은
                필수가 아니며, 로그인 없이도 대부분의 연습 기능을 이용하실 수
                있습니다.
              </li>
              <li>
                <strong>서비스 이용 기록 (로그인 시):</strong> 타자 연습
                기록(타수·정확도·오타 등), 게임 점수, 필사 서재 기록, 챌린지
                게시글·댓글·좋아요 등 이용자가 서비스 이용 과정에서 생성한
                데이터를 이용자 계정과 연동하여 저장합니다.
              </li>
              <li>
                <strong>프로필 사진 (선택적, 모바일 앱):</strong> 이용자가 직접
                프로필 사진을 등록하는 경우에 한하여, 기기의 카메라 또는 사진
                라이브러리에서 선택한 이미지를 수집·저장합니다. 등록하지 않으면
                수집하지 않으며, 언제든지 삭제할 수 있습니다.
              </li>
              <li>
                <strong>자동 수집 항목:</strong> 서비스 이용 과정에서 쿠키, 방문
                일시, 기기·브라우저 정보(앱의 경우 OS 버전·앱 버전·기기 모델),
                광고 식별자, 오류(비정상 종료) 로그 등이 자동으로 생성·수집될 수
                있습니다. (제5조 참고)
              </li>
            </ul>
            <div className="mt-6 bg-zinc-50 p-5 rounded-2xl border border-zinc-100 text-sm">
              <strong className="block mb-1 text-zinc-900">
                기기 내 저장(localStorage) 안내
              </strong>
              비로그인 상태의 필사 서재·이어하기 진행 상황, 게임 최고점수,
              서비스 설정 등은 이용자의 기기(브라우저)에만 저장되며 서버로
              전송되지 않습니다. 로그인 시에는 필사 서재 기록에 한하여 계정과
              동기화됩니다.
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제2조 (개인정보의 이용 목적)
            </h2>
            <p className="mb-4">
              서비스는 수집한 개인정보를 다음의 목적으로만 이용하며, 목적이
              변경될 경우 사전 동의를 받습니다.
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                <strong>회원 관리:</strong> 로그인 서비스 제공, 이용자 식별,
                기존 이용 기록 연동
              </li>
              <li>
                <strong>서비스 제공 및 품질 개선:</strong> 개인별 통계·기록
                제공, 오류 수정 및 최적화, 신규 기능 개발
              </li>
              <li>
                <strong>통계 분석:</strong> 방문 통계 및 이용 패턴 분석을 통한
                서비스 개선
              </li>
              <li>
                <strong>맞춤형 광고 제공:</strong> 광고 게재 및 서비스 운영에
                필요한 범위 내 광고 제공
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제3조 (개인정보의 보유 및 이용 기간)
            </h2>
            <p className="mb-4">
              서비스는 원칙적으로 개인정보의 수집·이용 목적이 달성되면 해당
              정보를 지체 없이 파기합니다. 구체적인 보유 및 이용 기간은 다음과
              같습니다.
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                <strong>회원 정보 및 이용 기록:</strong> 회원 탈퇴 시까지
                보유하며, 탈퇴 시 지체 없이 파기합니다.
              </li>
              <li>
                <strong>관련 법령에 따른 보존:</strong> 단, 관계 법령에서 일정
                기간 정보의 보존을 규정하는 경우 해당 기간 동안 보관하며, 이
                경우 보관 목적 이외의 용도로는 이용하지 않습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제4조 (개인정보의 제3자 제공 및 처리위탁)
            </h2>
            <p className="mb-4">
              서비스는 이용자의 개인정보를{' '}
              <strong>제3자에게 제공하지 않습니다.</strong> 다만, 원활한 서비스
              제공을 위하여 아래와 같이 개인정보 처리 업무를 외부 전문 업체에
              위탁하고 있으며, 위탁 계약 시 개인정보가 안전하게 관리되도록
              필요한 사항을 규정하고 있습니다.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-zinc-100">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 text-zinc-900">
                    <th className="p-4 font-bold border-b border-zinc-100">
                      수탁 업체
                    </th>
                    <th className="p-4 font-bold border-b border-zinc-100">
                      위탁 업무 내용
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-4 font-medium border-b border-zinc-100 align-top">
                      Supabase
                    </td>
                    <td className="p-4 border-b border-zinc-100">
                      회원 인증(OAuth) 및 데이터베이스 저장·관리
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium border-b border-zinc-100 align-top">
                      Google (GTM / GA4)
                    </td>
                    <td className="p-4 border-b border-zinc-100">
                      방문 통계 수집 및 이용 행태 분석
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium border-b border-zinc-100 align-top">
                      Microsoft (Clarity)
                    </td>
                    <td className="p-4 border-b border-zinc-100">
                      세션 리플레이·히트맵 기반 사용성 분석 (웹·모바일 앱)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium border-b border-zinc-100 align-top">
                      Kakao · Google (소셜 로그인)
                    </td>
                    <td className="p-4 border-b border-zinc-100">
                      소셜 로그인 인증 처리 (이메일·닉네임·프로필 이미지 확인)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium border-b border-zinc-100 align-top">
                      Google (AdSense)
                    </td>
                    <td className="p-4 border-b border-zinc-100">
                      맞춤형 광고 게재 (웹)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium border-b border-zinc-100 align-top">
                      Google (Firebase Analytics·Crashlytics)
                    </td>
                    <td className="p-4 border-b border-zinc-100">
                      모바일 앱 사용 통계 수집 및 오류(비정상 종료) 분석
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium border-b border-zinc-100 align-top">
                      Google (AdMob)
                    </td>
                    <td className="p-4 border-b border-zinc-100">
                      모바일 앱 내 맞춤형 광고 게재
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium align-top">
                      Pangle (Bytedance Pte. Ltd.)
                    </td>
                    <td className="p-4">
                      AdMob 미디에이션을 통한 모바일 앱 내 광고 게재
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              ※ 서비스는 동일 운영자가 제공하는 모바일 앱(korean_typing)과
              동일한 Supabase 계정 및 이용 기록을 공유합니다. 하나의 계정으로
              웹과 앱에서 기록이 연동되어 관리됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제5조 (쿠키·분석 도구·광고 및 거부 방법)
            </h2>
            <p className="mb-4">
              서비스는 이용자에게 맞춤형 서비스 및 통계 분석을 제공하기 위해
              쿠키(cookie) 및 유사 기술을 사용합니다.
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                <strong>Google Tag Manager · GA4:</strong> 방문 통계 및 서비스
                개선 목적의 이용 행태 분석
              </li>
              <li>
                <strong>Microsoft Clarity (웹·모바일 앱):</strong> 세션
                리플레이·히트맵을 통한 사용성 분석
              </li>
              <li>
                <strong>Google AdSense:</strong> 웹 맞춤형 광고 제공을 위해
                쿠키를 사용하며, 이용자는{' '}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-600"
                >
                  Google 광고 설정
                </a>
                에서 맞춤형 광고를 관리할 수 있습니다.
              </li>
              <li>
                <strong>Firebase Analytics·Crashlytics (모바일 앱):</strong> 앱
                사용 통계 및 오류(비정상 종료) 정보 수집
              </li>
              <li>
                <strong>Google AdMob · Pangle (모바일 앱):</strong> 앱 내 맞춤형
                광고 제공을 위해 광고 식별자(Android 광고 ID, iOS IDFA)를 사용할
                수 있으며, Pangle은 AdMob 미디에이션 파트너로서 광고를
                제공합니다.
              </li>
            </ul>
            <p className="mt-4">
              이용자는 웹 브라우저의 설정(예: 도구 &gt; 인터넷 옵션 &gt;
              개인정보)을 통해 쿠키 저장을 거부할 수 있으며, 모바일 앱의 경우
              기기 설정에서 광고 식별자를 재설정·삭제하거나 맞춤형 광고를 제한할
              수 있습니다(iOS는 앱 추적 허용 여부를 직접 선택할 수 있습니다).
              다만, 거부할 경우 일부 맞춤형 서비스 이용에 제한이 있을 수
              있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제6조 (모바일 앱의 접근권한)
            </h2>
            <p className="mb-4">
              동일한 서비스로 제공되는 모바일 앱(Android·iOS)은 아래와 같은
              접근권한을 요청하며, 모두 <strong>선택적 접근권한</strong>으로
              허용하지 않아도 앱의 기본 기능을 이용할 수 있습니다.
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                <strong>카메라 (선택):</strong> 프로필 사진을 직접 촬영하여
                등록하기 위해 사용합니다.
              </li>
              <li>
                <strong>사진·미디어 (선택):</strong> 기기에 저장된 사진을 프로필
                사진으로 등록하거나 기록 이미지를 저장·공유하기 위해
                사용합니다.
              </li>
              <li>
                <strong>광고 식별자 / 앱 추적(ATT, 선택):</strong> 맞춤형 광고
                제공 및 광고 성과 측정을 위해 사용합니다. iOS에서는 앱 추적
                허용 여부를 이용자가 직접 선택할 수 있습니다.
              </li>
            </ul>
            <p className="mt-4 text-sm text-zinc-500">
              ※ 접근권한 철회 방법 — Android: 설정 &gt; 애플리케이션 &gt;
              한글타자왕 &gt; 권한, iOS: 설정 &gt; 한글타자왕에서 언제든지
              변경할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제7조 (만 14세 미만 아동의 개인정보)
            </h2>
            <p>
              서비스는 만 14세 미만 아동의 개인정보를 수집할 의도가 없습니다. 만
              14세 미만 아동의 개인정보가 수집된 사실을 인지한 경우, 해당 정보를
              지체 없이 파기합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제8조 (이용자의 권리와 행사 방법)
            </h2>
            <p className="mb-4">
              이용자는 언제든지 자신의 개인정보에 대해 다음의 권리를 행사할 수
              있습니다.
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구 (회원 탈퇴)</li>
              <li>개인정보 처리정지 요구</li>
            </ul>
            <p className="mt-4">
              권리 행사는 서비스 내 설정 기능 또는 아래 개인정보 보호책임자의
              이메일을 통해 요청하실 수 있으며, 서비스는 지체 없이 필요한 조치를
              취합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제9조 (개인정보의 파기 절차 및 방법)
            </h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                <strong>파기 절차:</strong> 보유 기간이 경과하거나 처리 목적이
                달성된 개인정보는 지체 없이 파기합니다.
              </li>
              <li>
                <strong>파기 방법:</strong> 전자적 파일 형태의 정보는
                복구·재생이 불가능한 기술적 방법으로 삭제합니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제10조 (개인정보의 안전성 확보조치)
            </h2>
            <p className="mb-4">
              서비스는 이용자의 개인정보를 안전하게 관리하기 위하여 다음과 같은
              조치를 취하고 있습니다.
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                <strong>관리적 조치:</strong> 개인정보 취급 인원을 최소화하고,
                개인정보를 처리하는 데이터베이스에 대한 접근 권한을 업무상
                필요한 범위로 제한합니다.
              </li>
              <li>
                <strong>기술적 조치:</strong> 회원 인증·데이터 저장은 접근통제가
                적용된 클라우드(Supabase)를 통해 처리하며, 이용자 데이터는
                전송 구간에서 SSL/TLS로 암호화됩니다. 비밀번호 등 인증 정보는
                서비스가 직접 보관하지 않고 소셜 로그인(카카오·구글) 제공자를
                통해 처리됩니다.
              </li>
              <li>
                <strong>접근 통제:</strong> 개인정보처리시스템에 대한 접근 권한의
                부여·변경·말소를 관리하고, 외부로부터의 무단 접근을 통제합니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제11조 (개인정보 보호책임자 및 문의처)
            </h2>
            <p className="mb-4">
              개인정보 처리에 관한 문의, 불만 처리, 피해 구제 등은 아래 개인정보
              보호책임자에게 연락해 주시기 바랍니다.
            </p>
            <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
              <p className="text-sm mb-4 font-medium">
                개인정보 보호책임자 (정보보호·보안 총괄)
                {transferred && ' — 블루커뮤니케이션즈 주식회사'}
              </p>
              <ul className="text-sm space-y-1 mb-4 text-zinc-700">
                <li>
                  <strong className="text-zinc-900">성명:</strong> 홍상원
                </li>
                <li>
                  <strong className="text-zinc-900">직책:</strong> 개인정보
                  보호책임자 겸 정보보안 책임자
                </li>
              </ul>
              <div className="flex items-center gap-3 text-zinc-900 font-bold">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                  <Mail size={20} />
                </div>
                bluecomms.ailab@gmail.com
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제12조 (정보주체의 권익침해에 대한 구제방법)
            </h2>
            <p className="mb-4">
              이용자는 개인정보 침해로 인한 구제를 받기 위하여 아래 기관에
              분쟁 해결이나 상담 등을 신청할 수 있습니다. 서비스의 자체적인
              처리에 만족하지 못하시는 경우 도움을 받으실 수 있습니다.
            </p>
            <ul className="list-disc ml-6 space-y-2 text-sm">
              <li>개인정보분쟁조정위원회: (국번없이) 1833-6972 / www.kopico.go.kr</li>
              <li>개인정보침해신고센터: (국번없이) 118 / privacy.kisa.or.kr</li>
              <li>대검찰청 사이버수사과: (국번없이) 1301 / www.spo.go.kr</li>
              <li>경찰청 사이버수사국: (국번없이) 182 / ecrm.cyber.go.kr</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              제13조 (고지의 의무)
            </h2>
            <p>
              본 개인정보 처리방침의 내용 추가, 삭제 및 수정이 있을 경우, 변경
              사항의 시행 <strong>7일 전</strong>부터 서비스 내 공지사항을
              통하여 고지합니다. 다만, 이용자 권리의 중요한 변경이 있을 경우에는
              최소 30일 전에 고지합니다.
            </p>
            {transferred && (
              <p className="mt-4 text-sm text-zinc-500">
                부칙: 본 방침은 2026년 8월 29일부터 시행됩니다. 영업 양도에 따라
                서비스 운영 주체가 블루커뮤니케이션즈 주식회사로 변경되었으며,
                자세한 내용은{' '}
                <Link
                  prefetch={false}
                  href="/notice/transfer"
                  className="underline hover:text-blue-600"
                >
                  개인정보 이전 안내
                </Link>
                에서 확인하실 수 있습니다.
              </p>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-zinc-100 bg-zinc-50/30 text-center">
          <p className="text-xs text-zinc-400 font-medium">
            © 2026 {transferred ? '블루커뮤니케이션즈 주식회사' : '한글타자왕'}.
            All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
