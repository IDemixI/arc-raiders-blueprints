"use client";

import { useEffect, useMemo, useState } from "react";
import { getStatuses, saveStatuses } from "@/lib/storage";
import BlueprintTile from "./BlueprintTile";

export type Blueprint = {
  id: string;
  name: string;
  category: string;
  rarity?: string;
};

type Props = {
  initialBlueprints?: Blueprint[];
};

const STATUSES = ["unknown","need","learned"] as const;
type StatusKey = typeof STATUSES[number];

export default function BlueprintGrid({ initialBlueprints = [] }: Props) {
  const [blueprints] = useState<Blueprint[]>(initialBlueprints);
  const [statuses, setStatuses] = useState<Record<string, StatusKey>>({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusKey | "">("");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const current = getStatuses() as Record<string, any>;
    const migrated: Record<string, StatusKey> = {};
    for (const [id, s] of Object.entries(current)) {
      migrated[id] = (s === "got" || s === "crafted") ? "learned" : (s as StatusKey);
    }
    setStatuses(migrated);
    saveStatuses(migrated);
  }, []);

  // Wire header controls
  useEffect(() => {
    const searchInput = document.getElementById("searchInput") as HTMLInputElement | null;
    if (searchInput) {
      const handler = (e: Event) => setSearch((e.target as HTMLInputElement).value.toLowerCase());
      searchInput.addEventListener("input", handler);
      return () => searchInput.removeEventListener("input", handler);
    }
  }, []);
  useEffect(() => {
    const statusFilter = document.getElementById("statusFilter") as HTMLSelectElement | null;
    if (statusFilter) {
      const handler = (e: Event) => {
        const v = (e.target as HTMLSelectElement).value as StatusKey | "";
        setFilterStatus(v);
      };
      statusFilter.addEventListener("change", handler);
      return () => statusFilter.removeEventListener("change", handler);
    }
  }, []);

  const list = useMemo(() => {
    return blueprints
      .filter(bp => {
        const matchesSearch = search
          ? bp.name.toLowerCase().includes(search) || bp.category.toLowerCase().includes(search)
          : true;
        const curr = statuses[bp.id] ?? "unknown";
        const matchesStatus = filterStatus ? curr === filterStatus : true;
        return matchesSearch && matchesStatus;
      })
      .sort((a,b) => a.name.localeCompare(b.name));
  }, [blueprints, statuses, search, filterStatus]);

  // FOUND: learned only
  useEffect(() => {
    const foundCountEl = document.getElementById("foundCount");
    const foundTotalEl = document.getElementById("foundTotal");
    const learnedCount = Object.values(statuses).filter(s => s === "learned").length;
    if (foundCountEl) foundCountEl.textContent = String(learnedCount);
    if (foundTotalEl) foundTotalEl.textContent = String(blueprints.length);
  }, [statuses, blueprints.length]);

  function cycleStatus(curr: StatusKey): StatusKey {
    const idx = STATUSES.findIndex(s => s === curr);
    return STATUSES[(idx + 1) % STATUSES.length];
  }

  function setStatus(id: string, next: StatusKey) {
    setStatuses(prev => {
      const updated = { ...prev, [id]: next };
      saveStatuses(updated);
      return updated;
    });
  }

  function onTileClick(id: string) {
    const curr = statuses[id] ?? "unknown";
    const next = cycleStatus(curr);
    setStatus(id, next);
  }

  function onTileHover(id: string | null) {
    setActiveId(id);
  }

  const activeBp = activeId ? blueprints.find(b => b.id === activeId) ?? null : null;
  const activeStatus = activeBp ? (statuses[activeBp.id] ?? "unknown") : "unknown";

  return (
    <>
      <section id="grid" className="bp-grid" aria-busy={false} aria-live="polite">
        {list.map(bp => (
          <BlueprintTile
            key={bp.id}
            bp={bp}
            status={statuses[bp.id] ?? "unknown"}
            onCycle={() => onTileClick(bp.id)}
            onSet={(s) => setStatus(bp.id, s)}
            onHoverChange={(hovering) => onTileHover(hovering ? bp.id : (activeId === bp.id ? null : activeId))}
          />
        ))}
      </section>

      {activeBp && (
        <aside className="bp-overlay" role="dialog" aria-label="Blueprint details">
          <div className="bp-overlay-header">
            <span className="tag">BLUEPRINT</span>
            <h3>{activeBp.name.toUpperCase()}</h3>
          </div>
          <p className="bp-overlay-desc">
            {activeBp.category} · {(activeBp.rarity ?? "—")}
          </p>

          <div className="bp-overlay-actions">
            <button className="btn" onClick={() => setStatus(activeBp.id, "need")}>Need</button>
            <button className="btn" onClick={() => setStatus(activeBp.id, "learned")}>Learned</button>
          </div>

          <div className="bp-overlay-meta">
            <div className="meta-row">
              <span className="label">Status</span>
              <span className="value">{activeStatus === "learned" ? "Learned" : activeStatus}</span>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}