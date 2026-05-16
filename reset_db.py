import os
import psycopg2
from dotenv import load_dotenv

# Load database credentials
load_dotenv()

def reset_database():
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="waternet_db",
            user=os.getenv("POSTGRES_USER", "admin"),
            password=os.getenv("POSTGRES_PASSWORD", "password123"),
            port="5438"
        )
        cursor = conn.cursor()

        print("🧹 Dropping old V1 sensor_data table...")
        cursor.execute("DROP TABLE IF EXISTS sensor_data CASCADE;")

        print("🏗️ Creating new V2 Enterprise sensor_data table...")
        cursor.execute("""
            CREATE TABLE sensor_data (
                time TIMESTAMPTZ NOT NULL,
                system_id VARCHAR(50),
                flow_l_min DECIMAL,
                ph DECIMAL,
                turbidity_ntu DECIMAL,
                temp_c DECIMAL,
                tank_level DECIMAL,
                pump1_state BOOLEAN,
                uv_state BOOLEAN,
                anomaly_label VARCHAR(50) DEFAULT 'Normal'
            );
        """)

        print("⚡ Converting table to a TimescaleDB Hypertable...")
        # This is the magic command that makes time-series queries lightning fast
        cursor.execute("SELECT create_hypertable('sensor_data', 'time');")

        conn.commit()
        cursor.close()
        conn.close()
        print("✅ Database successfully upgraded to V2!")

    except Exception as e:
        print(f"❌ Error resetting database: {e}")

if __name__ == "__main__":
    reset_database()