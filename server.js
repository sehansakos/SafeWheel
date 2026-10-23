/**
 * RescueWrench Real-Time Geospatial Dispatch Server
 * Stack: Node.js, Express, WebSocket (ws), Redis (ioredis), PostGIS
 */
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const Redis = require('ioredis');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.use(express.json());

// 1. Update Mechanic Geospatial Location
app.post('/api/v1/mechanic/location', async (req, res) => {
  const { mechanicId, lat, lng } = req.body;
  // Store in Redis Geospatial Index
  await redis.geoadd('active_mechanics', lng, lat, mechanicId);
  res.json({ success: true, timestamp: Date.now() });
});

// 2. Dispatch Query: Find mechanics within 10km radius
app.post('/api/v1/sos/dispatch', async (req, res) => {
  const { customerLat, customerLng, serviceType } = req.body;
  
  // GEORADIUS active_mechanics lng lat 10 km WITHDIST WITHCOORD
  const nearbyMechanics = await redis.georadius(
    'active_mechanics', customerLng, customerLat, 10, 'km', 'WITHDIST', 'ASC'
  );

  res.json({
    totalFound: nearbyMechanics.length,
    mechanics: nearbyMechanics.map(([id, dist]) => ({ mechanicId: id, distanceKm: dist }))
  });
});

// WebSocket Real-time Telemetry Channel
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const payload = JSON.parse(message);
    // Broadcast updates between driver and mechanic
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(payload));
      }
    });
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`RescueWrench Server running on port ${PORT}`));
