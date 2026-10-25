/**
 * Placeholder until the save reader lands. It will show name, house, level, XP, gear and
 * talents read from the PC save, and auto-tick collected items.
 */
export function CharacterCard() {
  return (
    <section className="card char" aria-labelledby="char-h">
      <svg className="crest" viewBox="0 0 40 46" aria-hidden="true">
        <path d="M20 2 L37 8 V22 C37 33 29 41 20 44 C11 41 3 33 3 22 V8 Z" />
        <text x="20" y="30" textAnchor="middle">?</text>
      </svg>
      <div className="char-body">
        <p className="eyebrow">Your wizard</p>
        <h2 id="char-h">Not connected yet</h2>
        <p className="muted">
          Coming next: read your PC save to show your name, house, level, gear and talents, and tick off everything
          you've already collected. Read-only, and the file never leaves your computer.
        </p>
      </div>
    </section>
  );
}
