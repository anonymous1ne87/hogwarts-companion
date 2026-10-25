import { useEffect, useRef, useState } from "react";
import type { MapId } from "./types";
import { DEMIGUISE_LEGS, DEMIGUISE_ROUTE } from "./data/demiguise";
import { useProgress } from "./state/progress";
import { useSave } from "./state/save";
import { routeDoneInSave } from "./save/match";
import { MapView } from "./map/MapView";
import { CharacterCard } from "./components/CharacterCard";
import { Overview } from "./components/Overview";
import { NextStop } from "./components/NextStop";
import { RouteLedger } from "./components/RouteLedger";
import { DataTools } from "./components/DataTools";

const isWide = () => window.matchMedia("(min-width: 960px)").matches;

export default function App() {
  const { progress, toggle, setNote, markDone, replace, resetTicks } = useProgress();
  const save = useSave();
  const route = DEMIGUISE_ROUTE;
  const next = route.find((r) => !progress.done[r.id]) ?? null;

  const [mapId, setMapId] = useState<MapId>(() => next?.map ?? "highlands");
  const [selectedId, setSelectedId] = useState<string | null>(() => next?.id ?? null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Auto-tick whatever the save says is done, then move the selection on if it was just ticked.
  useEffect(() => {
    if (!save.summary) return;
    const ids = routeDoneInSave(route, save.summary);
    const fresh = ids.filter((id) => !progress.done[id]);
    if (!fresh.length) return;
    markDone(fresh);
    if (selectedId && fresh.includes(selectedId)) {
      const after = route.find((r) => !progress.done[r.id] && !ids.includes(r.id));
      if (after) {
        setSelectedId(after.id);
        setMapId(after.map);
      }
    }
    // Runs only when a new save summary arrives, not on every tick.
  }, [save.summary]);

  const collected = route.filter((r) => r.kind === "collect" && progress.done[r.id]).length;
  const total = route.filter((r) => r.kind === "collect").length;

  function select(id: string | null) {
    setSelectedId(id);
    const it = id ? route.find((r) => r.id === id) : null;
    if (it) setMapId(it.map);
  }

  function selectFromMap(id: string) {
    setSelectedId(id);
    if (isWide()) requestAnimationFrame(() => document.getElementById(`row-${id}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  }

  function showOnMap(id: string) {
    select(id);
    if (!isWide()) mapRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function markNextDone() {
    if (!next) return;
    toggle(next.id);
    const after = route.find((r) => r.id !== next.id && !progress.done[r.id]);
    if (after) select(after.id);
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <h1>Hogwarts Companion</h1>
          <p>100% run tracker</p>
        </div>
        <div className="top-progress" aria-label="Demiguise statues collected">
          <span className="top-n">
            <b>{collected}</b> / {total} statues
          </span>
          <span className="top-bar">
            <i style={{ width: `${(collected / total) * 100}%` }} />
          </span>
        </div>
      </header>

      <main className="layout">
        <div className="map-col" ref={mapRef}>
          <MapView
            mapId={mapId}
            onMapChange={setMapId}
            route={route}
            progress={progress}
            selectedId={selectedId}
            nextId={next?.id ?? null}
            onSelect={selectFromMap}
            onToggle={toggle}
          />
        </div>
        <aside className="panel" aria-label="Character and route">
          <CharacterCard save={save} />
          <NextStop route={route} progress={progress} onDone={markNextDone} onShow={showOnMap} />
          <Overview route={route} progress={progress} save={save.summary} />
          <RouteLedger
            title="Demiguise statue route"
            legs={DEMIGUISE_LEGS}
            route={route}
            progress={progress}
            selectedId={selectedId}
            nextId={next?.id ?? null}
            onToggle={toggle}
            onSelect={select}
            onShow={showOnMap}
            onNote={setNote}
          />
          <DataTools progress={progress} onImport={replace} onResetTicks={resetTicks} />
          <p className="fineprint">
            Fan-made and not affiliated with Warner Bros. Games or Avalanche Software. Map drawings are our own schematics.
          </p>
        </aside>
      </main>
    </div>
  );
}
