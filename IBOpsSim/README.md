# IBOpsSim - Simplified 5G RAN Simulator

A streamlined 5G RAN simulator for demonstrating AI-powered network optimization scenarios.

## Quick Start

```bash
# Run a simulation with YAML configuration
python3 simulate.py baseline.yaml
python3 simulate.py congested.yaml  
python3 simulate.py ai_optimized.yaml
```

## Files

- **`simulate.py`** - Main simulation script
- **`baseline.yaml`** - Baseline scenario (10 UEs, good performance)
- **`congested.yaml`** - Congested scenario (100 UEs, poor performance)
- **`ai_optimized.yaml`** - AI-optimized scenario (100 UEs, restored performance)
- **`5G_RAN_Parameters.md`** - Complete parameter reference guide

## Configuration Format

```yaml
name: "Scenario Name"

network:
  bandwidth: 20                    # MHz
  inter_scheduler: "RR"            # RR, RRp, PF11
  intra_scheduler: "RR"            # RR, PF11
  mimo_mode: "SU"                  # SU (Single-User) or MU (Multi-User)
  mimo_layers: 2                   # Number of MIMO layers

traffic:
  dl_users: 5                      # Downlink users
  ul_users: 5                      # Uplink users
  dl_packet_size: 30000            # Bytes
  ul_packet_size: 5000             # Bytes
  dl_arrival_rate: 1               # Packets per second
  ul_arrival_rate: 2               # Packets per second
  sinr_pattern: "S30"              # SXX (same) or DXX (distributed)

simulation:
  duration_ms: 30000               # Simulation time
  debug: false                     # Enable debug logs
```

## Key Metrics Output

Each simulation prints:
- **Throughput** (Mbps) - Data transfer rate
- **Packet Loss** (%) - Dropped packets due to congestion
- **SINR** (dB) - Signal quality
- **MCS** - Modulation and coding scheme
- **Resource Use** (PRBs) - Physical resource block utilization

## IBOps Demo Scenarios

### 1. Baseline (10 UEs)
Light load scenario showing good baseline performance.

### 2. Congested (100 UEs)  
Heavy load scenario demonstrating network congestion and performance degradation.

### 3. AI-Optimized (100 UEs)
AI-driven optimization scenario showing how intelligent parameter tuning restores performance:
- **Bandwidth**: 20MHz → 40MHz
- **Scheduling**: Round Robin → Proportional Fair
- **MIMO**: SU-MIMO 2 layers → MU-MIMO 4 layers
- **Load Balancing**: 50:50 → 30:70 DL:UL ratio
- **Traffic Shaping**: Optimized packet sizes and rates

## Expected Results

| Scenario | DL Throughput | UL Throughput | Key Insight |
|----------|---------------|---------------|-------------|
| Baseline | ~1,120 Mbps | ~522 Mbps | Good baseline |
| Congested | ~475 Mbps | ~509 Mbps | Performance degrades |
| AI-Optimized | ~3,925 Mbps | ~3,807 Mbps | AI restores performance |

**AI Impact**: 250% DL improvement, 630% UL improvement under heavy load.
