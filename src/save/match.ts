import type { RouteItem } from "../types";
import { TURNIN_SPELL_LEVEL } from "../data/demiguise";
import type { SaveSummary } from "./summary";

/** World units; save IDs round positions to whole numbers. */
const XY_TOLERANCE = 100;

/** Route stops the save says are done: collected statues, plus turn-ins implied by the Alohomora level. */
export function routeDoneInSave(route: RouteItem[], save: SaveSummary): string[] {
  const done: string[] = [];
  for (const it of route) {
    if (it.kind === "turnin") {
      const level = TURNIN_SPELL_LEVEL[it.id];
      if (level && save.character.alohomora >= level) done.push(it.id);
      continue;
    }
    const m = it.saveMatch;
    if (!m) continue;
    const hit = save.statues.find((s) =>
      "grid" in m
        ? s.grid === m.grid
        : s.x != null && s.y != null && Math.abs(s.x - m.x) < XY_TOLERANCE && Math.abs(s.y - m.y) < XY_TOLERANCE,
    );
    if (hit?.collected) done.push(it.id);
  }
  return done;
}
