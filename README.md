# Neural WaterNet: Autonomous Edge AI for Water Treatment

Neural WaterNet is an end-to-end industrial IoT platform designed for autonomous water quality monitoring and tank management. It utilizes a hybrid AI approach combining Deep Learning for anomaly detection and Reinforcement Learning for real-time hardware control.

## 🚀 System Architecture


The system is fully containerized using **Docker**, optimized for edge devices like the **Raspberry Pi 4**, featuring:
* **IoT Simulation:** Realistic sensor data generation via Python.
* **Time-Series Database:** TimescaleDB for high-ingestion big data storage.
* **Monitoring:** Real-time Grafana dashboards for visual surveillance.
* **Deep Learning Anomaly Detection:** An Autoencoder (TensorFlow) monitoring flow patterns for leaks and surges.
* **Reinforcement Learning Controller:** A PPO (Proximal Policy Optimization) agent that autonomously manages a diversion valve and extraction pump.

## 🧠 The AI Strategy
### 1. Hybrid Anomaly Detection
We use an **Autoencoder** trained on normal operating conditions. When reconstruction loss exceeds a dynamic threshold ($Loss > 0.02784$), a danger signal is triggered.

### 2. Autonomous Control (RL)
The PPO agent was trained in a custom **Gymnasium** environment. Through reward engineering, it learned to:
* **Divert Contaminated Water:** Instantly route toxic water to a recycle loop.
* **Manage Capacity:** Dynamically operate the extraction pump to keep the tank level in the "Sweet Spot" (30% - 70%) while preventing overflows.

## 🛠️ Edge Optimization for Raspberry Pi
To ensure sub-150ms inference on constrained hardware:
- **CPU-Only Builds:** Utilizes lightweight versions of TensorFlow and Stable-Baselines3.
- **Efficient Inference:** Pre-scaled inputs and NumPy-optimized state transitions.