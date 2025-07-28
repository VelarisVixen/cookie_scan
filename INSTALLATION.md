# 📦 Attribution Guard Scanner - Installation Guide

## 🎯 Quick Installation

You have downloaded the **Attribution Guard Scanner Backend** - a complete cybersecurity API solution!

### 📋 Prerequisites

Make sure your system has:
- **Node.js** (v16+ recommended)
- **Python 3** (with pip)
- **Git** (optional)

### 🚀 Installation Steps

1. **Extract the ZIP file:**
   ```bash
   unzip attribution-guard-backend-clean.zip
   cd attribution-guard-backend
   ```

2. **Run the one-command installer:**
   ```bash
   chmod +x start-backend.sh
   ./start-backend.sh
   ```

   This automatically:
   - ✅ Creates Python virtual environment
   - ✅ Installs all Python dependencies
   - ✅ Installs all Node.js dependencies
   - ✅ Downloads Playwright browsers
   - ✅ Sets up directories
   - ✅ Starts the API server

3. **Your API is now running at: http://localhost:3000**

### 🧪 Test the Installation

```bash
# Health check
curl http://localhost:3000/health

# Create test file
echo -e "https://google.com\nhttps://example.com" > test.txt

# Upload and scan
curl -X POST -F "file=@test.txt" http://localhost:3000/api/scan
```

## 📁 What's Included

```
attribution-guard-backend/
├── 🚀 start-backend.sh           # One-command installer & launcher
├── 🐍 cookie_stuffing_scanner.py # Python scanning engine
├── 🐳 Dockerfile                 # Docker container setup
├── 🏗️ backend/                   # Node.js Express API
│   ├── server.js                # Main API server
│   ├── package.json             # Dependencies
│   └── test-api.js              # Testing script
├── 📖 QUICK_START.md             # Quick start guide
├── 📚 README-BACKEND.md          # Complete documentation
├── 🧪 test_urls.txt              # Sample test file
└── 🌐 web-dashboard/             # Optional web interface
```

## 🔧 Manual Installation (if needed)

If the automatic installer doesn't work:

```bash
# 1. Install Python dependencies
python3 -m venv venv
source venv/bin/activate
pip install playwright
playwright install chromium

# 2. Install Node.js dependencies
cd backend
npm install

# 3. Start server
npm start
```

## 🌐 API Endpoints

Once running, your API provides:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API documentation |
| `GET` | `/health` | Health check |
| `POST` | `/api/scan` | Upload & scan URLs |
| `GET` | `/api/scan/:id/progress` | Check scan status |
| `GET` | `/api/scan/:id/report` | Download CSV report |

## 📊 Usage Example

```bash
# 1. Upload URLs and start scan
curl -X POST -F "file=@urls.txt" http://localhost:3000/api/scan
# Returns: {"scanId": "uuid", "message": "Scan initiated"}

# 2. Check progress
curl http://localhost:3000/api/scan/{scanId}/progress
# Returns: {"scanId": "uuid", "status": "completed"}

# 3. Download report
curl -O http://localhost:3000/api/scan/{scanId}/report
# Downloads: scan_report_{scanId}.csv
```

## 🎨 Web Dashboard (Optional)

The package includes a web dashboard:

```bash
cd web-dashboard
npm install
npm run dev
# Visit: http://localhost:5173
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Port 3000 in use:**
   ```bash
   export PORT=3001
   ./start-backend.sh
   ```

2. **Python not found:**
   ```bash
   # Ubuntu/Debian
   sudo apt install python3 python3-pip python3-venv
   
   # macOS
   brew install python3
   ```

3. **Node.js not found:**
   ```bash
   # Install via NodeSource
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Playwright browser issues:**
   ```bash
   source venv/bin/activate
   playwright install chromium --with-deps
   ```

## 🔒 Security Features

- ✅ File uploads limited to `.txt` files only
- ✅ Scans run in isolated directories
- ✅ No code execution from uploads
- ✅ Proper input validation
- ✅ Error handling and logging

## 🎯 What the Scanner Detects

The cybersecurity scanner identifies:
- **Cookie stuffing** attacks
- **Hidden tracking iframes**
- **Suspicious affiliate redirects**
- **Attribution hijacking**
- **Malicious tracking scripts**

## 📈 Production Deployment

For production use:

```bash
# Install PM2 process manager
npm install -g pm2

# Start with PM2
cd backend
pm2 start server.js --name "attribution-guard-api"
pm2 startup
pm2 save
```

## 📞 Support

- 📖 **Documentation:** See `README-BACKEND.md`
- 🚀 **Quick Start:** See `QUICK_START.md`
- 🧪 **Testing:** Run `node backend/test-api.js`

## ✅ Success!

Your Attribution Guard Scanner is now ready to:
- Accept URL uploads via REST API
- Run automated cybersecurity scans
- Generate detailed CSV reports
- Capture screenshots of suspicious pages
- Provide real-time scan progress

**🎉 Happy scanning!**