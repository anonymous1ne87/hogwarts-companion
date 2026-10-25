import type { RouteItem } from "../types";

const LOCK_LABEL = ["No lock", "Lock I", "Lock II", "Lock III"];

export function lockLabel(item: RouteItem): string {
  return LOCK_LABEL[item.lock ?? 0];
}

/** Lock level (or turn-in) badge. */
export function Chip({ item }: { item: RouteItem }) {
  if (item.kind === "turnin") return <span className="chip ms">Turn-in</span>;
  return <span className={`chip l${item.lock ?? 0}`}>{lockLabel(item)}</span>;
}

export function FlooIcon() {
  return (
    <svg className="ic-floo" viewBox="-1 -1.1 2 2.2" aria-hidden="true">
      <path d="M0,-1 C0.55,-0.35 0.7,0.05 0.7,0.3 A0.7,0.7 0 0 1 -0.7,0.3 C-0.7,0.05 -0.55,-0.35 0,-1 Z" />
    </svg>
  );
}

export function MoonIcon({ className = "ic-moon" }: { className?: string }) {
  return (
    <svg className={className} viewBox="-1.1 -1.1 2.2 2.2" aria-hidden="true">
      <path d="M0.6,-0.8 A1,1 0 1 0 0.6,0.8 A0.9,0.9 0 0 1 0.6,-0.8 Z" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 12.5l3.6 3.6L17.5 8.5" />
    </svg>
  );
}
