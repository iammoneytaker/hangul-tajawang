'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/analytics';

export function activityMode(path: string): string | null {
  const route = path.replace(/^\/en(?=\/|$)/, '') || '/';
  if (route === '/') return 'home';
  if (route === '/journey/daily') return 'daily';
  if (route.startsWith('/journey')) return 'journey';
  if (route.startsWith('/transcription')) return 'library';
  if (route.startsWith('/challenge')) return 'challenge';
  if (route === '/test') return 'speed_test';
  if (route.startsWith('/game/')) return route.split('/')[2];
  if (route === '/game') return 'games';
  if (route.startsWith('/practice/')) return route.split('/')[2];
  if (route === '/practice') return 'practice';
  return null;
}

export function ActivityAnalytics() {
  const pathname = usePathname();
  const previous = useRef<string | null>(null);
  useEffect(() => {
    const mode = activityMode(pathname);
    if (mode && previous.current !== pathname) track('activity_view', { mode });
    previous.current = pathname;
    let inputSeen = false;
    function onInput(event: Event) {
      const target = event.target;
      if (inputSeen || !mode || mode === 'home' || !(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)
        || !target.value || !target.hasAttribute('data-typing-input')) return;
      inputSeen = true;
      track('activity_input', { mode });
    }
    function onClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest('a[href]');
      if (!(link instanceof HTMLAnchorElement) || link.origin !== window.location.origin) return;
      const destinationMode = activityMode(link.pathname);
      if (mode && destinationMode && link.pathname !== pathname) track('activity_next', { mode, destination: link.pathname, destination_mode: destinationMode });
    }
    document.addEventListener('click', onClick);
    document.addEventListener('input', onInput);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('input', onInput);
    };
  }, [pathname]);
  return null;
}
