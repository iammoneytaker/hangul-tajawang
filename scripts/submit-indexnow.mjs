#!/usr/bin/env node
/**
 * IndexNow 색인 요청 스크립트
 * 사이트맵의 모든 URL을 IndexNow에 제출합니다.
 * IndexNow 지원 검색엔진에 URL 변경을 알립니다. 실제 크롤링·색인을 보장하지 않습니다.
 * (구글은 IndexNow 미지원 — 구글은 submit-gsc-sitemap.mjs 사용)
 *
 * 사용법:
 *   node scripts/submit-indexnow.mjs            # 사이트맵 전체 URL 제출
 *   node scripts/submit-indexnow.mjs /blog/xxx  # 특정 경로만 제출
 */

const HOST = 'www.hangul-tajawang.com';
const KEY = 'ee34742b8a797f293284d14ed3a06d50'; // public/{KEY}.txt 로 호스팅됨
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;

async function getSitemapUrls() {
  const res = await fetch(SITEMAP_URL);
  if (!res.ok) throw new Error(`사이트맵 로드 실패: ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
}

async function main() {
  const args = process.argv.slice(2);
  let urlList;

  if (args.length > 0) {
    urlList = args.map((p) => (p.startsWith('http') ? p : `https://${HOST}${p}`));
  } else {
    urlList = await getSitemapUrls();
  }

  // IndexNow는 한 번에 최대 10,000개까지 허용
  console.log(`제출할 URL: ${urlList.length}개`);

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList,
    }),
  });

  // 200 = 성공, 202 = 접수됨(키 검증 대기)
  console.log(`IndexNow 응답: ${res.status} ${res.statusText}`);
  if (res.status === 200 || res.status === 202) {
    console.log('✅ 제출 완료. 네이버/빙 크롤러에 URL이 전달되었습니다.');
  } else {
    console.error('❌ 제출 실패:', await res.text());
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
