import type { CategoryId } from "../types";

export interface CategoryDef {
  id: CategoryId;
  label: string;
  /** Total in the game, per the PowerPyx 100% guide. */
  total: number;
  /** Whether this repo has map positions for it yet. */
  hasData: boolean;
  note?: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: "demiguise", label: "Demiguise Statues", total: 30, hasData: true, note: "33 counting the 3 from The Caretaker's Lunar Lament" },
  { id: "floo", label: "Floo Flames", total: 83, hasData: false },
  { id: "merlin", label: "Merlin Trials", total: 95, hasData: false },
  { id: "fieldGuide", label: "Field Guide Pages", total: 236, hasData: false },
  { id: "collectionChest", label: "Collection Chests", total: 168, hasData: false },
  { id: "balloon", label: "Balloon Sets", total: 32, hasData: false },
  { id: "landing", label: "Landing Platforms", total: 20, hasData: false },
  { id: "hotspot", label: "Ancient Magic Hotspots", total: 20, hasData: false },
  { id: "astronomy", label: "Astronomy Tables", total: 15, hasData: false },
  { id: "butterfly", label: "Butterflies", total: 15, hasData: false },
  { id: "houseToken", label: "House Tokens", total: 16, hasData: false },
  { id: "infamousFoe", label: "Infamous Foes", total: 18, hasData: false },
  { id: "cairnDungeon", label: "Cairn Dungeons", total: 5, hasData: false },
  { id: "battleArena", label: "Battle Arenas", total: 2, hasData: false },
];
