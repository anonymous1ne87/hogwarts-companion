import type { RouteItem } from "../types";
import type { Progress } from "../state/progress";
import { CATEGORIES } from "../data/categories";

export function Overview({ route, progress }: { route: RouteItem[]; progress: Progress }) {
  const mapped = CATEGORIES.filter((c) => c.hasData).length;
  return (
    <section className="card" aria-labelledby="ov-h">
      <div className="card-h">
        <h2 id="ov-h">100% checklist</h2>
        <span className="muted small">
          {mapped} of {CATEGORIES.length} categories mapped
        </span>
      </div>
      <ul className="cats">
        {CATEGORIES.map((c) => {
          const got = route.filter((r) => r.category === c.id && r.kind === "collect" && progress.done[r.id]).length;
          return (
            <li key={c.id} className={c.hasData ? "" : "soon"} title={c.note}>
              <span className="cat-name">{c.label}</span>
              <span className="cat-n">{c.hasData ? `${got} / ${c.total}` : c.total}</span>
              <span className="cat-bar">
                <i style={{ width: `${c.hasData ? (got / c.total) * 100 : 0}%` }} />
              </span>
            </li>
          );
        })}
      </ul>
      <p className="muted small">Greyed-out categories have no map positions yet. Counts are from the PowerPyx 100% guide.</p>
    </section>
  );
}
