import type { Leg, RouteItem } from "../types";
import type { Progress } from "../state/progress";
import { CheckIcon, Chip, MoonIcon } from "./Chip";

interface Props {
  title: string;
  legs: Leg[];
  route: RouteItem[];
  progress: Progress;
  selectedId: string | null;
  nextId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string | null) => void;
  onShow: (id: string) => void;
  onNote: (id: string, text: string) => void;
}

function subLine(it: RouteItem): string {
  if (it.kind === "turnin") return `${it.where} · Floo: ${it.floo} · unlocks ${it.reward}`;
  if (it.map === "hogsmeade") return `Hogsmeade, ${it.where.toLowerCase()} · nearest Floo: ${it.floo}`;
  return `${it.where} · Floo: ${it.floo}`;
}

export function RouteLedger({ title, legs, route, progress, selectedId, nextId, onToggle, onSelect, onShow, onNote }: Props) {
  // Alohomora level the player has right now, from the turn-ins they've ticked.
  const spell = 1 + route.filter((r) => r.kind === "turnin" && progress.done[r.id]).length;

  return (
    <section className="ledger" aria-labelledby="ledger-h">
      <h2 id="ledger-h" className="ledger-h">{title}</h2>
      {legs.map((leg, li) => {
        const items = route.filter((r) => r.leg === li);
        const stops = items.filter((r) => r.kind === "collect").length;
        return (
          <section key={leg.title} className="leg" aria-labelledby={`leg-${li}`}>
            <header className="leg-head">
              <p className={`leg-k p${leg.phase}`}>
                Leg {li + 1} · with Alohomora {leg.phase === 1 ? "I" : "II"} · {stops} statues
              </p>
              <h3 id={`leg-${li}`}>{leg.title}</h3>
              <p className="leg-note">{leg.note}</p>
            </header>
            <ol className="rows">
              {items.map((it) => {
                const done = !!progress.done[it.id];
                const sel = selectedId === it.id;
                const note = progress.notes[it.id] ?? "";
                const blocked = it.lock === 2 && spell < 2 && !done;
                return (
                  <li
                    key={it.id}
                    id={`row-${it.id}`}
                    className={`step${done ? " done" : ""}${sel ? " sel" : ""}${nextId === it.id ? " is-next" : ""}${it.kind === "turnin" ? " turnin" : ""}`}
                  >
                    <button
                      type="button"
                      className="tick"
                      aria-pressed={done}
                      aria-label={`${it.kind === "turnin" ? "Turned in" : "Collected"}: ${it.name}`}
                      onClick={() => onToggle(it.id)}
                    >
                      <CheckIcon />
                    </button>
                    <button
                      type="button"
                      className="row"
                      aria-expanded={sel}
                      aria-controls={`det-${it.id}`}
                      onClick={() => onSelect(sel ? null : it.id)}
                    >
                      <span className="num">{it.kind === "turnin" ? <MoonIcon /> : it.n}</span>
                      <span className="main">
                        <span className="name">{it.name}</span>
                        <span className="sub">{subLine(it)}</span>
                        {blocked && <span className="needs">Opens after the first turn-in</span>}
                        {note && !sel && <span className="note-peek">{note.replace(/\s+/g, " ")}</span>}
                      </span>
                      <Chip item={it} />
                    </button>
                    {sel && (
                      <div className="det" id={`det-${it.id}`}>
                        <p>{it.directions}</p>
                        <label className="note-l" htmlFor={`note-${it.id}`}>Your notes</label>
                        <textarea
                          id={`note-${it.id}`}
                          className="note"
                          rows={2}
                          maxLength={2000}
                          value={note}
                          placeholder="Lock level, where it actually was, anything to remember"
                          onChange={(e) => onNote(it.id, e.target.value)}
                        />
                        <button type="button" className="linkbtn" onClick={() => onShow(it.id)}>
                          Show on map
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </section>
  );
}
