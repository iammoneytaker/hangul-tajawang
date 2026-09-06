import { FEATURED_WORKS } from '@/lib/i18n/practice-content';
import { localeAlternates } from '@/lib/i18n/alternates';
import { Metadata } from 'next';
import { LONG_TEXT_DB } from '@/lib/long-text-data';
import { fetchEpisodeSafe, fetchBooksSafe, type EpisodePageData } from '@/lib/books-db';
import type { LongTextData } from '@/lib/long-text-data';
import { LongPractice } from '@/components/long-practice/LongPractice';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ogImageUrl } from '@/lib/og-image';

type Props = {
  params: Promise<{ id: string }>;
};

// 책방 화는 DB(ISR)에서 — publish 후 재배포 없이 반영, 새 화 URL도 첫 요청 시 생성
export const revalidate = 300;
export const dynamicParams = true;

/** DB(책방) 우선, 없으면 정적(시·수필 등 기존 콘텐츠) */
async function resolveText(id: string): Promise<{ text: LongTextData; db: EpisodePageData | null } | null> {
  const db = await fetchEpisodeSafe(id);
  if (db) return { text: db.text, db };
  const staticText = LONG_TEXT_DB.find((t) => t.id === id);
  return staticText ? { text: staticText, db: null } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const resolved = await resolveText(resolvedParams.id);
  if (!resolved) return {};
  const { text, db } = resolved;
  // 본문 표지는 400px, 공유 썸네일은 800px(-og) 변형을 쓴다 — lib/og-image.ts 참고
  const coverUrl = ogImageUrl(db?.book.coverImageUrl);

  return {
    title: `${text.title} 한글 타자 연습 | 필사 연습`,
    description: `${text.title} 타자 연습: ${text.content.substring(0, 80).replace(/\n/g, ' ')}... 한글 타자 속도와 정확도를 실시간으로 측정해보세요.`,
    keywords: [
        text.title,
        `${text.title} 한글타자`,
        `${text.title} 타자연습`,
        `${text.title} 필사연습`,
        `${text.title} 타자필사`,
        text.author,
        text.category,
        "한글 타자 연습",
        "한글타자왕"
    ],
    alternates: FEATURED_WORKS.some(work => work.id === resolvedParams.id) ? localeAlternates(`/transcription/${resolvedParams.id}`, 'ko') : {
      canonical: `https://www.hangul-tajawang.com/transcription/${resolvedParams.id}`,
    },
    openGraph: {
      title: `${text.title} 한글 타자 연습 | 필사 연습 | 한글타자왕`,
      description: `지금 바로 '${text.title}' 한글 타자 연습을 시작하세요. 타수와 정확도를 측정해 드립니다!`,
      url: `https://www.hangul-tajawang.com/transcription/${resolvedParams.id}`,
      type: "article",
      images: [
        coverUrl
          ? { url: coverUrl, width: 900, height: 1200, alt: `${text.title} 표지` }
          : {
              url: "https://www.hangul-tajawang.com/ogimage.png",
              width: 1200,
              height: 630,
              alt: "한글타자왕 필사 연습",
            },
      ],
    }
  };
}

export async function generateStaticParams() {
  // 정적 콘텐츠 + DB 책방 화 (빌드 시점 스냅샷 — 이후 새 화는 dynamicParams로 생성)
  const ids = new Set(LONG_TEXT_DB.map((text) => text.id));
  const books = await fetchBooksSafe();
  for (const b of books) for (const e of b.episodesMeta) ids.add(e.id);
  return Array.from(ids).map((id) => ({ id }));
}

export default async function TranscriptionDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const resolved = await resolveText(resolvedParams.id);
  if (!resolved) notFound();
  const { text, db } = resolved;

  // 이전/다음: 책방 화는 같은 책 안에서, 정적 콘텐츠는 기존 목록 순서로
  let prevText: { id: string; title: string; author: string } | null = null;
  let nextText: { id: string; title: string; author: string } | null = null;
  if (db) {
    prevText = db.prevEp ? { id: db.prevEp.id, title: db.prevEp.title, author: db.book.author } : null;
    nextText = db.nextEp ? { id: db.nextEp.id, title: db.nextEp.title, author: db.book.author } : null;
  } else {
    const currentIndex = LONG_TEXT_DB.findIndex((t) => t.id === resolvedParams.id);
    prevText = currentIndex > 0 ? LONG_TEXT_DB[currentIndex - 1] : null;
    nextText = currentIndex < LONG_TEXT_DB.length - 1 ? LONG_TEXT_DB[currentIndex + 1] : null;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: text.title,
    author: { '@type': 'Person', name: text.author },
    genre: text.category,
    inLanguage: 'ko',
    url: `https://www.hangul-tajawang.com/transcription/${text.id}`,
    description: `${text.author}의 '${text.title}' 전문을 타이핑으로 필사하며 타자 속도와 정확도를 측정할 수 있는 온라인 필사 페이지입니다.`,
    isPartOf: {
      '@type': 'WebSite',
      name: '한글타자왕',
      url: 'https://www.hangul-tajawang.com',
    },
  };

  return (
    <div className="w-full py-8 text-on-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex flex-col items-center">
        {/* 연재물이면 시리즈 배너 */}
        {db && (
          <Link
            prefetch={false}
            href={`/transcription/series/${db.book.id}`}
            className="mb-2 inline-flex items-center gap-2 px-5 py-2.5 bg-rose-50 border border-rose-200 rounded-full text-sm font-bold text-rose-700 hover:scale-105 transition-transform"
          >
            📖 {db.book.title} · {text.episode}화 / {db.book.totalEpisodes}화 — 목차 보기 →
          </Link>
        )}
        <LongPractice initialTextId={text.id} dbText={db ? text : undefined} dbNextText={db ? (db.nextEp ? { id: db.nextEp.id, title: db.nextEp.title } : null) : undefined} />

        {/* SEO HTML Content */}
        <article className="mt-20 w-full max-w-5xl px-6 lg:px-8 animate-in fade-in duration-1000">
            <h2 className="text-3xl font-bold mb-8 border-b border-surface-high pb-4 break-keep text-balance">
              {text.title} <span className="whitespace-nowrap">한글 타자 연습</span>
            </h2>
            <div className="prose prose-lg text-zinc-700 max-w-none">
                <p className="leading-relaxed mb-8">
                    이 페이지는 <strong>{text.author}</strong>의 <strong>&apos;{text.title}&apos;</strong> 전문을 제공하며, 이를 활용하여 한글 타자 연습을 하실 수 있도록 구성되어 있습니다.
                    상단의 감성적인 원고지 화면에서 제시된 글을 따라 입력하며 연습을 진행해보세요.
                    이 한글 타자 연습 서비스는 연습 중인 사용자의 <strong>타자 속도(타수)</strong>와 <strong>정확도</strong>를 실시간으로 매우 정확하게 측정해 드립니다.
                    지속적인 연습을 통해 타자 실력을 향상시키고 자신만의 기록을 세워보세요!
                </p>
                <div className="bg-surface-low p-10 rounded-2xl whitespace-pre-wrap leading-loose font-medium text-lg border border-surface-high shadow-inner">
                    <h3 className="text-2xl font-bold mb-6 text-primary">{text.title} 전문</h3>
                    <div className="text-zinc-800 font-bold">
                      {text.content}
                    </div>
                </div>

                {/* 이전 글 / 다음 글 네비게이션 */}
                <nav className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-surface-high pt-8">
                    {prevText ? (
                        <Link prefetch={false} href={`/transcription/${prevText.id}`} className="group flex flex-col text-left mr-auto hover:bg-surface-low p-4 rounded-2xl transition-all w-full sm:w-1/2">
                            <span className="text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">{db ? '이전 화' : '이전 작품'}</span>
                            <span className="text-xl font-bold text-zinc-300 group-hover:text-primary transition-colors line-clamp-1">{prevText.title}</span>
                            <span className="text-sm font-medium text-zinc-500">{prevText.author}</span>
                        </Link>
                    ) : <div className="w-full sm:w-1/2" />}

                    {nextText ? (
                        <Link prefetch={false} href={`/transcription/${nextText.id}`} className="group flex flex-col text-right ml-auto hover:bg-surface-low p-4 rounded-2xl transition-all w-full sm:w-1/2 items-end">
                            <span className="text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">{db ? '다음 화' : '다음 작품'}</span>
                            <span className="text-xl font-bold text-zinc-300 group-hover:text-primary transition-colors line-clamp-1">{nextText.title}</span>
                            <span className="text-sm font-medium text-zinc-500">{nextText.author}</span>
                        </Link>
                    ) : <div className="w-full sm:w-1/2" />}
                </nav>
            </div>
        </article>
      </div>
    </div>
  );
}
