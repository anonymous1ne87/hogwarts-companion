/** The three map views, matching the in-game map tabs. Each has its own coordinate frame. */
export type MapId = "highlands" | "hogsmeade" | "castle";

export type CategoryId =
  | "demiguise"
  | "floo"
  | "merlin"
  | "fieldGuide"
  | "collectionChest"
  | "balloon"
  | "landing"
  | "hotspot"
  | "astronomy"
  | "butterfly"
  | "houseToken"
  | "infamousFoe"
  | "cairnDungeon"
  | "battleArena";

export type LockLevel = 0 | 1 | 2 | 3;
export type LabelSide = "left" | "right" | "above" | "below";

/** One stop on a route: something to collect, or a turn-in to an NPC. */
export interface RouteItem {
  /** Globally unique and stable, e.g. "demiguise/lower-hogsfield". Progress is keyed by it. */
  id: string;
  category: CategoryId;
  kind: "collect" | "turnin";
  /** Stop number shown on the marker (collectibles only). */
  n?: number;
  name: string;
  /** Shorter marker label where space is tight. */
  short?: string;
  map: MapId;
  /** Position in the map's own coordinate frame (see data/maps.ts). */
  x: number;
  y: number;
  /** Region, wing or part of town. */
  where: string;
  floo: string;
  lock?: LockLevel;
  /** Index into the route's legs. */
  leg: number;
  /** 1 = doable with Alohomora I, 2 = needs Alohomora II. Drives route colours. */
  phase: 1 | 2;
  /** For turn-ins: what you get. */
  reward?: string;
  directions: string;
  labelSide?: LabelSide;
  /** Override the curve of the route line arriving at this stop. */
  bendIn?: number;
}

export interface Leg {
  title: string;
  phase: 1 | 2;
  note: string;
}
