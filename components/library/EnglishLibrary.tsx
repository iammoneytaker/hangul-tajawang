'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, RotateCcw } from 'lucide-react';
import { getLibrary, syncLibraryWithServer, type PilsaRecord } from '@/lib/pilsa-library';
import { FEATURED_WORKS } from '@/lib/i18n/practice-content';

export function EnglishLibrary() {
  const [records, setRecords] = useState<PilsaRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  useEffect(() => { setRecords(getLibrary()); setReady(true); }, []);
  const refresh = async () => {
    setSyncing(true);
    try { await syncLibraryWithServer(); setRecords(getLibrary()); }
    finally { setSyncing(false); }
  };
  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <p className="text-zinc-600 mb-6">Your saved progress is stored in this browser. Completed works can also be synced with your signed-in account using the existing library sync.</p>
      <button onClick={refresh} disabled={syncing} className="inline-flex items-center gap-2 bg-surface-low rounded-xl px-4 py-3 font-bold mb-8 disabled:opacity-50"><RotateCcw size={16} />{syncing ? 'Syncing…' : 'Refresh & sync completed works'}</button>
      {!ready ? <p role="status">Loading your library…</p> : records.length === 0 ? (
        <div className="paper-card p-10 text-center"><BookOpen className="mx-auto text-primary mb-4" /><h2 className="text-xl font-bold mb-3">Your library starts with one work</h2><Link href="/en/transcription" className="text-primary font-bold">Choose a poem or story</Link></div>
      ) : <div className="grid gap-5 md:grid-cols-2">{records.map(record => {
        const work = record.sourceType === 'work' ? FEATURED_WORKS.find(work => work.id === record.sourceId) : undefined;
        const path = record.sourceType === 'challenge' ? `/challenge/${record.sourceId}` : `/transcription/${record.sourceId}`;
        const latest = record.completions.at(-1);
        return (
          <article key={`${record.sourceType}:${record.sourceId}`} className="paper-card p-6">
            <h2 className="text-xl font-bold mb-2">{work?.en || record.title}</h2>
            <p className="text-zinc-500 mb-4">{work?.author || record.author}</p>
            {record.progress && <p className="text-primary font-semibold mb-3">In progress: {record.progress.percent}%</p>}
            <p className="text-sm mb-3">Completed {record.completions.length} time(s)</p>
            {latest && <p className="text-sm text-zinc-600 mb-4">{latest.kpm} CPM · {latest.accuracy}% accuracy · {new Date(latest.date).toLocaleDateString('en-US')}</p>}
            <Link href={work ? `/en${path}` : path} className="text-primary font-bold">{record.progress ? 'Continue' : 'Practice again'}{work ? '' : ' (Korean interface)'}</Link>
          </article>
        );
      })}</div>}
    </section>
  );
}
