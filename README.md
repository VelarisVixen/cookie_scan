# 🕵️ Cookie Stuffing Scanner (Dockerized)

This tool scans a list of URLs for suspicious affiliate cookie stuffing and logs any findings, screenshots, and HTML content.

## 📦 Requirements

- Docker Desktop (Mac, Linux)
- `urls.txt` with one URL per line

## 🚀 Run the Scanner

```bash
./run.sh
```

This will:
- Build the Docker container
- Mount your `urls.txt` and output paths
- Run the scanner and save output to your local system

## 📥 Input
- `urls.txt`: A plain-text file with URLs to scan

## 📤 Output
- `cookie_stuffing_report.csv`: CSV report of findings
- `/screenshots/`: Screenshot + HTML capture of suspicious pages