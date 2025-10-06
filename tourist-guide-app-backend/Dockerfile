# -------------------------------
# 1️⃣ Base image
# -------------------------------
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# -------------------------------
# 2️⃣ Install dependencies
# -------------------------------
# Prevent interactive prompts & speed up installs
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Copy dependency file first (for caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# -------------------------------
# 3️⃣ Copy project files
# -------------------------------
COPY . .

# -------------------------------
# 4️⃣ Expose port (Railway will override)
# -------------------------------
EXPOSE 8000

# -------------------------------
# 5️⃣ Run FastAPI app
# -------------------------------
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

