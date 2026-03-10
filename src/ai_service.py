import time
import os
import joblib
import numpy as np
import pandas as pd
import psycopg2
from tensorflow.keras.models import load_model
from stable_baselines3 import PPO

import warnings
warnings.filterwarnings("ignore", category=UserWarning)

# --- CONFIGURATION ---
DB_HOST = os.getenv("POSTGRES_HOST", "db") 
DB_NAME = os.getenv("POSTGRES_DB", "waternet_db")
DB_USER = os.getenv("POSTGRES_USER", "admin")
DB_PASS = os.getenv("POSTGRES_PASSWORD", "password123")

# --- THE FIX: Updated Paths for Production Deployment ---
# These paths match the root "models/" folder mapped inside the Docker container
MODEL_PATH = "models/"
SCALER_PATH = "models/scaler.gz" # Updated based on standard save format
RL_MODEL_PATH = "models/ppo_waternet" 

# Important: This order must match the scaler training!
FEATURES = ['flow_l_min', 'turbidity_ntu', 'tank_level', 'ph', 'pressure']

# --- DATABASE CONNECTION ---
def get_db_connection():
    try:
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)
        return conn
    except Exception as e:
        print(f"⚠️ Waiting for Database... ({e})")
        return None

# --- LOAD RESOURCES ---
print("🧠 Loading Neural WaterNet AI Models, Scaler, and RL Agent...")

try:
    # 1. Load Anomaly Brains
    autoencoder = load_model(os.path.join(MODEL_PATH, 'autoencoder.keras'))
    iso_forest = joblib.load(os.path.join(MODEL_PATH, 'isolation_forest.pkl'))
    threshold_ae = np.load(os.path.join(MODEL_PATH, 'ae_threshold.npy'))
    
    # 2. Load Translator
    scaler = joblib.load(SCALER_PATH)
    
    # 3. Load RL Agent (Controller)
    rl_agent = PPO.load(RL_MODEL_PATH)
    
    print(f"✅ All Systems Ready. Sensitivity Threshold: {threshold_ae:.5f}")
except Exception as e:
    print(f"❌ Error loading resources: {e}")
    print("   Check that all paths are correct.")
    exit(1)

# --- INFERENCE ENGINE ---
def start_monitoring():
    print("🚀 Full Surveillance & Control System Active.")
    
    conn = None
    while conn is None:
        conn = get_db_connection()
        time.sleep(2)
    cur = conn.cursor()

    while True:
        try:
            # --- PHASE 1: SURVEILLANCE (Anomaly Detection) ---
            query = f"""
                SELECT {', '.join(FEATURES)}, time, anomaly_label 
                FROM sensor_data 
                WHERE time > NOW() - INTERVAL '60 minutes'
                ORDER BY time ASC;
            """
            cur.execute(query)
            rows = cur.fetchall()
            
            df = pd.DataFrame(rows, columns=FEATURES + ['time', 'anomaly_label'])

            if not df.empty:
                # Get the most recent raw state for the RL agent
                current_raw_state = df.iloc[-1]
                tank_level = current_raw_state['tank_level']
                inflow = current_raw_state['flow_l_min']
                turbidity = current_raw_state['turbidity_ntu']
                ph = current_raw_state['ph']
                # Check if the simulator flagged a chemical leak recently
                chem_alert = 1.0 if 'Chemical' in df.tail(5)['anomaly_label'].values else 0.0

                # Resample for Anomaly Detection
                df['time'] = pd.to_datetime(df['time'])
                df = df.set_index('time')
                df_resampled = df[FEATURES].resample('5min').mean().dropna()

                if len(df_resampled) >= 12:
                    raw_batch = df_resampled.tail(12)
                    data_scaled = scaler.transform(raw_batch.values)
                    
                    # Autoencoder
                    X_seq = data_scaled.reshape(1, 12, 5)
                    X_pred = autoencoder.predict(X_seq, verbose=0)
                    loss = np.mean(np.abs(X_pred - X_seq))
                    ae_anomaly = int(loss > threshold_ae)

                    # Isolation Forest
                    X_flat = data_scaled.reshape(1, -1)
                    iso_pred = iso_forest.predict(X_flat)[0]
                    iso_anomaly = 1 if iso_pred == -1 else 0

                    is_danger = ae_anomaly or iso_anomaly
                    status_icon = "🔴 DANGER" if is_danger else "🟢 NORMAL"
                    
                    # --- PHASE 2: CONTROL (RL Agent Decision) ---
                    # Build observation vector exactly as the RL env expects it
                    rl_obs = np.array([tank_level, inflow, turbidity, ph, chem_alert], dtype=np.float32)
                    
                    # Ask the agent what to do
                    action, _ = rl_agent.predict(rl_obs, deterministic=True)
                    pump_action, valve_action = action
                    
                    pump_text = "ON " if pump_action == 1 else "OFF"
                    valve_text = "RECYCLE" if valve_action == 1 else "MAIN   "
                    
                    # Output the combined intelligence
                    print(f"[{status_icon}] Loss: {loss:.4f} | RL Command -> Pump: {pump_text} | Valve: {valve_text}")
                else:
                    print(f"⏳ Gathering Context... ({len(df_resampled)}/12 steps)")
            else:
                print("⏳ Waiting for data stream...")

            time.sleep(5) 

        except Exception as e:
            print(f"❌ Error during scan: {e}")
            conn = get_db_connection()
            cur = conn.cursor()

if __name__ == "__main__":
    start_monitoring()