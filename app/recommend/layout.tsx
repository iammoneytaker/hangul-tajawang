import { Metadata } from "next";

export const metadata: Metadata = {
  title: "장비의 미학: 타자 연습의 리듬을 완성하는 키보드 추천 | 한글타자왕",
  description: "타자 연습의 리듬을 완성하는 최고의 키보드들을 엄선하여 소개합니다. 입문용 가성비 멤브레인 ABKO MK108부터 프리미엄 라인업까지 전문가의 리뷰를 확인하세요.",
  openGraph: {
    title: "장비의 미학: 키보드 추천 컬렉션 | 한글타자왕",
    description: "당신의 손끝을 즐겁게 할 선별된 키보드들을 만나보세요.",
    images: ["/ogimage.png"],
  },
  keywords: ["키보드 추천", "타자 연습 키보드", "ABKO MK108", "멤브레인 키보드", "가성비 키보드", "저소음 키보드", "한글타자왕"],
};

export default function RecommendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
