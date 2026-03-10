import gymnasium as gym
from gymnasium import spaces
import numpy as np

class WaterTreatmentEnv(gym.Env):
    """Custom Environment for Water Treatment with Contamination Routing"""
    metadata = {'render_modes': ['console']}

    def __init__(self):
        super().__init__()
        
        # Actions: [Pump State, Valve State]
        self.action_space = spaces.MultiDiscrete([2, 2])

        # Observations: [tank_level, inflow, turbidity, ph, chemical_alert]
        self.observation_space = spaces.Box(
            low=np.array([0.0, 0.0, 0.0, 0.0, 0.0]), 
            high=np.array([100.0, 10.0, 300.0, 14.0, 1.0]), 
            dtype=np.float32
        )
        
        self.max_capacity = 100.0
        self.current_step = 0
        self.state = self._get_initial_state()

    def _get_initial_state(self):
        return np.array([50.0, 1.5, 50.0, 7.0, 0.0], dtype=np.float32)

    def step(self, action):
        pump_action, valve_action = action
        tank_level, inflow, turbidity, ph, chem_alert = self.state
        
        reward = 0.0

        # --- Rule 1: Chemical & Water Quality Management ---
        is_contaminated = (chem_alert == 1.0) or (ph < 6.5) or (ph > 8.5) or (turbidity > 150)

        if is_contaminated:
            if valve_action == 0:
                reward -= 100.0
                tank_level += inflow
            else:
                reward += 20.0
        else:
            if valve_action == 0:
                reward += 20.0
                tank_level += inflow
            else:
                reward -= 50.0

        # --- Rule 2: Pump Energy Efficiency ---
        if pump_action == 1:
            tank_level -= 10.0 # 10L extraction
            reward -= 1.0      
            
        tank_level = max(0.0, min(tank_level, self.max_capacity))
        
        # --- Rule 3: Tank Capacity Management ---
        if tank_level >= 95.0:
            reward -= 50.0
        elif tank_level <= 5.0:
            reward -= 50.0
        elif 30.0 <= tank_level <= 70.0:
            reward += 10.0 

        self.current_step += 1
        
        # --- THE REALISTIC WATER FIX ---
        # Mostly normal, safe water parameters
        next_inflow = np.random.uniform(2.0, 7.0) 
        
        # Normal distribution centered at 7.2 (mostly safe)
        next_ph = np.random.normal(7.2, 0.5) 
        
        # Normal distribution centered at 40 (mostly safe)
        next_turbidity = max(0, np.random.normal(40, 30)) 
        
        # Only a 10% chance of a sudden chemical spike
        next_chem = 1.0 if np.random.random() < 0.1 else 0.0 

        self.state = np.array([tank_level, next_inflow, next_turbidity, next_ph, next_chem], dtype=np.float32)
        
        terminated = self.current_step >= 100
        truncated = False
        
        return self.state, reward, terminated, truncated, {}

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.state = self._get_initial_state()
        self.current_step = 0
        return self.state, {}