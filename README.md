# MineGuard ⛏️ — Smart Coal Mine Pollution Alert System

> **A real-time environmental monitoring dashboard and alert system designed for open-cast and underground coal mining operations.** Visualizes particulate matter (PM2.5 & PM10) concentrations, calculates Air Quality Index (AQI), provides automated dust suppression guidance, and exports formatted CSV/PDF compliance reports.

[![React 19](https://img.shields.io/badge/React-19.0.1-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.x-FF6384.svg)](https://www.chartjs.org/)
[![Standalone](https://img.shields.io/badge/Standalone-HTML%2FCSS%2FJS-success.svg)](#option-1-standalone-browser-prototype-zero-dependencies)

---

## 📋 Table of Contents
1. [Overview & Key Features](#-overview--key-features)
2. [Project Deliverables](#-project-deliverables)
3. [Quick Start Guide](#-quick-start-guide)
   - [Option 1: Standalone Browser Prototype (Zero Dependencies)](#option-1-standalone-browser-prototype-zero-dependencies)
   - [Option 2: Modern React Web Application (Vite / Node.js)](#option-2-modern-react-web-application-vite--nodejs)
4. [Project Structure](#-project-structure)
5. [Mining Zones Monitored](#-mining-zones-monitored)
6. [Environmental Thresholds & Compliance](#-environmental-thresholds--compliance)
7. [Simulation Engine & Presets](#-simulation-engine--presets)
8. [Reporting System (CSV & PDF)](#-reporting-system-csv--pdf)
9. [Troubleshooting Guide (Opening in Chrome)](#-troubleshooting-guide-opening-in-chrome)
10. [Technologies Used](#-technologies-used)

---

## 🌟 Overview & Key Features

Coal mining operations generate hazardous airborne particulate matter, primarily **PM2.5** (fine respirable particles) and **PM10** (coarse inhalable dust). Prolonged worker exposure can lead to Coal Workers' Pneumoconiosis (Black Lung Disease), silicosis, and chronic respiratory illness. 

**MineGuard** provides occupational health and safety (OHS) managers with an intuitive, real-time command center:

- 📊 **Real-Time Sensor Telemetry:** Tracks PM2.5, PM10, AQI, Temperature, Humidity, and Wind Speed across key mining zones.
- 🚦 **Intelligent Multi-Stage Alerts:** Automatically classifies zones into **🟢 NORMAL**, **🟡 WARNING**, or **🔴 CRITICAL** based on environmental limits.
- 📈 **Dynamic Charting:** Interactive dual-axis trend analysis (PM2.5/PM10 history) and cross-sector comparative bar charts.
- 🎯 **Actionable Mitigation Directives:** Instant operational responses (e.g., mist cannon deployment, vehicle speed reduction, water sprinkling).
- ⚙️ **Configurable Thresholds:** Custom limits for PM2.5/PM10 with automatic `localStorage` persistence.
- 📥 **Executive Reporting:** 1-click generation of formatted **CSV logs** and formal multi-page **PDF Compliance Reports** with tables and executive summaries.
- 📦 **Dual Implementation:** Includes both a **full React/TypeScript dashboard** and a **zero-dependency standalone browser prototype** (`index.html`, `style.css`, `script.js`).

---

## 📦 Project Deliverables

This repository contains two complete versions of the MineGuard system:

| Version | Files | Intended Use | How to Run |
| :--- | :--- | :--- | :--- |
| **Standalone Browser Prototype** | `MineGuard/index.html`<br>`MineGuard/style.css`<br>`MineGuard/script.js` | Direct client presentation, offline demo, academic submission | Double-click `index.html` or `mineguard.html` in Chrome |
| **All-in-One Single File** | `MineGuard/mineguard.html` | Foolproof single-file sharing without loose assets | Double-click in any browser (works offline) |
| **Full React 19 Web App** | `src/*`<br>`package.json`<br>`vite.config.ts` | Scalable enterprise web application with hot reload | `npm install` && `npm run dev` |

---

## 🚀 Quick Start Guide

### Option 1: Standalone Browser Prototype (Zero Dependencies)

No installation, Node.js, or server required!

#### Running the 3-File Bundle:
1. Open the `MineGuard/` folder.
2. Ensure `index.html`, `style.css`, and `script.js` are together in the same directory.
3. Double-click **`index.html`** to open it in **Google Chrome**, **Microsoft Edge**, **Mozilla Firefox**, or **Apple Safari**.

#### Running the Single All-in-One File:
1. Double-click **`MineGuard/mineguard.html`**.
2. It embeds all CSS stylesheets and JavaScript directly inside the HTML file. It will render with full high-tech styling even if moved to another folder or computer without internet access.

---

### Option 2: Modern React Web Application (Vite / Node.js)

To run the complete React 19 + TypeScript + Vite development server:

#### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun**

#### Installation & Development
```bash
# 1. Install dependencies
npm install

# 2. Start the local Vite development server
npm run dev
```

Open your browser at:
```
http://localhost:3000
```

#### Build for Production
```bash
# Compile TypeScript and bundle with Vite
npm run build

# Preview the production build locally
npm run preview
```

#### Type Checking & Linting
```bash
npm run lint
```

---

## 🗂️ Project Structure

```plaintext
MineGuard/
├── MineGuard/                        # Standalone Vanilla HTML/CSS/JS Prototype
│   ├── index.html                    # Main HTML entry with embedded fallback support
│   ├── style.css                     # Dark industrial high-contrast styling & layout
│   ├── script.js                     # Sensor simulation, modal handlers & chart logic
│   ├── mineguard.html                # 100% self-contained all-in-one HTML file
│   ├── mineguard_project.zip         # Pre-packaged ZIP bundle for 1-click sharing
│   └── README.md                     # Dedicated guide for standalone files
│
├── public/                           # Static assets served by Vite
│   ├── mineguard.html                # Public standalone file accessible via web URL
│   ├── mineguard_project.zip         # Downloadable ZIP file via UI button
│   └── standalone/                   # Public mirror of standalone prototype
│       ├── index.html
│       ├── style.css
│       └── script.js
│
├── src/                              # React 19 + TypeScript Source Code
│   ├── components/                   # Modular UI Components
│   │   ├── AlertHistory.tsx          # Real-time event log with dismiss & filter
│   │   ├── DemoGuideModal.tsx        # Interactive onboarding walkthrough
│   │   ├── DisclaimerBanner.tsx      # Operational compliance & simulation notice
│   │   ├── DownloadReportModal.tsx   # CSV & PDF export configuration dialog
│   │   ├── Header.tsx                # App navigation, quick export & emergency status
│   │   ├── RecommendationsPanel.tsx  # Dynamic dust suppression directives
│   │   ├── SimControls.tsx           # Auto-simulation tick, interval & presets
│   │   ├── StandaloneExportModal.tsx # Standalone code viewer & file exporter
│   │   ├── SummaryCards.tsx          # High-level mine health & telemetry cards
│   │   ├── ThresholdSettingsModal.tsx# Custom PM2.5/PM10 threshold configurations
│   │   ├── TrendLineChart.tsx        # Real-time dual-axis particulate history chart
│   │   ├── ZoneCard.tsx              # Individual zone gauge card with live metrics
│   │   ├── ZoneComparisonChart.tsx   # Cross-zone PM comparative bar chart
│   │   └── ZoneDetailModal.tsx       # Detailed breakdown and sensor inspection modal
│   │
│   ├── utils/                        # Utility & business logic
│   │   ├── reportGenerator.ts        # CSV and jsPDF report creation engine
│   │   ├── storage.ts                # localStorage state management & defaults
│   │   └── thresholds.ts             # Regulatory standards & alert evaluations
│   │
│   ├── App.tsx                       # Root application component & layout state
│   ├── main.tsx                      # React DOM entry point
│   ├── types.ts                      # TypeScript interfaces (Zone, Alert, Thresholds)
│   └── index.css                     # Global Tailwind CSS imports & theme rules
│
├── .env.example                      # Environment variables template
├── metadata.json                     # Application metadata and descriptors
├── package.json                      # Project dependencies and npm scripts
├── tsconfig.json                     # TypeScript compiler configuration
├── vite.config.ts                    # Vite build configuration with React plugin
└── README.md                         # Main documentation (this file)
```

---

## 🏭 Mining Zones Monitored

MineGuard monitors 4 high-risk sectors across the mining lease:

| Zone ID | Zone Name | Primary Operations | Dominant Hazard | Target AQI |
| :--- | :--- | :--- | :--- | :--- |
| `zone-1` | **Pit Excavation Area (Zone A)** | Continuous hydraulic shovels, bucket wheel excavators, dragline stripping | Heavy crystalline silica dust, fresh coal seam fracture | < 80 |
| `zone-2` | **Haul Road Corridor (Zone B)** | 100-ton haul truck transport, diesel exhaust, unpaved surface transit | Coarse fugitive wheel dust (PM10), mechanical re-entrainment | < 70 |
| `zone-3` | **Coal Preparation & Washery (Zone C)**| Sizing, crushing, screening, heavy-media cyclone washing | Fine coal dust (PM2.5) in enclosed transfer chutes | < 60 |
| `zone-4` | **Blasting & Crushing Zone (Zone D)** | Explosive rock blasting, primary jaw crushing, stockpile reclaim | Intense transient dust plumes, shockwave dust dispersion | < 90 |

---

## 🎯 Environmental Thresholds & Compliance

Threshold classifications adhere to environmental and occupational guidelines (OSHA / CPCB / US-EPA):

| Particle Metric | Normal Status (🟢) | Warning Status (🟡) | Critical Status (🔴) | Action Required at Critical |
| :--- | :--- | :--- | :--- | :--- |
| **PM2.5** | `< 60 µg/m³` | `60 - 90 µg/m³` | `> 90 µg/m³` | Halt blasting; mandatory N95/P100 respirators; activate mist cannons |
| **PM10** | `< 100 µg/m³` | `100 - 150 µg/m³` | `> 150 µg/m³` | Deploy 30,000L water tankers; enforce 20 km/h vehicle limit |

*Threshold values can be customized on-the-fly via the **Settings (⚙️)** modal and saved to browser storage.*

---

## ⚡ Simulation Engine & Presets

MineGuard includes a deterministic and continuous telemetry simulator to test alert pipelines and dust-suppression procedures without physical sensors:

- **Auto-Simulation Mode:** Toggles automatic periodic data streaming (1s, 2s, 3s, or 5s intervals).
- **Manual Step:** Advances the time step by 1 cycle for fine-grained testing.
- **Preset Scenarios:**
  1. **Normal Operations:** All zones running within safe regulatory limits.
  2. **Heavy Excavation Dust:** Simulates excavator breakdown and unsuppressed face drilling.
  3. **High Wind Dispersion:** Elevated ambient wind speeds carrying dust plumes across haul roads.
  4. **Critical Blasting Exceedance:** Severe spike in particulate matter triggering site-wide alarms.
  5. **Water Sprinkler Suppression:** Demonstrates the effectiveness of mist cannons and mobile sprayers.

---

## 📄 Reporting System (CSV & PDF)

Click the **Download Report** button in the header to export immediate compliance files:

### 1. Formatted CSV Export
- Contains timestamped records for every zone.
- Fields: `Timestamp`, `Zone ID`, `Zone Name`, `Status`, `PM2.5 (µg/m³)`, `PM10 (µg/m³)`, `AQI`, `Temperature (°C)`, `Humidity (%)`, `Wind Speed (km/h)`.
- Compatible with Excel, Google Sheets, Power BI, and Python Pandas.

### 2. Multi-Page PDF Compliance Summary
- Formatted via `jspdf` and `jspdf-autotable`.
- Executive overview with health status breakdown.
- Complete tabular telemetry breakdown.
- Active alert logs and operational recommendations signed for safety audits.

---

## 🛠️ Troubleshooting Guide (Opening in Chrome)

If you encounter issues when opening `index.html` on your computer, check the solutions below:

### Problem 1: Chrome displays raw code or text instead of the webpage
- **Root Cause:** In Windows, saving a file in Notepad as `index.html` frequently saves it as **`index.html.txt`** because Windows hides file extensions by default.
- **Fix:** 
  1. Open Windows File Explorer -> Click **View** -> Check **File name extensions**.
  2. Rename `index.html.txt` to `index.html`.
  3. Or simply double-click the pre-built **`mineguard.html`** file!

### Problem 2: Webpage loads with plain white background and unstyled Times New Roman text
- **Root Cause:** `style.css` is not in the exact same folder as `index.html`, or you opened the file directly inside a `.zip` archive without extracting.
- **Fix:**
  1. **Extract First:** Right-click `mineguard_project.zip` -> Select **Extract All...** -> Choose a folder.
  2. Ensure `index.html`, `style.css`, and `script.js` are in the same folder.
  3. Alternatively, open **`mineguard.html`** which has all CSS and JavaScript bundled internally.

### Problem 3: Chrome blocks local files from opening inside a ZIP folder
- **Root Cause:** Windows "Compressed Folder" preview creates a temporary read-only virtual path that blocks relative scripts.
- **Fix:** Always extract the ZIP file to your Desktop or Documents folder before double-clicking `index.html`.

---

## 💻 Technologies Used

- **Framework:** React 19 (SPA) with functional hooks
- **Language:** TypeScript 5.x & Vanilla JavaScript (ES6+)
- **Styling:** Tailwind CSS v4 with dark industrial palette
- **Charts:** Chart.js v4 & react-chartjs-2 with SVG offline fallback
- **Exporting:** jsPDF & jspdf-autotable for PDF generation
- **Icons:** Lucide React
- **Build Tool:** Vite 8.x

---

## 📜 License & Compliance Notice

This system is designed as an operational monitoring prototype. Real-world deployment should interface with calibrated particulate sensors (optical particle counters or beta-attenuation monitors) connected via industrial IoT gateways (Modbus / MQTT).

Developed for modern mine safety and environmental stewardship. 🌿⛏️
