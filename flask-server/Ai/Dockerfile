FROM python:3.11-slim
# ---------- Base image with CUDA ----------
FROM nvidia/cuda:12.1.1-runtime-ubuntu22.04

#---------- System setup ----------
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    git wget curl python3 python3-pip python3-venv && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

#---------- Dependencies ----------
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cu121

#---------- Copy app code ----------
COPY . .

#---------- Expose port and run ----------
EXPOSE 8000
CMD ["uvicorn", "aiapp:app", "--host", "0.0.0.0", "--port", "8000"]