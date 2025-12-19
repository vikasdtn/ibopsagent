# 5G RAN Simulator Web UI

A modern web interface for the Py5cheSim 5G RAN simulator with real-time metrics dashboard and interactive configuration.

## Features

- 📊 **Real-time Metrics Dashboard** - Live throughput, packet loss, SINR, MCS, and PRB usage
- 🗺️ **Interactive Map** - Scrollable map with gNB tower location and popup info
- ⚙️ **Configuration Panel** - Adjust network and traffic parameters via popup modal
- 🎯 **One-click Simulation** - Run simulations directly from the web interface
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Quick Start

### 1. Install Dependencies

**Frontend:**
```bash
cd webapp
npm install
```

**Backend:**
```bash
pip install -r requirements.txt
```

### 2. Start the Application

**Terminal 1 - Backend:**
```bash
python server.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 3. Access the Interface

Open http://localhost:3000 in your browser.

## Usage

1. **View Network**: See the gNB tower on the interactive map
2. **Configure Parameters**: Click "⚙️ Configure" to adjust:
   - Network: Bandwidth, schedulers, MIMO settings
   - Traffic: User counts, packet sizes, arrival rates
3. **Run Simulation**: Click "▶️ Run Simulation" 
4. **Monitor Results**: View real-time metrics for DL/UL performance

## Architecture

```
├── src/
│   ├── App.jsx          # Main React component
│   ├── App.css          # Styling
│   └── main.jsx         # React entry point
├── server.py            # Flask API backend
├── package.json         # Node.js dependencies
└── requirements.txt     # Python dependencies
```

## API Endpoints

- `POST /api/simulate` - Run simulation with configuration

## Configuration Parameters

The web UI supports all Py5cheSim parameters:

**Network:**
- Bandwidth (5-100 MHz)
- Inter/Intra schedulers (RR, RRp, PF11)
- MIMO mode (SU/MU) and layers (1-8)

**Traffic:**
- DL/UL user counts
- Packet sizes and arrival rates
- SINR patterns

## Metrics Displayed

**Downlink & Uplink:**
- Throughput (Mbps)
- Packet Loss (%)
- SINR (dB)
- MCS (Modulation & Coding Scheme)
- PRB Usage (Physical Resource Blocks)

The dashboard updates automatically after each simulation run.
