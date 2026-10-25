import initSqlJs from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { extractDatabase } from "./extract";
import { summarize, type SaveSummary } from "./summary";

// Loaded on demand (this module is imported lazily) so the map doesn't wait for the WASM files.
let sqlReady: ReturnType<typeof initSqlJs> | null = null;

/** Read a .sav entirely in the browser and summarize it. Nothing leaves the device. */
export async function readSave(bytes: ArrayBuffer, meta: { fileName: string; modified: number }): Promise<SaveSummary> {
  sqlReady ??= initSqlJs({ locateFile: () => wasmUrl });
  const SQL = await sqlReady;
  const db = new SQL.Database(extractDatabase(new Uint8Array(bytes)));
  try {
    return summarize(db, meta);
  } finally {
    db.close();
  }
}
