import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "한글타자왕 - 아날로그 감성 한글 타자 연습",
  description: "한글타자왕 웹 버전에서 낱말 연습, 짧은 글 연습, 감성 필사, 아케이드 게임을 즐겨보세요. 아날로그 학용품 컨셉의 따뜻한 디자인과 함께 실력을 키워보세요.",
  keywords: ["한글타자", "타자연습", "한글타자왕", "타자게임", "산성비", "감성필사", "글쓰기연습", "한글연습"],
  authors: [{ name: "한글타자왕" }],
  openGraph: {
    title: "한글타자왕 - 아날로그 감성 한글 타자 연습",
    description: "아날로그 학용품 컨셉의 따뜻한 디자인과 함께하는 최고의 한글 타자 연습 서비스",
    url: "https://hangul-tajawang.com",
    siteName: "한글타자왕",
    locale: "ko_KR",
    type: "website",
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
