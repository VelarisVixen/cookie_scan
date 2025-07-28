# Attribution Guard Scanner Backend API

A Node.js backend API for managing cybersecurity scans using a Python-based cookie stuffing scanner.

## Features

- 📁 File upload for URL lists (`.txt` files)
- 🔍 Automated scanning with Python/Playwright
- 🐳 Docker support with fallback to direct Python execution
- 📊 Real-time scan progress tracking
- 📄 CSV report generation and download
- 🖼️ Screenshot capture for suspicious sites

## API Endpoints

### POST `/api/scan`
Upload a `.txt` file containing URLs (one per line) and trigger a scan.

**Request:**
```bash
curl -X POST \
  -F "file=@urls.txt" \
  http://localhost:3000/api/scan
```

**Response:**
```json
{
  "scanId": "uuid",
  "message": "Scan initiated",
  "reportUrl": "/api/scan/{scanId}/report"
}
```

### GET `/api/scan/:scanId/progress`
Check the status of a scan.

**Response:**
```json
{
  "scanId": "uuid",
  "status": "pending" | "in_progress" | "completed" | "failed"
}
```

### GET `/api/scan/:scanId/report`
Download the CSV report after scan completion.

**CSV Format:**
```csv
URL,Status,Risk Level,Attribution Chain
https://example.com,Suspicious,High,Detected iframe tracking
```

### GET `/api/scan/:scanId/details`
Get detailed information about a scan.

**Response:**
```json
{
  "scanId": "uuid",
  "status": "completed",
  "hasReport": true,
  "screenshotCount": 3
}
```

### GET `/health`
Health check endpoint.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Ensure Python dependencies are available:**
   ```bash
   cd ..
   pip3 install playwright
   playwright install --with-deps
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Test the API:**
   ```bash
   # Check health
   curl http://localhost:3000/health
   
   # Create a test file
   echo -e "https://google.com\nhttps://example.com" > test_urls.txt
   
   # Upload and scan
   curl -X POST -F "file=@test_urls.txt" http://localhost:3000/api/scan
   ```

## Docker Integration

The backend automatically tries to use Docker first, then falls back to direct Python execution:

1. **Build the Docker image** (if Docker is available):
   ```bash
   cd ..
   docker build -t attribution-guard-scanner:latest .
   ```

2. **The API will automatically use Docker when available**

## File Structure

```
backend/
├── server.js          # Main Express server
├── package.json       # Node.js dependencies
└── README.md          # This file

../scans/{scanId}/     # Scan results directory
├── urls.txt           # Uploaded URLs
├── report.csv         # Transformed CSV report
├── cookie_stuffing_report.csv  # Original scanner output
└── screenshots/       # Captured screenshots
```

## Environment Variables

- `PORT`: Server port (default: 3000)

## Development

```bash
npm install -g nodemon
npm run dev
```

## Error Handling

The API includes comprehensive error handling:
- File validation (only `.txt` files)
- Scan status tracking
- Automatic fallback from Docker to Python
- Detailed error messages

## Security Notes

- File uploads are limited to `.txt` files
- Scans run in isolated directories
- Python script execution is sandboxed

## Troubleshooting

1. **Python not found**: Ensure Python 3 is installed
2. **Playwright issues**: Run `playwright install --with-deps`
3. **Docker not available**: The API will automatically fall back to direct Python execution
4. **Port in use**: Change the PORT environment variable

## Example Usage

```javascript
// Upload and scan
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/scan', {
  method: 'POST',
  body: formData
});

const { scanId } = await response.json();

// Poll for completion
const checkStatus = async () => {
  const statusResponse = await fetch(`/api/scan/${scanId}/progress`);
  const { status } = await statusResponse.json();
  
  if (status === 'completed') {
    // Download report
    window.open(`/api/scan/${scanId}/report`);
  } else if (status === 'failed') {
    console.error('Scan failed');
  } else {
    setTimeout(checkStatus, 2000); // Check again in 2 seconds
  }
};

checkStatus();
```