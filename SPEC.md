# SPEC.md: RackOps Technical Specification

**Project Name:** RackOps  
**Version:** 1.0.0  
**Stack:** Node.js (Express), React (Vite), Tailwind CSS, PostgreSQL/SQLite  

---

## 1. System Overview
RackOps is a Data Center Infrastructure Management (DCIM) tool focused on **Physical Layer Visualization**. It allows users to create virtual representations of server racks and populate them with hardware assets while enforcing physical constraints (space, height, and collision).

## 2. Data Models (Schema)

### 2.1 Rack Object
Defines the physical container.
* **id:** `UUID` (Primary Key)
* **name:** `String` (e.g., "DC1-ROW4-RACK02")
* **total_u:** `Integer` (e.g., 12, 24, 42, 48) — *Constraints: Min 1, Max 100*
* **depth:** `Enum` (Full, Half)
* **location:** `String` (Data center or room identifier)

### 2.2 Device Object
Defines the hardware mounted in the rack.
* **id:** `UUID` (Primary Key)
* **rack_id:** `UUID` (Foreign Key -> Rack.id)
* **name:** `String` (Hostname or Asset Tag)
* **type:** `Enum` (Server, Switch, PDU, Patch Panel, Storage, UPS)
* **height_u:** `Integer` (Height in Rack Units: 1, 2, 4, etc.)
* **start_u:** `Integer` (The bottom-most U position, 1-indexed)
* **metadata:** `JSON` (Serial Number, IP, MAC Address, Power Draw)

---

## 3. Business Logic & Validation

### 3.1 The Collision Engine (Core Logic)
Before any `Device` is created or moved, the backend must validate the physical space.

**Rule A: Boundary Check**
The device must fit within the rack dimensions.
$$start\_u + (height\_u - 1) \le rack.total\_u$$

**Rule B: Overlap Check**
The new device range $[S_n, E_n]$ must not intersect with any existing device range $[S_e, E_e]$ in the same rack.
* $E = S + H - 1$
* **Collision Condition:** $(S_n \le E_e) \text{ AND } (S_e \le E_n)$

### 3.2 Physical Representation
* **Indexing:** Racks are numbered **Bottom-to-Top** (Unit 1 is at the floor).
* **Aspect Ratio:** 1U = 1.75 inches physically. In UI, 1U should map to a fixed height (e.g., **40px**) to ensure visual alignment.

---

## 4. API Design (Express.js)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/racks` | `GET` | Returns list of all racks + device counts. |
| `/api/racks/:id` | `GET` | Returns full rack details and all associated devices. |
| `/api/racks` | `POST` | Create a new rack (requires `total_u`). |
| `/api/devices` | `POST` | Add device to rack (Triggers Collision Engine). |
| `/api/devices/:id` | `PATCH` | Move device or edit metadata (Triggers Collision Engine). |
| `/api/devices/:id` | `DELETE` | Remove device from rack. |

---

## 5. Frontend Requirements (React)

### 5.1 The Rack Visualizer Component
* **Container:** A `relative` positioned div with a height of `total_u * 40px`.
* **Background Grid:** Loop from 1 to `total_u` to render "U" labels and horizontal slot lines.
* **Device Layer:** Map through devices and render as `absolute` positioned blocks.
* **Positioning Calc:** * `bottom: (start_u - 1) * 40px`
    * `height: height_u * 40px`

### 5.2 Interactions
* **Form Validation:** Frontend should warn users if they try to place a 2U server in the last remaining 1U slot.
* **Color Coding:** * `Servers`: Blue
    * `Networking`: Green
    * `Power`: Amber/Orange

---

## 6. Implementation Phases

1.  **Phase 1 (MVP):** Basic Express API with SQLite. CRUD for Racks and Devices. Basic 42U hardcoded React view.
2.  **Phase 2 (Dynamic):** Variable Rack Height support. Robust collision middleware in Express.
3.  **Phase 3 (UX):** "Front/Back" view toggle. Hover states for device metadata.
4.  **Phase 4 (Advanced):** Drag-and-drop movement. Multi-rack comparison view.