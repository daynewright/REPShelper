"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatClock } from "@/lib/date";
import { getDocumentPip, supportsDocumentPip } from "@/lib/document-pip";
import { CATEGORY_LABELS, activityLabel } from "@/lib/reps/constants";
import type { ActiveTimer, Category } from "@/lib/types";

const COMPACT_SIZE = { width: 280, height: 168 } as const;
const EXPANDED_SIZE = { width: 340, height: 420 } as const;

const PIP_STYLES = `
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    height: 100%;
    background: #1a2a36;
    color: #f3f7f9;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
  }
  body {
    display: flex;
    align-items: stretch;
    justify-content: stretch;
  }
  .pip {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.7rem 0.8rem 0.75rem;
    min-height: 100%;
  }
  .pip.expanded { gap: 0.45rem; }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .eyebrow {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(243, 247, 249, 0.55);
  }
  .live {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #e8a317;
  }
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: #e8a317;
  }
  .clock {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 1.85rem;
    font-weight: 500;
    letter-spacing: -0.03em;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .meta {
    font-size: 12px;
    color: rgba(243, 247, 249, 0.65);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .details {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    min-height: 0;
  }
  select.kind-select {
    width: 100%;
    appearance: none;
    border: 1px solid rgba(243, 247, 249, 0.28);
    background:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(243,247,249,0.7)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")
      no-repeat right 0.55rem center / 0.9rem,
      rgba(0, 0, 0, 0.18);
    color: #f3f7f9;
    border-radius: 0.45rem;
    font: inherit;
    font-size: 12px;
    font-weight: 500;
    padding: 0.4rem 1.8rem 0.4rem 0.55rem;
    outline: none;
    cursor: pointer;
  }
  select.kind-select:focus {
    border-color: #e8a317;
    box-shadow: 0 0 0 2px rgba(232, 163, 23, 0.25);
  }
  select.kind-select option {
    color: #1a2a36;
    background: #f3f7f9;
  }
  .warn {
    display: flex;
    gap: 0.4rem;
    align-items: flex-start;
    border: 1px solid rgba(232, 163, 23, 0.55);
    background: rgba(232, 163, 23, 0.14);
    border-radius: 0.45rem;
    padding: 0.4rem 0.5rem;
    font-size: 11px;
    line-height: 1.35;
    color: rgba(243, 247, 249, 0.92);
  }
  .warn strong {
    display: block;
    font-size: 11px;
    font-weight: 650;
    margin-bottom: 0.1rem;
    color: #e8a317;
  }
  label {
    font-size: 11px;
    font-weight: 500;
    color: rgba(243, 247, 249, 0.65);
  }
  textarea {
    width: 100%;
    min-height: 3.2rem;
    resize: vertical;
    border: 1px solid rgba(243, 247, 249, 0.28);
    background: rgba(0, 0, 0, 0.18);
    color: #f3f7f9;
    border-radius: 0.45rem;
    font: inherit;
    font-size: 12px;
    padding: 0.4rem 0.5rem;
    outline: none;
  }
  textarea:focus {
    border-color: #e8a317;
    box-shadow: 0 0 0 2px rgba(232, 163, 23, 0.25);
  }
  textarea[aria-invalid="true"] {
    border-color: #e05a52;
  }
  .error {
    font-size: 11px;
    font-weight: 600;
    color: #f0a39e;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: auto;
    padding-top: 0.15rem;
  }
  button.action {
    appearance: none;
    border: 1px solid rgba(243, 247, 249, 0.25);
    background: transparent;
    color: #f3f7f9;
    border-radius: 0.4rem;
    font: inherit;
    font-size: 12px;
    font-weight: 500;
    padding: 0.4rem 0.65rem;
    cursor: pointer;
  }
  button.action:hover:not(:disabled) { background: rgba(243, 247, 249, 0.08); }
  button.action:disabled { opacity: 0.55; cursor: default; }
  button.action.primary {
    border-color: transparent;
    background: #e8a317;
    color: #1a2a36;
  }
  button.action.primary:hover:not(:disabled) { background: #f0b43a; }
  button.action.toggle {
    border-color: rgba(232, 163, 23, 0.45);
    color: #e8a317;
  }
  button.action.toggle:hover:not(:disabled) {
    background: rgba(232, 163, 23, 0.12);
  }
`;

type ActivityOption = { value: string; label: string };

function resizePip(win: Window | null, expanded: boolean) {
  if (!win || win.closed) return;
  const size = expanded ? EXPANDED_SIZE : COMPACT_SIZE;
  try {
    win.resizeTo(size.width, size.height);
  } catch {
    // Some environments block resizeTo; layout still collapses in-content.
  }
}

function PipFace({
  timer,
  elapsed,
  activityKind,
  kinds,
  notes,
  notesError,
  warn,
  pending,
  pipWindow,
  onActivityKindChange,
  onNotesChange,
  onBackToApp,
  onStopAndSave,
}: {
  timer: ActiveTimer;
  elapsed: number;
  activityKind: string | null;
  kinds: ActivityOption[];
  notes: string;
  notesError?: string;
  warn: boolean;
  pending: boolean;
  pipWindow: Window | null;
  onActivityKindChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onBackToApp: () => void;
  onStopAndSave: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const kindRef = useRef<HTMLSelectElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const kind = activityKind || timer.activity_kind || "";
  const activity = kind ? activityLabel(timer.category, kind) : null;

  useEffect(() => {
    if (notesError) setExpanded(true);
  }, [notesError]);

  useEffect(() => {
    resizePip(pipWindow, expanded);
  }, [expanded, pipWindow]);

  // Document PiP is another browsing context — prefer native listeners so
  // input, clicks, and opener.focus() keep working across the boundary.
  useEffect(() => {
    const toggle = toggleRef.current;
    if (!toggle) return;
    const handler = () => setExpanded((current) => !current);
    toggle.addEventListener("click", handler);
    return () => toggle.removeEventListener("click", handler);
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const select = kindRef.current;
    if (!select) return;
    const onChange = () => onActivityKindChange(select.value);
    select.addEventListener("change", onChange);
    return () => select.removeEventListener("change", onChange);
  }, [expanded, onActivityKindChange]);

  useEffect(() => {
    if (!expanded) return;
    const select = kindRef.current;
    if (select && select.value !== kind) {
      select.value = kind;
    }
  }, [expanded, kind]);

  useEffect(() => {
    if (!expanded) return;
    const area = notesRef.current;
    if (!area) return;
    const onInput = () => onNotesChange(area.value);
    area.addEventListener("input", onInput);
    return () => area.removeEventListener("input", onInput);
  }, [expanded, onNotesChange]);

  useEffect(() => {
    if (!expanded) return;
    const area = notesRef.current;
    if (area && area.value !== notes) {
      area.value = notes;
    }
  }, [expanded, notes]);

  useEffect(() => {
    const back = backRef.current;
    if (!back) return;
    const handler = () => onBackToApp();
    back.addEventListener("click", handler);
    return () => back.removeEventListener("click", handler);
  }, [onBackToApp, expanded]);

  useEffect(() => {
    if (!expanded) return;
    const save = saveRef.current;
    if (!save) return;
    const handler = () => onStopAndSave();
    save.addEventListener("click", handler);
    return () => save.removeEventListener("click", handler);
  }, [expanded, onStopAndSave]);

  return (
    <div className={expanded ? "pip expanded" : "pip"}>
      <div className="row">
        <span className="eyebrow">REPS timer</span>
        <span className="live">
          <span className="dot" />
          Live
        </span>
      </div>
      <div className="clock">{formatClock(elapsed)}</div>
      <div className="meta">
        {CATEGORY_LABELS[timer.category as Category]}
        {timer.performer === "spouse" ? " · Spouse" : ""}
        {activity ? ` · ${activity}` : ""}
      </div>

      {expanded ? (
        <div className="details">
          <label htmlFor="pip-activity-kind">Activity type</label>
          <select
            ref={kindRef}
            id="pip-activity-kind"
            className="kind-select"
            defaultValue={kind}
          >
            <option value="">Optional</option>
            {kinds.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {warn ? (
            <div className="warn" role="status">
              <div>
                <strong>May not count toward REPS</strong>
                Confirm with your CPA before relying on these hours.
              </div>
            </div>
          ) : null}

          <label htmlFor="pip-notes">What did you do?</label>
          <textarea
            ref={notesRef}
            id="pip-notes"
            defaultValue={notes}
            placeholder="Short description for the CPA log"
            aria-invalid={Boolean(notesError)}
          />
          {notesError ? <p className="error">{notesError}</p> : null}
        </div>
      ) : null}

      <div className="actions">
        {expanded ? (
          <button
            ref={saveRef}
            type="button"
            className="action primary"
            disabled={pending}
          >
            {pending ? "Saving…" : "Stop and save"}
          </button>
        ) : null}
        <button
          ref={toggleRef}
          type="button"
          className="action toggle"
          aria-expanded={expanded}
        >
          {expanded ? "Hide details" : "Finish log"}
        </button>
        <button ref={backRef} type="button" className="action" disabled={pending}>
          Back to app
        </button>
      </div>
    </div>
  );
}

export function useTimerPip(active: boolean) {
  const [supported, setSupported] = useState(false);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSupported(supportsDocumentPip());
  }, []);

  const closePip = useCallback(() => {
    if (pipWindow && !pipWindow.closed) {
      pipWindow.close();
    }
    setPipWindow(null);
    setMountNode(null);
  }, [pipWindow]);

  useEffect(() => {
    if (!active && pipWindow) {
      closePip();
    }
  }, [active, pipWindow, closePip]);

  const openPip = useCallback(async () => {
    const api = getDocumentPip();
    if (!api) return;
    if (pipWindow && !pipWindow.closed) {
      pipWindow.focus();
      return;
    }

    try {
      const next = await api.requestWindow({
        width: COMPACT_SIZE.width,
        height: COMPACT_SIZE.height,
        preferInitialWindowPlacement: true,
      });
      const style = next.document.createElement("style");
      style.textContent = PIP_STYLES;
      next.document.head.appendChild(style);
      next.document.title = "REPS timer";
      const root = next.document.createElement("div");
      root.id = "reps-timer-pip";
      next.document.body.replaceChildren(root);
      next.addEventListener("pagehide", () => {
        setPipWindow(null);
        setMountNode(null);
      });
      setPipWindow(next);
      setMountNode(root);
    } catch {
      // User denied or browser rejected — stay in-page.
    }
  }, [pipWindow]);

  return {
    supported,
    openPip,
    closePip,
    pipWindow,
    mountNode,
    isOpen: Boolean(mountNode),
  };
}

export function TimerPipPortal({
  timer,
  elapsed,
  activityKind,
  kinds,
  notes,
  notesError,
  warn,
  pending,
  mountNode,
  pipWindow,
  onActivityKindChange,
  onNotesChange,
  onBackToApp,
  onStopAndSave,
}: {
  timer: ActiveTimer;
  elapsed: number;
  activityKind: string | null;
  kinds: ActivityOption[];
  notes: string;
  notesError?: string;
  warn: boolean;
  pending: boolean;
  mountNode: HTMLElement | null;
  pipWindow: Window | null;
  onActivityKindChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onBackToApp: () => void;
  onStopAndSave: () => void;
}) {
  if (!mountNode) return null;
  return createPortal(
    <PipFace
      timer={timer}
      elapsed={elapsed}
      activityKind={activityKind}
      kinds={kinds}
      notes={notes}
      notesError={notesError}
      warn={warn}
      pending={pending}
      pipWindow={pipWindow}
      onActivityKindChange={onActivityKindChange}
      onNotesChange={onNotesChange}
      onBackToApp={onBackToApp}
      onStopAndSave={onStopAndSave}
    />,
    mountNode,
  );
}
