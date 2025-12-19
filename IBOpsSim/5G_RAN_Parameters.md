# 5G RAN Parameters Configuration Guide

This document provides detailed descriptions of all configurable 5G RAN parameters in Py5cheSim for AI-powered IBOps scenarios.

## Cell & Radio Configuration Parameters

### Bandwidth Configuration
- **Parameter**: `bandwidth` (integer)
- **Description**: Channel bandwidth allocation in MHz for each Component Carrier (CC)
- **Standard Reference**: 3GPP TS 38.104 - Base Station radio transmission and reception
- **Valid Values**:
  - **FR1 (Sub-6GHz)**: [5, 10, 15, 20, 25, 30, 40, 50, 60, 80, 90, 100] MHz
  - **FR2 (mmWave)**: [50, 100, 200, 400] MHz
- **Example**: `bandwidth: 20` for single 20MHz carrier
- **IBOps Impact**: Higher bandwidth = more capacity but increased interference potential

### Frequency Range
- **Parameter**: `frequency_range` (string)
- **Description**: 5G NR frequency range classification
- **Standard Reference**: 3GPP TS 38.104 - Operating bands and channel arrangements
- **Valid Values**:
  - `'FR1'`: Sub-6GHz frequencies (450MHz - 6GHz)
  - `'FR2'`: mmWave frequencies (24.25GHz - 52.6GHz)
- **Characteristics**:
  - **FR1**: Better coverage, lower capacity, higher mobility support
  - **FR2**: Higher capacity, limited coverage, beamforming essential
- **IBOps Impact**: FR2 requires more sophisticated beam management and handover algorithms

### Operating Band
- **Parameter**: `band` (string)
- **Description**: Specific 5G NR operating band
- **Standard Reference**: 3GPP TS 38.104 - Table 5.2-1 (FR1) and Table 5.2-2 (FR2)
- **Valid Values**:
  - **FDD Bands**: 'B1', 'B3', 'B7', 'B20', 'B28' (example subset)
  - **TDD Bands**: 'n257' (28GHz), 'n258' (26GHz), 'n260' (39GHz), 'n261' (28GHz)
- **IBOps Impact**: Band selection affects propagation characteristics and interference patterns

### Duplex Mode
- **Parameter**: `tdd` (boolean)
- **Description**: Time Division Duplex vs Frequency Division Duplex
- **Standard Reference**: 3GPP TS 38.211 - Physical channels and modulation
- **Valid Values**:
  - `false`: FDD mode (separate UL/DL frequencies)
  - `true`: TDD mode (time-shared UL/DL on same frequency)
- **TDD Advantages**: Flexible UL/DL ratio, spectrum efficiency
- **FDD Advantages**: Lower latency, simpler scheduling
- **IBOps Impact**: TDD allows dynamic UL/DL optimization based on traffic patterns

## Buffer and QoS Parameters

### UE Bearer Buffer Size
- **Parameter**: `buffer_size` (integer)
- **Description**: Maximum buffer size per UE bearer in bytes before packet dropping
- **Standard Reference**: Implementation-specific (3GPP defines buffer management principles)
- **Default**: 81920 bytes (80KB)
- **Range**: 1024 - 1048576 bytes (1KB - 1MB typical)
- **IBOps Impact**: Larger buffers reduce packet loss but increase latency

### Simulation Timing
- **Parameter**: `duration_ms` (integer)
- **Description**: Total simulation duration in milliseconds
- **Default**: 30000 ms (30 seconds)
- **IBOps Impact**: Longer simulations provide more stable statistics

- **Parameter**: `measurement_interval_ms` (float)
- **Description**: Statistics measurement interval in milliseconds
- **Default**: 1000.0 ms
- **IBOps Impact**: Shorter intervals provide finer granularity for AI decision making

- **Parameter**: `inter_slice_granularity_ms` (float)
- **Description**: Inter-slice scheduler decision granularity in milliseconds
- **Default**: 3000.0 ms
- **IBOps Impact**: Shorter granularity enables faster resource reallocation

## Scheduling Algorithms

### Inter-Slice Schedulers
- **Parameter**: `inter_scheduler` (string)
- **Description**: Algorithm for resource allocation between network slices
- **Standard Reference**: 3GPP TS 23.501 - Network slicing principles

#### Available Algorithms:
1. **Round Robin (`'RR'`)**
   - Equal resource distribution among slices
   - Simple, fair, but not QoS-aware
   
2. **Round Robin Plus (`'RRp'`)**
   - Resources allocated only to slices with buffered packets
   - More efficient than basic RR
   
3. **Proportional Fair (`'PF11'`)**
   - Balances fairness and efficiency
   - Example: `'PF11'` = standard PF, `'PF21'` = more throughput-focused

### Intra-Slice Schedulers
- **Parameter**: `intra_scheduler` (string)
- **Description**: Algorithm for resource allocation within a slice
- **Standard Reference**: 3GPP TS 38.214 - Physical layer procedures for data

#### Available Algorithms:
1. **Round Robin (`'RR'`)**
   - Equal time/frequency resources per UE
   - Fair but not channel-aware
   
2. **Proportional Fair (`'PF11'`)**
   - Considers both instantaneous and average throughput
   - Better spectral efficiency than RR

## MIMO Configuration

### MIMO Mode
- **Parameter**: `mimo_mode` (string)
- **Description**: Multiple-Input Multiple-Output transmission mode
- **Standard Reference**: 3GPP TS 38.214 - MIMO procedures

#### Valid Values:
- **`'SU'` (Single-User MIMO)**
  - All spatial layers serve one UE
  - Higher per-UE throughput
  - Better for high-data applications
  
- **`'MU'` (Multi-User MIMO)**
  - Spatial layers shared among multiple UEs
  - Higher system capacity
  - Better for many-UE scenarios

### MIMO Layers
- **Parameter**: `mimo_layers` (integer)
- **Description**: Number of spatial layers for MIMO transmission
- **Standard Reference**: 3GPP TS 38.214 - Table 5.1.3.1-1
- **Valid Values**: 1-8 layers (depending on UE capability and channel conditions)
- **SU-MIMO**: Layers per UE (higher = more throughput per UE)
- **MU-MIMO**: Simultaneous UEs served (higher = more concurrent users)

## Service Type Classifications

### Network Slice Types
- **Parameter**: `service_type` (string)
- **Description**: Service category determining QoS requirements
- **Standard Reference**: 3GPP TS 23.501 - Service and session continuity

#### Service Categories:
1. **eMBB (Enhanced Mobile Broadband)**
   - High throughput, moderate latency
   - Applications: Video streaming, file downloads
   - Typical Requirements: >100Mbps, <50ms latency
   
2. **mMTC (Massive Machine Type Communications)**
   - Low throughput, high connection density
   - Applications: IoT sensors, smart city
   - Typical Requirements: <1Mbps, >1000 devices/km²
   
3. **URLLC (Ultra-Reliable Low-Latency Communications)**
   - Ultra-low latency, high reliability
   - Applications: Industrial automation, autonomous vehicles
   - Typical Requirements: <1ms latency, 99.999% reliability

### QoS Requirements
- **Parameter**: `delay_requirement` (integer)
- **Description**: Maximum acceptable delay in milliseconds
- **Standard Reference**: 3GPP TS 23.501 - QoS characteristics

- **Parameter**: `availability` (string)
- **Description**: Required service availability percentage
- **Examples**: '99.9%', '99.99%', '99.999%'

## IBOps Optimization Strategies

### AI-Tunable Parameters for Network Optimization:
1. **Scheduler Selection**: Switch between RR and PF based on QoS requirements
2. **MIMO Adaptation**: Toggle SU/MU MIMO based on UE density
3. **Buffer Management**: Optimize `buffer_size` for latency vs. reliability trade-off
4. **Bandwidth Allocation**: Dynamic `bandwidth` assignment based on slice demands
5. **Quality Adaptation**: Adjust `sinr_pattern` targets based on channel conditions

This parameter set enables comprehensive 5G RAN simulation and AI-driven optimization for realistic IBOps demonstrations.
