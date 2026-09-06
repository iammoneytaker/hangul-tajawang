import type { Metadata } from 'next';

// Page-level openGraph replaces the parent's entire object in Next.js.
export const ENGLISH_OPEN_GRAPH = {
  type: 'website',
  locale: 'en_US',
  siteName: 'Hangul Tajawang',
  images: [{
    url: '/ogimage.png',
    width: 1200,
    height: 630,
    alt: 'Hangul Tajawang — Korean typing practice',
  }],
} satisfies Metadata['openGraph'];
