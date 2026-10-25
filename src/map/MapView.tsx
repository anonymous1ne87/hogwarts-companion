import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Pane, Polyline, Popup, SVGOverlay, ZoomControl, useMap } from "react-leaflet";
import type { MapId, RouteItem } from "../types";
import type { Progress } from "../state/progress";
import { FLOO_POINTS, MAPS, MAP_ORDER, PLACES } from "../data/maps";
import { curve } from "../lib/geometry";
import { Chip } from "../components/Chip";
import { BaseMap } from "./BaseMap";

/** CRS.Simple with y pointing down, so positions are plain [y, x] in our map frames. */
const CRS_YDOWN = L.extend({}, L.CRS.Simple, { transformation: new L.Transformation(1, 0, 1, 0) }) as L.CRS;

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);

const SVG_CHECK = '<svg viewBox="0 0 24 24" class="pin-check" aria-hidden="true"><path d="M6.5 12.5l3.6 3.6L17.5 8.5"/></svg>';
const SVG_MOON = '<svg viewBox="-1.1 -1.1 2.2 2.2" class="pin-glyph" aria-hidden="true"><path d="M0.6,-0.8 A1,1 0 1 0 0.6,0.8 A0.9,0.9 0 0 1 0.6,-0.8 Z"/></svg>';
const SVG_CASTLE = '<svg viewBox="-1.3 -1.4 2.6 2.6" class="pin-glyph" aria-hidden="true"><path d="M-1,0.9 V-0.25 H-0.72 V-0.6 H-0.46 V-0.25 H-0.16 V-0.85 L0,-1.15 L0.16,-0.85 V-0.25 H0.46 V-0.6 H0.72 V-0.25 H1 V0.9 H0.2 V0.35 A0.2,0.2 0 0 0 -0.2,0.35 V0.9 Z"/></svg>';
const SVG_HOUSES = '<svg viewBox="-1.3 -1.2 2.6 2.4" class="pin-glyph" aria-hidden="true"><path d="M-1,0.9 V-0.05 L-0.5,-0.6 L0,-0.05 V0.9 Z M0.12,0.9 V-0.25 L0.56,-0.85 L1,-0.25 V0.9 Z"/></svg>';
const SVG_FLAME = '<svg viewBox="-1 -1.1 2 2.2" class="floo-glyph" aria-hidden="true"><path d="M0,-1 C0.55,-0.35 0.7,0.05 0.7,0.3 A0.7,0.7 0 0 1 -0.7,0.3 C-0.7,0.05 -0.55,-0.35 0,-1 Z"/></svg>';

interface PinOpts {
  size: number;
  wrap: string;
  pin: string;
  inner: string;
  label?: string;
  labelCls?: string;
}

function pinIcon(o: PinOpts): L.DivIcon {
  const label = o.label ? `<span class="pin-label ${o.labelCls ?? ""}">${esc(o.label)}</span>` : "";
  return L.divIcon({
    className: "hc-icon",
    iconSize: [o.size, o.size],
    iconAnchor: [o.size / 2, o.size / 2],
    html: `<div class="pin-wrap ${o.wrap}" style="width:${o.size}px;height:${o.size}px"><div class="pin ${o.pin}">${o.inner}</div>${label}</div>`,
  });
}

interface Segment {
  key: string;
  pts: [number, number][];
  cls: string;
}

/** Route lines for one map. On the Highlands, castle and Hogsmeade stops collapse into one point each. */
function buildSegments(mapId: MapId, route: RouteItem[], done: Record<string, true>): Segment[] {
  const segs: Segment[] = [];
  if (mapId === "highlands") {
    type Group = { key: string; x: number; y: number; items: RouteItem[] };
    const groups: Group[] = [];
    for (const it of route) {
      const place = it.map === "highlands" ? undefined : PLACES[it.map];
      const key = place ? `place:${it.map}` : it.id;
      const last = groups[groups.length - 1];
      if (last && last.key === key) last.items.push(it);
      else groups.push({ key, x: place ? place.x : it.x, y: place ? place.y : it.y, items: [it] });
    }
    for (let i = 1; i < groups.length; i++) {
      const a = groups[i - 1], b = groups[i], first = b.items[0];
      const isReturn = first.kind === "turnin" && i === groups.length - 1;
      const dim = b.items.every((x) => done[x.id]);
      segs.push({ key: `${a.key}>${b.key}#${i}`, pts: curve(a, b, 0.16), cls: `route hop ${isReturn ? "ret" : `p${first.phase}`}${dim ? " dim" : ""}` });
    }
    return segs;
  }

  const walk = mapId === "hogsmeade";
  for (let i = 1; i < route.length; i++) {
    const a = route[i - 1], b = route[i];
    if (a.map !== mapId || b.map !== mapId || (a.x === b.x && a.y === b.y)) continue;
    segs.push({
      key: `${a.id}>${b.id}`,
      pts: curve(a, b, b.bendIn ?? (walk ? 0.08 : 0.16)),
      cls: `route ${walk ? "walk" : "hop"} p${b.phase}${done[b.id] ? " dim" : ""}`,
    });
  }
  if (walk) {
    // The Hogsmeade loop starts at the Floo Flame of its first stop.
    const first = route.find((r) => r.map === "hogsmeade");
    const floo = first && FLOO_POINTS.find((f) => f.map === "hogsmeade" && f.name === first.floo);
    if (first && floo) segs.push({ key: `start>${first.id}`, pts: curve(floo, first, 0.08), cls: `route walk p${first.phase}${done[first.id] ? " dim" : ""}` });
  }
  return segs;
}

/** Keeps zoom limits, the "zoomed in" label class and the focused stop in sync with the view. */
function MapBehaviour({ mapId, focus }: { mapId: MapId; focus: RouteItem | null }) {
  const map = useMap();

  useEffect(() => {
    const f = MAPS[mapId];
    const [vx, vy, vw, vh] = f.viewBox;
    const full = L.latLngBounds([vy, vx], [vy + vh, vx + vw]);
    const fit = L.latLngBounds(f.fit);
    let near = Infinity;
    const applyLabels = () => map.getContainer().classList.toggle("z-near", map.getZoom() >= near);
    // Zoom limits depend on the container size, so recompute them whenever it changes.
    const configure = () => {
      // Generous limits so popups near an edge can still pan into view.
      map.setMaxBounds(full.pad(0.6));
      map.setMinZoom(map.getBoundsZoom(full) - 0.25);
      near = map.getBoundsZoom(fit) + 0.75;
      applyLabels();
    };
    let fitted = false;
    const ro = new ResizeObserver(() => {
      map.invalidateSize({ pan: false });
      configure();
      // The container often has its final size only after the first layout pass.
      if (!fitted && map.getSize().y > 0) {
        fitted = true;
        map.fitBounds(fit, { animate: false });
      }
    });
    ro.observe(map.getContainer());
    map.on("zoomend", applyLabels);
    return () => {
      ro.disconnect();
      map.off("zoomend", applyLabels);
    };
  }, [map, mapId]);

  useEffect(() => {
    if (!focus || focus.map !== mapId) return;
    const ll = L.latLng(focus.y, focus.x);
    if (!map.getBounds().pad(-0.12).contains(ll)) map.panTo(ll);
  }, [focus, map, mapId]);

  return null;
}

/** In-map card for a stop: the same directions as the list, plus a collect button. */
function StopPopup({ it, done, note, onToggle }: { it: RouteItem; done: boolean; note?: string; onToggle: (id: string) => void }) {
  const turnin = it.kind === "turnin";
  return (
    <Popup className="hc-popup" maxWidth={300} autoPanPaddingTopLeft={[24, 72]} autoPanPaddingBottomRight={[60, 48]}>
      <p className="pop-k">{turnin ? `Turn-in · unlocks ${it.reward}` : `Stop ${it.n} · ${it.where}`}</p>
      <h3 className="pop-h">{it.name}</h3>
      <p className="pop-floo">
        <span>Floo: <b>{it.floo}</b></span>
        <Chip item={it} />
      </p>
      <p className="pop-dir">{it.directions}</p>
      {note && (
        <p className="pop-note">
          <b>Your note:</b> {note}
        </p>
      )}
      <button type="button" className={`btn ${done ? "btn-ghost" : "btn-moon"}`} onClick={() => onToggle(it.id)}>
        {done ? (turnin ? "Mark not turned in" : "Mark not collected") : turnin ? "Turned in" : "Mark collected"}
      </button>
    </Popup>
  );
}

interface Props {
  mapId: MapId;
  onMapChange: (id: MapId) => void;
  route: RouteItem[];
  progress: Progress;
  selectedId: string | null;
  nextId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}

export function MapView({ mapId, onMapChange, route, progress, selectedId, nextId, onSelect, onToggle }: Props) {
  const frame = MAPS[mapId];
  const [vx, vy, vw, vh] = frame.viewBox;
  const done = progress.done;
  const segments = useMemo(() => buildSegments(mapId, route, done), [mapId, route, done]);
  const focus = route.find((r) => r.id === selectedId) ?? null;
  const next = route.find((r) => r.id === nextId) ?? null;

  const stops = route.filter((r) => r.map === mapId && r.kind === "collect");
  const turnins = route.filter((r) => r.map === mapId && r.kind === "turnin");
  // Both Gladwin turn-ins share one spot; show whichever is still to do.
  const turnin = turnins.find((t) => !done[t.id]) ?? turnins[turnins.length - 1];

  const leftOn = (id: MapId) => route.filter((r) => r.map === id && r.kind === "collect" && !done[r.id]).length;

  return (
    <div className="mapwrap">
      <MapContainer
        key={mapId}
        crs={CRS_YDOWN}
        bounds={frame.fit}
        zoomSnap={0.25}
        zoomDelta={0.5}
        wheelPxPerZoomLevel={90}
        minZoom={-5}
        maxZoom={3}
        zoomControl={false}
        attributionControl={false}
        className="leaflet-map"
      >
        <ZoomControl position="topright" />
        {/* Its own pane below the overlay pane, so route lines draw on top of the base map. */}
        <Pane name="basemap" style={{ zIndex: 250 }}>
          <SVGOverlay bounds={[[vy, vx], [vy + vh, vx + vw]]} attributes={{ viewBox: `${vx} ${vy} ${vw} ${vh}`, preserveAspectRatio: "none" }}>
            <BaseMap mapId={mapId} />
          </SVGOverlay>
        </Pane>

        {segments.map((s) => (
          <Polyline key={s.key} positions={s.pts} pathOptions={{ className: s.cls, color: "#b89dff", weight: 3, interactive: false }} />
        ))}

        {FLOO_POINTS.filter((f) => f.map === mapId).map((f) => (
          <Marker
            key={`floo:${f.name}`}
            position={[f.y, f.x]}
            interactive={false}
            keyboard={false}
            icon={pinIcon({ size: 16, wrap: "floo", pin: "floo-pin", inner: SVG_FLAME, label: f.name, labelCls: `floo-label minor ${f.labelSide ?? "right"}` })}
          />
        ))}

        {mapId === "highlands" &&
          MAP_ORDER.filter((id) => PLACES[id]).map((id) => {
            const p = PLACES[id]!;
            const left = leftOn(id);
            const isNext = next?.map === id;
            const isSel = focus?.map === id;
            return (
              <Marker
                key={`place:${id}`}
                position={[p.y, p.x]}
                title={`Open the ${p.name} map`}
                eventHandlers={{ click: () => onMapChange(id) }}
                icon={pinIcon({
                  size: 44,
                  wrap: `${isNext ? "next" : ""} ${isSel ? "sel" : ""}`,
                  pin: `place${left === 0 ? " done" : ""}`,
                  inner: id === "castle" ? SVG_CASTLE : SVG_HOUSES,
                  label: `${p.name}${left ? ` · ${left} left` : " · done"}`,
                  labelCls: `place-label ${p.side}`,
                })}
              />
            );
          })}

        {stops.map((it) => {
          const isDone = !!done[it.id];
          return (
            <Marker
              key={it.id}
              position={[it.y, it.x]}
              title={`Stop ${it.n}: ${it.name}`}
              eventHandlers={{ click: () => onSelect(it.id) }}
              icon={pinIcon({
                size: 28,
                wrap: `${nextId === it.id ? "next" : ""} ${selectedId === it.id ? "sel" : ""} ${progress.notes[it.id] ? "has-note" : ""}`,
                pin: `l${it.lock ?? 0}${isDone ? " done" : ""}`,
                inner: isDone ? SVG_CHECK : String(it.n),
                label: mapId === "highlands" ? it.name : it.short ?? it.name,
                labelCls: `${mapId === "castle" ? "minor" : ""} ${it.labelSide ?? "right"}`,
              })}
            >
              <StopPopup it={it} done={isDone} note={progress.notes[it.id]} onToggle={onToggle} />
            </Marker>
          );
        })}

        {turnin && (
          <Marker
            key="turnin"
            position={[turnin.y, turnin.x]}
            title={turnin.name}
            eventHandlers={{ click: () => onSelect(turnin.id) }}
            icon={pinIcon({
              size: 34,
              wrap: `${nextId && turnins.some((t) => t.id === nextId) ? "next" : ""} ${turnins.some((t) => t.id === selectedId) ? "sel" : ""}`,
              pin: `ms${done[turnin.id] ? " done" : ""}`,
              inner: SVG_MOON,
              label: turnin.short ?? turnin.name,
              labelCls: turnin.labelSide ?? "above",
            })}
          >
            <StopPopup it={turnin} done={!!done[turnin.id]} note={progress.notes[turnin.id]} onToggle={onToggle} />
          </Marker>
        )}

        <MapBehaviour mapId={mapId} focus={focus} />
      </MapContainer>

      <nav className="map-tabs" aria-label="Map area">
        {MAP_ORDER.map((id) => (
          <button key={id} type="button" className="map-tab" aria-pressed={id === mapId} onClick={() => onMapChange(id)}>
            {MAPS[id].label} <span>{leftOn(id) || "done"}</span>
          </button>
        ))}
      </nav>

      <div className="map-legend" aria-hidden="true">
        <span className="lg l0"><i className="lg-dot" />No lock</span>
        <span className="lg l1"><i className="lg-dot" />Lock I</span>
        <span className="lg l2"><i className="lg-dot" />Lock II</span>
        <span className="lg p1"><i className="lg-line" />Floo hop, before Alohomora II</span>
        <span className="lg p2"><i className="lg-line" />after</span>
        <span className="lg p2"><i className="lg-line solid" />walk</span>
        <span className="lg ret"><i className="lg-line" />back to Gladwin</span>
      </div>
    </div>
  );
}
