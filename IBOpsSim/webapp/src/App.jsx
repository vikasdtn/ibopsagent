import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const towerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#e74c3c">
      <path d="M12 2L8 6v16h8V6l-4-4zm0 2.83L13.17 6H10.83L12 4.83zM10 8h4v2h-4V8zm0 4h4v2h-4v-2zm0 4h4v2h-4v-2z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
})

function App() {
  const [metrics, setMetrics] = useState({
    DL: { throughput_mbps: 0, packet_loss_rate: 0, avg_sinr_db: 0, avg_mcs: 0, avg_resource_use: 0 },
    UL: { throughput_mbps: 0, packet_loss_rate: 0, avg_sinr_db: 0, avg_mcs: 0, avg_resource_use: 0 }
  })
  const [isSimulating, setIsSimulating] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState({
    name: "Custom Scenario",
    network: {
      bandwidth: 20,
      inter_scheduler: "RR",
      intra_scheduler: "RR",
      mimo_mode: "SU",
      mimo_layers: 2
    },
    traffic: {
      dl_users: 5,
      ul_users: 5,
      dl_packet_size: 5000,
      ul_packet_size: 3000,
      dl_arrival_rate: 1,
      ul_arrival_rate: 1,
      sinr_pattern: "S30"
    }
  })

  const runSimulation = async () => {
    setIsSimulating(true)
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      const result = await response.json()
      setMetrics(result.metrics || metrics)
    } catch (error) {
      console.error('Simulation failed:', error)
    }
    setIsSimulating(false)
  }

  const MetricCard = ({ title, value, unit, color = "#3498db" }) => (
    <div className="metric-card">
      <div className="metric-header" style={{ borderLeftColor: color }}>
        <h3>{title}</h3>
      </div>
      <div className="metric-value">
        {value} <span className="metric-unit">{unit}</span>
      </div>
    </div>
  )

  return (
    <div className="app">
      <header className="header">
        <h1>📡 5G RAN Simulator</h1>
        <button 
          className="config-btn"
          onClick={() => setShowConfig(true)}
        >
          ⚙️ Configure
        </button>
      </header>

      <div className="main-content">
        <div className="left-panel">
          <div className="map-container">
            <h2>📡 Network Coverage</h2>
            <MapContainer 
              center={[-37.8136, 144.9631]} 
              zoom={13} 
              style={{ height: '300px', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[-37.8136, 144.9631]} icon={towerIcon}>
                <Popup>
                  <strong>gNB Cell-1</strong><br/>
                  Bandwidth: {config.network.bandwidth}MHz<br/>
                  MIMO: {config.network.mimo_mode}-MIMO {config.network.mimo_layers}L
                </Popup>
              </Marker>
            </MapContainer>
          </div>

          <div className="simulation-control">
            <button 
              className={`simulate-btn ${isSimulating ? 'simulating' : ''}`}
              onClick={runSimulation}
              disabled={isSimulating}
            >
              {isSimulating ? '🔄 Simulating...' : '▶️ Run Simulation'}
            </button>
          </div>
        </div>

        <div className="right-panel">
          <div className="metrics-section">
            <h2>📊 Performance Metrics</h2>
            
            <div className="direction-section">
              <h3>📥 Downlink</h3>
              <div className="metrics-grid">
                <MetricCard title="Throughput" value={metrics.DL.throughput_mbps.toFixed(1)} unit="Mbps" color="#27ae60" />
                <MetricCard title="Packet Loss" value={metrics.DL.packet_loss_rate.toFixed(1)} unit="%" color="#e74c3c" />
                <MetricCard title="SINR" value={metrics.DL.avg_sinr_db.toFixed(1)} unit="dB" color="#f39c12" />
                <MetricCard title="MCS" value={metrics.DL.avg_mcs.toFixed(1)} unit="" color="#9b59b6" />
                <MetricCard title="PRB Usage" value={metrics.DL.avg_resource_use.toFixed(1)} unit="PRBs" color="#34495e" />
              </div>
            </div>

            <div className="direction-section">
              <h3>📤 Uplink</h3>
              <div className="metrics-grid">
                <MetricCard title="Throughput" value={metrics.UL.throughput_mbps.toFixed(1)} unit="Mbps" color="#27ae60" />
                <MetricCard title="Packet Loss" value={metrics.UL.packet_loss_rate.toFixed(1)} unit="%" color="#e74c3c" />
                <MetricCard title="SINR" value={metrics.UL.avg_sinr_db.toFixed(1)} unit="dB" color="#f39c12" />
                <MetricCard title="MCS" value={metrics.UL.avg_mcs.toFixed(1)} unit="" color="#9b59b6" />
                <MetricCard title="PRB Usage" value={metrics.UL.avg_resource_use.toFixed(1)} unit="PRBs" color="#34495e" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfig && (
        <div className="modal-overlay" onClick={() => setShowConfig(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚙️ Simulation Configuration</h2>
              <button onClick={() => setShowConfig(false)}>✕</button>
            </div>
            
            <div className="config-form">
              <div className="config-section">
                <h3>📡 Network</h3>
                <div className="form-row">
                  <label>Bandwidth (MHz)</label>
                  <input 
                    type="number" 
                    value={config.network.bandwidth}
                    onChange={e => setConfig({...config, network: {...config.network, bandwidth: parseInt(e.target.value)}})}
                  />
                </div>
                <div className="form-row">
                  <label>Inter Scheduler</label>
                  <select 
                    value={config.network.inter_scheduler}
                    onChange={e => setConfig({...config, network: {...config.network, inter_scheduler: e.target.value}})}
                  >
                    <option value="RR">Round Robin</option>
                    <option value="RRp">Round Robin Plus</option>
                    <option value="PF11">Proportional Fair</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Intra Scheduler</label>
                  <select 
                    value={config.network.intra_scheduler}
                    onChange={e => setConfig({...config, network: {...config.network, intra_scheduler: e.target.value}})}
                  >
                    <option value="RR">Round Robin</option>
                    <option value="PF11">Proportional Fair</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>MIMO Mode</label>
                  <select 
                    value={config.network.mimo_mode}
                    onChange={e => setConfig({...config, network: {...config.network, mimo_mode: e.target.value}})}
                  >
                    <option value="SU">Single-User</option>
                    <option value="MU">Multi-User</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>MIMO Layers</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="8"
                    value={config.network.mimo_layers}
                    onChange={e => setConfig({...config, network: {...config.network, mimo_layers: parseInt(e.target.value)}})}
                  />
                </div>
              </div>

              <div className="config-section">
                <h3>👥 Traffic</h3>
                <div className="form-row">
                  <label>DL Users</label>
                  <input 
                    type="number" 
                    value={config.traffic.dl_users}
                    onChange={e => setConfig({...config, traffic: {...config.traffic, dl_users: parseInt(e.target.value)}})}
                  />
                </div>
                <div className="form-row">
                  <label>UL Users</label>
                  <input 
                    type="number" 
                    value={config.traffic.ul_users}
                    onChange={e => setConfig({...config, traffic: {...config.traffic, ul_users: parseInt(e.target.value)}})}
                  />
                </div>
                <div className="form-row">
                  <label>DL Packet Size (bytes)</label>
                  <input 
                    type="number" 
                    value={config.traffic.dl_packet_size}
                    onChange={e => setConfig({...config, traffic: {...config.traffic, dl_packet_size: parseInt(e.target.value)}})}
                  />
                </div>
                <div className="form-row">
                  <label>UL Packet Size (bytes)</label>
                  <input 
                    type="number" 
                    value={config.traffic.ul_packet_size}
                    onChange={e => setConfig({...config, traffic: {...config.traffic, ul_packet_size: parseInt(e.target.value)}})}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="apply-btn" onClick={() => setShowConfig(false)}>
                ✅ Apply Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
