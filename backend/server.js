const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Storage configuration for multer
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
            cb(null, true);
        } else {
            cb(new Error('Only .txt files are allowed!'), false);
        }
    }
});

// In-memory storage for scan status
const scanStatus = new Map();

// Ensure scans directory exists
const SCANS_DIR = path.join(process.cwd(), '..', 'scans');
fs.ensureDirSync(SCANS_DIR);

// Helper function to run Docker container or Python script directly
async function runScan(scanId, urlsFilePath) {
    return new Promise((resolve, reject) => {
        const scanDir = path.join(SCANS_DIR, scanId);
        
        // Update status to in_progress
        scanStatus.set(scanId, 'in_progress');
        
        // Try Docker first, fallback to direct Python execution
        let dockerProcess = spawn('docker', [
            'run', '--rm',
            '-v', `${scanDir}:/app/scan`,
            '-w', '/app',
            'attribution-guard-scanner:latest',
            'python', 'cookie_stuffing_scanner.py', 'scan/urls.txt'
        ]);
        
        let output = '';
        let errorOutput = '';
        
        dockerProcess.stdout.on('data', (data) => {
            output += data.toString();
            console.log(`Docker stdout: ${data}`);
        });
        
        dockerProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.log(`Docker stderr: ${data}`);
        });
        
        dockerProcess.on('close', (code) => {
            if (code === 0) {
                scanStatus.set(scanId, 'completed');
                resolve({ success: true, output });
            } else {
                console.log('Docker failed, trying direct Python execution...');
                runPythonDirectly(scanId, urlsFilePath)
                    .then(resolve)
                    .catch(reject);
            }
        });
        
        dockerProcess.on('error', (error) => {
            console.log('Docker not available, trying direct Python execution...');
            runPythonDirectly(scanId, urlsFilePath)
                .then(resolve)
                .catch(reject);
        });
    });
}

// Fallback function to run Python script directly
async function runPythonDirectly(scanId, urlsFilePath) {
    return new Promise((resolve, reject) => {
        const scanDir = path.join(SCANS_DIR, scanId);
        const pythonScriptPath = path.join(process.cwd(), '..', 'cookie_stuffing_scanner.py');
        
        // Copy Python script to scan directory
        fs.copySync(pythonScriptPath, path.join(scanDir, 'cookie_stuffing_scanner.py'));
        
        // Copy requirements.txt
        const requirementsPath = path.join(process.cwd(), '..', 'requirements.txt');
        if (fs.existsSync(requirementsPath)) {
            fs.copySync(requirementsPath, path.join(scanDir, 'requirements.txt'));
        }
        
        // Update status to in_progress
        scanStatus.set(scanId, 'in_progress');
        
        // Use the virtual environment Python
        const pythonPath = path.join(process.cwd(), '..', 'venv', 'bin', 'python');
        const pythonProcess = spawn(pythonPath, ['cookie_stuffing_scanner.py', 'urls.txt'], {
            cwd: scanDir
        });
        
        let output = '';
        let errorOutput = '';
        
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
            console.log(`Python stdout: ${data}`);
        });
        
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.log(`Python stderr: ${data}`);
        });
        
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                scanStatus.set(scanId, 'completed');
                resolve({ success: true, output });
            } else {
                scanStatus.set(scanId, 'failed');
                reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
            }
        });
        
        pythonProcess.on('error', (error) => {
            scanStatus.set(scanId, 'failed');
            reject(new Error(`Failed to run Python script: ${error.message}`));
        });
    });
}

// Helper function to transform CSV format
function transformCsvFormat(inputPath, outputPath) {
    try {
        const csvContent = fs.readFileSync(inputPath, 'utf8');
        const lines = csvContent.split('\n');
        
        if (lines.length === 0) return;
        
        // Expected input format: type,url,detail,origin,referer
        // Expected output format: URL,Status,Risk Level,Attribution Chain
        
        const outputLines = ['URL,Status,Risk Level,Attribution Chain'];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const parts = line.split(',');
            if (parts.length >= 3) {
                const url = parts[1] || '';
                const status = 'Suspicious'; // All detected items are suspicious
                const riskLevel = parts[0] === 'iframe' ? 'High' : 'Medium';
                const attributionChain = `Detected ${parts[0]} tracking`;
                
                outputLines.push(`${url},${status},${riskLevel},${attributionChain}`);
            }
        }
        
        fs.writeFileSync(outputPath, outputLines.join('\n'));
    } catch (error) {
        console.error('Error transforming CSV:', error);
    }
}

// API Routes

// POST /api/scan - Upload URLs and trigger scan
app.post('/api/scan', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const scanId = uuidv4();
        const scanDir = path.join(SCANS_DIR, scanId);
        
        // Create scan directory
        await fs.ensureDir(scanDir);
        await fs.ensureDir(path.join(scanDir, 'screenshots'));
        
        // Save uploaded file as urls.txt
        const urlsFilePath = path.join(scanDir, 'urls.txt');
        await fs.writeFile(urlsFilePath, req.file.buffer);
        
        // Set initial status
        scanStatus.set(scanId, 'pending');
        
        // Start scan in background
        runScan(scanId, urlsFilePath)
            .then((result) => {
                console.log(`Scan ${scanId} completed successfully`);
                
                // Transform CSV format if the original report exists
                const originalCsvPath = path.join(scanDir, 'cookie_stuffing_report.csv');
                const transformedCsvPath = path.join(scanDir, 'report.csv');
                
                if (fs.existsSync(originalCsvPath)) {
                    transformCsvFormat(originalCsvPath, transformedCsvPath);
                } else {
                    // Create empty report if no detections
                    const emptyReport = 'URL,Status,Risk Level,Attribution Chain\n';
                    fs.writeFileSync(transformedCsvPath, emptyReport);
                }
            })
            .catch((error) => {
                console.error(`Scan ${scanId} failed:`, error);
                scanStatus.set(scanId, 'failed');
            });
        
        // Return immediate response
        res.json({
            scanId: scanId,
            message: 'Scan initiated',
            reportUrl: `/api/scan/${scanId}/report`
        });
        
    } catch (error) {
        console.error('Error processing scan request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/scan/:scanId/progress - Check scan status
app.get('/api/scan/:scanId/progress', (req, res) => {
    const { scanId } = req.params;
    const status = scanStatus.get(scanId) || 'not_found';
    
    if (status === 'not_found') {
        return res.status(404).json({ error: 'Scan not found' });
    }
    
    res.json({ scanId, status });
});

// GET /api/scan/:scanId/report - Download CSV report
app.get('/api/scan/:scanId/report', (req, res) => {
    const { scanId } = req.params;
    const status = scanStatus.get(scanId);
    
    if (!status) {
        return res.status(404).json({ error: 'Scan not found' });
    }
    
    if (status !== 'completed') {
        return res.status(400).json({ error: `Scan status: ${status}` });
    }
    
    const reportPath = path.join(SCANS_DIR, scanId, 'report.csv');
    
    if (!fs.existsSync(reportPath)) {
        return res.status(404).json({ error: 'Report not found' });
    }
    
    res.download(reportPath, `scan_report_${scanId}.csv`);
});

// GET /api/scan/:scanId/details - Get scan details
app.get('/api/scan/:scanId/details', async (req, res) => {
    const { scanId } = req.params;
    const status = scanStatus.get(scanId);
    
    if (!status) {
        return res.status(404).json({ error: 'Scan not found' });
    }
    
    const scanDir = path.join(SCANS_DIR, scanId);
    const reportPath = path.join(scanDir, 'report.csv');
    const screenshotsDir = path.join(scanDir, 'screenshots');
    
    const details = {
        scanId,
        status,
        hasReport: fs.existsSync(reportPath),
        screenshotCount: 0
    };
    
    if (fs.existsSync(screenshotsDir)) {
        const screenshots = await fs.readdir(screenshotsDir);
        details.screenshotCount = screenshots.filter(f => f.endsWith('.png')).length;
    }
    
    res.json(details);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Default route
app.get('/', (req, res) => {
    res.json({
        message: 'Attribution Guard Scanner API',
        version: '1.0.0',
        endpoints: {
            'POST /api/scan': 'Upload URLs and trigger scan',
            'GET /api/scan/:scanId/progress': 'Check scan status',
            'GET /api/scan/:scanId/report': 'Download CSV report',
            'GET /api/scan/:scanId/details': 'Get scan details',
            'GET /health': 'Health check'
        }
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Attribution Guard Scanner API running on port ${PORT}`);
    console.log(`📁 Scans directory: ${SCANS_DIR}`);
    console.log(`🔗 API URL: http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});