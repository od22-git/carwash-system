import { useSyncExternalStore, type ReactNode } from 'react';

let content: ReactNode = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

if (typeof window !== 'undefined') {
  window.addEventListener('afterprint', () => {
    content = null;
    notify();
  });
}

/**
 * Prints one piece of content (a receipt) instead of the whole screen. The content is
 * rendered into the print area, then the browser's print runs once it is on the page.
 */
export function printNode(node: ReactNode): void {
  content = node;
  notify();
  requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
}

export function usePrintContent(): ReactNode {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => content,
  );
}
