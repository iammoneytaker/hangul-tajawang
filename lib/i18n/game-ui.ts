// 게임 안내 문구 로케일 레이어.
// 원칙: "안내는 영어, 타이핑 대상(단어·스킬 명령어)은 한글 그대로".
// t()는 한국어 원문을 키로 받아 /en에서만 영어를 반환한다 —
// ko 경로는 원문을 그대로 돌려주므로 한국어 화면 회귀가 구조적으로 불가능하고,
// 미번역 문구는 en에서도 한국어로 폴백된다(빈 화면 방지).

import { usePathname } from 'next/navigation';
import { isEnPath } from './routes';

const EN: Record<string, string> = {
  "게임 종료": "Exit game",
  "음소거": "Mute audio",
  "음소거 토글": "Toggle audio",
  "남은 게이지": "Energy",
  "병아리 캐릭터": "Chick character",
  // ── 공통 (시작/결과/랭킹) ────────────────────────────────────────────
  '게임 시작': 'Start Game',
  '준비가 되면 시작하세요': 'Press start when ready',
  '다시 도전하기': 'Play Again',
  '다시 시작하기': 'Play Again',
  '다시 도전': 'Play Again',
  '목록으로 돌아가기': 'All games',
  '방금 세운 기록이 랭킹에 성공적으로 반영되었습니다!': 'Your score has been posted to the leaderboard!',
  '랭킹에 기록이 성공적으로 등록되었습니다!': 'Your score has been posted to the leaderboard!',
  '랭킹에 기록이 반영되었습니다.': 'Your score has been posted to the leaderboard.',
  '랭킹에 이름을 남기고 싶으신가요?': 'Want your name on the leaderboard?',
  '랭킹에 기록을 남겨보세요.': 'Want your name on the leaderboard?',
  '기록을 남겨보세요!': 'Want to save your record?',
  '3초 만에 로그인하고 기록 저장': 'Sign in with Kakao to save your score',
  '3초 만에 로그인하고 저장': 'Sign in with Kakao to save your score',
  '카카오로 로그인하고 저장': 'Sign in with Kakao to save your score',
  '게임을 그만하고 결과를 볼까요?': 'Quit the game and see your results?',
  '실시간 랭킹': 'Live Leaderboard',
  '기록 없음': 'No records yet',
  '익명': 'Anonymous',
  '나': 'You',
  '점수': 'Score',
  '타수': 'CPM',
  '분당 타수': 'CPM',
  '정확도': 'Accuracy',
  '탭해서 계속': 'Tap to continue',
  '화면을 누르면 이어서 진행됩니다': 'Tap the screen to resume',
  '전체화면으로 열립니다 · 언제든 나가기 버튼으로 종료': 'Opens in fullscreen · exit any time with the close button',

  // ── 산성비 (WordGame) ───────────────────────────────────────────────
  '산성비 게임': 'Acid Rain',
  '한글 산성비': 'Acid Rain',
  '떨어지는 단어를 바닥에 닿기 전에 입력하세요!': 'Type the falling words before they hit the ground!',
  '단어를 입력하세요!': 'Type a word!',
  '최고의 집중력을 보여주셨네요!': 'Incredible focus — well played!',

  // ── 글자 계단 (StairsGame) ──────────────────────────────────────────
  '글자 계단': 'Word Stairs',
  '다음 계단의 단어를 정확히 입력해 한 칸씩 올라가세요! 처음 10층은 자음·모음 워밍업, 게이지가 바닥나기 전에 최대한 높이 오르세요.':
    'Type the word on the next step to climb! The first 10 floors are a jamo warm-up — climb as high as you can before the gauge runs out.',
  '다음 계단의 단어를 입력!': "Type the next step's word!",
  '등반을 그만하고 결과를 볼까요?': 'Stop climbing and see your results?',
  '도달 층수': 'Floor Reached',
  '층': 'Floor',
  '구름 위까지! 대단한 등반이었어요.': 'Above the clouds — what a climb!',
  '절반의 고지를 넘었어요. 한 번 더!': 'Past the halfway mark. One more run!',
  '발끝이 근질근질하죠? 다시 올라볼까요?': 'Feet itching already? Climb again!',
  '최고 층수 랭킹': 'Highest Floor Leaderboard',

  // ── 타자 레이스 (TypingRaceGame) ────────────────────────────────────
  '타자 레이스': 'Typing Race',
  '단어를 입력해 달리세요! 거북이(200타), 토끼(350타), 치타(500타)와의 500타 경주입니다.':
    'Type words to run! Race the Turtle (200 CPM), Rabbit (350 CPM), and Cheetah (500 CPM).',
  '경주 시작': 'Start Race',
  '위 단어를 입력하세요!': 'Type the word above!',
  '경주를 그만하고 결과를 볼까요?': 'Quit the race and see your results?',
  '치타까지 제쳤습니다! 완벽한 질주였어요.': 'You beat even the cheetah — a perfect run!',
  '거북이에게 졌지만, 다음 판이 있습니다!': 'The turtle got you this time — rematch!',
  '좋은 기록이에요. 한 등수만 더 올려볼까요?': 'Nice run. Ready to climb one more place?',
  '거북이': 'Turtle',
  '토끼': 'Rabbit',
  '치타': 'Cheetah',
  '다음: ': 'Next: ',
  '현재 타수': 'Live CPM',
  '실시간 타수 랭킹': 'Live CPM Leaderboard',

  // ── 블록 팝핑 (BlockPopGame) ────────────────────────────────────────
  '블록 팝핑': 'Block Pop',
  '아래에서 차오르는 단어 블록을 타이핑해 터뜨리세요!': 'Type the rising word blocks to pop them!',
  '블록 단어를 입력하세요!': 'Type a block word!',
  '블록이 천장에 닿았어요! 멋진 플레이였습니다.': 'The blocks hit the ceiling — great run!',

  // ── 기억력 타자 (CardFlipGame) ──────────────────────────────────────
  '기억력 타자': 'Memory Flip',
  '카드 뒷면의 단어를 치면 뒤집힙니다.': "Type the word on a card's back to flip it.",
  '기억력을 발휘해 짝을 맞추세요!': 'Match the pairs from memory!',
  '놀라운 기억력입니다!': 'What a memory!',
  '시간이 다 되었습니다. 다시 도전해보세요!': "Time's up — try again!",
  '단어 입력 후 엔터!': 'Type a word and press Enter!',
  '판정 대기 중...': 'Checking...',
  '짝': 'Pairs',
  '기억력 랭킹': 'Memory Leaderboard',

  // ── 성문방어 (TypingDefenseGame) — 스킬 명령어(번개/방패/수리)는 타이핑 대상이라 번역하지 않는다
  '한글 타자 성문방어': 'Castle Defense',
  '성문방어 랭킹': 'Defense Leaderboard',
  '적 단어를 입력하세요': "Type an enemy's word",
  '시작 후 입력 가능': 'Start the game to type',
  '방어 시작': 'Start Defense',
  '붐비는 라인 정리': 'Clears a crowded lane',
  '피해 1회 방어': 'Blocks one hit',
  '성문 +2 회복': 'Repairs the gate +2',
  '명중!': 'Hit!',
  '막힘!': 'Blocked!',
  '방패 +1': 'Shield +1',
  '이번 방어 기록입니다.': 'Here is your defense record.',
  '강화 하나를 선택하세요': 'Choose one upgrade',
  '로그인하면 내 기록을 실시간 랭킹에 남길 수 있습니다.': 'Sign in to post your record to the live leaderboard.',
  '아트: Tiny Swords by Pixel Frog · 무료 상업적 이용 가능': 'Art: Tiny Swords by Pixel Frog · free for commercial use',
  // 강화 카드(엔진 데이터의 표시 전용 대응 — 엔진은 건드리지 않는다)
  '성문 보강': 'Gate Reinforcement',
  '성문 최대 체력 +2, 즉시 +2 회복': 'Max gate HP +2, instantly repairs +2',
  '콤보 마스터': 'Combo Master',
  '콤보 점수 배율 +25%': 'Combo score multiplier +25%',
  '쾌속 재정비': 'Quick Reload',
  '스킬 쿨다운 20% 감소': 'Skill cooldowns reduced by 20%',
  '관통 화살': 'Piercing Arrows',
  '격파 시 같은 라인 뒤 적도 1대 타격': 'Kills also hit the enemy behind in the same lane',
  '단단한 방패': 'Sturdy Shield',
  '방패 최대치 +1, 방패 스킬 획득 +1': 'Max shields +1, gain +1 shield now',
  '자동 수리반': 'Auto Repair Crew',
  '웨이브 클리어마다 성문 +2 회복': 'Gate repairs +2 after every wave',
  '로그인을 하시면 나만의 소중한 기록을': 'Sign in to keep your records',
  '실시간 랭킹에 남길 수 있습니다.': 'on the live leaderboard.',
};

/** /en 라우트 여부 (게임 컴포넌트는 /game/*, /en/game/* 양쪽에서 렌더된다) */
export function useIsEnRoute(): boolean {
  return isEnPath(usePathname() ?? '');
}

/**
 * 게임 안내 문구 번역기.
 * ko 라우트: 원문 그대로 반환(회귀 불가능). en 라우트: 번역, 없으면 ko 폴백.
 */
export function useGameT() {
  const isEn = useIsEnRoute();
  const t = (ko: string): string => (isEn ? EN[ko] ?? ko : ko);
  return { isEn, t };
}

/** 인터폴레이션이 필요한 라벨들 */
export function waveLabel(isEn: boolean, wave: number, boss = false): string {
  if (isEn) return boss ? `⚔️ Boss Wave ${wave}` : `Wave ${wave}`;
  return boss ? `⚔️ 보스 웨이브 ${wave}` : `웨이브 ${wave}`;
}

export function waveClearLabel(isEn: boolean, wave: number): string {
  return isEn ? `Wave ${wave} cleared!` : `웨이브 ${wave} 클리어!`;
}

export function raceRankLabel(isEn: boolean, rank: number): string {
  if (isEn) return ['🥇 1st', '🥈 2nd', '🥉 3rd', '4th'][rank - 1] || `${rank}th`;
  return ['🥇 1등', '🥈 2등', '🥉 3등', '4등'][rank - 1] || `${rank}등`;
}
