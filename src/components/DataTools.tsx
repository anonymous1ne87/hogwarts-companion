import { useEffect, useRef, useState } from "react";
import { parseProgress, type Progress } from "../state/progress";

interface Props {
  progress: Progress;
  onImport: (p: Progress) => void;
  onResetTicks: () => void;
}

/** Backup and restore. Progress lives in this browser, so export is how it moves between devices. */
export function DataTools({ progress, onImport, onResetTicks }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);

  function exportFile() {
    const body = JSON.stringify({ app: "hogwarts-companion", version: 1, exportedAt: new Date().toISOString(), ...progress }, null, 2);
    const url = URL.createObjectURL(new Blob([body], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `hogwarts-companion-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Backup downloaded.");
  }

  async function importFile(file: File) {
    try {
      const next = parseProgress(JSON.parse(await file.text()));
      onImport(next);
      setMessage(`Restored ${Object.keys(next.done).length} ticks and ${Object.keys(next.notes).length} notes.`);
    } catch {
      setMessage("That file isn't a Hogwarts Companion backup.");
    }
  }

  return (
    <section className="card tools" aria-labelledby="tools-h">
      <h2 id="tools-h" className="small-h">Backup</h2>
      <div className="tool-row">
        <button type="button" className="btn btn-ghost" onClick={exportFile}>Download backup</button>
        <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>Restore backup</button>
        <button
          type="button"
          className={`btn btn-quiet${armed ? " armed" : ""}`}
          onClick={() => {
            if (!armed) return setArmed(true);
            setArmed(false);
            onResetTicks();
            setMessage("All ticks cleared. Notes kept.");
          }}
        >
          {armed ? "Tap again to clear all ticks" : "Reset ticks"}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void importFile(f);
          e.target.value = "";
        }}
      />
      {message && <p className="muted small" role="status">{message}</p>}
    </section>
  );
}
