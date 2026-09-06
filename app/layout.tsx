import type { Metadata, Viewport } from "next";
import { 
  Geist, Geist_Mono, Noto_Sans_KR, Nanum_Myeongjo, Nanum_Pen_Script, 
  Jua, Gowun_Batang, Gowun_Dodum, Gamja_Flower, Single_Day, Stylish, 
  Yeon_Sung, Nanum_Brush_Script, Gaegu, Poor_Story, East_Sea_Dokdo,
  Plus_Jakarta_Sans, Inter
} from "next/font/google";
import Script from "next/script";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PrivacyConsentModal } from "@/components/layout/PrivacyConsentModal";
import { TopAdBanner } from "@/components/layout/TopAdBanner";
import { AdSenseUnit } from "@/components/layout/AdSenseUnit";
import { ActivityAnalytics } from "@/components/layout/ActivityAnalytics";
import { DocumentLanguage } from "@/components/layout/DocumentLanguage";

const plusJakartaSans = Plus_Jakarta_Sans({ variable: "--font-plus-jakarta", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono" });

const notoSans = Noto_Sans_KR({ variable: "--font-noto-sans", subsets: ["latin"], preload: false });
const nanumMyeongjo = Nanum_Myeongjo({ variable: "--font-nanum-myeongjo", weight: ["400", "700", "800"], subsets: ["latin"], preload: false });
const nanumPen = Nanum_Pen_Script({ variable: "--font-nanum-pen", weight: "400", subsets: ["latin"], preload: false });
const jua = Jua({ variable: "--font-jua", weight: "400", subsets: ["latin"], preload: false });
const gowunBatang = Gowun_Batang({ variable: "--font-gowun-batang", weight: ["400", "700"], subsets: ["latin"], preload: false });
const gowunDodum = Gowun_Dodum({ variable: "--font-gowun-dodum", weight: "400", subsets: ["latin"], preload: false });
const gamjaFlower = Gamja_Flower({ variable: "--font-gamja-flower", weight: "400", subsets: ["latin"], preload: false });

// subsets 미지원 폰트들 수정
const singleDay = Single_Day({ variable: "--font-single-day", weight: "400" });
const stylish = Stylish({ variable: "--font-stylish", weight: "400" });
const yeonSung = Yeon_Sung({ variable: "--font-yeon-sung", weight: "400" });
const nanumBrush = Nanum_Brush_Script({ variable: "--font-nanum-brush", weight: "400" });
const gaegu = Gaegu({ variable: "--font-gaegu", weight: "400" });
const poorStory = Poor_Story({ variable: "--font-poor-story", weight: "400" });
const dokdo = East_Sea_Dokdo({ variable: "--font-dokdo", weight: "400" });

// 모바일 가상 키보드가 올라올 때 뷰포트가 함께 줄어들도록 설정
// (안드로이드 크롬: interactive-widget, iOS는 useVirtualKeyboard 훅으로 보완)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.hangul-tajawang.com"),
  title: {
    default: "한글타자왕 - 무료 한글타자연습사이트 | 낱말/짧은글/필사/게임",
    template: "%s | 한글타자왕"
  },
  description: "한글 타자 연습 사이트 한글타자왕에서 낱말 연습, 짧은 글 연습, 원고지 필사, 산성비 게임을 무료로 즐겨보세요. 독수리 타법 교정과 타자 속도 측정에 가장 효과적인 한글타자연습사이트입니다.",
  keywords: ["한글타자연습사이트", "한글 타자 연습 사이트", "한글타자왕", "한글타자", "타자연습", "낱말연습", "타자게임", "산성비", "감성필사", "타수올리기", "독수리타법교정", "무료타자연습", "한글타자연습", "한글타자속도측정사이트"],
  openGraph: {
    title: "한글타자왕 - 아날로그 감성 한글 타자 연습",
    description: "아날로그 학용품 컨셉의 따뜻한 디자인과 함께하는 최고의 한글 타자 연습 서비스",
    url: "https://www.hangul-tajawang.com",
    siteName: "한글타자왕",
    images: [
      {
        url: "/ogimage.png",
        width: 1200,
        height: 630,
        alt: "한글타자왕 대표 이미지",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  icons: {
    icon: "/favicon.png",
  },
  alternates: {
    canonical: "https://www.hangul-tajawang.com",
    types: {
      'application/rss+xml': 'https://www.hangul-tajawang.com/feed.xml',
    },
  },
  verification: {
    other: {
      "naver-site-verification": "a2b9690769181edc8ee83bbbe17c9e693b18a21c",
    },
  },
  other: {
    // 블루컴즈 애드센스 (이관 후 재심사용) — 이전 개인 계정: ca-pub-5720611278808953
    "google-adsense-account": "ca-pub-6359187702715364",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="ko">
      <head>
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-NCVLQG83');`}
        </Script>
        <Script
          id="adsense-script"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6359187702715364"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script id="clarity-script" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "voys6pz476");`}
        </Script>
      </head>
      <body className={`
        ${plusJakartaSans.variable} ${inter.variable}
        ${geistSans.variable} ${geistMono.variable} ${notoSans.variable} 
        ${nanumMyeongjo.variable} ${nanumPen.variable} ${jua.variable} 
        ${gowunBatang.variable} ${gowunDodum.variable} ${gamjaFlower.variable}
        ${singleDay.variable} ${stylish.variable} ${yeonSung.variable} ${nanumBrush.variable}
        ${gaegu.variable} ${poorStory.variable} ${dokdo.variable}
        antialiased min-h-screen flex flex-col
      `}>
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NCVLQG83" height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} /></noscript>
        <PrivacyConsentModal />
        <ActivityAnalytics />
        <DocumentLanguage />
        <Header />
        <TopAdBanner />
        <div className="flex w-full">
          {/* 좌측 160x600 광고 - 슬롯보다 넓은 반응형 소재가 본문을 덮지 않도록 160px로 클리핑 */}
          <aside className="hidden xl:flex shrink-0 w-[180px] items-start justify-center pt-8 px-2">
            <div className="sticky top-28 w-[160px] max-w-[160px] overflow-hidden">
              <AdSenseUnit label="sidebar-left" width={160} height={600} />
            </div>
          </aside>

          {/* 메인 콘텐츠 */}
          <main className="flex-1 min-w-0">
            {children}
          </main>

          {/* 우측 160x600 광고 - 좌측과 동일하게 클리핑 */}
          <aside className="hidden xl:flex shrink-0 w-[180px] items-start justify-center pt-8 px-2">
            <div className="sticky top-28 w-[160px] max-w-[160px] overflow-hidden">
              <AdSenseUnit label="sidebar-right" width={160} height={600} />
            </div>
          </aside>
        </div>
        <Footer />
      </body>
    </html>
  );
}
