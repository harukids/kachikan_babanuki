const storageKey = (roomCode: string) => `kachikan-player:${roomCode}`;

export function savePlayerId(roomCode: string, playerId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(roomCode), playerId);
}

export function loadPlayerId(roomCode: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(storageKey(roomCode));
}

export function clearPlayerId(roomCode: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey(roomCode));
}
