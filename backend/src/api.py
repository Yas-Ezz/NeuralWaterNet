import os
import io
import csv
import json
import asyncio
import psycopg2
from dotenv import load_dotenv
from pydantic import BaseModel
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import paho.mqtt.client as mqtt
from paho.mqtt.enums import CallbackAPIVersion

# Load secrets from the .env file
load_dotenv()

# --- 1. WEBSOCKET CONNECTION MANAGER ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"🔌 [WEBSOCKET] New client connected! Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"🔌 [WEBSOCKET] Client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

# --- 2. DATABASE HELPER ---
def get_db_connection():
    return psycopg2.connect(
        host="localhost", 
        database="waternet_db", 
        user=os.getenv("POSTGRES_USER", "admin"), 
        password=os.getenv("POSTGRES_PASSWORD", "password123"), 
        port="5438"
    )

def save_mqtt_to_db(payload, system_id):
    """Saves the live MQTT data into TimescaleDB so history/CSV exports still work!"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Ensure the table exists with the new V2 columns if needed
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sensor_data (
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
        
        cursor.execute("""
            INSERT INTO sensor_data (time, system_id, flow_l_min, ph, turbidity_ntu, temp_c, tank_level, pump1_state, uv_state, anomaly_label)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (
            payload['timestamp'], system_id, payload['flow_l_min'], payload['ph'], 
            payload['turbidity_ntu'], payload['temp_c'], payload['tank_level_percent'], 
            payload['pump1_state'], payload['uv_state'], 'Normal'
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"🚨 DB INSERT ERROR: {e}")

# --- 3. MQTT SETUP ---
MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC = "swe/sensors/+"

def on_connect(client, userdata, flags, rc, properties):
    if rc == 0:
        print(f"✅ [BACKEND MQTT] Connected! Subscribing to {MQTT_TOPIC}")
        client.subscribe(MQTT_TOPIC)

def on_message(client, userdata, msg):
    payload_str = msg.payload.decode()
    system_id = msg.topic.split("/")[-1]
    
    print(f"📥 [MQTT RECV] {system_id}: {payload_str}")
    payload = json.loads(payload_str)
    
    # 1. Save to Database for history
    save_mqtt_to_db(payload, system_id)
    
    # 2. Push to React instantly via WebSockets
    websocket_payload = {
        "event": "new_sensor_data",
        "system_id": system_id,
        "data": payload
    }
    loop = userdata['loop']
    asyncio.run_coroutine_threadsafe(manager.broadcast(json.dumps(websocket_payload)), loop)

# --- 4. FASTAPI LIFECYCLE ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    loop = asyncio.get_running_loop()
    mqtt_client = mqtt.Client(CallbackAPIVersion.VERSION2, client_id="FastAPI_Backend", userdata={'loop': loop})
    mqtt_client.on_connect = on_connect
    mqtt_client.on_message = on_message
    
    mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
    mqtt_client.loop_start()
    
    yield 
    
    mqtt_client.loop_stop()
    mqtt_client.disconnect()

app = FastAPI(title="Neural WaterNet Enterprise API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 5. WEBSOCKET ENDPOINT (NEW) ---
@app.websocket("/api/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# --- 6. EXISTING REST ENDPOINTS (UNCHANGED) ---

@app.get("/api/dashboard/latest")
def get_latest_dashboard_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT tank_level, ph, turbidity_ntu FROM sensor_data ORDER BY time DESC LIMIT 1;")
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
        return {"status": "error", "message": str(e)}

class DeviceCommand(BaseModel):
    device_name: str
    state: int

@app.post("/api/control/device")
def control_device(command: DeviceCommand):
    print(f"🚨 COMMAND RECEIVED: Turn {command.device_name} to {'ON' if command.state == 1 else 'OFF'}")
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS system_commands (
                id SERIAL PRIMARY KEY, timestamp TIMESTAMPTZ DEFAULT NOW(),
                device_name VARCHAR(50), command_state INT, is_executed BOOLEAN DEFAULT FALSE
            );
        """)
        cursor.execute("INSERT INTO system_commands (device_name, command_state) VALUES (%s, %s);", 
                       (command.device_name, command.state))
        conn.commit()
        cursor.close()
        conn.close()
        return {"status": "success", "message": f"{command.device_name} updated to {command.state}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

class SystemMode(BaseModel):
    mode_name: str

class AlertSetting(BaseModel):
    alert_name: str
    is_active: bool

@app.post("/api/control/mode")
def set_system_mode(mode_data: SystemMode):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS system_settings (
                setting_key VARCHAR(50) PRIMARY KEY, setting_value VARCHAR(50), updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        """)
        cursor.execute("""
            INSERT INTO system_settings (setting_key, setting_value) VALUES ('active_mode', %s)
            ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW();
        """, (mode_data.mode_name,))
        conn.commit()
        cursor.close()
        conn.close()
        return {"status": "success"}
    except Exception as e:
        return {"status": "error"}

@app.post("/api/control/alert")
def set_alert_setting(setting: AlertSetting):
    return {"status": "success", "message": f"Alert {setting.alert_name} updated"}

@app.get("/api/tracking/weekly")
def get_weekly_consumption():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT TRIM(TO_CHAR(time, 'Day')) as day_name, SUM(flow_l_min) as total_flow
            FROM sensor_data WHERE time >= NOW() - INTERVAL '7 days'
            GROUP BY DATE(time), TRIM(TO_CHAR(time, 'Day')) ORDER BY DATE(time) ASC;
        """)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        day_map = {"Monday": "Lun", "Tuesday": "Mar", "Wednesday": "Mer", "Thursday": "Jeu", "Friday": "Ven", "Saturday": "Sam", "Sunday": "Dim"}
        chart_data = [{"name": day_map.get(r[0], r[0][:3]), "pv": round(r[1] / 10, 1)} for r in rows]
        return {"status": "success", "data": chart_data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/tracking/summary")
def get_tracking_summary():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT SUM(flow_l_min) FROM sensor_data;")
        total_m3 = round((cursor.fetchone()[0] or 0) / 1000, 1)
        
        cursor.execute("SELECT AVG(ph), AVG(turbidity_ntu) FROM sensor_data WHERE time >= NOW() - INTERVAL '24 hours';")
        quality_row = cursor.fetchone()
        avg_ph = round(quality_row[0] or 7.0, 2)
        avg_turbidity = round(quality_row[1] or 10.0, 1)
        
        grade = "C" if avg_ph < 6.5 or avg_ph > 8.0 or avg_turbidity > 30 else ("B" if avg_ph < 6.8 or avg_ph > 7.5 or avg_turbidity > 15 else "A")
        cursor.close()
        conn.close()
        return {"status": "success", "data": {"impact": {"water_saved_m3": total_m3, "co2_saved_kg": round(total_m3 * 0.6, 1)}, "quality": {"grade": grade, "avg_ph": avg_ph, "avg_turbidity": avg_turbidity}}}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/history/events")
def get_system_events():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT time, anomaly_label, flow_l_min, ph, turbidity_ntu FROM sensor_data WHERE anomaly_label != 'Normal' ORDER BY time DESC LIMIT 15;")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        events = []
        for row in rows:
            label = row[1]
            if label == 'Leak':
                title, desc, event_type = "Alerte: Fuite Détectée", f"Débit anormal ({round(row[2], 1)} L/min).", "error"
            elif label == 'Chemical':
                title, desc, event_type = "Alerte: Qualité de l'eau", f"pH: {round(row[3], 2)}, Turbidité: {round(row[4], 1)} NTU.", "warning"
            else:
                title, desc, event_type = f"Intervention: {label}", "Ajustement IA.", "info"
            events.append({"id": row[0].isoformat(), "title": title, "date": row[0].strftime("%d %b %Y à %H:%M"), "desc": desc, "type": event_type})
        return {"status": "success", "data": events}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/history/export/csv")
def export_csv_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT time, flow_l_min, ph, turbidity_ntu, anomaly_label FROM sensor_data ORDER BY time DESC LIMIT 1000;")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        stream = io.StringIO()
        writer = csv.writer(stream)
        writer.writerow(['Timestamp', 'Flow (L/min)', 'pH', 'Turbidity (NTU)', 'System Status'])
        for row in rows:
            writer.writerow([row[0].strftime("%Y-%m-%d %H:%M:%S"), round(row[1], 2), round(row[2], 2), round(row[3], 2), row[4]])

        response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
        response.headers["Content-Disposition"] = "attachment; filename=NeuralWaterNet_RawData.csv"
        return response
    except Exception as e:
        return {"status": "error", "message": str(e)}