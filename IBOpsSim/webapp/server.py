#!/usr/bin/env python3
"""
Flask backend for IBOps Simulator Web UI
"""
import os
import sys
import yaml
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import simulation function
from simulate import run_simulation

app = Flask(__name__)
CORS(app)

@app.route('/api/simulate', methods=['POST'])
def simulate():
    try:
        config = request.json
        
        # Add required fields if missing
        if 'simulation' not in config:
            config['simulation'] = {
                'duration_ms': 30000,
                'measurement_interval_ms': 1000,
                'inter_slice_granularity_ms': 3000,
                'debug': False
            }
        
        # Add missing network fields
        network_defaults = {
            'frequency_range': 'FR1',
            'band': 'B1',
            'tdd': False,
            'buffer_size': 81920
        }
        for key, value in network_defaults.items():
            if key not in config['network']:
                config['network'][key] = value
        
        # Add missing traffic fields
        traffic_defaults = {
            'service_type': 'eMBB',
            'delay_requirement': 20,
            'availability': ''
        }
        for key, value in traffic_defaults.items():
            if key not in config['traffic']:
                config['traffic'][key] = value
        
        # Run simulation
        
        print(config)
        metrics = run_simulation(config)
        
        return jsonify({
            'success': True,
            'metrics': metrics,
            'config': config
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
