FROM python:3.10-slim

# System dependencies for Chromium
RUN apt-get update && \
    apt-get install -y curl unzip wget \
    libglib2.0-0 libnss3 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libxss1 libxcomposite1 libxrandr2 \
    libasound2 libxtst6 libpangocairo-1.0-0 libgtk-3-0 && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy files into container
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright and required browsers
RUN playwright install --with-deps

# Run the script
CMD ["python", "cookie_stuffing_scanner.py"]
