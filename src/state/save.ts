import { useCallback, useEffect, useRef, useState } from "react";
import type { SaveSummary } from "../save/summary";
import { canWatchFolder, latestPerCharacter, listSaves, loadFolderHandle, storeFolderHandle } from "../save/folder";

const SUMMARY_KEY = "hogwarts-companion/save-summary-v1";
const CHARACTER_KEY = "hogwarts-companion/save-character-v1";
const POLL_MS = 10_000;

export type SaveStatus =
  | { kind: "none" }
  | { kind: "reading" }
  /** Folder connected and up to date; re-read automatically after each autosave. */
  | { kind: "watching" }
  /** A single file was opened (browsers without folder access). */
  | { kind: "file" }
  /** A folder is remembered but the browser needs a click to grant access again. */
  | { kind: "reconnect" }
  | { kind: "error"; message: string };

export interface CharacterOption {
  character: string;
  fileName: string;
  modified: number;
}

function loadCached(): SaveSummary | null {
  try {
    const raw = localStorage.getItem(SUMMARY_KEY);
    return raw ? (JSON.parse(raw) as SaveSummary) : null;
  } catch {
    return null;
  }
}

function store(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage blocked: works for this visit only */
  }
}

const messageOf = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** Connects to the player's save (folder or single file), keeps a summary of it, and re-reads on new autosaves. */
export function useSave() {
  const [summary, setSummary] = useState<SaveSummary | null>(loadCached);
  const [status, setStatus] = useState<SaveStatus>({ kind: "none" });
  const [characters, setCharacters] = useState<CharacterOption[]>([]);
  const [character, setCharacter] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CHARACTER_KEY);
    } catch {
      return null;
    }
  });

  const dirRef = useRef<FileSystemDirectoryHandle | null>(null);
  const characterRef = useRef(character);
  const lastRead = useRef<{ name: string; modified: number } | null>(null);
  const busy = useRef(false);
  characterRef.current = character;

  const read = useCallback(async (file: File) => {
    const { readSave } = await import("../save/readSave");
    const s = await readSave(await file.arrayBuffer(), { fileName: file.name, modified: file.lastModified });
    setSummary(s);
    store(SUMMARY_KEY, JSON.stringify(s));
  }, []);

  /** Re-read the followed character's newest save if it changed (or always, with force). */
  const refresh = useCallback(
    async (force = false) => {
      const dir = dirRef.current;
      if (!dir || busy.current) return;
      busy.current = true;
      try {
        const latest = latestPerCharacter(await listSaves(dir));
        setCharacters(latest.map((s) => ({ character: s.character, fileName: s.name, modified: s.modified })));
        if (!latest.length) {
          setStatus({ kind: "error", message: "No character saves (HL-xx-xx.sav) in that folder. Pick SaveGames or the numbered folder inside it." });
          return;
        }
        const pick = latest.find((s) => s.character === characterRef.current) ?? latest[0];
        const unchanged = lastRead.current?.name === pick.name && lastRead.current.modified === pick.modified;
        if (!unchanged || force) {
          setStatus({ kind: "reading" });
          await read(await pick.handle.getFile());
          lastRead.current = { name: pick.name, modified: pick.modified };
        }
        setStatus((prev) => (prev.kind === "watching" ? prev : { kind: "watching" }));
      } catch (e) {
        if (e instanceof DOMException && e.name === "NotAllowedError") setStatus({ kind: "reconnect" });
        else setStatus({ kind: "error", message: messageOf(e) });
      } finally {
        busy.current = false;
      }
    },
    [read],
  );

  const connectFolder = useCallback(async () => {
    if (!window.showDirectoryPicker) return;
    try {
      const dir = await window.showDirectoryPicker({ id: "hl-saves", mode: "read" });
      dirRef.current = dir;
      lastRead.current = null;
      await storeFolderHandle(dir);
      await refresh(true);
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) setStatus({ kind: "error", message: messageOf(e) });
    }
  }, [refresh]);

  const reconnect = useCallback(async () => {
    const dir = dirRef.current ?? (await loadFolderHandle());
    if (!dir) return;
    if ((await dir.requestPermission({ mode: "read" })) === "granted") {
      dirRef.current = dir;
      await refresh(true);
    }
  }, [refresh]);

  const openFile = useCallback(
    async (file: File) => {
      dirRef.current = null;
      setCharacters([]);
      setStatus({ kind: "reading" });
      try {
        await read(file);
        setStatus({ kind: "file" });
      } catch (e) {
        setStatus({ kind: "error", message: messageOf(e) });
      }
    },
    [read],
  );

  const chooseCharacter = useCallback(
    (code: string) => {
      setCharacter(code);
      characterRef.current = code;
      store(CHARACTER_KEY, code);
      void refresh(true);
    },
    [refresh],
  );

  const disconnect = useCallback(() => {
    dirRef.current = null;
    lastRead.current = null;
    void storeFolderHandle(null);
    store(SUMMARY_KEY, null);
    setSummary(null);
    setCharacters([]);
    setStatus({ kind: "none" });
  }, []);

  // Pick the remembered folder back up on load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!canWatchFolder()) return;
      const dir = await loadFolderHandle();
      if (!dir || cancelled) return;
      dirRef.current = dir;
      if ((await dir.queryPermission({ mode: "read" })) === "granted") await refresh(true);
      else setStatus({ kind: "reconnect" });
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  // While watching, check for a newer autosave every few seconds and whenever the tab regains focus.
  useEffect(() => {
    if (status.kind !== "watching") return;
    const tick = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const timer = setInterval(tick, POLL_MS);
    window.addEventListener("focus", tick);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", tick);
    };
  }, [status.kind, refresh]);

  return { summary, status, characters, character, connectFolder, reconnect, openFile, chooseCharacter, refresh, disconnect };
}

export type SaveState = ReturnType<typeof useSave>;
