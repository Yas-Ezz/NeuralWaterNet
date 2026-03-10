import time
import random
import os
import psycopg2
from datetime import datetime, timedelta

# Configuration
DB_HOST = os.getenv("POSTGRES_HOST", "db")
DB_NAME = os.getenv("POSTGRES_DB", "waternet_db")
DB_USER = os.getenv("POSTGRES_USER", "admin")
DB_PASS = os.getenv("POSTGRES_PASSWORD", "password123")

# Physics Constants
TANK_CAPACITY_LITERS = 1000.0

def get_db_connection():
    try:
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)
        return conn
    except Exception as e:
        print(f"Waiting for Database... Error: {e}")
        return None

# Helper: Quality Class
def get_quality_class(ph, turbidity):
    if (6.8 <= ph <= 7.5) and (turbidity < 50): return "A"
    elif (6.0 <= ph <= 8.5) and (50 <= turbidity <= 100): return "B"
    elif (100 < turbidity <= 150): return "C"
    elif (turbidity > 150): return "D"
    elif (ph < 6.0 or ph > 9.0): return "E"
    return "D"

class SystemState:
    def __init__(self):
        self.current_water_liters = 500.0 

    def generate_step(self, timestamp):
        hour = timestamp.hour
        month = timestamp.month
        
        # --- 1. SEASONALITY ---
        if month in [12, 1, 2]: # Winter
            temp_range = (20, 23); ph_range = (7.3, 7.6); turb_base = (50, 80); cons_factor = 0.9
        elif month in [6, 7, 8]: # Summer
            temp_range = (28, 33); ph_range = (6.9, 7.2); turb_base = (70, 120); cons_factor = 1.2
        else: # Spring/Autumn
            temp_range = (24, 27); ph_range = (7.0, 7.4); turb_base = (60, 90); cons_factor = 1.0

        # --- 2. DAILY CONSUMPTION ---
        if 0 <= hour < 6: flow_target = random.uniform(0, 2)
        elif 6 <= hour < 7: flow_target = random.uniform(12, 15)
        elif 7 <= hour < 8: flow_target = random.uniform(8, 10)
        elif 8 <= hour < 12: flow_target = random.uniform(3, 5)
        elif 12 <= hour < 14: flow_target = random.uniform(5, 8)
        elif 14 <= hour < 18: flow_target = random.uniform(2, 4)
        elif 18 <= hour < 20: flow_target = random.uniform(10, 14)
        elif 20 <= hour < 22: flow_target = random.uniform(8, 10)
        else: flow_target = random.uniform(0, 2)

        flow_in = flow_target * cons_factor
        
        # --- 3. PHYSICS CORRELATIONS ---
        turbidity = random.uniform(*turb_base)
        if flow_in > 10: turbidity += (flow_in * 1.5)
        temp = random.uniform(*temp_range)
        ph = random.uniform(*ph_range)
        
        # --- 4. ANOMALIES ---
        anomaly_label = "Normal"
        chance = random.random()
        if chance < 0.005: 
            flow_in = random.uniform(2, 3); anomaly_label = "Leak"
        elif chance < 0.01:
            ph = random.choice([5.5, 9.5]); anomaly_label = "Chemical"
        elif chance < 0.015:
            turbidity = random.uniform(200, 300); anomaly_label = "Muddy"

        # --- 5. SYSTEM LOGIC ---
        self.current_water_liters += (flow_in / 60) * 5
        pump_state = 0
        if self.current_water_liters > (TANK_CAPACITY_LITERS * 0.9):
            pump_state = 1
            self.current_water_liters -= 20.0
        
        if anomaly_label == "Leak": pump_state = 0
            
        self.current_water_liters = max(0, min(self.current_water_liters, TANK_CAPACITY_LITERS))
        tank_level_pct = (self.current_water_liters / TANK_CAPACITY_LITERS) * 100
        
        uv_status = 1 if (flow_in > 0.1) else 0
        flow_out = flow_in * 0.95 if flow_in > 0 else 0
        pressure = 1.0 + (flow_in * 0.05) + random.uniform(-0.1, 0.1)
        if turbidity > 150: pressure += 0.5
        
        q_class = get_quality_class(ph, turbidity)
        optimal_action = 100.0 if pump_state == 1 else 0.0

        return (
            timestamp, round(flow_in, 2), round(flow_out, 2), round(ph, 2), 
            round(turbidity, 1), round(temp, 1), round(tank_level_pct, 1),
            round(pressure, 2), int(pump_state), int(uv_status), 1, 
            q_class, optimal_action, anomaly_label
        )

def main():
    conn = None
    while conn is None:
        conn = get_db_connection()
        time.sleep(2)
    
    system = SystemState()
    cur = conn.cursor()

    # --- INTELLIGENT RESUME LOGIC ---
    cur.execute("SELECT MAX(time) FROM sensor_data;")
    last_time = cur.fetchone()[0]

    if last_time is None:
        print("📉 Database empty. Starting from 180 days ago...")
        current_sim_time = datetime.now().astimezone() - timedelta(days=180)
    else:
        print(f"🔄 Resuming simulation from {last_time}...")
        current_sim_time = last_time

    try:
        while True:
            now = datetime.now().astimezone()
            
            if current_sim_time < (now - timedelta(minutes=5)):
                step_size = 300 # Backfill speed
                sleep_time = 0
                mode = "BACKFILL"
            else:
                step_size = 5 # Live speed
                sleep_time = 5
                current_sim_time = now
                mode = "LIVE"

            data_row = system.generate_step(current_sim_time)
            
            cur.execute("""
                INSERT INTO sensor_data (
                    time, flow_l_min, flow_out_l_min, ph, turbidity_ntu, temp_c, 
                    tank_level, pressure, pump_state, uv_status, valve_position, 
                    quality_class, optimal_action, anomaly_label
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, data_row)
            
            conn.commit()
            
            if mode == "LIVE":
                print(f"[{current_sim_time.strftime('%H:%M:%S')}] Flow: {data_row[1]} L/m | Anomaly: {data_row[13]}")
                time.sleep(sleep_time)
            else:
                current_sim_time += timedelta(seconds=step_size)
                if current_sim_time.minute == 0 and current_sim_time.hour % 24 == 0:
                    print(f"⚡ Backfilling: {current_sim_time.date()}")

    except KeyboardInterrupt:
        conn.close()

if __name__ == "__main__":
    main()