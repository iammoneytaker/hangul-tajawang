import { Metadata } from 'next';
import { BASIC_PRACTICE_STEPS } from '@/lib/word-data';
import { PositionPractice } from '@/components/word-practice/PositionPractice';
import { notFound } from 'next/navigation';
import Link from 'next/link';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const data = BASIC_PRACTICE_STEPS.find((t) => t.id === resolvedParams.id);
  if (!data) return {};

  return {
    title: `${data.title} 낱말 타자 연습 | 한글 단어 연습`,
    description: `${data.title} (${data.description}) 테마의 낱말 타자 연습. '${data.words[0]}', '${data.words[1]}' 등 관련 단어를 치며 타이핑 속도를 높여보세요.`,
    keywords: [
      `${data.title} 타자연습`,
      `${data.title} 낱말`,
      "낱말 타자 연습", 
      "한글 단어 연습", 
      "타자 속도 올리기", 
      "정확도 100%", 
      "타자 기초",
      "한글타자왕"
    ],
    alternates: {
      canonical: `https://hangul-tajawang.com/practice/word/${data.id}`,
    },
    openGraph: {
      title: `${data.title} 낱말 타자 연습 | 한글타자왕`,
      description: `${data.title} 범위의 단어들을 치며 타자 실력을 쑥쑥 올려보세요.`,
      url: `https://hangul-tajawang.com/practice/word/${data.id}`,
      type: "article",
    }
  };
}

export function generateStaticParams() {
  return BASIC_PRACTICE_STEPS.map((t) => ({ id: t.id }));
}

export default async function WordCategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const currentIndex = BASIC_PRACTICE_STEPS.findIndex((t) => t.id === resolvedParams.id);
  
  if (currentIndex === -1) notFound();
  
  const data = BASIC_PRACTICE_STEPS[currentIndex];
  // Calculate prev/next
  const prevData = currentIndex > 0 ? BASIC_PRACTICE_STEPS[currentIndex - 1] : null;
  const nextData = currentIndex < BASIC_PRACTICE_STEPS.length - 1 ? BASIC_PRACTICE_STEPS[currentIndex + 1] : null;

  // JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": `${data.title} 낱말 타자 연습`,
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "All",
    "description": `${data.title} 해당하는 한글 자모음으로 구성된 필수 단어(낱말) 타자 연습입니다.`,
    "author": {
      "@type": "Organization",
      "name": "한글타자왕"
    }
  };

  return (
    <div className="w-full py-8 text-on-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex flex-col items-center">
        <PositionPractice initialPhase="words" initialTargetId={data.id} />

        {/* SEO HTML Content */}
        <article className="mt-12 w-full max-w-5xl px-6 lg:px-8 animate-in fade-in duration-1000">
            <h1 className="text-3xl font-black mb-8 border-b border-surface-high pb-4">{data.title} 기반 낱말 타자 연습</h1>
            <div className="prose dark:prose-invert prose-lg text-zinc-700 dark:text-zinc-300 max-w-none">
                <p className="leading-relaxed mb-8">
                    이곳은 <strong>{data.title} ({data.description})</strong> 영역의 한글 자모음들로 구성된 자주 쓰이는 낱말들을 집중적으로 타이핑해 볼 수 있는 연습장입니다.
                    키보드 위치를 숙지한 후 단어로 응용하면서 "독수리 타법"을 완전히 교정하고 타수를 급격히 올리는 핵심적인 훈련 과정입니다.
                </p>
                <div className="bg-surface-low p-10 rounded-[2.5rem] leading-loose font-medium text-lg border border-surface-high shadow-inner">
                    <h2 className="text-2xl font-bold mb-6 text-primary">제공되는 {data.title} 관련 낱말 목록</h2>
                    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-on-surface">
                      {data.words.map((word, idx) => (
                        <li key={idx} className="bg-surface-lowest px-4 py-2 rounded-xl text-center border border-surface-high">{word}</li>
                      ))}
                    </ul>
                </div>

                {/* 이전 글 / 다음 글 네비게이션 */}
                <nav className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-surface-high pt-8">
                    {prevData ? (
                        <Link href={`/practice/word/${prevData.id}`} className="group flex flex-col text-left mr-auto hover:bg-surface-low p-4 rounded-2xl transition-all w-full sm:w-1/2">
                            <span className="text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">이전 단계</span>
                            <span className="text-xl font-black text-zinc-300 group-hover:text-primary transition-colors line-clamp-1">{prevData.title}</span>
                        </Link>
                    ) : <div className="w-full sm:w-1/2" />}

                    {nextData ? (
                        <Link href={`/practice/word/${nextData.id}`} className="group flex flex-col text-right ml-auto hover:bg-surface-low p-4 rounded-2xl transition-all w-full sm:w-1/2 items-end">
                            <span className="text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">다음 단계</span>
                            <span className="text-xl font-black text-zinc-300 group-hover:text-primary transition-colors line-clamp-1">{nextData.title}</span>
                        </Link>
                    ) : <div className="w-full sm:w-1/2" />}
                </nav>
            </div>
        </article>
      </div>
    </div>
  );
}
