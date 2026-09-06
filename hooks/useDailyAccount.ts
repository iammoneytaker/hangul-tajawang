'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useDailyAccount(): string | null | undefined {
  const [userId, setUserId] = useState<string | null>();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  return userId;
}
