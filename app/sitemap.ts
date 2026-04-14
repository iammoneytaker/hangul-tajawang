import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { LONG_TEXT_DB } from '@/lib/long-text-data';
import { BASIC_PRACTICE_STEPS } from '@/lib/word-data';
import { SHORT_TEXT_DB } from '@/lib/short-text-data';
import { QUIZ_DATA } from '@/lib/quiz-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 실제 운영 중인 www 도메인으로 베이스 URL 설정
  const baseUrl = 'https://www.hangul-tajawang.com';
  const lastModifiedTime = new Date().toISOString();

  // 1. 정적 페이지 목록
  const staticPages = [
    '',
    '/practice',
    '/practice/position',
    '/practice/word',
    '/practice/short',
    '/transcription',
    '/challenge',
    '/game',
    '/game/acid-rain',
    '/game/card-flip',
    '/quiz',
    '/recommend',
    '/recommend/abko-mk108',
    '/guide',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: lastModifiedTime,
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. 로컬 하드코딩 된 SEO 페이지 파싱 (낱말, 짧은글, 긴글, 퀴즈)
  const longTextPages = LONG_TEXT_DB.map(text => ({
    url: `${baseUrl}/transcription/${text.id}`,
    lastModified: lastModifiedTime,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const shortPages = SHORT_TEXT_DB.map(data => ({
    url: `${baseUrl}/practice/short/${data.id}`,
    lastModified: lastModifiedTime,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const wordPages = BASIC_PRACTICE_STEPS.map(step => ({
    url: `${baseUrl}/practice/word/${step.id}`,
    lastModified: lastModifiedTime,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const quizPages = QUIZ_DATA.map(quiz => ({
    url: `${baseUrl}/quiz/${quiz.id}`,
    lastModified: lastModifiedTime,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  // 3. 동적 챌린지 페이지 목록 (Supabase에서 실시간으로 가져옴)
  let challengePages: any[] = [];
  try {
    const { data: contents } = await supabase
      .from('typing_contents')
      .select('id, updated_at, created_at')
      .lt('report_count', 10); // 신고 누적된 글은 제외

    if (contents) {
      challengePages = contents.map((content) => ({
        url: `${baseUrl}/challenge/${content.id}`,
        lastModified: new Date(content.updated_at || content.created_at).toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Sitemap generation error:', error);
  }

  return [...staticPages, ...longTextPages, ...shortPages, ...wordPages, ...quizPages, ...challengePages];
}
