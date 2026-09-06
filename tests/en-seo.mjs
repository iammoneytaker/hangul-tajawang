import assert from 'node:assert/strict';

const origin = process.argv[2] || 'http://localhost:3003';
const site = 'https://www.hangul-tajawang.com';
const paths = ['', '/test', '/practice', '/practice/position', '/practice/word', '/practice/short',
  '/transcription', '/guide', '/game', '/game/acid-rain', '/game/stairs',
  '/game/castle-defense', '/game/card-flip', '/game/block-pop', '/game/typing-race'];

for (const path of paths) {
  const response = await fetch(`${origin}/en${path}`, { signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 200, path);
  const html = (await response.text()).replace(/<!--.*?-->/gs, '');
  const head = html.split('</head>')[0];
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, path);
  assert.ok(head.includes(`rel="canonical" href="${site}/en${path}"`), `canonical: ${path}`);
  assert.ok(head.includes(`hrefLang="en" href="${site}/en${path}"`), `English alternate: ${path}`);
  assert.ok(head.includes(`hrefLang="ko" href="${site}${path}"`), `Korean alternate: ${path}`);
  assert.ok(head.includes('property="og:image"'), `share image: ${path}`);
  assert.ok(head.includes('property="og:locale" content="en_US"'), `share locale: ${path}`);
  assert.ok(html.includes('lang="en"'), `English content language: ${path}`);
  assert.ok(!head.includes('noindex'), `indexable: ${path}`);
  const koResponse = await fetch(`${origin}${path || '/'}`, { signal: AbortSignal.timeout(20000) });
  assert.equal(koResponse.status, 200, `Korean counterpart: ${path}`);
  const koHead = (await koResponse.text()).split('</head>')[0];
  assert.ok(koHead.includes(`hrefLang="en" href="${site}/en${path}"`), `reciprocal alternate: ${path}`);
  console.log(`PASS /en${path}`);
}
