export const STEP_LABELS: Readonly<Record<string, { readonly title: string; readonly description: string }>> = {
  step1: { title: 'Home Row', description: 'Practice ㅁ ㄴ ㅇ ㄹ ㅎ and ㅗ ㅓ ㅏ ㅣ.' },
  step2: { title: 'Top Row', description: 'Practice ㅂ ㅈ ㄷ ㄱ ㅅ and ㅛ ㅕ ㅑ ㅐ ㅔ.' },
  step3: { title: 'Bottom Row', description: 'Practice ㅋ ㅌ ㅊ ㅍ and ㅠ ㅜ ㅡ.' },
  step4: { title: 'Shift & Tense Consonants', description: 'Practice ㄲ ㄸ ㅃ ㅆ ㅉ and ㅒ ㅖ with Shift.' },
  step5: { title: 'Full Keyboard Review', description: 'Mix words from every keyboard row.' },
};

export const THEME_LABELS_EN: Readonly<Record<string, { readonly title: string; readonly description: string }>> = {
  healing: { title: 'Comfort & Healing', description: 'Warm, encouraging lines with everyday vocabulary.' },
  motivation: { title: 'Motivation', description: 'Quotes about effort and growth.' },
  love: { title: 'Love', description: 'Short romantic lines and common expressions.' },
  literature: { title: 'Literature & Quotes', description: 'Lines from literature and familiar sayings.' },
  proverb: { title: 'Proverbs', description: 'Classic Korean proverbs.' },
};

export const FEATURED_WORKS = [
  { id: 'poem_1', ko: '별 헤는 밤', en: 'Counting the Stars at Night', author: 'Yun Dong-ju', type: 'Poem', level: 'Beginner' },
  { id: 'poem_2', ko: '진달래꽃', en: 'Azaleas', author: 'Kim So-wol', type: 'Poem', level: 'Beginner' },
  { id: 'tale_1', ko: '토끼와 거북이', en: 'The Tortoise and the Hare', author: 'Aesop (Korean)', type: 'Tale', level: 'Beginner' },
  { id: 'poem_6', ko: '알 수 없어요', en: 'I Cannot Know', author: 'Han Yong-un', type: 'Poem', level: 'Intermediate' },
  { id: 'poem_8', ko: '광야', en: 'The Wide Plain', author: 'Yi Yuk-sa', type: 'Poem', level: 'Advanced' },
  { id: 'novel_1', ko: '운수 좋은 날', en: 'A Lucky Day (excerpt)', author: 'Hyun Jin-geon', type: 'Novel', level: 'Advanced' },
] as const;

export const LOCALIZED_DETAIL_PATHS = [
  ...Object.keys(STEP_LABELS).map(id => `/practice/word/${id}`),
  ...Object.keys(THEME_LABELS_EN).map(id => `/practice/short/${id}`),
  ...FEATURED_WORKS.map(work => `/transcription/${work.id}`),
];
