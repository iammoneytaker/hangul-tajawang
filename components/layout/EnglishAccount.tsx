'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SupabaseService } from '@/lib/supabase';
import { EnglishLibrary } from '@/components/library/EnglishLibrary';

type Profile = { readonly nickname: string; readonly bestSpeed: number };
export function EnglishAccount() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const user = await SupabaseService.getCurrentUser();
        if (!user) return;
        const data = await SupabaseService.getMyProfile();
        if (active) {
          const name = typeof data?.nickname === 'string' ? data.nickname : 'Typist';
          setProfile({ nickname: name, bestSpeed: typeof data?.best_speed === 'number' ? data.best_speed : 0 });
          setNickname(name);
        }
      } catch { if (active) setMessage('Your account could not be loaded. Please try again.'); }
      finally { if (active) setLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, []);
  const signIn = async () => {
    setBusy(true);
    try { await SupabaseService.signInWithKakao(); }
    catch { setMessage('Sign-in could not start. Please try again.'); setBusy(false); }
  };
  const save = async () => {
    if (!nickname.trim()) return;
    setBusy(true); setMessage('');
    try {
      await SupabaseService.updateProfile({ nickname: nickname.trim() });
      setProfile(current => current ? { ...current, nickname: nickname.trim() } : current);
      setMessage('Nickname saved.');
    } catch { setMessage('Your nickname could not be saved. Please try again.'); }
    finally { setBusy(false); }
  };
  const signOut = async () => {
    setBusy(true);
    try { await SupabaseService.signOut(); router.push('/en'); router.refresh(); }
    catch { setMessage('Sign-out failed. Please try again.'); setBusy(false); }
  };
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>
      {message && <p role="status" className="mb-5 text-primary">{message}</p>}
      {loading ? <p role="status">Loading your account…</p> : profile ? (
        <section className="paper-card p-6 md:p-10 mb-8">
          <h2 className="text-2xl font-bold mb-4">{profile.nickname}</h2>
          <p className="text-zinc-600 mb-6">Account best speed: {Math.round(profile.bestSpeed)} CPM</p>
          <form onSubmit={event => { event.preventDefault(); void save(); }} className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-2 font-semibold">Nickname<input value={nickname} onChange={event => setNickname(event.target.value)} required maxLength={50} className="border border-surface-high rounded-xl px-4 py-3 max-w-full" /></label>
            <button disabled={busy} className="primary-gradient text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50">Save</button>
          </form>
          <button onClick={signOut} disabled={busy} className="mt-6 text-zinc-600 underline">Sign out</button>
          <p className="text-sm text-zinc-500 mt-6">Your existing account and records are shared across both languages. <Link href="/mypage" className="underline">Manage community posts and avatar in the Korean account page</Link>.</p>
        </section>
      ) : <section className="paper-card p-8"><p className="mb-4">Practice without an account, or sign in to save game scores and sync completed works.</p><button onClick={signIn} disabled={busy} className="primary-gradient text-white px-6 py-3 rounded-xl font-bold">{busy ? 'Opening sign-in…' : 'Sign in with Kakao'}</button><p className="text-sm text-zinc-500 mt-4">Kakao manages its own sign-in screen and available languages.</p></section>}
      <h2 className="text-2xl font-bold mt-10">My Library</h2>
      <EnglishLibrary />
    </div>
  );
}
