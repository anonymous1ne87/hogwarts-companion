import type { Leg, RouteItem } from "../types";

/**
 * Demiguise statue route: Lock I statues first, 9 moons to Gladwin Moon for Alohomora II,
 * then everything else, then 13 more moons for Alohomora III.
 * Sources: PowerPyx, EIP Gaming, Gamer Guides, Fextralife, Push Square.
 * Where guides disagree on a lock, the higher level is used.
 */
export const DEMIGUISE_LEGS: Leg[] = [
  { title: "Warm-up near the castle", phase: 1, note: "Two statues right beside their Floo Flames, both behind Level 1 locks." },
  { title: "Castle sweep, Lock I", phase: 1, note: "Every castle statue Alohomora I can open. You finish in the South Wing, steps from Gladwin Moon." },
  { title: "Castle, Lock II rooms", phase: 2, note: "The three castle doors that were too tough a moment ago." },
  { title: "Hogsmeade on foot", phase: 2, note: "Floo to West Hogsmeade once and walk the loop. All nine statues are a short stroll apart." },
  { title: "Highlands tour", phase: 2, note: "One Floo Flame per town. Stop 22 gives you enough for Alohomora III, but no statue needs it, so finish the set first." },
];

/** Gladwin Moon stands in the South Wing near the Faculty Tower Floo Flame (castle frame). */
export const GLADWIN = { x: 1160, y: 1440 };

type Raw = Omit<RouteItem, "id" | "category" | "kind" | "phase"> & { slug: string; kind?: RouteItem["kind"] };

const RAW: Raw[] = [
  { slug: "lower-hogsfield", n: 1, leg: 0, name: "Lower Hogsfield", map: "highlands", where: "South Hogwarts Region", floo: "Lower Hogsfield", lock: 1, x: 698, y: 1003,
    directions: "Pick the Level 1 lock on the first house right next to the Floo Flame. Turn left inside; the statue is on the floor by the door." },
  { slug: "aranshire", n: 2, leg: 0, name: "Aranshire", map: "highlands", where: "South Hogwarts Region", floo: "Aranshire", lock: 1, x: 914, y: 838,
    directions: "Pick the Level 1 lock on the house beside the Floo Flame, just north of it, then head upstairs." },

  { slug: "north-exit", n: 3, leg: 1, name: "North Exit ramparts", short: "North Exit", map: "castle", where: "Bell Tower Wing", floo: "Hogwarts North Exit", lock: 1, x: 215, y: 420,
    directions: "Turn around from the Floo Flame and follow the wall on your left to the stairs up to the ramparts. The Level 1 door is at the side of the stairs; the statue is on a crate to the right." },
  { slug: "restricted", n: 4, leg: 1, name: "Restricted Section", map: "castle", where: "Library Annex", floo: "Library", lock: 0, x: 735, y: 650,
    directions: "Go through the gate into the Restricted Section and follow the path down two floors, the same way as the quest Secrets of the Restricted Section. The statue is on a lit stand just before the next door." },
  { slug: "divination", n: 5, leg: 1, name: "Divination Classroom", map: "castle", where: "Library Annex", floo: "Divination Classroom", lock: 0, x: 1130, y: 660,
    directions: "Climb the spiral staircase to the top and go up the ladder. The statue is on Professor Onai's desk at the back." },
  { slug: "muggle-studies", n: 6, leg: 1, name: "Muggle Studies classroom", short: "Muggle Studies", map: "castle", where: "Astronomy Wing, dungeon level", floo: "Transfiguration Classroom", lock: 1, x: 520, y: 770,
    directions: "Go through the door north of the flame into the North Hall, then take the stairs down toward the dungeons. Pass the sleeping dragon statue and turn right. The Level 1 door is on your left; the statue is on a cabinet just inside." },
  { slug: "fig-office", n: 7, leg: 1, name: "Professor Fig's office", short: "Fig's office", map: "castle", where: "Astronomy Wing", floo: "Professor Fig's Classroom", lock: 0, x: 600, y: 1110,
    directions: "Walk into the classroom and up the stairs at the back into Fig's office. The statue is on a stand left of the fireplace." },
  { slug: "great-hall", n: 8, leg: 1, name: "Great Hall side room", short: "Great Hall", map: "castle", where: "Great Hall", floo: "Great Hall", lock: 1, x: 1415, y: 1395, bendIn: -0.16,
    directions: "Head for the locked room at the far back right of the hall. Level 1 door; the statue is on the middle table." },
  { slug: "haunted-toilets", n: 9, leg: 1, name: "Haunted toilets", map: "castle", where: "South Wing", floo: "Clock Tower Courtyard", lock: 1, x: 905, y: 1415,
    directions: "Take the door to the right of the flame, cross the short bridge past the Map of Argyllshire, go through the next door and downstairs, then turn left. The second toilet door on the left has the Level 1 lock. The statue is in the middle Out of Order stall." },
  { slug: "turnin-1", kind: "turnin", leg: 1, name: "Hand 9 moons to Gladwin Moon", short: "Gladwin Moon", map: "castle", where: "South Wing", floo: "Faculty Tower", reward: "Alohomora II", x: GLADWIN.x, y: GLADWIN.y, labelSide: "above",
    directions: "Floo to Faculty Tower. Gladwin Moon is close by in the South Wing; track The Man Behind the Moons to get his marker. He teaches Alohomora II, which opens Level 2 locks." },

  { slug: "dada-tower", n: 10, leg: 2, name: "Defence Against the Dark Arts Tower", short: "DADA Tower", map: "castle", where: "Astronomy Wing", floo: "Transfiguration Courtyard", lock: 2, x: 860, y: 1010,
    directions: "Go through the nearby double doors into the DADA Tower. The Level 2 door is to the right of the staircase, between two gargoyles. The statue is on the desk to your left." },
  { slug: "beasts", n: 11, leg: 2, name: "Beasts Classroom side room", short: "Beasts Classroom", map: "castle", where: "Bell Tower Wing", floo: "Beasts Classroom", lock: 2, x: 210, y: 1150,
    directions: "Look for the small building to the right of the Floo Flame. It has two Level 2 doors and either one works. The statue is on the table at the back." },
  { slug: "long-gallery", n: 12, leg: 2, name: "Long Gallery storeroom", short: "Long Gallery", map: "castle", where: "Library Annex", floo: "Potions Classroom", lock: 2, x: 935, y: 880, bendIn: -0.16,
    directions: "Skip the classroom and take the spiral stairs beside it down to a Level 1 door. In the hallway past it, the first door on the left is the Level 2 storeroom with the statue." },

  { slug: "pippins-house", n: 13, leg: 3, name: "House north of J. Pippin's Potions", short: "North of J. Pippin's", map: "hogsmeade", where: "West side", floo: "West Hogsmeade", lock: 2, x: 362, y: 185, labelSide: "above",
    directions: "Walk north from the Floo Flame to the house just north of J. Pippin's Potions. Open the Level 2 lock and go upstairs; the statue is on a dresser." },
  { slug: "hogs-head", n: 14, leg: 3, name: "The Hog's Head", short: "Hog's Head", map: "hogsmeade", where: "West edge", floo: "West Hogsmeade", lock: 0, x: 265, y: 303, labelSide: "below",
    directions: "Go through the doorway behind the bar into the back room. The statue is on top of some crates." },
  { slug: "hogs-head-st", n: 15, leg: 3, name: "Corner house on Hog's Head Street", short: "Corner house", map: "hogsmeade", where: "South-west", floo: "West Hogsmeade", lock: 2, x: 378, y: 362,
    directions: "The corner house between Tomes and Scrolls and Ollivanders. Open the Level 2 lock; the statue is on the second floor." },
  { slug: "tomes", n: 16, leg: 3, name: "Tomes and Scrolls", map: "hogsmeade", where: "South", floo: "West Hogsmeade", lock: 0, x: 371, y: 420,
    directions: "Walk past the shopkeeper into the back room on the left. The statue is in the corner near an eye chest. A few players have reported this one missing." },
  { slug: "three-broomsticks", n: 17, leg: 3, name: "The Three Broomsticks", short: "Three Broomsticks", map: "hogsmeade", where: "Centre", floo: "South Hogsmeade", lock: 1, x: 486, y: 248, labelSide: "above",
    directions: "The big inn in the middle of the village. Take the left stairs all the way up to a Level 1 door; the statue is on the table just ahead." },
  { slug: "east-of-broomsticks", n: 18, leg: 3, name: "House east of the Three Broomsticks", short: "East of the inn", map: "hogsmeade", where: "Centre", floo: "South Hogsmeade", lock: 1, x: 538, y: 275,
    directions: "The small house directly east of the inn. Level 1 lock; the statue is on the upper floor." },
  { slug: "dervish", n: 19, leg: 3, name: "Dervish and Banges", map: "hogsmeade", where: "North", floo: "North Hogsmeade", lock: 0, x: 546, y: 156, labelSide: "above",
    directions: "Just west of Gladrags Wizardwear and the North Hogsmeade Floo Flame. The statue is on the counter as soon as you walk in." },
  { slug: "bridge-house", n: 20, leg: 3, name: "House by the north bridge", short: "Bridge house", map: "hogsmeade", where: "North edge", floo: "North Hogsmeade", lock: 1, x: 602, y: 84,
    directions: "The small house beside the river bridge on the north edge of the village. Level 1 lock; the statue is on a ground-floor shelf straight ahead." },
  { slug: "east-hill", n: 21, leg: 3, name: "Hilltop house on the east edge", short: "Hilltop house", map: "hogsmeade", where: "East edge", floo: "North Hogsmeade", lock: 1, x: 762, y: 170, labelSide: "below",
    directions: "The last house on the east side of the village, up the hill past Brood and Peck. Level 1 lock; the statue is on the ground floor, above the fireplace." },

  { slug: "upper-hogsfield", n: 22, leg: 4, name: "Upper Hogsfield", map: "highlands", where: "Hogsmeade Valley", floo: "Upper Hogsfield", lock: 0, x: 887, y: 369,
    directions: "Take the northern path to the well. The house just west of it has a wheel by the door; the statue is right inside." },
  { slug: "pitt", n: 23, leg: 4, name: "Pitt-Upon-Ford", map: "highlands", where: "North Ford Bog", floo: "Pitt-Upon-Ford", lock: 0, x: 659, y: 164,
    directions: "Head south over the bridge. The first house on your right is three storeys tall; the statue is on the top floor." },
  { slug: "brocburrow", n: 24, leg: 4, name: "Brocburrow", map: "highlands", where: "Hogwarts Valley", floo: "Brocburrow", lock: 1, x: 1013, y: 1126,
    directions: "Walk west to the well in the middle of the hamlet, then to the small house north-west of it, west of the Merlin Trial. Level 1 lock; the statue is immediately to your left inside." },
  { slug: "keenbridge", n: 25, leg: 4, name: "Keenbridge", map: "highlands", where: "Hogwarts Valley", floo: "Keenbridge", lock: 1, x: 781, y: 1374,
    directions: "Walk west out of the hamlet to the westernmost house. Level 1 lock; the statue is straight ahead by the stairs." },
  { slug: "irondale", n: 26, leg: 4, name: "Irondale", map: "highlands", where: "Feldcroft Region", floo: "Irondale", lock: 0, x: 614, y: 1665,
    directions: "The house just north-east of the Floo Flame. The statue is on the floor behind the bar, to the right of the door." },
  { slug: "feldcroft", n: 27, leg: 4, name: "Feldcroft", map: "highlands", where: "Feldcroft Region", floo: "Feldcroft", lock: 2, x: 284, y: 1574,
    directions: "Head to the east side of town, to the house with a clothesline beside it. Level 2 lock; the statue is on the windowsill to your left." },
  { slug: "marunweem", n: 28, leg: 4, name: "Marunweem", map: "highlands", where: "Marunweem Lake", floo: "Marunweem", lock: 1, x: 1222, y: 2021,
    directions: "Go north and cross the second bridge; it's the first house on your left. Level 1 lock; the statue is in the kitchen behind the counter." },
  { slug: "bainburgh", n: 29, leg: 4, name: "Bainburgh", map: "highlands", where: "Manor Cape", floo: "Bainburgh", lock: 2, x: 1265, y: 2143, labelSide: "left",
    directions: "Go north-east, turn left at the community board and enter the house ahead at the north end of the hamlet. Level 2 lock (one guide says Level 1). The statue is on a table next to an armchair, to your left." },
  { slug: "cragcroft", n: 30, leg: 4, name: "Cragcroft", map: "highlands", where: "Cragcroftshire", floo: "Cragcroft", lock: 0, x: 1638, y: 2270, labelSide: "left",
    directions: "Head north-west to the house next to the merchant Bella Navarro; the door is open. The statue is on the top floor." },
  { slug: "turnin-2", kind: "turnin", leg: 4, name: "Hand 13 more to Gladwin Moon", short: "Gladwin Moon", map: "castle", where: "South Wing", floo: "Faculty Tower", reward: "Alohomora III", x: GLADWIN.x, y: GLADWIN.y, labelSide: "above",
    directions: "Back to Faculty Tower. Thirteen more moons (22 in total) gets you Alohomora III. Afterwards Gladwin gets in touch and sends you to Piers Pemberton in Hogsmeade to finish The Man Behind the Moons." },
];

export const DEMIGUISE_ROUTE: RouteItem[] = RAW.map(({ slug, kind, ...rest }) => ({
  ...rest,
  id: `demiguise/${slug}`,
  category: "demiguise",
  kind: kind ?? "collect",
  phase: DEMIGUISE_LEGS[rest.leg].phase,
}));
