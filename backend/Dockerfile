# ==============================================================================
# AEGISCLOUD REST API BACKEND DOCKER CONTAINER
# For deployment on AWS App Runner, AWS ECS, or AWS EC2 Docker
# ==============================================================================

FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . .

# Expose REST API Port
EXPOSE 8080

# Environment variables
ENV PORT=8080

# Run FastAPI Server
CMD ["python", "server.py"]
