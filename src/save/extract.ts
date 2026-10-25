import { decompress } from "ooz-wasm";

/**
 * A Hogwarts Legacy .sav is an Unreal GVAS file. The game state is a SQLite database stored in the
 * `RawDatabaseImage` byte-array property, Oodle-compressed in Unreal "compressed chunk" blocks.
 */

export class SaveFormatError extends Error {}

const CHUNK_TAG = 0x9e2a83c1;
const SQLITE_MAGIC = "SQLite format 3\u0000";

function indexOf(hay: Uint8Array, needle: Uint8Array, from = 0): number {
  const first = needle[0];
  outer: for (let i = from; i <= hay.length - needle.length; i++) {
    if (hay[i] !== first) continue;
    for (let j = 1; j < needle.length; j++) if (hay[i + j] !== needle[j]) continue outer;
    return i;
  }
  return -1;
}

const latin1 = (b: Uint8Array) => String.fromCharCode(...b);

/** Bytes of an ArrayProperty<ByteProperty> with the given name, or null if the save doesn't have it. */
function findByteArray(buf: Uint8Array, name: string): Uint8Array | null {
  const key = new Uint8Array(4 + name.length + 1);
  new DataView(key.buffer).setInt32(0, name.length + 1, true);
  for (let i = 0; i < name.length; i++) key[4 + i] = name.charCodeAt(i);
  const at = indexOf(buf, key);
  if (at < 0) return null;

  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let off = at + key.length;
  const readFString = () => {
    const n = view.getInt32(off, true);
    const s = latin1(buf.subarray(off + 4, off + 4 + n - 1));
    off += 4 + n;
    return s;
  };
  if (readFString() !== "ArrayProperty") return null;
  off += 8; // property size
  readFString(); // inner type, ByteProperty
  off += 1; // no property GUID
  const count = view.getInt32(off, true);
  off += 4;
  return buf.subarray(off, off + count);
}

/** Unreal compressed chunks: [tag][block size][compressed total][raw total][n × (compressed, raw)][block data], repeated. */
function inflateChunks(p: Uint8Array): Uint8Array {
  const view = new DataView(p.buffer, p.byteOffset, p.byteLength);
  const i64 = (o: number) => Number(view.getBigInt64(o, true));
  const parts: Uint8Array[] = [];
  let total = 0;
  let off = 0;
  while (off < p.length) {
    if (view.getUint32(off, true) !== CHUNK_TAG) throw new SaveFormatError(`Unexpected data at byte ${off} of the save's database.`);
    const blockSize = i64(off + 8);
    const rawTotal = i64(off + 24);
    off += 32;
    const blocks: [number, number][] = [];
    for (let k = 0; k < Math.ceil(rawTotal / blockSize); k++) {
      blocks.push([i64(off), i64(off + 8)]);
      off += 16;
    }
    for (const [compressed, raw] of blocks) {
      const out = decompress(p.subarray(off, off + compressed), raw);
      parts.push(out);
      total += out.length;
      off += compressed;
    }
  }
  const joined = new Uint8Array(total);
  let pos = 0;
  for (const part of parts) {
    joined.set(part, pos);
    pos += part.length;
  }
  return joined;
}

/** The save's SQLite database, ready to open with sql.js. */
export function extractDatabase(save: Uint8Array): Uint8Array {
  if (latin1(save.subarray(0, 4)) !== "GVAS") throw new SaveFormatError("This isn't a Hogwarts Legacy save file.");
  const image = findByteArray(save, "RawDatabaseImage");
  if (!image) throw new SaveFormatError("This save has no game database in it. It may be a settings file rather than a character save.");

  const raw = inflateChunks(image);
  const magic = new Uint8Array([...SQLITE_MAGIC].map((c) => c.charCodeAt(0)));
  const start = indexOf(raw, magic);
  if (start < 0) throw new SaveFormatError("The save's database didn't decompress into SQLite.");

  // Trim to the size the SQLite header declares (page size × page count).
  const header = new DataView(raw.buffer, raw.byteOffset + start, 100);
  const pageSize = header.getUint16(16) === 1 ? 65536 : header.getUint16(16);
  const pages = header.getUint32(28);
  const end = pages > 0 ? Math.min(raw.length, start + pageSize * pages) : raw.length;
  return raw.subarray(start, end);
}
