# Hogwarts Companion

A night-themed interactive map and tracker for a 100% run of Hogwarts Legacy (PC).

Right now it has the full Demiguise statue route: all 30 open-world statues, ordered so the
Lock I statues come first, with directions, Floo Flames, lock levels and per-stop notes.
Progress is saved in your browser.

## Run it

You need [Node.js](https://nodejs.org/) 20 or newer.

```bash
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173).

Other scripts:

- `npm run build`: type-check and build the static site into `dist/`
- `npm run preview`: serve the built site locally
- `npm run typecheck`: type-check only

## How it's organised

| Path | What's in it |
| --- | --- |
| `src/data/` | Route and map data. `demiguise.ts` is the statue route, `maps.ts` holds map frames and the drawn base maps, `categories.ts` lists every 100% category. |
| `src/map/` | The Leaflet map (`MapView.tsx`) and the drawn base maps (`BaseMap.tsx`). |
| `src/components/` | The side panel: character card, next stop, checklist, route list, backup tools. |
| `src/state/progress.ts` | Ticks and notes, stored in `localStorage`. |

Each map view (Highlands, Hogsmeade, Castle) has its own coordinate frame with y pointing down.
Positions are ours, traced from community maps, and approximate.

## Roadmap

1. **Save reader (PC).** Read your `.sav` in the browser to show name, house, level, gear and
   talents, and auto-tick collected items. Read-only; the file never leaves your computer.
   Later, watch the save folder so the page updates after every autosave.
2. **More categories.** Floo Flames first (routes depend on them), then Merlin Trials,
   Field Guide Pages, Collection Chests and the rest.
3. **Your own map art.** Load a map image from your own computer and calibrate it onto the map frames.
4. **Smart routes.** Region sweeps built from the Floo network, filtered by the spells and lock level you have.

## Rules for this repo

- Never commit game files, saves or extracted game art. `.gitignore` blocks `*.sav`, `saves/` and `local-map/`.
- Fan-made and not affiliated with Warner Bros. Games or Avalanche Software.

## Sources

Statue data cross-checked against PowerPyx, EIP Gaming, Gamer Guides, Fextralife and Push Square.
Where guides disagree on a lock level, the higher level is used.
