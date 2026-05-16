# Use Python 3.10-slim
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# SPEED TRICK 1: Install PyTorch first (CPU only) so it doesn't crash the RAM
RUN pip install --no-cache-dir --default-timeout=1000 torch --extra-index-url https://download.pytorch.org/whl/cpu

# SPEED TRICK 2: Install TensorFlow second, separately
RUN pip install --no-cache-dir --default-timeout=1000 tensorflow-cpu>=2.17.0

# SPEED TRICK 3: Install the rest of the tools
RUN pip install --no-cache-dir --default-timeout=1000 numpy>=2.0.0 pandas>=2.2.2 scikit-learn>=1.5.0 psycopg2-binary==2.9.9 stable-baselines3 shimmy

# Copy the source code
COPY . .

# Default command: Keep container running so we can exec into it
CMD ["tail", "-f", "/dev/null"]