import os
import psycopg2
import time

# Configuration
DB_HOST = os.getenv("POSTGRES_HOST", "db")
DB_NAME = os.getenv("POSTGRES_DB", "waternet_db")
DB_USER = os.getenv("POSTGRES_USER", "admin")
DB_PASS = os.getenv("POSTGRES_PASSWORD", "password123")

def get_db_connection():
    try:
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)
        return conn
    except Exception as e:
        print(f"Waiting for Database... Error: {e}")
        return None

def reset_database():
    conn = None
    while conn is None:
        conn = get_db_connection()
        time.sleep(2)
        
    cur = conn.cursor()
    print("⚠️  WARNING: DELETING ALL EXISTING DATA...")
    
    # 1. DROP OLD TABLE
    cur.execute("DROP TABLE IF EXISTS sensor_data;")
    
    # 2. CREATE NEW TABLE (Supervisor's Table 9 Structure)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS sensor_data (
            time TIMESTAMPTZ NOT NULL,
            -- Core Metrics
            flow_l_min DOUBLE PRECISION,     
            flow_out_l_min DOUBLE PRECISION, 
            ph DOUBLE PRECISION,             
            turbidity_ntu DOUBLE PRECISION,  
            temp_c DOUBLE PRECISION,         
            tank_level DOUBLE PRECISION,     -- Stored as %
            pressure DOUBLE PRECISION,       
            
            -- States & Labels
            pump_state INTEGER,              
            uv_status INTEGER,               
            valve_position INTEGER,          
            quality_class TEXT,              
            optimal_action DOUBLE PRECISION, 
            anomaly_label TEXT               
        );
    """)
    
    # 3. CONVERT TO TIMESCALEDB HYPERTABLE
    try:
        cur.execute("SELECT create_hypertable('sensor_data', 'time', if_not_exists => TRUE);")
    except:
        pass
        
    conn.commit()
    cur.close()
    conn.close()
    print("✅ Database successfully RESET. Ready for simulation.")

if __name__ == "__main__":
    reset_database()