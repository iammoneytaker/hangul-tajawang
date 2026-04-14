import { Metadata, ResolvingMetadata } from "next";
import { SupabaseService } from "@/lib/supabase";
import { LongPractice } from "@/components/long-practice/LongPractice";
import { notFound } from "next/navigation";
import React from "react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { id } = await params;
  try {
    const content = await SupabaseService.getContentById(id);
    if (!content) return { title: "글을 찾을 수 없습니다." };

    return {
      title: `${content.title} 타자 필사 연습 | 유저 창작글`,
      description: `${content.profiles?.nickname || '익명'} 작가의 글 "${content.title}"을(를) 필사하며 타자 실력을 키워보세요. 현재 ${content.complete_count}명이 함께 도전 중입니다!`,
      keywords: [
        content.title,
        `${content.title} 한글타자`,
        `${content.title} 필사연습`,
        `${content.profiles?.nickname || '익명'} 작가`,
        "유저 창작글 필사",
        "타자 챌린지"
      ],
      alternates: {
        canonical: `https://hangul-tajawang.com/challenge/${id}`,
      },
      openGraph: {
        title: `${content.title} | 유저 창작 타자 챌린지 | 한글타자왕`,
        description: `"${content.title}" - 감성적인 문장을 원고지에 직접 써내려가 보세요. 유저들이 직접 창작하고 공유한 글입니다.`,
        url: `https://hangul-tajawang.com/challenge/${id}`,
        type: "article",
        images: content.profiles?.avatar_url ? [content.profiles.avatar_url] : [],
      },
    };
  } catch (e) {
    return { title: "챌린지 상세 - 한글타자왕" };
  }
}

export default async function ChallengeDetailPage({ params }: Props) {
  const { id } = await params;
  let content;
  
  try {
    content = await SupabaseService.getContentById(id);
  } catch (e) {
    notFound();
  }

  // JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": `${content.title} - 한글 타자 챌린지`,
    "author": {
      "@type": "Person",
      "name": content.profiles?.nickname || "익명 사용자"
    },
    "text": content.content,
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/CompleteAction",
      "userInteractionCount": content.complete_count || 0
    }
  };

  return (
    <div className="w-full py-8 text-on-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex flex-col items-center">
        <LongPractice externalContent={content} />

        {/* SEO HTML Content */}
        <article className="mt-20 w-full max-w-5xl px-6 lg:px-8 animate-in fade-in duration-1000">
            <h1 className="text-3xl font-black mb-8 border-b border-surface-high pb-4 text-zinc-900 dark:text-zinc-100">
               {content.title} - 유저 참여형 타자 필사 연습
            </h1>
            
            <div className="prose dark:prose-invert prose-lg text-zinc-700 dark:text-zinc-300 max-w-none">
                <p className="leading-relaxed mb-8">
                    지금 보고 계신 페이지는 한글타자왕의 유저 참여형 서비스인 <strong>필사 챌린지</strong> 공간입니다. 
                    이 글은 <strong>{content.profiles?.nickname || '익명'}</strong> 님이 직접 창작하거나 공유해주신 소중한 작품 <strong>'{content.title}'</strong> 입니다. 
                    다른 유저분들이 남긴 감성적이고 깊이 있는 문장들을 직접 원고지에 타이핑(필사)해보며, 타자 속도 증진뿐만 아니라 힐링과 사색의 시간을 가져보세요.
                </p>

                <div className="bg-surface-low p-10 rounded-[2.5rem] whitespace-pre-wrap leading-loose font-medium text-lg border border-surface-high shadow-inner">
                    <h2 className="text-2xl font-bold mb-6 text-primary">{content.title} 전문</h2>
                    <div className="text-zinc-800 dark:text-zinc-200 font-bold">
                      {content.content}
                    </div>
                </div>
            </div>
        </article>
      </div>
    </div>
  );
}
