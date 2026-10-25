import { useRef, useState } from "react";
import type { SaveState } from "../state/save";
import { canWatchFolder, SAVE_FOLDER_HINT } from "../save/folder";

const ROMAN = ["", "I", "II", "III"];

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const timeOf = (ms: number) =>
  new Date(ms).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

function Crest({ house, initial }: { house: string | null; initial: string }) {
  return (
    <svg className={`crest${house ? ` house-${house.toLowerCase()}` : ""}`} viewBox="0 0 40 46" aria-hidden="true">
      <path d="M20 2 L37 8 V22 C37 33 29 41 20 44 C11 41 3 33 3 22 V8 Z" />
      <text x="20" y="30" textAnchor="middle">{initial}</text>
    </svg>
  );
}

function PathHint() {
  const [copied, setCopied] = useState(false);
  return (
    <p className="path-hint">
      Saves live in <code>{SAVE_FOLDER_HINT}</code>
      <button
        type="button"
        className="linkbtn"
        onClick={() => {
          navigator.clipboard?.writeText(SAVE_FOLDER_HINT).then(
            () => setCopied(true),
            () => setCopied(false),
          );
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <br />
      Paste it into the address bar of the folder picker.
    </p>
  );
}

/** Your wizard, read from the save: character, wand, gear, and save connection controls. */
export function CharacterCard({ save }: { save: SaveState }) {
  const { summary, status } = save;
  const fileRef = useRef<HTMLInputElement>(null);
  const folderSupported = canWatchFolder();

  const fileInput = (
    <input
      ref={fileRef}
      type="file"
      accept=".sav"
      hidden
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) void save.openFile(f);
        e.target.value = "";
      }}
    />
  );

  const errorLine = status.kind === "error" && <p className="char-error" role="alert">{status.message}</p>;

  if (!summary) {
    return (
      <section className="card char" aria-labelledby="char-h">
        <Crest house={null} initial="?" />
        <div className="char-body">
          <p className="eyebrow">Your wizard</p>
          <h2 id="char-h">Connect your save</h2>
          <p className="muted">
            Read your PC save to show your character and gear and tick off what you've already collected. It's read in this browser and
            never uploaded.
          </p>
          <div className="char-actions">
            {status.kind === "reconnect" ? (
              <button type="button" className="btn btn-moon" onClick={() => void save.reconnect()}>Reconnect save folder</button>
            ) : (
              folderSupported && (
                <button type="button" className="btn btn-moon" onClick={() => void save.connectFolder()}>Choose save folder</button>
              )
            )}
            <button type="button" className={`btn ${folderSupported ? "btn-ghost" : "btn-moon"}`} onClick={() => fileRef.current?.click()}>
              Open a .sav file
            </button>
          </div>
          {status.kind === "reading" && <p className="muted small">Reading save…</p>}
          {errorLine}
          <PathHint />
          {!folderSupported && <p className="muted small">Live updates need Chrome or Edge. In this browser, open the newest save after you play.</p>}
          {fileInput}
        </div>
      </section>
    );
  }

  const c = summary.character;
  const statusText =
    status.kind === "watching"
      ? `Watching ${summary.fileName} · saved ${timeOf(summary.modified)} · updates after each autosave`
      : status.kind === "reading"
        ? "Reading save…"
        : status.kind === "reconnect"
          ? `Showing ${summary.fileName} from ${timeOf(summary.modified)}. Reconnect to keep it up to date.`
          : status.kind === "file"
            ? `Read ${summary.fileName} (saved ${timeOf(summary.modified)}). Open it again after you play to update.`
            : `Last read ${summary.fileName} (saved ${timeOf(summary.modified)}).`;

  return (
    <section className="card char connected" aria-labelledby="char-h">
      <div className="char-head">
        <Crest house={c.house || null} initial={(c.firstName || "?").charAt(0)} />
        <div className="char-body">
          <p className="eyebrow">
            {c.house}
            {c.year ? ` · ${ordinal(c.year)} year` : ""}
          </p>
          <h2 id="char-h">
            {c.firstName} {c.lastName}
          </h2>
          <p className="char-meta">
            <span title="The save doesn't store your level. This is a lower-bound estimate from talents learned and gear level.">
              Level {c.levelEstimate ?? "?"}
              <sup>est.</sup>
            </span>
            <span>Alohomora {ROMAN[c.alohomora] ?? c.alohomora}</span>
            <span>{c.talents} talents</span>
            <span>{c.spells.length} spells</span>
          </p>
        </div>
      </div>

      <dl className="char-facts">
        <div>
          <dt>Wand</dt>
          <dd>
            {c.wand.wood}, {c.wand.core.toLowerCase()} core, {c.wand.length.toLowerCase()} inches, {c.wand.flexibility.toLowerCase()}
          </dd>
        </div>
        {c.xp != null && (
          <div>
            <dt>XP</dt>
            <dd className="num-tab">{c.xp.toLocaleString()}</dd>
          </div>
        )}
      </dl>

      {summary.gear.length > 0 && (
        <>
          <h3 className="mini-h">Equipped gear</h3>
          <ul className="gear">
            {summary.gear.map((g) => (
              <li key={g.slot} className={`rar-${g.rarity.toLowerCase()}`}>
                <span className="g-slot">{g.label}</span>
                <span className="g-rar">{g.rarity}</span>
                <span className="g-lvl">{g.level != null ? `Lv ${g.level}` : ""}</span>
                <span className="g-stats">
                  {g.offense} off · {g.defense} def{g.upgrades ? ` · ${g.upgrades} upgrade${g.upgrades > 1 ? "s" : ""}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="char-status">
        <p className="muted small">{statusText}</p>
        {errorLine}
        <div className="char-actions">
          {save.characters.length > 1 && (
            <label className="char-pick">
              <span>Character</span>
              <select value={save.character ?? save.characters[0].character} onChange={(e) => save.chooseCharacter(e.target.value)}>
                {save.characters.map((o) => (
                  <option key={o.character} value={o.character}>
                    HL-{o.character} · saved {timeOf(o.modified)}
                  </option>
                ))}
              </select>
            </label>
          )}
          {status.kind === "reconnect" && (
            <button type="button" className="btn btn-moon" onClick={() => void save.reconnect()}>Reconnect folder</button>
          )}
          {status.kind === "watching" && (
            <button type="button" className="btn btn-quiet" onClick={() => void save.refresh(true)}>Read again</button>
          )}
          {status.kind !== "watching" && status.kind !== "reconnect" && (
            <button type="button" className="btn btn-quiet" onClick={() => fileRef.current?.click()}>Open another .sav</button>
          )}
          <button type="button" className="btn btn-quiet" onClick={save.disconnect}>Disconnect</button>
        </div>
      </div>
      {fileInput}
    </section>
  );
}
