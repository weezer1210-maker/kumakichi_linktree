declare global {
  interface Window {
    goatcounter?: {
      count: (opts: { path: string; title?: string; event?: boolean }) => void;
    };
  }
}

/** Fire a GoatCounter event for an outbound link. Never throws — analytics must not block navigation. */
export function trackClick(id: string, label?: string): void {
  try {
    window.goatcounter?.count({ path: `out-${id}`, title: label ?? id, event: true });
  } catch {
    /* ignore */
  }
}

export {};
