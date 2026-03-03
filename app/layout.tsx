import type { Metadata } from "next";
import { 
  Geist, Geist_Mono, Noto_Sans_KR, Nanum_Myeongjo, Nanum_Pen_Script, 
  Jua, Gowun_Batang, Gowun_Dodum, Gamja_Flower, Single_Day, Stylish, 
  Yeon_Sung, Nanum_Brush_Script, Gaegu, Poor_Story, East_Sea_Dokdo
} from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono" });

const notoSans = Noto_Sans_KR({ variable: "--font-noto-sans", subsets: ["latin"] });
const nanumMyeongjo = Nanum_Myeongjo({ variable: "--font-nanum-myeongjo", weight: ["400", "700", "800"], subsets: ["latin"] });
const nanumPen = Nanum_Pen_Script({ variable: "--font-nanum-pen", weight: "400", subsets: ["latin"] });
const jua = Jua({ variable: "--font-jua", weight: "400", subsets: ["latin"] });
const gowunBatang = Gowun_Batang({ variable: "--font-gowun-batang", weight: ["400", "700"], subsets: ["latin"] });
const gowunDodum = Gowun_Dodum({ variable: "--font-gowun-dodum", weight: "400", subsets: ["latin"] });
const gamjaFlower = Gamja_Flower({ variable: "--font-gamja-flower", weight: "400", subsets: ["latin"] });

// subsets 미지원 폰트들 수정
const singleDay = Single_Day({ variable: "--font-single-day", weight: "400" });
const stylish = Stylish({ variable: "--font-stylish", weight: "400" });
const yeonSung = Yeon_Sung({ variable: "--font-yeon-sung", weight: "400" });
const nanumBrush = Nanum_Brush_Script({ variable: "--font-nanum-brush", weight: "400" });
const gaegu = Gaegu({ variable: "--font-gaegu", weight: "400" });
const poorStory = Poor_Story({ variable: "--font-poor-story", weight: "400" });
const dokdo = East_Sea_Dokdo({ variable: "--font-dokdo", weight: "400" });

export const metadata: Metadata = {
  title: "한글타자왕 - 아날로그 감성 한글 타자 연습",
  description: "한글타자왕 웹 버전에서 낱말 연습, 짧은 글 연습, 긴 글 연습, 아케이드 게임을 즐겨보세요.",
  icons: { icon: "/favicon.png" },
  verification: {
    other: {
      "naver-site-verification": "a2b9690769181edc8ee83bbbe17c9e693b18a21c",
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="ko">
      <head>
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-NCVLQG83');`}
        </Script>
      </head>
      <body className={`
        ${geistSans.variable} ${geistMono.variable} ${notoSans.variable} 
        ${nanumMyeongjo.variable} ${nanumPen.variable} ${jua.variable} 
        ${gowunBatang.variable} ${gowunDodum.variable} ${gamjaFlower.variable}
        ${singleDay.variable} ${stylish.variable} ${yeonSung.variable} ${nanumBrush.variable}
        ${gaegu.variable} ${poorStory.variable} ${dokdo.variable}
        antialiased
      `}>
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NCVLQG83" height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} /></noscript>
        {children}
      </body>
    </html>
  );
}
