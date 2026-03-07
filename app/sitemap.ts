import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 실제 운영 중인 www 도메인으로 베이스 URL 설정
  const baseUrl = 'https://www.hangul-tajawang.com';

  // 1. 정적 페이지 목록
  const staticPages = [
    '',
    '/practice',
    '/practice/position', // 자리 연습
    '/practice/word',     // 낱말 연습
    '/practice/short',    // 짧은 글 연습
    '/transcription',     // 긴 글 연습 (필사)
    '/challenge',         // 필사 챌린지 목록
    '/game',              // 한글 게임 센터
    '/game/acid-rain',    // 산성비 게임
    '/quiz',              // 맞춤법 퀴즈
    '/guide',             // 이용 가이드
    '/privacy',           // 개인정보처리방침
    '/terms',             // 이용약관
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. 동적 챌린지 페이지 목록 (Supabase에서 실시간으로 가져옴)
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
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Sitemap generation error:', error);
  }

  return [...staticPages, ...challengePages];
}
