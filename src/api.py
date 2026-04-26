from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
import io
import csv

# Load secrets from the .env file
load_dotenv()

app = FastAPI(title="Neural WaterNet Edge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    return psycopg2.connect(
        host="localhost", 
        database="waternet_db", 
        user=os.getenv("POSTGRES_USER", "admin"), 
        password=os.getenv("POSTGRES_PASSWORD", "password123"), 
        port="5438"
    )


@app.get("/api/dashboard/latest")
def get_latest_dashboard_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT tank_level, ph, turbidity_ntu 
            FROM sensor_data 
            ORDER BY time DESC 
            LIMIT 1;
        """)
        row = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if row:
            return {
                "status": "success",
                "data": {
                    "tank_level_liters": round(row[0], 2),
                    "ph_level": round(row[1], 2),
                    "turbidity_ntu": round(row[2], 2)
                }
            }
        return {"status": "error", "message": "No data found"}
        
    except Exception as e:
        print(f"🚨 DATABASE ERROR: {e}")
        return {"status": "error", "message": str(e)}
    



# Create a data model for the incoming command
class DeviceCommand(BaseModel):
    device_name: str
    state: int  # 1 for ON, 0 for OFF

@app.post("/api/control/device")
def control_device(command: DeviceCommand):
    print(f"🚨 COMMAND RECEIVED: Turn {command.device_name} to {'ON' if command.state == 1 else 'OFF'}")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Create a commands table if it doesn't exist yet
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS system_commands (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMPTZ DEFAULT NOW(),
                device_name VARCHAR(50),
                command_state INT,
                is_executed BOOLEAN DEFAULT FALSE
            );
        """)
        
        # 2. Insert the new command from React into the database
        cursor.execute("""
            INSERT INTO system_commands (device_name, command_state)
            VALUES (%s, %s);
        """, (command.device_name, command.state))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"status": "success", "message": f"{command.device_name} updated to {command.state}"}
        
    except Exception as e:
        print(f"🚨 DATABASE ERROR: {e}")
        return {"status": "error", "message": str(e)}
    



# 1. Models for the new incoming data
class SystemMode(BaseModel):
    mode_name: str

class AlertSetting(BaseModel):
    alert_name: str
    is_active: bool

# 2. Endpoint to handle Mode changes (Eco, Confort, etc.)
@app.post("/api/control/mode")
def set_system_mode(mode_data: SystemMode):
    print(f"🌟 AI MODE CHANGED TO: {mode_data.mode_name.upper()}")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create a settings table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS system_settings (
                setting_key VARCHAR(50) PRIMARY KEY,
                setting_value VARCHAR(50),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        """)
        
        # Insert or update the active mode (UPSERT)
        cursor.execute("""
            INSERT INTO system_settings (setting_key, setting_value)
            VALUES ('active_mode', %s)
            ON CONFLICT (setting_key) 
            DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW();
        """, (mode_data.mode_name,))
        
        conn.commit()
        cursor.close()
        conn.close()
        return {"status": "success", "message": f"Mode updated to {mode_data.mode_name}"}
    except Exception as e:
        print(f"🚨 DATABASE ERROR: {e}")
        return {"status": "error", "message": str(e)}

# 3. Endpoint to handle Alert toggles
@app.post("/api/control/alert")
def set_alert_setting(setting: AlertSetting):
    state_str = "ON" if setting.is_active else "OFF"
    print(f"🔔 ALERT SETTING [{setting.alert_name}] is now {state_str}")
    # You can add the SQL logic here later just like above!
    return {"status": "success", "message": f"Alert {setting.alert_name} updated"}



@app.get("/api/tracking/weekly")
def get_weekly_consumption():
    """Aggregates water consumption over the last 7 days"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Big Data SQL: Group by day, sum the flow, order chronologically
        cursor.execute("""
            SELECT 
                TRIM(TO_CHAR(time, 'Day')) as day_name,
                SUM(flow_l_min) as total_flow
            FROM sensor_data 
            WHERE time >= NOW() - INTERVAL '7 days'
            GROUP BY DATE(time), TRIM(TO_CHAR(time, 'Day'))
            ORDER BY DATE(time) ASC;
        """)
        
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        # Translate English database days to French UI days
        day_map = {
            "Monday": "Lun", "Tuesday": "Mar", "Wednesday": "Mer", 
            "Thursday": "Jeu", "Friday": "Ven", "Saturday": "Sam", "Sunday": "Dim"
        }

        chart_data = []
        for row in rows:
            eng_day = row[0]
            # Convert liters/min sum to an estimated volume metric for the chart
            volume = round(row[1] / 10, 1) 
            
            chart_data.append({
                "name": day_map.get(eng_day, eng_day[:3]),
                "pv": volume # Recharts uses 'pv' in your frontend code!
            })
            
        return {"status": "success", "data": chart_data}
        
    except Exception as e:
        print(f"🚨 DATABASE ERROR: {e}")
        return {"status": "error", "message": str(e)}
    

@app.get("/api/tracking/summary")
def get_tracking_summary():
    """Calculates overall Impact and 24h Quality averages"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Calculate All-Time Impact (Total Water Processed)
        cursor.execute("SELECT SUM(flow_l_min) FROM sensor_data;")
        total_flow_result = cursor.fetchone()[0]
        # Convert to cubic meters (m³) for the UI - roughly estimated
        total_m3 = round((total_flow_result or 0) / 1000, 1)
        
        # 1 cubic meter of recycled water saves approx 0.6 kg of CO2
        co2_saved = round(total_m3 * 0.6, 1)

        # 2. Calculate 24h Average Quality
        cursor.execute("""
            SELECT AVG(ph), AVG(turbidity_ntu) 
            FROM sensor_data 
            WHERE time >= NOW() - INTERVAL '24 hours';
        """)
        quality_row = cursor.fetchone()
        avg_ph = round(quality_row[0] or 7.0, 2)
        avg_turbidity = round(quality_row[1] or 10.0, 1)

        # Calculate an overall Grade (A, B, C)
        grade = "A"
        if avg_ph < 6.5 or avg_ph > 8.0 or avg_turbidity > 30:
            grade = "C"
        elif avg_ph < 6.8 or avg_ph > 7.5 or avg_turbidity > 15:
            grade = "B"

        cursor.close()
        conn.close()

        return {
            "status": "success",
            "data": {
                "impact": {
                    "water_saved_m3": total_m3,
                    "co2_saved_kg": co2_saved
                },
                "quality": {
                    "grade": grade,
                    "avg_ph": avg_ph,
                    "avg_turbidity": avg_turbidity
                }
            }
        }
        
    except Exception as e:
        print(f"🚨 DATABASE ERROR: {e}")
        return {"status": "error", "message": str(e)}


@app.get("/api/history/events")
def get_system_events():
    """Scans the database for Edge AI anomalies and formats them for the timeline"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Hunt for anomalies (ignoring 'Normal' status), get the latest 15
        cursor.execute("""
            SELECT time, anomaly_label, flow_l_min, ph, turbidity_ntu
            FROM sensor_data 
            WHERE anomaly_label != 'Normal'
            ORDER BY time DESC 
            LIMIT 15;
        """)
        
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        events = []
        for row in rows:
            timestamp = row[0]
            label = row[1]
            
            # Format the PostgreSQL timestamp into a clean French string
            formatted_date = timestamp.strftime("%d %b %Y à %H:%M")

            # Translate technical flags into user-friendly alerts
            if label == 'Leak':
                title = "Alerte: Fuite Détectée"
                desc = f"Débit anormal ({round(row[2], 1)} L/min). Sécurisation et coupure de la pompe en cours."
                event_type = "error"
            elif label == 'Chemical':
                title = "Alerte: Qualité de l'eau"
                desc = f"Paramètres hors-normes (pH: {round(row[3], 2)}, Turbidité: {round(row[4], 1)} NTU). Cycle UV activé."
                event_type = "warning"
            else:
                title = f"Intervention: {label}"
                desc = "Ajustement automatique par l'IA Edge."
                event_type = "info"

            events.append({
                "id": timestamp.isoformat(), # Unique ID for React
                "title": title,
                "date": formatted_date,
                "desc": desc,
                "type": event_type
            })
            
        return {"status": "success", "data": events}
        
    except Exception as e:
        print(f"🚨 DATABASE ERROR: {e}")
        return {"status": "error", "message": str(e)}
    


@app.get("/api/history/export/csv")
def export_csv_data():
    """Generates a downloadable CSV file of the raw sensor data"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Grab the last 1000 rows of raw data
        cursor.execute("""
            SELECT time, flow_l_min, ph, turbidity_ntu, anomaly_label 
            FROM sensor_data 
            ORDER BY time DESC 
            LIMIT 1000;
        """)
        
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        # Create a CSV file in the server's RAM
        stream = io.StringIO()
        writer = csv.writer(stream)
        
        # Write the Header row
        writer.writerow(['Timestamp', 'Flow (L/min)', 'pH', 'Turbidity (NTU)', 'System Status'])

        # Write the Data rows
        for row in rows:
            formatted_time = row[0].strftime("%Y-%m-%d %H:%M:%S")
            writer.writerow([formatted_time, round(row[1], 2), round(row[2], 2), round(row[3], 2), row[4]])

        # Stream the file back to React
        response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
        # This header tells the browser "Download this file, don't just display it"
        response.headers["Content-Disposition"] = "attachment; filename=NeuralWaterNet_RawData.csv"
        
        return response
        
    except Exception as e:
        print(f"🚨 CSV EXPORT ERROR: {e}")
        return {"status": "error", "message": str(e)}