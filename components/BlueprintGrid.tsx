
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

const STATUSES = ["unknown","need","owned"] as const;
type StatusKey = typeof STATUSES[number];

export default function BlueprintGrid({ initialBlueprints = [] }: Props) {
  const [blueprints, setBlueprints] = useState<Blueprint[]>(initialBlueprints);
  const [statuses, setStatuses] = useState<Record<string, StatusKey>>({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusKey | "">("");

  useEffect(() => {
    setStatuses(getStatuses());
  }, []);

  // Wire header controls (search + filter) by IDs
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

  // Found counter: non-unknown
  useEffect(() => {
    const foundCountEl = document.getElementById("foundCount");
    const foundTotalEl = document.getElementById("foundTotal");
    const found = Object.values(statuses).filter(s => s && s !== "unknown").length;
    if (foundCountEl) foundCountEl.textContent = String(found);
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

  return (
    <section id="grid" className="bp-grid" aria-busy={false} aria-live="polite">
      {list.map(bp => (
        <BlueprintTile
          key={bp.id}
          bp={bp}
          status={statuses[bp.id] ?? "unknown"}
          onCycle={() => onTileClick(bp.id)}
          onSet={(s) => setStatus(bp.id, s)}
        />
      ))}
    </section>
  );
}
