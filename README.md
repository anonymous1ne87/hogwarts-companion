# Hogwarts Companion

A night-themed interactive map and tracker for a 100% run of Hogwarts Legacy (PC).

Live site: https://anonymous1ne87.github.io/hogwarts-companion/

- **Demiguise statue route:** all 30 open-world statues, ordered so the Lock I statues come first,
  with directions, Floo Flames, lock levels and per-stop notes.
- **Save reader (PC):** connect your save to see your character, wand, level estimate, Alohomora level
  and equipped gear, and to tick off collected statues automatically. The 100% checklist then shows live
  counts from the save: Floo Flames, Merlin Trials, Field Guide Pages, Balloon Sets, Landing Platforms,
  Astronomy Tables, Ancient Magic Hotspots, Infamous Foes and every Collections category.
  In Chrome or Edge, choose the save folder once and the page re-reads after every autosave.

Progress and notes are saved in your browser. Saves are read entirely in the browser and never uploaded.

## Connecting your save

Saves live in `%LOCALAPPDATA%\Hogwarts Legacy\Saved\SaveGames\<number>`. Each character has files named
`HL-<character>-<slot>.sav`; the app follows the newest one and lets you switch characters.

How the reader works (`src/save/`):

1. A `.sav` is an Unreal GVAS file. The game state is a SQLite database in the `RawDatabaseImage` property.
2. That database is Oodle-compressed in Unreal compressed-chunk blocks; [ooz-wasm](https://github.com/SnosMe/ooz-wasm) decompresses it.
3. [sql.js](https://github.com/sql-js/sql.js) opens the database and `summary.ts` queries it.
4. `match.ts` maps the save's statue records onto the route (by grid cell in the Highlands, by world position in
   the castle and Hogsmeade).

The save doesn't store your level, so the app shows a lower-bound estimate from talents learned and gear level.
To test locally, copy a save into `saves/` (git-ignored); the dev server serves it at `/saves/<name>.sav`.

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

1. **Save reader (PC).** Done: character, gear, auto-ticks and live counts.
2. **More categories on the map.** The save already contains world positions for every Merlin Trial,
   Field Guide Page, chest and more; next is placing them on the map from your own save.
3. **Your own map art.** Load a map image from your own computer and calibrate it onto the map frames.
4. **Smart routes.** Region sweeps built from the Floo network, filtered by the spells and lock level you have.

## Rules for this repo

- Never commit game files, saves or extracted game art. `.gitignore` blocks `*.sav`, `saves/` and `local-map/`.
- Fan-made and not affiliated with Warner Bros. Games or Avalanche Software.

## License

GPL-3.0-or-later (see `LICENSE`), because the save decompressor ooz-wasm is GPL-3.0.

## Sources

Statue data cross-checked against PowerPyx, EIP Gaming, Gamer Guides, Fextralife and Push Square.
Where guides disagree on a lock level, the higher level is used.
