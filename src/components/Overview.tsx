import type { RouteItem } from "../types";
import type { Progress } from "../state/progress";
import type { SaveSummary } from "../save/summary";
import { CATEGORIES } from "../data/categories";

interface Props {
  route: RouteItem[];
  progress: Progress;
  save: SaveSummary | null;
}

function Row({ label, done, total, muted, title }: { label: string; done: number | null; total: number; muted?: boolean; title?: string }) {
  return (
    <li className={muted ? "soon" : ""} title={title}>
      <span className="cat-name">{label}</span>
      <span className="cat-n">{done == null ? total : `${done} / ${total}`}</span>
      <span className="cat-bar">
        <i style={{ width: `${done == null || !total ? 0 : (done / total) * 100}%` }} />
      </span>
    </li>
  );
}

/** Every 100% category. With a save connected, counts come straight from it. */
export function Overview({ route, progress, save }: Props) {
  return (
    <section className="card" aria-labelledby="ov-h">
      <div className="card-h">
        <h2 id="ov-h">100% checklist</h2>
        <span className="muted small">{save ? "from your save" : "connect a save for live counts"}</span>
      </div>
      <ul className="cats">
        {CATEGORIES.map((c) => {
          const fromSave = save?.counts[c.id];
          if (fromSave) return <Row key={c.id} label={c.label} done={fromSave.done} total={fromSave.total} title={c.note} />;
          if (c.hasData) {
            const got = route.filter((r) => r.category === c.id && r.kind === "collect" && progress.done[r.id]).length;
            return <Row key={c.id} label={c.label} done={got} total={c.total} title={c.note} />;
          }
          return <Row key={c.id} label={c.label} done={null} total={c.total} muted title="Not tracked yet" />;
        })}
      </ul>

      {save && save.collections.length > 0 && (
        <>
          <h3 className="mini-h">Collections</h3>
          <ul className="cats">
            {save.collections.map((c) => (
              <Row key={c.id} label={c.label} done={c.obtained} total={c.total} />
            ))}
          </ul>
        </>
      )}

      <p className="muted small">
        {save
          ? "Greyed-out categories aren't tracked in the save yet."
          : "Greyed-out categories have no map positions yet. Totals are from the PowerPyx 100% guide."}
      </p>
    </section>
  );
}
