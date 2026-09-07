require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');

const nodeRoutes     = require('./routes/nodeRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const seedRoutes     = require('./routes/seedRoutes');

// Connect — retries internally, does not crash the server
connectDB();

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Health (always responds — no DB guard here) ───────────────────────────────
app.get('/',            (_req, res) => res.json({ status: 'ok', db: connectDB.isConnected() ? 'connected' : 'disconnected' }));
app.get('/api/health',  (_req, res) => {
  const up = connectDB.isConnected();
  res.status(up ? 200 : 503).json({ api: 'ok', db: up ? 'connected' : 'disconnected' });
});

// ── DB guard: blocks data routes when Mongo is not ready ─────────────────────
const requireDB = (_req, res, next) => {
  if (!connectDB.isConnected()) {
    return res.status(503).json({
      error: 'Database not connected. Check your MongoDB Atlas connection and IP whitelist.',
    });
  }
  next();
};

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/nodes',     requireDB, nodeRoutes);
app.use('/api/incidents', requireDB, incidentRoutes);
app.use('/api/seed',      requireDB, seedRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[Unhandled]', err.stack || err.message);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server on http://localhost:${PORT}`);
  console.log(`   Health → http://localhost:${PORT}/api/health`);
});
