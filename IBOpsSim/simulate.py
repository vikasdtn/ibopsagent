#!/usr/bin/env python3
"""
IBOpsSim - Simplified 5G RAN Simulator
Usage: python3 simulate.py config.yaml
"""
import sys
import os
import yaml
import shutil
import simpy

# Add parent directory to path to import Py5cheSim modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from UE import *
from Cell import *
from Results import *

def load_config(config_file):
    """Load configuration from YAML file"""
    with open(config_file, 'r') as f:
        return yaml.safe_load(f)

def clean_previous_results():
    """Clean previous simulation results"""
    for folder in ["Statistics", "Logs"]:
        if os.path.exists(folder):
            shutil.rmtree(folder)

def calculate_metrics(stats_dir="Statistics"):
    """Calculate key performance metrics"""
    metrics = {}
    
    # Load DL stats
    dl_file = os.path.join(stats_dir, "dlStsts_eMBB.txt")
    ul_file = os.path.join(stats_dir, "ulStsts_eMBB.txt")
    
    for direction, file_path in [('DL', dl_file), ('UL', ul_file)]:
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                lines = f.readlines()[1:]  # Skip header
                
            if lines:
                total_sent = sum(int(line.split()[6]) for line in lines)
                total_lost = sum(int(line.split()[7]) for line in lines)
                total_bytes = sum(int(line.split()[8]) for line in lines)
                avg_sinr = sum(float(line.split()[2]) for line in lines) / len(lines)
                avg_mcs = sum(int(line.split()[3]) for line in lines) / len(lines)
                avg_resource = sum(int(line.split()[5]) for line in lines) / len(lines)
                
                # Calculate derived metrics
                simulation_time_sec = 30  # Default simulation time
                throughput_mbps = (total_bytes * 8) / (simulation_time_sec * 1000000)
                packet_loss_rate = (total_lost / total_sent * 100) if total_sent > 0 else 0
                
                metrics[direction] = {
                    'throughput_mbps': round(throughput_mbps, 2),
                    'packet_loss_rate': round(packet_loss_rate, 2),
                    'avg_sinr_db': round(avg_sinr, 2),
                    'avg_mcs': round(avg_mcs, 1),
                    'avg_resource_use': round(avg_resource, 1),
                    'total_packets_sent': total_sent,
                    'total_packets_lost': total_lost
                }
    
    return metrics

def print_results(config, metrics):
    """Print simulation results"""
    print("\n" + "="*60)
    print("🎯 IBOpsSim - 5G RAN Simulation Results")
    print("="*60)
    
    print(f"\n📋 Configuration: {config.get('name', 'Unnamed Scenario')}")
    print(f"👥 Users: {config['traffic']['dl_users']} DL, {config['traffic']['ul_users']} UL")
    print(f"📡 Network: {config['network']['bandwidth']}MHz, {config['network']['inter_scheduler']}")
    print(f"🔧 MIMO: {config['network']['mimo_mode']}, {config['network']['mimo_layers']} layers")
    
    for direction in ['DL', 'UL']:
        if direction in metrics:
            m = metrics[direction]
            print(f"\n{direction} Performance:")
            print(f"  📊 Throughput:     {m['throughput_mbps']} Mbps")
            print(f"  📉 Packet Loss:    {m['packet_loss_rate']}%")
            print(f"  📡 SINR:          {m['avg_sinr_db']} dB")
            print(f"  🔧 MCS:           {m['avg_mcs']}")
            print(f"  🔋 Resource Use:   {m['avg_resource_use']} PRBs")
            print(f"  📦 Packets:       {m['total_packets_sent']:,} sent, {m['total_packets_lost']:,} lost")
    
    print("\n" + "="*60)

def run_simulation(config):
    """Run 5G RAN simulation with given configuration"""
    print(f"🚀 Starting simulation: {config.get('name', 'Unnamed')}")
    
    # Clean previous results
    clean_previous_results()
    
    # Extract configuration
    net_config = config['network']
    traffic_config = config['traffic']
    sim_config = config.get('simulation', {})
    
    # Simulation parameters
    bw = [net_config['bandwidth']]
    fr = net_config.get('frequency_range', 'FR1')
    band = net_config.get('band', 'B1')
    tdd = net_config.get('tdd', False)
    buf = net_config.get('buffer_size', 81920)
    scheduler_inter = net_config.get('inter_scheduler', 'RR')
    
    t_sim = sim_config.get('duration_ms', 30000)
    debMode = sim_config.get('debug', False)
    measInterv = sim_config.get('measurement_interval_ms', 1000.0)
    interSliceSchGr = sim_config.get('inter_slice_granularity_ms', 3000.0)
    
    # Create environment and cell
    env = simpy.Environment()
    cell = Cell('c1', bw, fr, debMode, buf, tdd, interSliceSchGr, scheduler_inter)
    
    # Create UE group
    uegroup = UEgroup(
        traffic_config['dl_users'],
        traffic_config['ul_users'],
        traffic_config['dl_packet_size'],
        traffic_config['ul_packet_size'],
        traffic_config['dl_arrival_rate'],
        traffic_config['ul_arrival_rate'],
        traffic_config.get('service_type', 'eMBB'),
        traffic_config.get('delay_requirement', 20),
        traffic_config.get('availability', ''),
        net_config.get('intra_scheduler', 'RR'),
        net_config['mimo_mode'],
        net_config['mimo_layers'],
        cell, t_sim, measInterv, env,
        traffic_config.get('sinr_pattern', 'S30')
    )
    
    UEgroups = [uegroup]
    
    # Create slices and run simulation
    for ueG in UEgroups:
        cell.interSliceSched.createSlice(
            ueG.req['reqDelay'], ueG.req['reqThroughputDL'], 
            ueG.req['reqThroughputUL'], ueG.req['reqAvailability'],
            ueG.num_usersDL, ueG.num_usersUL, band, debMode,
            ueG.mmMd, ueG.lyrs, ueG.label, ueG.sch
        )
    
    # Activate processes
    procCell = env.process(cell.updateStsts(env, interv=measInterv, tSim=t_sim))
    procInter = env.process(cell.interSliceSched.resAlloc(env))
    for ueG in UEgroups:
        ueG.activateSliceScheds(cell.interSliceSched, env)
    
    # Run simulation
    env.run(until=t_sim)
    
    # Close files
    for slice in list(cell.slicesStsts.keys()):
        cell.slicesStsts[slice]['DL'].close()
        cell.slicesStsts[slice]['UL'].close()
    for slice in list(cell.interSliceSched.slices.keys()):
        cell.interSliceSched.slices[slice].schedulerDL.dbFile.close()
        if slice != 'LTE':
            cell.interSliceSched.slices[slice].schedulerUL.dbFile.close()
    
    print("✅ Simulation completed")
    
    # Calculate and print results
    metrics = calculate_metrics()
    print_results(config, metrics)
    
    return metrics

def main():
    """Main function"""
    if len(sys.argv) != 2:
        print("Usage: python3 simulate.py <config.yaml>")
        sys.exit(1)
    
    config_file = sys.argv[1]
    
    if not os.path.exists(config_file):
        print(f"Error: Configuration file '{config_file}' not found")
        sys.exit(1)
    
    try:
        config = load_config(config_file)
        run_simulation(config)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
