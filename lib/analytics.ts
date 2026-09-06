// 필사·지식여정 계측을 GTM dataLayer 로만 보낸다.
//
// 예전에는 Supabase usage_events 테이블에도 같이 적었는데 2026-09-05에 걷어냈다.
//   - 프로덕션에서 이 테이블을 읽는 코드가 없었다 (로컬 CLI 하나뿐, 57일간 조회 28회)
//   - 그런데 INSERT 14만 건이 Disk IO 1위였다
//   - 필사 완주 기록은 pilsa_records 에 작품·타수·정확도까지 함께 이미 쌓이고 있어
//     usage_events 의 pilsa_* 는 더 부실한 중복이었다
//
// 지표가 다시 필요해지면 GTM 에서 맞춤 이벤트 트리거 + GA4 태그를 만들면 된다
// (측정 ID G-5LL9SEW1SL). 아래 dataLayer.push 는 그대로 두었으므로 코드 수정은 필요 없다.

const VISITOR_KEY = 'htw_visitor_id';

function getVisitorId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return null; // 시크릿 모드 등 localStorage 불가 환경
  }
}

export type UsageEventName =
  | 'pilsa_start'
  | 'pilsa_complete'
  | 'journey_start'
  | 'journey_complete'
  | 'journey_hint'
  | 'practice_start'
  | 'practice_complete'
  | 'speed_test_start'
  | 'speed_test_complete'
  | 'tier_card_download'
  | 'tier_card_share'
  | 'daily_start'
  | 'daily_complete'
  | 'daily_hint'
  | 'game_start'
  | 'game_complete'
  | 'activity_view'
  | 'activity_input'
  | 'activity_next';

type AnalyticsWindow = Window & { dataLayer?: Record<string, unknown>[] };

// 계측 실패가 사용자 경험을 해치지 않도록 항상 조용히 무시한다.
export function track(
  event: UsageEventName,
  props: Record<string, string | number | boolean | null> = {}
): void {
  try {
    const analyticsWindow = window as AnalyticsWindow;
    const dataLayer = analyticsWindow.dataLayer ?? (analyticsWindow.dataLayer = []);
    const payload = {
      event,
      ...props,
      visitor_id: getVisitorId(),
      path: window.location.pathname,
    };
    dataLayer.push(payload);
    if (event.endsWith('_start') || event.endsWith('_complete')) {
      const mode = props.mode ?? (event.startsWith('pilsa_') ? props.source ?? 'library'
        : event.startsWith('journey_') ? 'journey'
        : event.startsWith('daily_') ? 'daily'
        : event.startsWith('speed_test_') ? 'speed_test' : 'game');
      dataLayer.push({ ...payload, mode, event: event.endsWith('_start') ? 'activity_start' : 'activity_complete' });
    }
  } catch {
    /* noop */
  }
}
