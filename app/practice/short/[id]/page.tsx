import { Metadata } from 'next';
import { SHORT_TEXT_DB } from '@/lib/short-text-data';
import { ShortPractice } from '@/components/short-practice/ShortPractice';
import { notFound } from 'next/navigation';
import Link from 'next/link';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const data = SHORT_TEXT_DB.find((t) => t.id === resolvedParams.id);
  if (!data) return {};

  return {
    title: `${data.category} 짧은 글 타자 연습 | 한글 문장 연습`,
    description: `${data.category} 테마의 짧은 글 타자 연습. '${data.sentences[0]}' 등 총 ${data.sentences.length}개의 감성 문장을 타자하며 속도를 측정해 보세요.`,
    keywords: [
      `${data.category} 타자연습`,
      `${data.category} 짧은 글`,
      "짧은 글 타자", 
      "한글 문장 연습", 
      "타자 속도 측정", 
      "타수 올리기", 
      "감성 문장 타자",
      "한글타자왕"
    ],
    alternates: {
      canonical: `https://hangul-tajawang.com/practice/short/${data.id}`,
    },
    openGraph: {
      title: `${data.category} 짧은 글 타자 연습 | 한글타자왕`,
      description: `${data.category} 명언과 글귀를 치며 타자 실력을 키워보세요.`,
      url: `https://hangul-tajawang.com/practice/short/${data.id}`,
      type: "article",
    }
  };
}

export function generateStaticParams() {
  return SHORT_TEXT_DB.map((t) => ({ id: t.id }));
}

export default async function ShortCategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const currentIndex = SHORT_TEXT_DB.findIndex((t) => t.id === resolvedParams.id);
  
  if (currentIndex === -1) notFound();
  
  const data = SHORT_TEXT_DB[currentIndex];
  // Calculate prev/next
  const prevData = currentIndex > 0 ? SHORT_TEXT_DB[currentIndex - 1] : null;
  const nextData = currentIndex < SHORT_TEXT_DB.length - 1 ? SHORT_TEXT_DB[currentIndex + 1] : null;

  // JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": `${data.category} 짧은 글 타자 연습`,
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "All",
    "description": `${data.category} 테마의 짧은 글(명언, 속담, 시구 등)을 활용한 한글 타자 연습 도구입니다. 타자 속도(타수)와 정확도를 측정합니다.`,
    "author": {
      "@type": "Organization",
      "name": "한글타자왕"
    }
  };

  return (
    <div className="w-full py-8 text-on-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex flex-col items-center">
        <ShortPractice initialCategory={data.category} />

        {/* SEO HTML Content */}
        <article className="mt-12 w-full max-w-5xl px-6 lg:px-8 animate-in fade-in duration-1000">
            <h1 className="text-3xl font-black mb-8 border-b border-surface-high pb-4">{data.category} 기반 짧은 글 타자 연습</h1>
            <div className="prose dark:prose-invert prose-lg text-zinc-700 dark:text-zinc-300 max-w-none">
                <p className="leading-relaxed mb-8">
                    지금 보고 계신 페이지는 <strong>{data.category}</strong> 테마에 맞춘 짧은 글(문장)들을 집중적으로 연습할 수 있는 타자 연습 모드입니다. 
                    타자 속도(연타수)와 타이핑 정확도를 실시간으로 피드백 받아, 재미와 학습 효율을 동시에 챙겨보세요.
                    아래는 본 프로그램에서 등장하는 주요 <strong>{data.category}</strong> 문장 목록입니다.
                </p>
                <div className="bg-surface-low p-10 rounded-[2.5rem] leading-loose font-medium text-lg border border-surface-high shadow-inner">
                    <h2 className="text-2xl font-bold mb-6 text-primary">제공되는 {data.category} 문장 목록</h2>
                    <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300 font-medium">
                      {data.sentences.map((st, idx) => (
                        <li key={idx}>{st}</li>
                      ))}
                    </ul>
                </div>

                {/* 이전 글 / 다음 글 네비게이션 */}
                <nav className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-surface-high pt-8">
                    {prevData ? (
                        <Link href={`/practice/short/${prevData.id}`} className="group flex flex-col text-left mr-auto hover:bg-surface-low p-4 rounded-2xl transition-all w-full sm:w-1/2">
                            <span className="text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">이전 테마</span>
                            <span className="text-xl font-black text-zinc-300 group-hover:text-primary transition-colors line-clamp-1">{prevData.category}</span>
                        </Link>
                    ) : <div className="w-full sm:w-1/2" />}

                    {nextData ? (
                        <Link href={`/practice/short/${nextData.id}`} className="group flex flex-col text-right ml-auto hover:bg-surface-low p-4 rounded-2xl transition-all w-full sm:w-1/2 items-end">
                            <span className="text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">다음 테마</span>
                            <span className="text-xl font-black text-zinc-300 group-hover:text-primary transition-colors line-clamp-1">{nextData.category}</span>
                        </Link>
                    ) : <div className="w-full sm:w-1/2" />}
                </nav>
            </div>
        </article>
      </div>
    </div>
  );
}
