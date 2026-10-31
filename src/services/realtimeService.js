import { API_CONFIG } from "../config/api";

export function createRealtimeSocket({ onEvent, onReady, onDisconnected }) {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) return null;

  const apiUrl = new URL(API_CONFIG.BASE_URL, window.location.origin);
  const protocol = apiUrl.protocol === "https:" ? "wss:" : "ws:";
  const socket = new WebSocket(`${protocol}//${apiUrl.host}/ws/notifications/`);

  socket.addEventListener("open", () => socket.send(JSON.stringify({ token: accessToken })));
  socket.addEventListener("message", (message) => {
    try {
      const event = JSON.parse(message.data);
      if (event.type === "ready") onReady?.(event);
      else onEvent?.(event);
    } catch {
      // Ignore malformed frames without exposing message contents or tokens.
    }
  });
  socket.addEventListener("close", onDisconnected || (() => {}));
  return socket;
}
