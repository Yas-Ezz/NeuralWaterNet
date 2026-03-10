# Neural WaterNet: Autonomous Edge AI for Water Treatment

Neural WaterNet is an end-to-end industrial IoT platform designed for autonomous water quality monitoring and tank management. It utilizes a hybrid AI approach combining Deep Learning for anomaly detection and Reinforcement Learning for real-time hardware control.

---

# 🚀 System Architecture

The system is fully containerized using **Docker**, optimized for edge devices like the **Raspberry Pi 4**, and includes the following components:

- **IoT Simulation:** Realistic sensor data generation via Python.
- **Time-Series Database:** TimescaleDB for high-ingestion big data storage.
- **Monitoring:** Real-time Grafana dashboards for visual surveillance.
- **Deep Learning Anomaly Detection:** An Autoencoder and Isolation Forest monitoring flow patterns for leaks and surges.
- **Reinforcement Learning Controller:** A PPO (Proximal Policy Optimization) agent that autonomously manages a diversion valve and extraction pump.

---

# 📂 Repository Structure

```
/models
    ppo_waternet.zip        # Pre-trained PPO RL agent
    autoencoder.keras       # Autoencoder weights
    isolation_forest.pkl    # Isolation Forest model
    scaler.pkl              # Data scaler

/src
    ai_service.py           # Main AI inference service
    sensor_mock.py          # Sensor data simulation
    rl_env.py               # Reinforcement learning environment

/notebooks
    Data extraction
    Preprocessing
    Model training pipelines

/docker
    Dockerfiles for building the application container
```

---

# ⚙️ How to Run the Project Locally

## 1️⃣ Prerequisites

Make sure you have the following installed:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## 2️⃣ Clone and Boot the Infrastructure

Open your terminal and run:

```bash
git clone https://github.com/Yas-Ezz/NeuralWaterNet.git
cd NeuralWaterNet
docker-compose up -d
```

This will start:

- TimescaleDB database
- Grafana dashboard
- AI application container

---

## 3️⃣ Start the IoT Sensor Simulation

The AI system requires sensor data to operate. Open a **new terminal window** and run:

```bash
docker exec -it neural_waternet_app python src/simulation/sensor_mock.py
```

This script generates **realistic water flow sensor data**.

---

## 4️⃣ Start the AI Brain

Open **another terminal window** and launch the AI inference engine:

```bash
docker exec -it neural_waternet_app python src/ai_service.py
```

This script will:

- Load the **Autoencoder model**
- Load the **PPO Reinforcement Learning agent**
- Read **live sensor data**
- Output **control commands** for the pump and valve system

---

## 5️⃣ View the Dashboard

Open your browser and navigate to:

```
http://localhost:3001
```

Default login:

```
Username: admin
Password: admin
```

From Grafana, connect to the **PostgreSQL / TimescaleDB container** to visualize:

- Water tank levels
- Flow rates
- Detected anomalies
- System behavior in real time

---

# 🛠️ Edge Deployment (Raspberry Pi Notes)

Currently, the project uses:

```
src/simulation/sensor_mock.py
```

to generate **simulated sensor data** for testing on a standard computer.

To deploy on real hardware:

### Replace Sensor Simulation

Replace the mock script with a **GPIO sensor interface** using libraries such as:

- `RPi.GPIO`
- `spidev`

This will allow the system to read **real water sensors** connected to the Raspberry Pi.

### Keep the Same AI Architecture

The following components remain unchanged:

- Docker architecture
- `/models` directory
- AI inference service

This ensures that the AI logic **ports seamlessly to the ARM architecture of the Raspberry Pi**.

---

# 📊 Project Highlights

- Edge AI system for industrial water monitoring
- Hybrid **Deep Learning + Reinforcement Learning**
- Real-time **IoT data streaming**
- **Grafana monitoring dashboards**
- **Dockerized architecture for easy deployment**
- Compatible with **Raspberry Pi edge hardware**

---

# 📜 License

This project is open-source and available under the MIT License.