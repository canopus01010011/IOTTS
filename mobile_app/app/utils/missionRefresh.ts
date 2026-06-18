type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeMissionRefresh(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyMissionRefresh(): void {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.warn("missionRefresh listener failed", e);
    }
  });
}
