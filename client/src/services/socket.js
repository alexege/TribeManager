import { io } from "socket.io-client";

// Connect to the API server (same host/port in dev via Vite proxy)
const socket = io("http://localhost:3000", {
  withCredentials: true,
  autoConnect: true,
});

socket.on("connect_error", (err) => {
  console.error("Socket connection error:", err.message);
});

export default socket;
