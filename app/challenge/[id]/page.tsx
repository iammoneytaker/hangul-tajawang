import { Metadata, ResolvingMetadata } from "next";
import { SupabaseService } from "@/lib/supabase";
import { LongPractice } from "@/components/long-practice/LongPractice";
import { notFound } from "next/navigation";
import React from "react";

interface Props {
  params: Promise<{ id: string }>;
}

// 1. 동적 SEO 메타데이터 생성
export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { id } = await params;
  try {
    const content = await SupabaseService.getContentById(id);
    if (!content) return { title: "글을 찾을 수 없습니다." };

    return {
      title: `${content.title} - 한글 필사 챌린지`,
      description: `${content.profiles?.nickname} 작가의 글 "${content.title}"을(를) 필사하며 타자 실력을 키워보세요. 현재 ${content.complete_count}명이 도전 중!`,
      openGraph: {
        title: `${content.title} | 한글타자왕`,
        description: `"${content.title}" - 감성적인 문장을 원고지에 써내려가 보세요.`,
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

  return (
    <div className="w-full py-8">
      <h1 className="sr-only">{content.title} - 필사 타자 연습</h1>
      <div className="flex justify-center">
        <LongPractice externalContent={content} />
      </div>
    </div>
  );
}
