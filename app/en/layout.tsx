import type { Metadata } from 'next';

// /en 서브트리 공통 메타 — 루트 레이아웃의 한국어 타이틀 템플릿("%s | 한글타자왕")을 영어로 교체한다.
export const metadata: Metadata = {
  title: {
    default: 'Korean Typing Practice - Learn to Type Hangul Free',
    template: '%s | Hangul Tajawang',
  },
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="en">
      {children}
    </div>
  );
}
