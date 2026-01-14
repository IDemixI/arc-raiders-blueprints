"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

type OverlayPos = {
  top: number;
  left: number;
  side: "right" | "left";
};

export default function BlueprintGrid({ initialBlueprints = [] }: Props) {
  const [blueprints] = useState<Blueprint[]>(initialBlueprints);
  const [statuses, setStatuses] = useState<Record<string, StatusKey>>({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusKey | "">("");

  const [activeId, setActiveId] = useState<string | null>(null);
  const anchorElRef = useRef<HTMLElement | null>(null);       // tile element
  const overlayRef = useRef<HTMLDivElement | null>(null);      // overlay element
  const [overlayPos, setOverlayPos] = useState<OverlayPos | null>(null);

  // migration: got/crafted -> learned
  useEffect(() => {
    const current = getStatuses() as Record<string, any>;
    const migrated: Record<string, StatusKey> = {};
    for (const [id, s] of Object.entries(current)) {
      migrated[id] = (s === "got" || s === "crafted") ? "learned" : (s as StatusKey);
    }
    setStatuses(migrated);
    saveStatuses(migrated);
  }, []);

  // Wire header controls (unchanged)
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

  // --- Dynamic overlay positioning ---
  function computeOverlayPosition(anchorEl: HTMLElement | null) {
    if (!anchorEl) return null;

    const gap = 12;
    const overlayWidth = Math.min(380, Math.round(window.innerWidth * 0.4));
    const rect = anchorEl.getBoundingClientRect();

    const candidateRight = rect.right + window.scrollX + gap;
    const candidateLeft = rect.left + window.scrollX - gap - overlayWidth;
    const top = rect.top + window.scrollY; // align near top of tile

    const willOverflowRight = candidateRight + overlayWidth > (window.scrollX + window.innerWidth);
    const side: "right" | "left" = willOverflowRight ? "left" : "right";
    const left = side === "right" ? candidateRight : Math.max(candidateLeft, 8); // don’t go off the left edge

    return { top, left, side };
  }

  function onTileHover(hovering: boolean, el?: HTMLElement) {
    if (hovering && el) {
      anchorElRef.current = el;
      const idAttr = el.getAttribute("data-id");
      // If you prefer, inject data-id on the tile element; here we map via name/closest:
      const article = el.closest("article");
      if (!article) return;
      // We stored key in the component map; simplest: pass the id via closure.
      // As we only get the element, we’ll set activeId earlier in the Tile (see below).