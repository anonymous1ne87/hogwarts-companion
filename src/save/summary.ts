import type initSqlJs from "sql.js";
import type { CategoryId } from "../types";

type Database = initSqlJs.Database;

export interface GearPiece {
  slot: string;
  label: string;
  rarity: string;
  level: number | null;
  offense: number;
  defense: number;
  upgrades: number;
}

export interface CountPair {
  done: number;
  total: number;
}

/** One Demiguise statue as the save records it. */
export interface SaveStatue {
  /** Grid cell from the ID (e.g. "HN_BG") for statues out in the Highlands. */
  grid: string | null;
  x: number | null;
  y: number | null;
  collected: boolean;
}

/** Everything the app uses from a save. Small and JSON-safe so it can be cached. */
export interface SaveSummary {
  fileName: string;
  modified: number;
  readAt: number;
  character: {
    firstName: string;
    lastName: string;
    house: string;
    year: number | null;
    wand: { wood: string; core: string; length: string; flexibility: string };
    xp: number | null;
    talents: number;
    /**
     * The save doesn't store level. Lower-bound estimate: one talent point per level from 5,
     * and equipped gear never above your level. Capped at 40.
     */
    levelEstimate: number | null;
    alohomora: number;
    spells: string[];
  };
  gear: GearPiece[];
  collections: { id: string; label: string; obtained: number; total: number }[];
  counts: Partial<Record<CategoryId, CountPair>>;
  statues: SaveStatue[];
}

function rows(db: Database, sql: string): (string | number | null)[][] {
  const res = db.exec(sql);
  return res.length ? (res[0].values as (string | number | null)[][]) : [];
}

/** "DragonHeartstringCore" -> "Dragon heartstring core" */
function words(s: string): string {
  const spaced = s
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .replace(/_/g, " ")
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

const SLOT_LABEL: Record<string, string> = { HEAD: "Head", FACE: "Face", NECK: "Neck", BACK: "Cloak", OUTFIT: "Outfit", HAND: "Hands" };
const SLOT_ORDER = ["HEAD", "FACE", "NECK", "BACK", "OUTFIT", "HAND"];

const COLLECTION_LABEL: Record<string, string> = {
  Gear: "Appearances", WandStyle: "Wand handles", Brooms: "Brooms", Conjurations: "Conjurations", Traits: "Traits",
  Beasts: "Beasts", Enemies: "Enemies", Exploration: "Revelio pages", Potions: "Potions", Seeds: "Plants",
};

/** Map-location kinds the save tracks, with how to tell a finished one. */
const LOCATION_KINDS: { id: CategoryId; match: (id: string) => boolean; done: (state: number) => boolean }[] = [
  { id: "demiguise", match: (s) => s.startsWith("KO_Demiguise"), done: (st) => st === 11 },
  { id: "merlin", match: (s) => s.startsWith("SphinxPuzzle"), done: (st) => st === 11 },
  { id: "fieldGuide", match: (s) => s.startsWith("KIO_") || s.startsWith("Collect_"), done: (st) => st === 11 },
  { id: "balloon", match: (s) => s.startsWith("FlyingBroom_Balloon"), done: (st) => st === 11 },
  { id: "landing", match: (s) => s.startsWith("FlyingBroom_Platform"), done: (st) => st === 11 },
  { id: "astronomy", match: (s) => s.startsWith("KO_Astronomy"), done: (st) => st === 11 },
  { id: "hotspot", match: (s) => s.startsWith("AMagic_"), done: (st) => st === 11 },
  { id: "infamousFoe", match: (s) => s.startsWith("INT_Kill"), done: (st) => st === 11 },
  // Floo Flames: 8 = not yet unlocked, 9 = unlocked.
  { id: "floo", match: (s) => s.startsWith("FT_"), done: (st) => st === 9 },
];

function estimateLevel(talents: number, gear: GearPiece[]): number | null {
  const fromTalents = talents > 0 ? talents + 4 : 0;
  const fromGear = Math.max(0, ...gear.map((g) => g.level ?? 0));
  const best = Math.max(fromTalents, fromGear);
  return best > 0 ? Math.min(40, best) : null;
}

export function summarize(db: Database, meta: { fileName: string; modified: number }): SaveSummary {
  const misc = new Map<string, string>();
  for (const [owner, name, value] of rows(db, "select DataOwner, DataName, DataValue from MiscDataDynamic where DataOwner in ('Player', 'ExperienceManager')")) {
    misc.set(`${owner}.${name}`, String(value ?? ""));
  }
  const get = (k: string) => misc.get(k) ?? "";
  const house = get("Player.HouseID");

  const talents = rows(db, "select PerkID from PerkDynamic where PerkID like 'Talent\\_%' escape '\\'").length;
  const unlocks = rows(db, "select LockID from LocksDynamic where LockID like 'Spell\\_%' escape '\\'").map((r) => String(r[0]).slice(6));
  const alohomora = 1 + (unlocks.includes("Alohomora_L2") ? 1 : 0) + (unlocks.includes("Alohomora_L3") ? 1 : 0);
  // Spell_* rows also cover upgrades and combat mechanics; keep only actual spells.
  const NOT_SPELLS = new Set(["AimMode", "Finishers", "TransformationOverland"]);
  const spells = unlocks.filter((s) => !NOT_SPELLS.has(s) && !/_L\d$/.test(s));
  const xpRaw = Number(get("ExperienceManager.ExperiencePoints"));

  const gear: GearPiece[] = rows(
    db,
    `select e.SlotID, e.GearID, g.GearLevel, g.OffenseStat, g.DefenseStat, g.StatUpgrades
     from EquippedGearDynamic e left join GearItemsDynamic g on g.GearID = e.GearID and g.GearVariation = e.GearVariation
     where e.ActorID = 'Player0'`,
  )
    .map(([slot, id, level, off, def, up]) => ({
      slot: String(slot),
      label: SLOT_LABEL[String(slot)] ?? words(String(slot)),
      rarity: String(id).split("_").pop() ?? "",
      level: level == null ? null : Number(level),
      offense: Number(off ?? 0),
      defense: Number(def ?? 0),
      upgrades: Number(up ?? 0),
    }))
    .sort((a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot));

  const collections = rows(db, "select CategoryID, sum(ItemState = 'Obtained'), count(*) from CollectionDynamic group by CategoryID")
    .map(([id, obtained, total]) => ({ id: String(id), label: COLLECTION_LABEL[String(id)] ?? words(String(id)), obtained: Number(obtained), total: Number(total) }))
    .sort((a, b) => a.label.localeCompare(b.label));

  // Common-room Floo Flames of other houses can never be unlocked, so leave them out.
  const otherHouseRoom = (id: string) => {
    const m = /^FT_HW_(Gryffindor|Hufflepuff|Ravenclaw|Slytherin)CommonRoom/i.exec(id);
    return !!m && m[1].toLowerCase() !== house.toLowerCase();
  };

  const counts: Partial<Record<CategoryId, CountPair>> = {};
  const statues: SaveStatue[] = [];
  for (const [rawId, rawState] of rows(db, "select MapLocationID, State from MapLocationDataDynamic")) {
    const id = String(rawId);
    const state = Number(rawState);
    const kind = LOCATION_KINDS.find((k) => k.match(id));
    if (!kind || (kind.id === "floo" && otherHouseRoom(id))) continue;
    const c = (counts[kind.id] ??= { done: 0, total: 0 });
    c.total++;
    if (kind.done(state)) c.done++;
    if (kind.id === "demiguise") {
      const grid = /^KO_Demiguise_([A-Z]{2}_[A-Z]{2})_/.exec(id);
      const xy = /X=(-?[\d.]+) Y=(-?[\d.]+)/.exec(id);
      statues.push({ grid: grid ? grid[1] : null, x: xy ? Number(xy[1]) : null, y: xy ? Number(xy[2]) : null, collected: kind.done(state) });
    }
  }

  return {
    fileName: meta.fileName,
    modified: meta.modified,
    readAt: Date.now(),
    character: {
      firstName: get("Player.PlayerFirstName"),
      lastName: get("Player.PlayerLastName"),
      house,
      year: Number(get("Player.Year")) || null,
      wand: {
        wood: words(get("Player.WandWood").replace(/^Wood_/, "")),
        core: words(get("Player.WandCore").replace(/Core$/, "")),
        length: words(get("Player.WandLength")),
        flexibility: words(get("Player.WandFlex").replace(/^Flexibility_/, "")),
      },
      xp: Number.isFinite(xpRaw) ? xpRaw : null,
      talents,
      levelEstimate: estimateLevel(talents, gear),
      alohomora,
      spells,
    },
    gear,
    collections,
    counts,
    statues,
  };
}
