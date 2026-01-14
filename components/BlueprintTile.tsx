
"use client";

import type { Blueprint } from "./BlueprintGrid";

type StatusKey = "unknown" | "need" | "got" | "crafted";

export default function BlueprintTile({
  bp,
  status,
  onCycle,
  onSet,
}: {
  bp: Blueprint;
  status: StatusKey;
  onCycle: () => void;
  onSet: (next: StatusKey) => void;
}) {
  const showCheck = status === "got" || status === "crafted";

  return (
    <article
      className={`bp-tile status-${status}`}
      tabIndex={0}
      role="button"
      aria-pressed={status !== "unknown"}
      onClick={(e) => {
        const isBtn = (e.target as HTMLElement).closest(".btn");
        if (!isBtn) onCycle();
      }}
    >
      <div className="bp-check" style={{ display: showCheck ? "block" : "none" }} aria-hidden="true"></div>
      <div className="bp-icon" aria-hidden="true">
        {/* Placeholder; replace with /icons/{bp.id}.png later */}
        <svg viewBox="0 0 24 24" className="placeholder" focusable="false" aria-hidden="true">
          <path fill="currentColor" d="M4 6h16v12H4zM8 10h8v2H8z"></path>
        </svg>
      </div>
      <div className="bp-bottom-bar" aria-hidden="true">
        <span className="book">📘</span>
      </div>

      {/* Hover overlay */}
      <div className="bp-hover">
        <h3 className="bp-name">{bp.name}</h3>
        <div className="bp-meta">
          <span className="bench">{bp.category || "—"}</span> · <span className="rarity">{(bp.rarity || "—")}</span>
        </div>
        <div className="bp-actions">
          <button className="btn" onClick={(e) => { e.stopPropagation(); onSet("need"); }}>Need</button>
          <button className="btn" onClick={(e) => { e.stopPropagation(); onSet("got"); }}>Got</button>
          <button className="btn" onClick={(e) => { e.stopPropagation(); onSet("crafted"); }}>Crafted</button>
          <button className="btn" onClick={(e) => { e.stopPropagation(); onCycle(); }}>Cycle</button>
        </div>
      </div>
    </article>
  );
}
