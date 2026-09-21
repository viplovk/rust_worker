import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

/**
 * Word frequency counter matching the Rust implementation:
 * - Splits on whitespace
 * - Converts each word to lowercase
 * - Accumulates count in dictionary / map
 */
export function countWordFrequencies(text: string): Record<string, number> {
  const counts: Record<string, number> = {};
  if (!text || typeof text !== 'string') return counts;

  const trimmed = text.trim();
  if (!trimmed) return counts;

  const words = trimmed.split(/\s+/);
  for (const word of words) {
    if (!word) continue;
    const lower = word.toLowerCase();
    counts[lower] = (counts[lower] || 0) + 1;
  }
  return counts;
}

// POST /process (Original Axum endpoint)
app.post('/process', (req, res) => {
  const { text } = req.body || {};
  if (typeof text !== 'string') {
    return res.status(400).json({ error: 'Payload must contain a string property "text"' });
  }

  const startTime = process.hrtime();
  const counts = countWordFrequencies(text);
  const diff = process.hrtime(startTime);
  const executionTimeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(3);

  return res.json({
    counts,
    stats: {
      totalWords: Object.values(counts).reduce((a, b) => a + b, 0),
      uniqueWords: Object.keys(counts).length,
      executionTimeMs: Number(executionTimeMs),
    },
  });
});

// POST /api/process (API alias)
app.post('/api/process', (req, res) => {
  const { text } = req.body || {};
  if (typeof text !== 'string') {
    return res.status(400).json({ error: 'Payload must contain a string property "text"' });
  }

  const startTime = process.hrtime();
  const counts = countWordFrequencies(text);
  const diff = process.hrtime(startTime);
  const executionTimeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(3);

  return res.json({
    counts,
    stats: {
      totalWords: Object.values(counts).reduce((a, b) => a + b, 0),
      uniqueWords: Object.keys(counts).length,
      executionTimeMs: Number(executionTimeMs),
    },
  });
});

// GET /api/health
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'rust_dsa_lab',
    engine: 'Rust WASM Tracing Engine',
    port: PORT,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🦀 Rust DSA Lab listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
