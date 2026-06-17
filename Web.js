import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Decode URL to handle spaces and special chars
    let decodedUrl;
    try {
        decodedUrl = decodeURIComponent(req.url);
    } catch (e) {
        decodedUrl = req.url;
    }

    // Default to index.html for root or any client-side routes (for React Router support)
    // If the path doesn't have an extension, serve index.html (client-side routing fallback)
    const hasExtension = path.extname(decodedUrl) !== '';
    let filePath = (!hasExtension || decodedUrl === '/') ? 'index.html' : decodedUrl;
    
    // Resolve absolute path
    let safePath = path.normalize(path.join(PUBLIC_DIR, filePath));
    
    // Security check: ensure path is within PUBLIC_DIR
    if (!safePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    // Check if file exists and serve
    fs.stat(safePath, (err, stats) => {
        // Fallback to index.html if file not found (crucial for React Router BrowserRouter routing!)
        if (err || !stats.isFile()) {
            if (!hasExtension) {
                safePath = path.join(PUBLIC_DIR, 'index.html');
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
                return;
            }
        }

        const ext = path.extname(safePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(safePath).pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});