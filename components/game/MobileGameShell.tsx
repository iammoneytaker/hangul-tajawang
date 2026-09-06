"use client";

import { useGameT } from '@/lib/i18n/game-ui';
import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { GamePauseOverlay } from "./GamePauseOverlay";

/**
 * 모바일 풀스크린 게임 셸.
 * 플레이 중 게임 전체(미니 HUD + 게임 영역 + 입력창)를 document.body 포털의
 * fixed 오버레이로 띄워 헤더/광고 등 사이트 크롬에서 완전히 벗어난다.
 * top/height는 useMobileGamePlay의 visualViewport 실측값을 그대로 받는다.
 */
export const MobileGameShell: React.FC<{
  overlay: { top: number; height: number };
  /** 점수·레벨 등 한 줄 HUD (좌측 영역) */
  hud: React.ReactNode;
  /** 게임 입력창 */
  input: React.ReactNode;
  /** 게임 영역 */
  children: React.ReactNode;
  paused: boolean;
  onResume: () => void;
  onExit: () => void;
}> = ({ overlay, hud, input, children, paused, onResume, onExit }) => {
  const { t } = useGameT();
  return createPortal(
    <div
      className="fixed left-0 w-full z-[9990] bg-zinc-950 flex flex-col"
      style={{ top: overlay.top, height: overlay.height }}
    >
      {/* 미니 HUD */}
      <div className="h-11 shrink-0 flex items-center justify-between gap-2 px-3 bg-zinc-900 border-b border-zinc-800">
        <div className="flex-1 flex items-center gap-3 min-w-0 overflow-hidden">{hud}</div>
        <button
          type="button"
          onClick={onExit}
          aria-label={t("게임 종료")}
          className="shrink-0 w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 flex items-center justify-center active:scale-90 transition-transform"
        >
          <X size={16} />
        </button>
      </div>

      {/* 게임 영역 */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {children}
        {paused && <GamePauseOverlay onResume={onResume} />}
      </div>

      {/* 입력창 (항상 자판 바로 위) */}
      <div className="shrink-0 p-2 bg-zinc-900 border-t border-zinc-800">{input}</div>
    </div>,
    document.body
  );
};
