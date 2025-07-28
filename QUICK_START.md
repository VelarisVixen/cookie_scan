# 🚀 Attribution Guard Scanner - Quick Start

## ✨ Start the Backend (One Command!)

```bash
./start-backend.sh
```

That's it! This single command will:
- ✅ Set up Python virtual environment
- ✅ Install all dependencies
- ✅ Download browser engines
- ✅ Start the API server

## 🔗 API is now running at: http://localhost:3000

## 📱 Test the API

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Upload and Scan URLs
```bash
# Create test file
echo -e "https://google.com\nhttps://example.com" > test_urls.txt

# Upload and scan
curl -X POST -F "file=@test_urls.txt" http://localhost:3000/api/scan
```

### 3. Check Progress
```bash
# Use the scanId from the previous response
curl http://localhost:3000/api/scan/{SCAN_ID}/progress
```

### 4. Download Report (when completed)
```bash
curl -O http://localhost:3000/api/scan/{SCAN_ID}/report
```

## 🌐 Web Interface Test

Create this HTML file to test uploads:

```html
<!DOCTYPE html>
<html>
<head><title>Attribution Guard Scanner</title></head>
<body>
    <h1>Upload URLs for Scanning</h1>
    <form action="http://localhost:3000/api/scan" method="post" enctype="multipart/form-data">
        <input type="file" name="file" accept=".txt" required>
        <button type="submit">Upload and Scan</button>
    </form>
</body>
</html>
```

## 📊 Expected Output

**Scan Response:**
```json
{
  "scanId": "uuid-here",
  "message": "Scan initiated",
  "reportUrl": "/api/scan/{uuid}/report"
}
```

**Progress Response:**
```json
{
  "scanId": "uuid-here", 
  "status": "completed"
}
```

**Report Format (CSV):**
```csv
URL,Status,Risk Level,Attribution Chain
https://example.com,Suspicious,High,Detected iframe tracking
```

## 🛠️ Troubleshooting

If something doesn't work:

1. **Check the logs** in the terminal where you ran the script
2. **Verify Python is working**: `source venv/bin/activate && python --version`
3. **Verify Node.js is working**: `node --version`
4. **Check if port 3000 is free**: `lsof -i :3000`

## 🎯 What This Does

The backend automatically:
- Accepts `.txt` files with URLs (one per line)
- Runs a Python scanner using Playwright to detect:
  - Cookie stuffing
  - Hidden tracking iframes  
  - Suspicious affiliate redirects
- Captures screenshots of suspicious pages
- Generates detailed CSV reports
- Provides real-time scan progress

## ✅ Success! 

Your cybersecurity scanning API is now ready to use! 🎉