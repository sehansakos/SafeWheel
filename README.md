# RescueWrench — On-Demand Roadside Assistance & Technical Concierge

A production-ready platform connecting stranded motorists with mobile mechanic workshops, tire vans, and flatbeds.

## Included in this Package
- `index.html`: Complete dual-phone synchronized interactive application with Leaflet GPS maps.
- `server.js`: Express & WebSocket server with Redis GEORADIUS dispatch.
- `schema.sql`: PostgreSQL database schema with PostGIS spatial indexing.
- `docker-compose.yml`: Microservices orchestration configuration.
- `manifest.json`: Progressive Web App (PWA) configuration.

## Quick Start
1. Open `index.html` in any modern browser for direct testing.
2. Run backend cluster:
   ```bash
   docker compose up -d
   ```
