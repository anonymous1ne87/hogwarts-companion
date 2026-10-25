import type { RouteItem } from "../types";
import type { Progress } from "../state/progress";
import { Chip, FlooIcon, MoonIcon } from "./Chip";

interface Props {
  route: RouteItem[];
  progress: Progress;
  onDone: () => void;
  onShow: (id: string) => void;
}

export function NextStop({ route, progress, onDone, onShow }: Props) {
  const idx = route.findIndex((r) => !progress.done[r.id]);

  if (idx < 0) {
    return (
      <section className="card next" aria-live="polite">
        <p className="eyebrow moon">Route complete</p>
        <h2>All 30 moons, both turn-ins</h2>
        <p className="muted">Gladwin's quest has an epilogue: he'll get in touch and send you to Piers Pemberton in Hogsmeade.</p>
      </section>
    );
  }

  const it = route[idx];
  const prev = idx > 0 ? route[idx - 1] : null;
  const walking = it.map === "hogsmeade" && prev?.map === "hogsmeade" && progress.done[prev.id];
  const startsWalk = it.map === "hogsmeade" && prev?.map !== "hogsmeade";
  const collectCount = route.filter((r) => r.kind === "collect").length;

  return (
    <section className="card next" aria-live="polite">
      <div className="next-body">
        <p className="eyebrow moon">
          {it.kind === "turnin" ? "Turn-in" : `Next stop · ${it.n} of ${collectCount}`}
        </p>
        <h2>{it.name}</h2>
        <p className="next-floo">
          {walking ? (
            <span>
              Walk over from stop {prev?.n} · nearest Floo: <b>{it.floo}</b>
            </span>
          ) : (
            <>
              <FlooIcon />
              <span>
                Floo to <b>{it.floo}</b>
                {startsWalk ? ", then walk the loop" : ""}
              </span>
            </>
          )}
          {it.kind === "turnin" ? <span className="chip ms">Unlocks {it.reward}</span> : <Chip item={it} />}
        </p>
        <p className="next-dir">{it.directions}</p>
      </div>
      <div className="next-actions">
        <button type="button" className="btn btn-moon" onClick={onDone}>
          {it.kind === "turnin" ? "Turned in" : "Collected"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => onShow(it.id)}>
          Show on map
        </button>
      </div>
      <p className="night">
        <MoonIcon />
        <span>Night only. Statues glow blue and can only be taken after dark, so skip to night from the map screen first.</span>
      </p>
    </section>
  );
}
