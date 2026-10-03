type Listener = () => void;
const listeners = new Set<Listener>();

/** Lets the sync scheduler push soon after the cashier saves something. */
export function onLocalChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyLocalChange(): void {
  listeners.forEach((listener) => listener());
}
