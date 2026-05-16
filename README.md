# **🌊 Neural WaterNet: Edge AI Architecture for Autonomous Water Treatment**

Neural WaterNet is an enterprise-grade IoT and Artificial Intelligence platform designed to monitor, analyze, and control distributed water treatment facilities in real time. By deploying Machine Learning models (Isolation Forests and LSTMs) directly to Edge devices, the system eliminates cloud-latency dependencies, ensuring deterministic, sub-150ms autonomous reactions to water anomalies such as pH, turbidity, and flow irregularities.

## **✨ Key Features**

* **🌍 Enterprise Fleet Management (V2):** Interactive dark-mode CartoDB mapping system tracking live telemetry from multiple nodes across Morocco.  
* **⚡ Sub-500ms Streaming:** End-to-end WebSocket architecture bridging the Edge Mosquitto MQTT broker to the FastAPI backend, pushing live data instantly to React clients.  
* **🔐 Role-Based Access Control (RBAC):** Secure dual-portal architecture where SuperAdmins access the global fleet map and Local Operators are restricted to isolated node controls.  
* **🤖 Edge AI Hardware Simulation:** Python-based Edge agents simulate industrial sensors and execute local anomaly thresholds before broadcasting payloads.  
* **📊 Glassmorphic UI/UX:** High-performance animated interface using Framer Motion, Tailwind CSS, Recharts, and automated client-side PDF reporting.

## **📂 Repository Structure (Monorepo)**

NeuralWaterNet/  
├── backend/                  \# API, AI Models, and Infrastructure  
│   ├── models/               \# Pre-trained ML & RL models (.keras, .pkl, .zip)  
│   ├── notebooks/            \# Jupyter notebooks for data pipeline & training  
│   ├── src/                  \# FastAPI server and Edge AI MQTT simulators  
│   ├── mosquitto/            \# MQTT broker configuration  
│   └── docker-compose.yml    \# TimescaleDB and Redis infrastructure  
│  
└── frontend/                 \# Client and Admin React application  
    ├── src/  
    │   ├── components/       \# UI components (Dashboard, Map, Tracking)  
    │   ├── store/            \# Zustand state management  
    │   └── firebase.ts       \# RBAC and authentication configuration  
    └── package.json

## **🚀 Local Development Setup**

To run the full ecosystem locally, open four separate terminal windows.

### **1\. Start the Infrastructure (Database & Message Broker)**

Ensure Docker Desktop is running, then deploy TimescaleDB and Mosquitto.

cd backend  
docker-compose up \-d

### **2\. Start the FastAPI Middleware**

Activate your virtual environment and start the API server.

cd backend

\# Windows  
venv\\Scripts\\activate

\# macOS/Linux  
source venv/bin/activate

pip install \-r requirements.txt  
uvicorn src.api:app \--reload \--port 8000

Wait until you see the log message: \[BACKEND MQTT\] Connected\!

### **3\. Start the Edge AI Simulator**

Launch the Raspberry Pi mock agent to begin publishing sensor telemetry.

cd backend

\# Activate virtual environment first  
python src/simulation/sensor\_mqtt\_agent.py

### **4\. Launch the React Frontend**

Start the web interface.

cd frontend  
npm install  
npm run dev

Navigate to: http://localhost:3000

## **🏗️ Technology Stack**

**Frontend**

* React 18  
* Vite  
* Tailwind CSS  
* Framer Motion  
* Recharts  
* Zustand  
* Firebase Authentication

**Backend**

* FastAPI  
* WebSockets  
* MQTT (Mosquitto)  
* TimescaleDB  
* Redis

**AI & Data Science**

* Python  
* Scikit-learn  
* TensorFlow/Keras  
* Isolation Forest  
* LSTM Networks  
* Reinforcement Learning

**Infrastructure**

* Docker Compose  
* Edge AI Simulators  
* Raspberry Pi Deployment Ready

## **🎯 Performance Targets**

* **Autonomous Response Time:** \< 150ms  
* **Frontend Streaming Latency:** \< 500ms  
* **Edge Processing:** Local inference without cloud dependency  
* **Scalability:** Multi-node monitoring across distributed treatment facilities

## **📌 Use Cases**

* Smart municipal water treatment plants  
* Industrial wastewater management  
* Remote water infrastructure monitoring  
* Real-time anomaly detection and automated corrective actions  
* Predictive maintenance of pumps and sensors

## **👨‍💻 Author**

**Ilyas Ezzahrioui** B.S. in Computer Science, specializing in Big Data Analytics

Al Akhawayn University

Edge AI Engineer @ VIC DeepTech
