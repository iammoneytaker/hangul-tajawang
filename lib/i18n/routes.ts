// 로케일 라우팅의 단일 기준점.
// 로케일 판정은 URL 경로에서만 한다 — 쿠키·Accept-Language로 라우팅을 바꾸지 않는다(국내 색인 보호).
// /cn 등 로케일 추가 시 LOCALES와 프리픽스 매핑만 확장하면 된다.

import { LOCALIZED_DETAIL_PATHS } from './practice-content';

export const BASE_URL = 'https://www.hangul-tajawang.com';

export type Locale = 'ko' | 'en';

/** /en 버전이 실제로 존재하는 한국어 경로 목록 (hreflang·sitemap·언어 선택기가 모두 이 목록을 따른다) */
export const LOCALIZED_KO_PATHS = [
  '/',
  '/test',
  '/practice',
  '/practice/position',
  '/practice/word',
  '/practice/short',
  '/transcription',
  '/game',
  '/game/acid-rain',
  '/game/stairs',
  '/game/castle-defense',
  '/game/card-flip',
  '/game/block-pop',
  '/game/typing-race',
  '/guide',
  '/terms',
  '/privacy',
  '/contact',
] as const;

export function koToEnPath(koPath: string): string {
  return koPath === '/' ? '/en' : `/en${koPath}`;
}

export function enToKoPath(enPath: string): string {
  return enPath === '/en' ? '/' : enPath.replace(/^\/en/, '');
}

export function isEnPath(pathname: string): boolean {
  return pathname === '/en' || pathname.startsWith('/en/');
}

export function localeFromPathname(pathname: string): Locale {
  return isEnPath(pathname) ? 'en' : 'ko';
}

/**
 * 언어 선택기가 이동할 대응 URL.
 * 대응 페이지가 없으면 상대 언어의 홈으로 보낸다. (JS 상태 전환이 아니라 실제 <a> 링크로 쓸 것)
 */
export function switchLocaleHref(pathname: string): string {
  const supports = (path: string) => (LOCALIZED_KO_PATHS as readonly string[]).includes(path) || LOCALIZED_DETAIL_PATHS.includes(path) || ['/mypage', '/library', '/terms', '/privacy', '/contact'].includes(path);
  if (isEnPath(pathname)) {
    const ko = enToKoPath(pathname);
    return supports(ko) ? ko : '/';
  }
  return supports(pathname) ? koToEnPath(pathname) : '/en';
}
