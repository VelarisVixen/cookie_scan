#!/bin/bash

echo "🛠️  Building Docker image..."
docker build -t cookie-detector .

echo "🚀 Running container..."
docker run --rm -v "$(pwd)/urls.txt:/app/urls.txt" -v "$(pwd)/screenshots:/app/screenshots" -v "$(pwd)/cookie_stuffing_report.csv:/app/cookie_stuffing_report.csv" cookie-detector
