import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Cloud Run injects PORT (typically 8080). Bind directly to process.env.PORT, defaulting to 3000.
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());

// Health check endpoints for Cloud Run and load balancers
app.get(['/healthz', '/health', '/_health'], (_req, res) => {
  res.status(200).send('OK');
});

const distPath = path.join(__dirname, 'dist');

// Always serve static assets from dist
app.use(express.static(distPath));

// SPA fallback for client-side routing
app.get('*', (_req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send('Task and Esports Arena application is starting up...');
  }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Task and Esports Arena Server listening on http://0.0.0.0:${PORT}`);
});

server.on('error', (err) => {
  console.error('Primary server error:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received: shutting down gracefully');
  server.close(() => {
    console.log('Server process terminated');
  });
});
