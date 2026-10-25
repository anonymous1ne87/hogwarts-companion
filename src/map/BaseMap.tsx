import type { MapId } from "../types";
import { smoothClosed, smoothOpen } from "../lib/geometry";
import {
  BLACK_LAKE, CASTLE_WATER, CASTLE_ZONES, HOG_RIVER, HOG_ROADS, HOUSES, LAND, MAPS,
  MARUNWEEM_LAKE, REGIONS, RIVER, WINGS,
} from "../data/maps";

/**
 * The drawn (schematic) base maps, rendered inside a Leaflet SVG overlay.
 * These are our own drawings traced from community maps, so they are safe to publish.
 */
export function BaseMap({ mapId }: { mapId: MapId }) {
  if (mapId === "highlands") return <HighlandsBase />;
  if (mapId === "castle") return <CastleBase />;
  return <HogsmeadeBase />;
}

function Backdrop({ mapId, className }: { mapId: MapId; className: string }) {
  const [x, y, w, h] = MAPS[mapId].viewBox;
  return <rect x={x} y={y} width={w} height={h} className={className} />;
}

function HighlandsBase() {
  const land = smoothClosed(LAND);
  const grid = [];
  for (let x = 0; x <= 2000; x += 200) grid.push(<line key={`x${x}`} x1={x} y1={-100} x2={x} y2={2800} className="grat" />);
  for (let y = 0; y <= 2800; y += 200) grid.push(<line key={`y${y}`} x1={-100} y1={y} x2={2000} y2={y} className="grat" />);
  return (
    <>
      <defs>
        <pattern id="hc-trees" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="8" r="3.4" className="tree" />
          <circle cx="21" cy="20" r="2.8" className="tree" />
        </pattern>
      </defs>
      <Backdrop mapId="highlands" className="sea" />
      {grid}
      <path d={land} className="halo" />
      <path d={land} className="land" />
      <ellipse cx={680} cy={340} rx={190} ry={140} className="forest" />
      <path d={smoothClosed(BLACK_LAKE)} className="water" />
      <path d={smoothClosed(MARUNWEEM_LAKE)} className="water" />
      <path d={smoothOpen(RIVER)} className="river" strokeWidth={16} />
      {REGIONS.map(([t, x, y]) => (
        <text key={t} x={x} y={y} className="region" fontSize={34}>{t.toUpperCase()}</text>
      ))}
      <Compass cx={1560} cy={330} r={80} />
      <text x={150} y={2610} className="note-t" fontSize={30}>Schematic, not to scale</text>
    </>
  );
}

function CastleBase() {
  return (
    <>
      <Backdrop mapId="castle" className="ground" />
      {CASTLE_WATER.map((p, i) => <path key={`w${i}`} d={smoothClosed(p)} className="water" />)}
      {CASTLE_ZONES.map((p, i) => <path key={`z${i}`} d={smoothClosed(p)} className="zone" />)}
      {WINGS.map(([t, x, y]) => (
        <text key={t} x={x} y={y} className="wing" fontSize={44}>{t.toUpperCase()}</text>
      ))}
    </>
  );
}

function HogsmeadeBase() {
  return (
    <>
      <Backdrop mapId="hogsmeade" className="ground" />
      <path d={smoothOpen(HOG_RIVER)} className="river bank" strokeWidth={22} />
      <path d={smoothOpen(HOG_RIVER)} className="river" strokeWidth={18} />
      {HOG_ROADS.map((p, i) => <path key={`r${i}`} d={smoothOpen(p)} className="road" strokeWidth={7} />)}
      {HOUSES.map(([x, y, a], i) => (
        <rect key={`h${i}`} x={x - 9} y={y - 6} width={18} height={12} rx={1.5} className="house" transform={`rotate(${a} ${x} ${y})`} />
      ))}
    </>
  );
}

function Compass({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={r} className="cmp-ring" />
      <circle r={r * 0.72} className="cmp-ring thin" />
      <path d={`M0 ${-r * 1.05} L${r * 0.17} 0 L0 ${r * 0.18} L${-r * 0.17} 0Z`} className="cmp-n" />
      <path d={`M0 ${r * 1.05} L${r * 0.17} 0 L0 ${-r * 0.18} L${-r * 0.17} 0Z`} className="cmp-s" />
      <text y={-r * 1.25} fontSize={r * 0.45} textAnchor="middle" className="cmp-t">N</text>
    </g>
  );
}
