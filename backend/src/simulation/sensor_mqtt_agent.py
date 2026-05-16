import time
import json
import random
from datetime import datetime, timezone
import paho.mqtt.client as mqtt

# --- CONFIGURATION ---
MQTT_BROKER = "localhost" # Connects to the Mosquitto container
MQTT_PORT = 1883
SYSTEM_ID = "SWE-001"     # The ID requested in the specs
TOPIC = f"swe/sensors/{SYSTEM_ID}"

# Callback to verify connection
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"✅ [EDGE AI] Connected to MQTT Broker! Broadcasting to: {TOPIC}")
    else:
        print(f"❌ [EDGE AI] Failed to connect, return code {rc}")

# Initialize the MQTT Client
client = mqtt.Client(client_id=f"Agent_{SYSTEM_ID}")
client.on_connect = on_connect

try:
    # Connect to the broker and start the background thread
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_start()

    print("🌱 Booting up Neural WaterNet Edge Agent...")
    
    # The Autonomous AI Loop
    while True:
        # Generate realistic data based on the Cahier des Charges requirements
        payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "flow_l_min": round(random.uniform(10.0, 15.0), 2),
            "ph": round(random.uniform(6.8, 7.5), 2), # Optimal pH range
            "turbidity_ntu": round(random.uniform(5.0, 20.0), 2),
            "temp_c": round(random.uniform(20.0, 25.0), 1),
            "tank_level_percent": round(random.uniform(40.0, 95.0), 1),
            "pump1_state": True,
            "pump2_state": False,
            "uv_state": True
        }

        # Publish the data to the MQTT Megaphone!
        client.publish(TOPIC, json.dumps(payload))
        
        print(f"📡 [BROADCAST] pH: {payload['ph']} | Turbidity: {payload['turbidity_ntu']} NTU | Tank: {payload['tank_level_percent']}%")
        
        # Publish every 2 seconds as per the specs
        time.sleep(2) 

except KeyboardInterrupt:
    print("\n🛑 Shutting down AI Agent...")
    client.loop_stop()
    client.disconnect()
except Exception as e:
    print(f"⚠️ Error: {e}")