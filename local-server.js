const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const PUBLIC_DIR = path.resolve(__dirname);

// Helper to serve a static file
function serveStaticFile(filePath, res) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'text/html';
    if (ext === '.js') contentType = 'application/javascript';
    else if (ext === '.css') contentType = 'text/css';
    else if (ext === '.json') contentType = 'application/json';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.ico') contentType = 'image/x-icon';
    else if (ext === '.pdf') contentType = 'application/pdf';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Serve API endpoints
  if (pathname.startsWith('/api/')) {
    let bodyData = '';
    req.on('data', chunk => {
      bodyData += chunk;
    });

    req.on('end', () => {
      // Mock Vercel response helper
      const customRes = {
        statusCode: 200,
        headers: {},
        setHeader(name, value) {
          this.headers[name] = value;
          return this;
        },
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.setHeader('Content-Type', 'application/json');
          res.writeHead(this.statusCode, this.headers);
          res.end(JSON.stringify(data));
        },
        end(data) {
          res.writeHead(this.statusCode, this.headers);
          res.end(data);
        }
      };

      const customReq = {
        method: req.method,
        query: parsedUrl.query,
        headers: req.headers,
        body: null
      };

      if (bodyData) {
        try {
          customReq.body = JSON.parse(bodyData);
        } catch (e) {
          customReq.body = bodyData;
        }
      }

      // Route to local file
      const apiFileName = pathname.substring(5) + '.js'; // e.g. "analyse-book.js"
      const apiFilePath = path.join(PUBLIC_DIR, 'api', apiFileName);

      try {
        // delete require cache for live reloads during dev
        delete require.cache[require.resolve(apiFilePath)];
        const handler = require(apiFilePath);
        
        // Call the serverless function handler
        Promise.resolve(handler(customReq, customRes)).catch(err => {
          console.error(`Error in API handler ${apiFileName}:`, err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        });
      } catch (err) {
        console.error(`Failed to load API handler ${apiFileName}:`, err);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('API Endpoint Not Found');
      }
    });
    return;
  }

  // Rewrite logic to match vercel.json
  let targetPath = path.join(PUBLIC_DIR, pathname);
  
  if (pathname === '/' || pathname === '') {
    targetPath = path.join(PUBLIC_DIR, 'index.html');
  } else if (pathname === '/chaos' || pathname === '/chaos/') {
    targetPath = path.join(PUBLIC_DIR, 'chaos', 'index.html');
  } else {
    const exists = fs.existsSync(targetPath);
    // If the path does not have an extension and does not exist, serve main index.html
    if (!exists && !path.extname(pathname)) {
      targetPath = path.join(PUBLIC_DIR, 'index.html');
    }
  }

  serveStaticFile(targetPath, res);
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`  Local Dev Server started at: http://localhost:${PORT}`);
  console.log(`==================================================\n`);
});
