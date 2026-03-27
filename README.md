# 🖥️ RackOps

**RackOps** is a lightweight, high-precision Data Center Infrastructure Management (DCIM) tool designed to visualize and manage physical server rack layouts. Unlike static spreadsheets, RackOps provides a dynamic, unit-aware interface to prevent physical equipment overlaps and optimize space.

## ✨ Features

  * **Variable Rack Heights:** Support for any rack size (12U, 24U, 42U, 48U, etc.).
  * **Collision Detection Engine:** Intelligent backend logic that prevents two devices from occupying the same physical Rack Unit ($U$).
  * **Bottom-Up Visualization:** Industry-standard numbering (Unit 1 at the floor) for authentic data center mapping.
  * **Asset Metadata:** Track device types (Servers, Switches, PDUs), serial numbers, and power requirements.
  * **Real-time Scaling:** Responsive CSS Grid/Flexbox UI that scales based on the rack's total units.

## 🚀 Tech Stack

  * **Frontend:** React 18, Tailwind CSS, Lucide Icons, Axios.
  * **Backend:** Node.js, Express.js.
  * **Database:** PostgreSQL (with Sequelize ORM).
  * **Validation:** Zod (Schema validation) & Custom Collision Middleware.

## 🛠️ Installation

### Prerequisites

  * Node.js (v18+)
  * PostgreSQL (or SQLite for local dev)

### Setup

1.  **Clone the repository**

    ```bash
    git clone https://github.com/your-username/rackops.git
    cd rackops
    ```

2.  **Install Dependencies**

    ```bash
    # Install Backend
    cd server && npm install

    # Install Frontend
    cd ../client && npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the `/server` directory:

    ```env
    PORT=8080
    DATABASE_URL=postgres://user:password@localhost:5432/rackops
    ```

4.  **Run Development Mode**

    ```bash
    # From root
    npm run dev
    ```

## 📐 Core Logic: The Collision Formula

To ensure physical accuracy, the backend validates every device placement. A collision is detected if a new device overlaps with an existing device's range $[Start, End]$.

The overlap condition is defined as:
$$(S_{new} \le E_{existing}) \land (S_{existing} \le E_{new})$$

Where $E$ (End Unit) is calculated as:
$$E = S + H - 1$$
*(Where $S$ is the starting unit and $H$ is the height in U)*

## 🗺️ Roadmap

  - [ ] **Phase 1:** Basic CRUD for Racks and Devices with overlap prevention.
  - [ ] **Phase 2:** Drag-and-drop UI for reordering equipment within a rack.
  - [ ] **Phase 3:** Power consumption heatmaps and weight distribution alerts.
  - [ ] **Phase 4:** Multi-rack "Row View" and inter-device cabling visualization.

-----

## 🤝 Contributing

Contributions are welcome\! Please open an issue to discuss major changes before submitting a pull request.