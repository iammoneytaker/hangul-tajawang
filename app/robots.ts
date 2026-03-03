import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/mypage', '/auth/*'], // 개인정보가 있는 마이페이지와 인증 라우트는 검색엔진 수집 거부
    },
    sitemap: 'https://hangul-tajawang.com/sitemap.xml',
  };
}
