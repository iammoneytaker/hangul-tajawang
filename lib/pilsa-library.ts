/**
 * 내 서재 — 필사 기록 저장소 (localStorage 기반)
 *
 * 완주한 작품이 "책"으로 서재에 쌓이고, 진행 중인 작품은 이어하기가 가능하다.
 * v1은 기기 로컬 저장(비로그인 포함 전원 동작). 서버 동기화는 v2에서
 * 이 모듈의 API 뒤에 붙이는 것을 전제로 설계했다.
 */

export interface PilsaCompletion {
  date: string;     // ISO
  kpm: number;
  accuracy: number;
  seconds: number;
}

/** 이어하기용 진행 스냅샷 (데스크톱 미러 입력 / 모바일 줄 모드 겸용) */
export interface PilsaProgress {
  inputValue: string;   // 데스크톱: 지금까지 친 전체 텍스트
  lineInput?: string;
  lineIndex: number;    // 모바일 줄 모드: 완료한 줄 수
  accStrokes: number;
  accCorrect: number;
  accTyped: number;
  elapsedSeconds: number;
  percent: number;
  updatedAt: string;
}

export interface PilsaSourceMeta {
  sourceType: "work" | "challenge";
  sourceId: string;
  title: string;
  author: string;
  category: string;
  /** 챌린지는 원문을 함께 보관 (내장 작품은 LONG_TEXT_DB에서 조회 가능) */
  content?: string;
}

export interface PilsaRecord extends PilsaSourceMeta {
  completions: PilsaCompletion[];
  progress?: PilsaProgress;
}

const STORAGE_KEY = "tajawang_library_v1";

const keyOf = (type: string, id: string) => `${type}:${id}`;

function loadDb(): Record<string, PilsaRecord> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveDb(db: Record<string, PilsaRecord>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* 저장 공간 부족 등은 조용히 무시 */
  }
}

/** 서재 전체 (최근 활동순) */
export function getLibrary(): PilsaRecord[] {
  const db = loadDb();
  const lastActivity = (r: PilsaRecord) => {
    const dates = [
      ...r.completions.map((c) => c.date),
      r.progress?.updatedAt || "",
    ];
    return dates.sort().pop() || "";
  };
  return Object.values(db).sort((a, b) => lastActivity(b).localeCompare(lastActivity(a)));
}

export function getRecord(sourceType: string, sourceId: string): PilsaRecord | null {
  return loadDb()[keyOf(sourceType, sourceId)] || null;
}

/** 완주 기록 — 서재에 책이 꽂힌다 (재완주 시 "N쇄"로 쌓임) */
export function recordCompletion(meta: PilsaSourceMeta, completion: PilsaCompletion) {
  const db = loadDb();
  const key = keyOf(meta.sourceType, meta.sourceId);
  const existing = db[key];
  db[key] = {
    ...meta,
    completions: [...(existing?.completions || []), completion],
    // 완주했으니 진행 스냅샷은 제거
    progress: undefined,
  };
  saveDb(db);
  // 로그인 상태면 서버에도 기록 (실패해도 로컬은 이미 저장됨 — 다음 동기화 때 백필)
  void pushCompletionToServer(meta, completion);
}

/** 진행 스냅샷 저장 (이어하기) — 2% 미만은 노이즈라 저장하지 않음 */
export function saveProgress(meta: PilsaSourceMeta, progress: PilsaProgress) {
  if (progress.percent < 2 || progress.percent >= 100) return;
  const db = loadDb();
  const key = keyOf(meta.sourceType, meta.sourceId);
  const existing = db[key];
  db[key] = {
    ...meta,
    completions: existing?.completions || [],
    progress,
  };
  saveDb(db);
}

export function clearProgress(sourceType: string, sourceId: string) {
  const db = loadDb();
  const key = keyOf(sourceType, sourceId);
  const record = db[key];
  if (!record) return;
  if (record.completions.length === 0) {
    delete db[key]; // 완주 이력도 없으면 레코드 자체 제거
  } else {
    record.progress = undefined;
  }
  saveDb(db);
}

// ═══════════════════════════════════════════════════════════════════
// 서버 동기화 (로그인 사용자 한정, pilsa_records 테이블 필요 — supabase/pilsa_records.sql)
// 원칙: 로컬이 항상 진실의 원본. 서버는 백업+기기 간 공유용.
// 테이블이 없거나 오프라인이어도 모든 로컬 기능은 정상 동작한다.
// ═══════════════════════════════════════════════════════════════════

async function currentUserId(): Promise<string | null> {
  try {
    const { supabase } = await import("./supabase");
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

async function pushCompletionToServer(meta: PilsaSourceMeta, c: PilsaCompletion) {
  const uid = await currentUserId();
  if (!uid) return;
  try {
    const { supabase } = await import("./supabase");
    await supabase.from("pilsa_records").insert({
      user_id: uid,
      source_type: meta.sourceType,
      source_id: meta.sourceId,
      title: meta.title,
      author: meta.author,
      category: meta.category,
      kpm: c.kpm,
      accuracy: c.accuracy,
      seconds: c.seconds,
      completed_at: c.date,
    });
  } catch {
    /* 오프라인/테이블 미생성 — 다음 syncLibraryWithServer 백필에서 재시도 */
  }
}

/**
 * 서버 ↔ 로컬 양방향 병합.
 * 1) 서버에만 있는 완주(다른 기기에서 새김) → 로컬에 내려받기
 * 2) 로컬에만 있는 완주(오프라인/비로그인 시절 기록) → 서버에 올리기
 * 중복 판정: 같은 작품 + 완주 시각 2초 이내.
 */
export async function syncLibraryWithServer(): Promise<void> {
  const uid = await currentUserId();
  if (!uid) return;

  let rows: any[] = [];
  try {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase
      .from("pilsa_records")
      .select("source_type, source_id, title, author, category, kpm, accuracy, seconds, completed_at")
      .eq("user_id", uid);
    if (error) return; // 테이블 미생성 등 — 로컬만으로 동작
    rows = data || [];
  } catch {
    return;
  }

  const db = loadDb();
  const serverTimes = rows.map((r) => ({ k: keyOf(r.source_type, r.source_id), t: new Date(r.completed_at).getTime() }));
  const existsOnServer = (k: string, t: number) => serverTimes.some((s) => s.k === k && Math.abs(s.t - t) < 2000);
  const existsLocally = (rec: PilsaRecord | undefined, t: number) =>
    !!rec?.completions.some((c) => Math.abs(new Date(c.date).getTime() - t) < 2000);

  // 1) 서버 → 로컬
  for (const r of rows) {
    const key = keyOf(r.source_type, r.source_id);
    const t = new Date(r.completed_at).getTime();
    const rec: PilsaRecord = db[key] || {
      sourceType: r.source_type,
      sourceId: r.source_id,
      title: r.title,
      author: r.author || "",
      category: r.category || "",
      completions: [],
    };
    if (!existsLocally(rec, t)) {
      rec.completions.push({ date: new Date(t).toISOString(), kpm: r.kpm, accuracy: r.accuracy, seconds: r.seconds || 0 });
      rec.completions.sort((a, b) => a.date.localeCompare(b.date));
    }
    db[key] = rec;
  }
  saveDb(db);

  // 2) 로컬 → 서버 백필
  const missing = Object.values(db).flatMap((rec) =>
    rec.completions
      .filter((c) => !existsOnServer(keyOf(rec.sourceType, rec.sourceId), new Date(c.date).getTime()))
      .map((c) => ({
        user_id: uid,
        source_type: rec.sourceType,
        source_id: rec.sourceId,
        title: rec.title,
        author: rec.author,
        category: rec.category,
        kpm: c.kpm,
        accuracy: c.accuracy,
        seconds: c.seconds,
        completed_at: c.date,
      }))
  );
  if (missing.length > 0) {
    try {
      const { supabase } = await import("./supabase");
      await supabase.from("pilsa_records").insert(missing);
    } catch { /* 다음 방문 때 재시도 */ }
  }
}

/** 요약 통계 (서재 헤더용) */
export function getLibraryStats() {
  const records = getLibrary();
  const done = records.filter((r) => r.completions.length > 0);
  const totalCompletions = done.reduce((a, r) => a + r.completions.length, 0);
  const bestKpm = Math.max(0, ...done.flatMap((r) => r.completions.map((c) => c.kpm)));
  return { books: done.length, totalCompletions, bestKpm, inProgress: records.length - done.length };
}
