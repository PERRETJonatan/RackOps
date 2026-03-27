# RackOps - Quick Start Guide

## Phase 1 MVP Implementation

The MVP includes:
- **Backend API** with collision detection
- **Database Schema** (SQLite)
- **React Frontend** with 42U hardcoded view
- **Real-time Rack Visualization**

## Installation & Setup

### 1. Install Dependencies

```bash
# From root directory
npm run build
```

This will install dependencies for both server and client.

### 2. Start Development Server

```bash
npm run dev
```

This starts both the backend (port 8080) and frontend (port 5173) concurrently.

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **API**: http://localhost:8080/api
- **Health Check**: http://localhost:8080/health

## Testing the Application

### Sample API Calls

1. **Create a Rack**:
```bash
curl -X POST http://localhost:8080/api/racks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DC1-ROW4-RACK02",
    "total_u": 42,
    "location": "Data Center 1"
  }'
```

2. **Get All Racks**:
```bash
curl http://localhost:8080/api/racks
```

3. **Add Device to Rack** (replace RACK_ID with actual ID):
```bash
curl -X POST http://localhost:8080/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "rack_id": "RACK_ID",
    "name": "SERVER-01",
    "type": "Server",
    "height_u": 2,
    "start_u": 40
  }'
```

## Project Structure

```
RackOps/
├── server/                    # Node.js Express Backend
│   ├── src/
│   │   ├── index.js          # Main server entry
│   │   ├── db/
│   │   │   └── init.js       # Database initialization
│   │   ├── models/
│   │   │   └── index.js      # Rack & Device models
│   │   ├── middleware/
│   │   │   └── collisionEngine.js  # Collision detection logic
│   │   └── routes/
│   │       ├── racks.js      # Rack endpoints
│   │       └── devices.js    # Device endpoints
│   └── package.json
│
├── client/                    # React Frontend (Vite)
│   ├── src/
│   │   ├── main.jsx          # Entry point
│   │   ├── App.jsx           # Main component
│   │   ├── index.css         # Global styles
│   │   └── components/
│   │       └── RackVisualizer.jsx  # Rack visualization
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── package.json               # Root package.json for concurrency
```

## Key Features Implemented

### ✅ Collision Engine
- **Boundary Check**: Ensures devices fit within rack
- **Overlap Check**: Prevents two devices occupying same space
- **Bottom-to-Top Numbering**: Industry-standard U indexing

### ✅ API Endpoints
- `GET /api/racks` - List all racks
- `POST /api/racks` - Create rack
- `GET /api/racks/:id` - Get rack details
- `POST /api/devices` - Add device (with collision check)
- `PATCH /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Remove device

### ✅ Frontend Features
- Dynamic rack visualization (40px per U)
- Device type color coding
- Bottom-to-top unit numbering
- Add/Delete device operations
- Real-time error feedback

## Phase 2+ Roadmap

- [ ] Drag-and-drop device reordering
- [ ] Front/Back view toggle
- [ ] Power consumption heatmaps
- [ ] Weight distribution alerts
- [ ] Multi-rack "Row View"
- [ ] Inter-device cabling visualization
