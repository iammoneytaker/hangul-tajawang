import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { LONG_TEXT_DB } from '@/lib/long-text-data';
import { fetchBooksSafe, fetchAuthorsSafe } from '@/lib/books-db';
import { BASIC_PRACTICE_STEPS } from '@/lib/word-data';
import { SHORT_TEXT_DB } from '@/lib/short-text-data';
import { QUIZ_DATA } from '@/lib/quiz-data';
import { blogPosts } from '@/lib/blog-data';
import { JOURNEY_COURSES } from '@/lib/journey-data';
import { LOCALIZED_KO_PATHS, koToEnPath } from '@/lib/i18n/routes';

// 사이트맵을 1시간마다 재생성 (매 요청마다 DB 쿼리 방지)
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.hangul-tajawang.com';

  // ✅ 고정 날짜 사용
  // new Date()를 쓰면 매번 "오늘 수정됨"으로 인식되어
  // 크롤러가 매일 모든 페이지를 강제 재크롤링합니다.
  const CONTENT_LAST_UPDATED = '2025-12-01';

  // 1. 정적 페이지
  const staticPages = [
    '',
    '/test',
    '/blog',
    '/practice',
    '/practice/position',
    '/practice/word',
    '/practice/short',
    '/transcription',
    '/challenge',
    '/game',
    '/game/acid-rain',
    '/game/card-flip',
    '/game/block-pop',
    '/game/castle-defense',
    '/game/typing-race',
    '/game/stairs',
    '/journey',
    '/journey/daily',
    ...JOURNEY_COURSES.map((course) => `/journey/${course.id}`),
    '/quiz',
    '/guide',
    '/contact',
    '/privacy',
    '/terms',
  ].map((route) => {
    // /en 버전이 있는 페이지는 hreflang 상호참조를 sitemap에도 노출
    const koPath = route === '' ? '/' : route;
    const localized = (LOCALIZED_KO_PATHS as readonly string[]).includes(koPath);
    return {
      url: `${baseUrl}${route}`,
      lastModified: CONTENT_LAST_UPDATED,
      changeFrequency: 'monthly' as const, // daily → monthly (정적 페이지는 자주 안 바뀜)
      priority: route === '' ? 1.0 : 0.8,
      ...(localized && {
        alternates: {
          languages: { ko: `${baseUrl}${route}`, en: `${baseUrl}${koToEnPath(koPath)}` },
        },
      }),
    };
  });

  // 영문 페이지 (2026-09 신설 — 코어 페이지만, 한글 콘텐츠 상세는 제외)
  const EN_LAUNCHED = '2026-09-01';
  const enPages = LOCALIZED_KO_PATHS.map((koPath) => ({
    url: `${baseUrl}${koToEnPath(koPath)}`,
    lastModified: EN_LAUNCHED,
    changeFrequency: 'monthly' as const,
    priority: koPath === '/' ? 0.9 : 0.7,
    alternates: {
      languages: {
        ko: koPath === '/' ? baseUrl : `${baseUrl}${koPath}`,
        en: `${baseUrl}${koToEnPath(koPath)}`,
      },
    },
  }));

  // 2. 블로그 포스트 (실제 작성 날짜 사용)
  const blogPages = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: post.date,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  // 3. 콘텐츠 페이지
  // 오리지널 연재(책방)는 DB 기준 — publish만 하면 사이트맵에도 자동 반영
  const books = await fetchBooksSafe();
  const seriesPages = books.map(book => ({
    url: `${baseUrl}/transcription/series/${book.id}`,
    lastModified: CONTENT_LAST_UPDATED,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  // 작가 페이지 (authors 테이블 미생성 시 빈 배열)
  const authors = await fetchAuthorsSafe();
  const authorPages = authors.map(author => ({
    url: `${baseUrl}/authors/${author.id}`,
    lastModified: CONTENT_LAST_UPDATED,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // 화 페이지: 정적 콘텐츠 + DB 책방 화 (중복 제거)
  const longTextIds = new Set(LONG_TEXT_DB.map(text => text.id));
  for (const book of books) for (const e of book.episodesMeta) longTextIds.add(e.id);
  const longTextPages = Array.from(longTextIds).map(id => ({
    url: `${baseUrl}/transcription/${id}`,
    lastModified: CONTENT_LAST_UPDATED,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const shortPages = SHORT_TEXT_DB.map(data => ({
    url: `${baseUrl}/practice/short/${data.id}`,
    lastModified: CONTENT_LAST_UPDATED,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const wordPages = BASIC_PRACTICE_STEPS.map(step => ({
    url: `${baseUrl}/practice/word/${step.id}`,
    lastModified: CONTENT_LAST_UPDATED,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const quizPages = QUIZ_DATA.map(quiz => ({
    url: `${baseUrl}/quiz/${quiz.id}`,
    lastModified: CONTENT_LAST_UPDATED,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  // 4. 동적 챌린지 페이지 (revalidate로 1시간 캐싱)
  let challengePages: any[] = [];
  try {
    const { data: contents } = await supabase
      .from('typing_contents')
      .select('id, updated_at, created_at')
      .lt('report_count', 10);

    if (contents) {
      challengePages = contents.map((content) => ({
        url: `${baseUrl}/challenge/${content.id}`,
        lastModified: new Date(content.updated_at || content.created_at).toISOString(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Sitemap generation error:', error);
  }

  return [
    ...staticPages,
    ...enPages,
    ...blogPages,
    ...seriesPages,
    ...authorPages,
    ...longTextPages,
    ...shortPages,
    ...wordPages,
    ...quizPages,
    ...challengePages,
  ];
}
