const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- OPTIONAL REDIS SETUP ---
let redisClient = null;
if (process.env.REDIS_URL) {
  try {
    const Redis = require("ioredis");
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null // Don't spam retries if it fails
    });
    redisClient.on("error", (err) => {
      console.warn("Redis unavailable, using local memory instead.");
    });
  } catch (e) {
    console.warn("Redis initialization skipped.");
  }
}

// In-memory fallback
let clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (err) {
      console.error("WebSocket broadcast error:", err);
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    connectedClients: clients.size,
    redis: !!redisClient
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`SafeWheel Server running on port ${PORT}`);
});