import { Metadata } from "next";
import ClientMyPageWrapper from "./ClientMyPageWrapper";

export const metadata: Metadata = {
  title: "마이페이지 - 한글타자왕",
  description: "나의 한글 타자 연습 기록, 최고 타수, 그리고 작성한 오픈 챌린지 글을 관리하세요.",
};

export default function MyPageRoute() {
  return (
    <>
      <h1 className="sr-only">마이페이지 - 내 타자 기록 관리</h1>
      <ClientMyPageWrapper />
    </>
  );
}
