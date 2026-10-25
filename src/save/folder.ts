/**
 * Watching the save folder (Chrome and Edge only, via the File System Access API).
 * The folder handle is kept in IndexedDB so the next visit only needs one click to reconnect.
 */

const SAVE_NAME = /^HL-(\d{2})-(\d{2})\.sav$/i;
const DB_NAME = "hogwarts-companion";
const STORE = "kv";
const HANDLE_KEY = "save-folder";

export const SAVE_FOLDER_HINT = "%LOCALAPPDATA%\\Hogwarts Legacy\\Saved\\SaveGames";

export const canWatchFolder = () => typeof window !== "undefined" && typeof window.showDirectoryPicker === "function";

export interface SaveFileInfo {
  name: string;
  /** "00", "01", ...: one per character. */
  character: string;
  modified: number;
  handle: FileSystemFileHandle;
}

/** Character saves in the folder, newest first. Also looks one level down (the Steam/Epic ID folder). */
export async function listSaves(dir: FileSystemDirectoryHandle): Promise<SaveFileInfo[]> {
  const out: SaveFileInfo[] = [];
  const scan = async (d: FileSystemDirectoryHandle, depth: number) => {
    for await (const [name, handle] of d.entries()) {
      if (handle.kind === "directory") {
        if (depth === 0) await scan(handle as FileSystemDirectoryHandle, 1);
        continue;
      }
      const m = SAVE_NAME.exec(name);
      if (!m) continue;
      const file = await (handle as FileSystemFileHandle).getFile();
      out.push({ name, character: m[1], modified: file.lastModified, handle: handle as FileSystemFileHandle });
    }
  };
  await scan(dir, 0);
  return out.sort((a, b) => b.modified - a.modified);
}

/** Newest save per character, newest character first. */
export function latestPerCharacter(saves: SaveFileInfo[]): SaveFileInfo[] {
  const seen = new Set<string>();
  return saves.filter((s) => (seen.has(s.character) ? false : (seen.add(s.character), true)));
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function kv<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const req = fn(db.transaction(STORE, mode).objectStore(STORE));
      req.onsuccess = () => resolve(req.result as T);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

export async function loadFolderHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    return (await kv<FileSystemDirectoryHandle | undefined>("readonly", (s) => s.get(HANDLE_KEY))) ?? null;
  } catch {
    return null;
  }
}

export async function storeFolderHandle(handle: FileSystemDirectoryHandle | null): Promise<void> {
  try {
    await kv("readwrite", (s) => (handle ? s.put(handle, HANDLE_KEY) : s.delete(HANDLE_KEY)));
  } catch {
    /* private window or blocked storage: the folder just won't be remembered */
  }
}
