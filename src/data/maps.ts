import type { MapId } from "../types";
import type { Pt } from "../lib/geometry";

/**
 * Map frames. Each view has its own coordinate system, y pointing down, matching the
 * reference maps the positions were traced from. These numbers are ours, not game data.
 * When a real map image is added later it gets calibrated onto these frames.
 */
export interface MapFrame {
  label: string;
  /** SVG viewBox of the drawn base map: [x, y, width, height]. */
  viewBox: [number, number, number, number];
  /** Area to fit on open: [[y1, x1], [y2, x2]]. */
  fit: [[number, number], [number, number]];
}

export const MAPS: Record<MapId, MapFrame> = {
  highlands: { label: "Highlands", viewBox: [-100, -100, 2100, 2900], fit: [[10, 90], [2690, 1810]] },
  hogsmeade: { label: "Hogsmeade", viewBox: [150, -40, 700, 540], fit: [[10, 200], [465, 805]] },
  castle: { label: "Castle", viewBox: [0, 150, 1760, 1750], fit: [[190, 40], [1840, 1700]] },
};

export const MAP_ORDER: MapId[] = ["highlands", "hogsmeade", "castle"];

/** Where the castle and Hogsmeade sit on the Highlands map; their markers open those views. */
export const PLACES: Partial<Record<MapId, { x: number; y: number; name: string; side: "left" | "right" }>> = {
  castle: { x: 695, y: 809, name: "Hogwarts", side: "left" },
  hogsmeade: { x: 841, y: 554, name: "Hogsmeade", side: "right" },
};

/* ---------------- Highlands ---------------- */
export const LAND: Pt[] = [[540,70],[640,45],[780,50],[900,70],[1010,60],[1110,110],[1175,220],[1185,380],[1165,520],[1090,600],[1000,650],[975,760],[985,860],[960,950],[1000,1030],[1090,1080],[1120,1150],[1070,1215],[980,1260],[940,1360],[950,1470],[990,1560],[1020,1640],[1100,1665],[1250,1690],[1400,1710],[1480,1760],[1490,1880],[1460,1990],[1540,2040],[1650,2070],[1730,2140],[1750,2260],[1720,2370],[1650,2410],[1700,2480],[1745,2580],[1690,2650],[1550,2665],[1420,2620],[1355,2520],[1375,2420],[1420,2370],[1370,2330],[1300,2300],[1260,2350],[1270,2470],[1310,2560],[1240,2590],[1180,2510],[1130,2390],[1100,2270],[1135,2185],[1175,2120],[1150,2080],[1060,2075],[960,2040],[905,1960],[895,1840],[905,1730],[935,1680],[860,1700],[760,1715],[660,1745],[560,1850],[450,1810],[330,1760],[220,1700],[130,1640],[105,1540],[125,1440],[190,1340],[320,1270],[430,1200],[445,1080],[450,960],[420,820],[400,720],[330,640],[300,580],[360,520],[430,480],[490,380],[505,260],[515,150]];
export const BLACK_LAKE: Pt[] = [[720,690],[800,680],[880,700],[900,760],[890,860],[870,950],[840,1040],[800,1070],[770,1040],[760,960],[750,880],[730,820],[715,760]];
export const MARUNWEEM_LAKE: Pt[] = [[1190,1800],[1300,1780],[1420,1800],[1440,1870],[1400,1950],[1300,1960],[1220,1930],[1180,1870]];
export const RIVER: Pt[] = [[800,1065],[790,1150],[770,1250],[790,1330],[770,1420],[720,1520],[650,1620],[600,1710],[575,1800]];
export const REGIONS: [string, number, number][] = [
  ["North Ford Bog", 666, 93], ["Forbidden Forest", 620, 330], ["Hogsmeade Valley", 900, 463], ["North Hogwarts Region", 470, 560],
  ["South Hogwarts Region", 758, 927], ["Hogwarts Valley", 781, 1258], ["Feldcroft Region", 274, 1478], ["South Sea Bog", 780, 1600],
  ["Coastal Cavern", 1000, 1720], ["Poidsear Coast", 1010, 1900], ["Marunweem Lake", 1320, 1872], ["Manor Cape", 1167, 2332],
  ["Cragcroftshire", 1560, 2170], ["Clagmar Coast", 1522, 2454],
];

/* ---------------- Castle ---------------- */
export const CASTLE_ZONES: Pt[][] = [
  [[90,300],[260,230],[520,300],[610,470],[600,620],[640,800],[480,840],[430,980],[400,1190],[180,1190],[110,1000],[130,640]],
  [[620,480],[820,370],[1100,350],[1170,560],[1160,800],[1080,960],[960,960],[860,880],[660,810],[610,640]],
  [[470,850],[660,820],[860,880],[940,970],[900,1130],[720,1150],[520,1150],[440,1000]],
  [[960,1000],[1080,960],[1220,970],[1320,1100],[1320,1260],[1200,1300],[1020,1270],[950,1130]],
  [[1220,900],[1450,900],[1600,1000],[1620,1300],[1560,1540],[1360,1570],[1290,1420],[1320,1260],[1320,1100]],
  [[850,1290],[1020,1270],[1200,1300],[1290,1420],[1250,1500],[1060,1500],[1010,1600],[1030,1800],[820,1800],[830,1560],[860,1400]],
];
export const CASTLE_WATER: Pt[][] = [
  [[1180,150],[1760,150],[1760,950],[1600,960],[1450,880],[1300,850],[1200,760],[1175,560],[1150,360]],
  [[430,1170],[620,1160],[800,1210],[850,1300],[830,1470],[800,1560],[810,1900],[560,1900],[470,1580],[330,1420],[0,1400],[0,1330],[320,1320],[400,1220]],
  [[1050,1620],[1180,1590],[1350,1610],[1560,1600],[1760,1560],[1760,1900],[1060,1900]],
];
export const WINGS: [string, number, number][] = [
  ["Bell Tower Wing", 330, 620], ["Library Annex", 900, 450], ["Astronomy Wing", 620, 1235],
  ["Grand Staircase", 1130, 1170], ["Great Hall", 1450, 1050], ["South Wing", 1080, 1640],
];

export interface FlooPoint { name: string; map: MapId; x: number; y: number; labelSide?: "left" | "right" | "above" | "below" }

/** Floo Flames used by the current routes, positioned on the castle and Hogsmeade views. */
export const FLOO_POINTS: FlooPoint[] = [
  { name: "Hogwarts North Exit", map: "castle", x: 144, y: 350, labelSide: "above" },
  { name: "Library", map: "castle", x: 665, y: 589, labelSide: "left" },
  { name: "Divination Classroom", map: "castle", x: 1070, y: 722, labelSide: "right" },
  { name: "Transfiguration Classroom", map: "castle", x: 590, y: 841, labelSide: "below" },
  { name: "Transfiguration Courtyard", map: "castle", x: 732, y: 911, labelSide: "below" },
  { name: "Professor Fig's Classroom", map: "castle", x: 672, y: 1086, labelSide: "left" },
  { name: "Great Hall", map: "castle", x: 1459, y: 1311, labelSide: "right" },
  { name: "Clock Tower Courtyard", map: "castle", x: 881, y: 1527, labelSide: "right" },
  { name: "Faculty Tower", map: "castle", x: 1234, y: 1321, labelSide: "right" },
  { name: "Beasts Classroom", map: "castle", x: 279, y: 1078, labelSide: "right" },
  { name: "Potions Classroom", map: "castle", x: 882, y: 825, labelSide: "above" },
  { name: "West Hogsmeade", map: "hogsmeade", x: 333, y: 258, labelSide: "below" },
  { name: "North Hogsmeade", map: "hogsmeade", x: 618, y: 160, labelSide: "right" },
  { name: "South Hogsmeade", map: "hogsmeade", x: 497, y: 355, labelSide: "below" },
];

/* ---------------- Hogsmeade ---------------- */
export const HOG_RIVER: Pt[] = [[150,262],[300,195],[410,128],[520,105],[585,90],[640,55],[700,10],[740,-40]];
export const HOG_ROADS: Pt[][] = [
  [[180,320],[333,258],[420,250],[486,232],[560,205],[618,160],[700,150],[762,170],[850,220]],
  [[333,258],[360,320],[378,362],[371,420],[385,500]],
  [[486,232],[497,300],[497,355],[470,420],[450,500]],
  [[560,205],[575,140],[602,84],[592,30]],
  [[378,362],[440,330],[497,355],[560,330],[640,300],[720,320]],
  [[333,258],[345,205],[362,185],[392,140],[410,122]],
];
export const HOUSES: [number, number, number][] = [[300,282,10],[312,324,-5],[352,302,15],[396,296,0],[412,352,-10],[345,396,5],[402,402,20],[330,442,0],[422,432,-15],[452,282,5],[456,214,-10],[520,240,10],[524,302,0],[562,262,-5],[590,232,15],[602,292,0],[652,202,-10],[690,186,5],[722,232,10],[662,262,0],[520,180,0],[582,176,10],[470,180,-5],[430,204,5],[542,352,0],[602,342,10],[452,392,-5],[532,402,5],[640,122,0],[560,122,10],[298,240,0],[250,332,5],[700,282,0],[744,196,8],[236,262,-8]];
