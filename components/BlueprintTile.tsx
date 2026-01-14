"use client";

import type { Blueprint } from "./BlueprintGrid";
type StatusKey = "unknown" | "need" | "learned";

export default function BlueprintTile({
  bp,
  status,
  onCycle,
  onSet,
  onHoverChange,
}: {
  bp: Blueprint;
  status: StatusKey;
  onCycle: () => void;
  onSet: (next: StatusKey) => void;
  onHoverChange?: (hovering: boolean, el?: HTMLElement) => void;
}) {
  const showCheck = status === "learned";

  function handleEnter(e: React.MouseEvent<HTMLElement>) {
    onHoverChange?.(true, e.currentTarget);
  }
  function handleLeave() {
    onHoverChange?.(false);
  }
  function handleFocus(e: React.FocusEvent<HTMLElement>) {
    onHoverChange?.(true, e.currentTarget);
  }
  function handleBlur() {
    onHoverChange?.(false);
  }

  return (
    <article
      className={`bp-tile status-${status}`}
      tabIndex={0}
      role="button"
      aria-pressed={status !== "unknown"}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={(e) => {
        const isBtn = (e.target as HTMLElement).closest(".btn");
        if (!isBtn) onCycle();
      }}
    >
      <div className="bp-check" style={{ display: showCheck ? "block" : "none" }} aria-hidden="true"></div>

      <div className="bp-icon" aria-hidden="true">
        {/* Placeholder; replace with <img src="/id}.png later */}
        <svg viewBox="0 0 24 24" className="placeholder" focusable="false" aria-hidden="true">
          <path fill="currentColor" d="M4 6h16v12H4zM8 10h8v2H8z"></path>
        </svg>
      </div>

      <div className="bp-bottom-bar" aria-hidden="true">