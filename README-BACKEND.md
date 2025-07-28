# Attribution Guard Scanner - Complete Backend Setup

🚀 **Ready-to-run cybersecurity scanning backend API built with Node.js + Express and Python**

## 🎯 Overview

This backend API provides a complete solution for managing cybersecurity scans using a Python-based cookie stuffing scanner with Playwright automation. The system accepts URL lists, runs scans in isolated environments, and provides downloadable reports.

## ✨ Features

- 📁 **File Upload**: Accept `.txt` files with URLs (one per line)
- 🔍 **Automated Scanning**: Python/Playwright-based scanner with headless browser automation
- 🐳 **Docker Integration**: Automatic Docker fallback to direct Python execution
- 📊 **Real-time Progress**: Live scan status tracking via REST API
- 📄 **CSV Reports**: Structured reports with risk levels and attribution chains
- 🖼️ **Screenshot Capture**: Automatic screenshot capture for suspicious sites
- 🛡️ **Security**: File validation, isolated scan directories, proper error handling

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Frontend      │───▶│   Node.js API    │───▶│  Python Scanner     │
│   (Upload UI)   │    │   (Express.js)   │    │  (Playwright)       │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   File System    │
                       │  /scans/{uuid}/  │
                       └──────────────────┘
```

## 🚀 Quick Start

### 1. One-Command Launch
```bash
./start-backend.sh
```

This script automatically:
- ✅ Sets up Python virtual environment
- ✅ Installs all dependencies (Node.js + Python)
- ✅ Downloads Playwright browsers
- ✅ Creates necessary directories
- ✅ Starts the API server

### 2. Manual Setup (if needed)
```bash
# Install Python dependencies
python3 -m venv venv
source venv/bin/activate
pip install playwright
playwright install chromium

# Install Node.js dependencies
cd backend
npm install

# Start server
npm start
```

## 📋 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API documentation and available endpoints |
| `GET` | `/health` | Health check |
| `POST` | `/api/scan` | Upload URLs and trigger scan |
| `GET` | `/api/scan/:id/progress` | Check scan status |
| `GET` | `/api/scan/:id/report` | Download CSV report |
| `GET` | `/api/scan/:id/details` | Get scan details |

### 📤 Upload and Scan
```bash
# Create test file
echo -e "https://google.com\nhttps://example.com\nhttps://github.com" > test_urls.txt

# Upload and scan
curl -X POST \
  -F "file=@test_urls.txt" \
  http://localhost:3000/api/scan

# Response
{
  "scanId": "123e4567-e89b-12d3-a456-426614174000",
  "message": "Scan initiated",
  "reportUrl": "/api/scan/123e4567-e89b-12d3-a456-426614174000/report"
}
```

### 📊 Monitor Progress
```bash
curl http://localhost:3000/api/scan/123e4567-e89b-12d3-a456-426614174000/progress

# Response
{
  "scanId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "completed"  # pending | in_progress | completed | failed
}
```

### 📄 Download Report
```bash
curl -O http://localhost:3000/api/scan/123e4567-e89b-12d3-a456-426614174000/report
```

## 📊 Report Format

The CSV report follows this structure:

```csv
URL,Status,Risk Level,Attribution Chain
https://example.com,Suspicious,High,Detected iframe tracking
https://another.com,Suspicious,Medium,Detected request tracking
```

**Risk Levels:**
- `High`: Hidden iframes and cookie stuffing
- `Medium`: Suspicious tracking requests
- `Low`: Minor tracking concerns

## 📁 File Structure

```
workspace/
├── start-backend.sh           # 🚀 One-command startup script
├── cookie_stuffing_scanner.py # 🐍 Python scanner script
├── Dockerfile                 # 🐳 Docker container setup
├── requirements.txt           # 📦 Python dependencies
├── backend/                   # 🏗️ Node.js API
│   ├── server.js             # 🎯 Main Express server
│   ├── package.json          # 📦 Node.js dependencies
│   ├── test-api.js           # 🧪 API testing script
│   └── README.md             # 📖 Backend documentation
├── scans/                    # 📁 Scan results storage
│   └── {scan-id}/           # 🔍 Individual scan folders
│       ├── urls.txt         # 📝 Input URLs
│       ├── report.csv       # 📊 Generated report
│       └── screenshots/     # 🖼️ Captured images
└── venv/                    # 🐍 Python virtual environment
```

## 🔧 Configuration

### Environment Variables
- `PORT`: API server port (default: 3000)

### Scanner Configuration
The Python scanner can be customized by editing `cookie_stuffing_scanner.py`:
- Suspicious keywords
- Screenshot settings
- Timeout values
- Browser options

## 🧪 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:3000/health

# API documentation
curl http://localhost:3000

# Full scan test
cd backend
node test-api.js
```

### Frontend Testing (HTML Upload Form)
```html
<!DOCTYPE html>
<html>
<body>
    <form action="http://localhost:3000/api/scan" method="post" enctype="multipart/form-data">
        <input type="file" name="file" accept=".txt">
        <button type="submit">Upload and Scan</button>
    </form>
</body>
</html>
```

## 🐳 Docker Integration

The system automatically tries Docker first, then falls back to direct Python execution:

```bash
# Build Docker image (optional)
docker build -t attribution-guard-scanner:latest .

# The API will automatically use Docker when available
```

## 🛠️ Troubleshooting

### Common Issues

1. **Python not found**
   ```bash
   sudo apt install python3 python3-venv python3-pip
   ```

2. **Node.js not found**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Playwright installation fails**
   ```bash
   source venv/bin/activate
   playwright install chromium
   ```

4. **Port 3000 in use**
   ```bash
   export PORT=3001
   npm start
   ```

### Debug Mode
```bash
# Enable detailed logging
DEBUG=* npm start
```

## 🔒 Security Notes

- ✅ File uploads limited to `.txt` files only
- ✅ Scans run in isolated directories
- ✅ Python execution is sandboxed
- ✅ No code execution from uploads
- ✅ Proper error handling and validation

## 🚀 Production Deployment

### Using PM2 (Process Manager)
```bash
npm install -g pm2
pm2 start backend/server.js --name "attribution-guard-api"
pm2 startup
pm2 save
```

### Using systemd
```bash
sudo nano /etc/systemd/system/attribution-guard.service
sudo systemctl enable attribution-guard
sudo systemctl start attribution-guard
```

## 📞 Support

### API Status Codes
- `200`: Success
- `400`: Bad request (invalid file, etc.)
- `404`: Scan not found
- `500`: Internal server error

### Logs Location
- API logs: Console output
- Scan logs: Per-scan directory
- System logs: `/var/log/syslog`

## 🎉 Success!

Your backend is now ready! The API provides a complete cybersecurity scanning solution with:

✅ **Easy setup** - One command to run everything  
✅ **Flexible deployment** - Docker or direct Python execution  
✅ **Real-time monitoring** - Live scan progress tracking  
✅ **Comprehensive reports** - Detailed CSV outputs with screenshots  
✅ **Production ready** - Proper error handling and logging  

**API is running at: http://localhost:3000** 🎯