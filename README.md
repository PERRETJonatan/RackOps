# 🖥️ RackOps

[![Tests](https://github.com/PERRETJonatan/RackOps/actions/workflows/test.yml/badge.svg)](https://github.com/PERRETJonatan/RackOps/actions/workflows/test.yml)
[![Code Quality](https://github.com/PERRETJonatan/RackOps/actions/workflows/quality.yml/badge.svg)](https://github.com/PERRETJonatan/RackOps/actions/workflows/quality.yml)
[![License: MIT + Commons Clause](https://img.shields.io/badge/License-MIT%20%2B%20Commons%20Clause-yellow.svg)](LICENSE)
![Node.js 20+](https://img.shields.io/badge/Node.js-20+-green)

**RackOps** is a lightweight, high-precision Data Center Infrastructure Management (DCIM) tool designed to visualize and manage physical server rack layouts. Unlike static spreadsheets, RackOps provides a dynamic, unit-aware interface to prevent physical equipment overlaps and optimize space utilization.

> Built by developers, for data center operators. Real-time collision detection. Drag-and-drop simplicity.

## ✨ Current Features (Phase 1, 2 & 3)

### Phase 1: MVP ✅
- **Variable Rack Heights:** Support any rack size (12U, 24U, 42U, 48U, etc.)
- **Collision Detection Engine:** Intelligent validation prevents equipment overlaps
- **Bottom-Up Visualization:** Industry-standard numbering (Unit 1 at floor level)
- **Asset Metadata:** Track device types, serial numbers, IP addresses, power draw
- **Real-time Scaling:** Responsive UI that adapts to rack dimensions
- **REST API:** Full CRUD endpoints with validation

### Phase 2: Drag-and-Drop ✅
- **Smooth Drag-and-Drop UI:** Move devices within racks with click-and-drag
- **Real-time Collision Warnings:** Visual feedback when dragging over invalid positions
- **Snap-to-Grid:** Automatic alignment to U positions
- **URL State Persistence:** Selected rack saved in URL for easy sharing and bookmarking
- **Visual Feedback:** Drag indicators, collision warnings, opacity states

### Phase 3: Power & Weight Analytics ✅
- **Power Consumption Tracking:** Per-device wattage (W), rack totals, and density (W/U)
- **Power Heatmap Visualization:** Color-coded devices showing energy intensity (red=critical 1000W+, orange=high 500-1000W, yellow=medium 100-500W, green=low <100W)
- **Power Imbalance Detection:** Pareto analysis identifies when top 20% of devices consume 80%+ of power
- **Weight Distribution Analytics:** Per-device weight (kg), rack totals, and density (kg/U)
- **Weight Imbalance Warnings:** Detects when weight exceeds balanced thresholds
- **Real-time Analytics API:** 4 dedicated endpoints for power and weight metrics across single/multiple racks
- **Live Dashboard Cards:** Power consumption summary, weight distribution stats, combined analytics view

## 🚀 Tech Stack

**Frontend:**
- React 18 + Vite (fast dev/build)
- Tailwind CSS (responsive styling)
- Lucide Icons (clean iconography)
- Axios (HTTP client)

**Backend:**
- Node.js + Express.js (REST API)
- SQLite (Phase 1-2) / PostgreSQL-ready
- Zod (schema validation)
- Custom collision detection middleware

**Database:**
- SQLite for development (no setup needed)
- PostgreSQL for production (ORM-ready)

## 🛠️ Installation & Quick Start

### Prerequisites
- Node.js v20+ (LTS recommended)
- npm or yarn

### Setup (< 2 minutes)

```bash
# Clone repository
git clone https://github.com/PERRETJonatan/RackOps.git
cd RackOps

# Install all dependencies
npm run build

# Start both servers (backend + frontend)
npm run dev
```

**Access the application:**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080/api
- **Health Check:** http://localhost:8080/health

### Optional: Seed Sample Data

```bash
cd server
npm run seed
```

This populates 3 sample racks with 14 devices across different data centers for testing.

## ✅ Testing & CI/CD

### Run Tests Locally

```bash
# Backend tests (Jest - collision detection + API)
cd server && npm run test

# Frontend tests (Vitest - React components)
cd client && npm run test

# Run with coverage
cd server && npm run test:coverage
cd client && npm run test:coverage
```

**Test Results:**
- Backend: 13 tests (collision detection algorithms + REST API endpoints)
- Frontend: 3 tests (RackVisualizer component rendering and interaction)

### Continuous Integration

Every push to `main` or `develop` and all pull requests automatically run:

✅ **Backend Tests** - Jest with coverage  
✅ **Frontend Tests** - Vitest with coverage  
✅ **Build Check** - Verify builds succeed  
⚠️ **Code Quality** - Package validation & security audit  

See [CI/CD Documentation](CI_CD.md) for detailed workflow information.

## 📐 Core Architecture

### Collision Detection Formula

The collision engine prevents overlap by checking if device ranges intersect:

**Range Overlap Check:**
$$(S_{new} \le E_{existing}) \land (S_{existing} \le E_{new})$$

**Where:**
- $S$ = Start Unit (1-indexed)
- $E$ = End Unit = $S + H - 1$ (H = height in U)
- Valid range: $1 \le S \le total\_u$

### API Endpoints

| Endpoint | Method | Purpose |
|:---------|:-------|:--------|
| `/api/racks` | GET | List all racks with device counts |
| `/api/racks/:id` | GET | Get full rack details + devices |
| `/api/racks` | POST | Create new rack |
| `/api/devices` | POST | Add device (collision validated) |
| `/api/devices/:id` | PATCH | Move device or edit metadata |
| `/api/devices/:id` | DELETE | Remove device |
| `/api/analytics/racks/:id/power` | GET | Power analytics for specific rack |
| `/api/analytics/racks/:id/weight` | GET | Weight analytics for specific rack |
| `/api/analytics/racks/:id/heatmap` | GET | Device heatmap (power intensity) for rack |
| `/api/analytics/all` | GET | Aggregated analytics across all racks |

### Data Models

**Rack:**
```javascript
{
  id: UUID,
  name: String,        // e.g., "DC1-ROW4-RACK02"
  total_u: Integer,    // 12, 24, 42, 48, etc.
  depth: Enum,         // "Full" or "Half"
  location: String,    // Data center/room
  device_count: Integer
}
```

**Device:**
```javascript
{
  id: UUID,
  rack_id: UUID,
  name: String,        // e.g., "SERVER-01"
  type: Enum,          // Server, Switch, PDU, Patch Panel, Storage, UPS
  height_u: Integer,   // 1, 2, 4, etc.
  start_u: Integer,    // Position (1-indexed, bottom-up)
  power_watts: Integer,// Power consumption in watts (default: 0)
  weight_kg: Float,    // Weight in kilograms (default: 0)
  metadata: JSON       // {ip, serial, capacity, etc.}
}
```

## 🗺️ Development Roadmap

### ✅ Phase 1: MVP (Complete)
- [x] SQLite database with Rack & Device schemas
- [x] Express REST API with validation
- [x] Collision detection middleware
- [x] Basic React UI with rack visualization
- [x] Add/Delete device operations
- [x] Real-time error feedback

### ✅ Phase 2: Drag-and-Drop (Complete)
- [x] Drag-and-drop device reordering
- [x] Real-time collision detection during drag
- [x] Snap-to-grid positioning
- [x] Visual feedback (grip handles, opacity, warnings)
- [x] URL state persistence (bookmark selected rack)
- [x] Smooth interaction without layout shift

### ✅ Phase 3: Power & Weight Analytics (Complete)
- [x] Power consumption tracking per device (watts)
- [x] Power density calculations (W/U)
- [x] Heatmap visualization of power distribution with color coding
- [x] Power imbalance detection (Pareto principle)
- [x] Weight per device metadata (kg)
- [x] Weight distribution analytics
- [x] Weight imbalance warnings
- [x] Analytics API endpoints (4 routes)
- [x] Real-time dashboard cards & visualizations

### 🔮 Phase 4: Multi-Rack & Cabling
- [ ] "Row View" for multiple racks
- [ ] Rack comparison view
- [ ] Front/Back view toggle
- [ ] Inter-device cabling visualization
- [ ] Cable path planning
- [ ] Port mapping UI

### 📋 Phase 5: Advanced Features (Future)
- [ ] PostgreSQL migration guide
- [ ] Authentication & RBAC
- [ ] Audit logging (who moved what, when)
- [ ] Backup/restore functionality
- [ ] Import from CSV
- [ ] Export to PDF/SVG
- [ ] Mobile app (React Native)
- [ ] Real-time collaboration (WebSockets)

## 🎮 Testing the Application

### 1. View Sample Racks
- App loads with 3 pre-seeded racks (if you ran `npm run seed`)
- Select different racks from the sidebar

### 2. Test Drag-and-Drop
- Click and drag any device vertically
- Watch the U position update in real-time
- Try dragging into overlapping space—collision warning appears
- Release on valid space to save

### 3. Test Collision Detection
- Try adding a device to a position occupied by another
- API will reject with a clear error message
- Try dragging a tall device into insufficient space—it snaps to valid position

### 4. URL Persistence
- Select a rack, check the URL: `?rackId=...`
- Copy the URL and share it—others see the same rack
- Refresh (Ctrl+R)—stays on the same rack

## 📁 Project Structure

```
RackOps/
├── server/                        # Node.js Backend
│   ├── src/
│   │   ├── index.js              # Express server entry
│   │   ├── db/init.js            # SQLite initialization
│   │   ├── models/index.js       # Rack & Device models
│   │   ├── middleware/
│   │   │   └── collisionEngine.js # Overlap detection logic
│   │   └── routes/
│   │       ├── racks.js          # Rack endpoints
│   │       └── devices.js        # Device endpoints
│   ├── seed.js                    # Sample data seeder
│   └── package.json
│
├── client/                        # React Frontend (Vite)
│   ├── src/
│   │   ├── App.jsx               # Main component
│   │   ├── components/
│   │   │   └── RackVisualizer.jsx # Rack visualization
│   │   └── index.css             # Tailwind imports
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── SPEC.md                        # Technical specification
├── QUICKSTART.md                  # Setup guide
├── README.md                      # This file
└── package.json                   # Root (concurrency runner)
```

## 🎯 Example: Create & Manage a Rack

```bash
# Create a rack
curl -X POST http://localhost:8080/api/racks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DC1-ROW4-RACK02",
    "total_u": 42,
    "location": "Data Center 1, Row 4"
  }'

# Add a server (starts at U40, takes 2U)
curl -X POST http://localhost:8080/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "rack_id": "YOUR_RACK_ID",
    "name": "SERVER-01",
    "type": "Server",
    "height_u": 2,
    "start_u": 40,
    "power_watts": 850,
    "weight_kg": 12,
    "metadata": {"ip": "192.168.1.10", "serial": "SRV-2024-001"}
  }'

# Move the server to U35
curl -X PATCH http://localhost:8080/api/devices/YOUR_DEVICE_ID \
  -H "Content-Type: application/json" \
  -d '{"start_u": 35}'
```

## 🔧 Troubleshooting

**Port Already in Use:**
```bash
# Change port in server/.env
PORT=8081
npm run dev
```

**Database Issues:**
```bash
# Reset database (deletes all data)
rm server/data/rackops.db
npm run dev
```

**Dependencies Not Installing:**
```bash
npm run build  # Reinstalls everything
```

## 📞 Support & Contribution

- **Bug Reports:** Open an issue on GitHub
- **Feature Requests:** Discuss in issues first
- **Pull Requests:** Welcome! Ensure collision engine tests pass

## 📄 License

See LICENSE file for details.

---

**Built with ❤️ for data center engineers who demand precision.**