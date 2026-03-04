import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://hangul-tajawang.com'; // 실제 도메인으로 변경 권장

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
    '/quiz',
    '/guide',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. 동적 챌린지 페이지 목록 (Supabase에서 데이터 가져오기)
  let challengePages: any[] = [];
  try {
    const { data: contents } = await supabase
      .from('typing_contents')
      .select('id, created_at')
      .lt('report_count', 10);

    if (contents) {
      challengePages = contents.map((content) => ({
        url: `${baseUrl}/challenge/${content.id}`,
        lastModified: new Date(content.created_at).toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Sitemap generation error:', error);
  }

  return [...staticPages, ...challengePages];
}
