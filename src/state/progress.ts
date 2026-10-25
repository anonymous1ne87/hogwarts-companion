import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "hogwarts-companion/progress-v1";

/** Everything the player has ticked or written, keyed by RouteItem id. */
export interface Progress {
  done: Record<string, true>;
  notes: Record<string, string>;
}

const EMPTY: Progress = { done: {}, notes: {} };

export function parseProgress(raw: unknown): Progress {
  const out: Progress = { done: {}, notes: {} };
  if (!raw || typeof raw !== "object") return out;
  const r = raw as { done?: unknown; notes?: unknown };
  if (r.done && typeof r.done === "object") {
    for (const id of Array.isArray(r.done) ? r.done : Object.keys(r.done)) if (typeof id === "string") out.done[id] = true;
  }
  if (r.notes && typeof r.notes === "object") {
    for (const [id, text] of Object.entries(r.notes)) if (typeof text === "string" && text) out.notes[id] = text.slice(0, 2000);
  }
  return out;
}

function load(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseProgress(JSON.parse(raw)) : EMPTY;
  } catch {
    return EMPTY;
  }
}

/** Progress kept in this browser's localStorage. Export/import moves it between browsers. */
export function useProgress() {
  const [progress, setProgress] = useState<Progress>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      /* storage full or blocked: progress lives for this session only */
    }
  }, [progress]);

  const toggle = useCallback((id: string) => {
    setProgress((p) => {
      const done = { ...p.done };
      if (done[id]) delete done[id];
      else done[id] = true;
      return { ...p, done };
    });
  }, []);

  const setNote = useCallback((id: string, text: string) => {
    setProgress((p) => {
      const notes = { ...p.notes };
      if (text) notes[id] = text.slice(0, 2000);
      else delete notes[id];
      return { ...p, notes };
    });
  }, []);

  /** Tick several items at once (used for items the save says are done). Never unticks. */
  const markDone = useCallback((ids: string[]) => {
    setProgress((p) => {
      if (ids.every((id) => p.done[id])) return p;
      const done = { ...p.done };
      for (const id of ids) done[id] = true;
      return { ...p, done };
    });
  }, []);

  const replace = useCallback((next: Progress) => setProgress(next), []);
  const resetTicks = useCallback(() => setProgress((p) => ({ ...p, done: {} })), []);

  return { progress, toggle, setNote, markDone, replace, resetTicks };
}
