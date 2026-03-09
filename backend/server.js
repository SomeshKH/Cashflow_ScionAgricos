/**
 * ScionAxon – Backend API Server
 * Serves all financial dashboard endpoints.
 * Authentication via X-API-Key header.
 *
 * Start: node server.js
 * Dev:   npx nodemon server.js
 */

const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 8000;

// ── The API key that must be sent by the frontend ─────────────────────────────
const API_KEY = process.env.API_KEY || 'JwgL5XUT5W3pHst7iVUjA1UuzR8KKQYW4tvUSGBV';

// ── Data file ─────────────────────────────────────────────────────────────────
const DATA_FILE = path.join(__dirname, 'data.json');

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    console.error('⚠  Could not read data.json:', err.message);
    return {};
  }
}

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── API key authentication (skip for /health) ─────────────────────────────────
function authenticate(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing X-API-Key header' });
  }
  next();
}

// ── Router ────────────────────────────────────────────────────────────────────
const router = express.Router();

// Health check – no auth required
router.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Apply auth to every route defined AFTER this line
router.use(authenticate);

// ── Endpoints ─────────────────────────────────────────────────────────────────

router.get('/yearly-totals', (_req, res) => {
  const data = loadData();
  res.json(data.yearlyTotals || []);
});

router.get('/summary', (req, res) => {
  const year = req.query.year ? String(req.query.year) : '2025';
  const data  = loadData();
  res.json(data.summary?.[year] || data.summary?.['2025'] || {});
});

router.get('/person-year-data', (_req, res) => {
  const data = loadData();
  res.json(data.personYearData || []);
});

router.get('/traders', (req, res) => {
  const year = req.query.year ? parseInt(req.query.year) : null;
  const data = loadData();
  let traders = data.personYearData || [];
  if (year) traders = traders.filter(p => p.year === year);
  res.json(traders);
});

router.get('/monthly-margins', (req, res) => {
  const year = req.query.year ? String(req.query.year) : '2025';
  const data  = loadData();
  res.json(data.monthlyMargins?.[year] || data.monthlyMargins?.['2025'] || []);
});

router.get('/products', (req, res) => {
  const year = req.query.year ? String(req.query.year) : '2025';
  const data  = loadData();
  res.json(data.products?.[year] || data.products?.['2025'] || []);
});

router.get('/origins', (req, res) => {
  const year = req.query.year ? String(req.query.year) : '2025';
  const data  = loadData();
  res.json(data.origins?.[year] || data.origins?.['2025'] || []);
});

router.get('/historical-shipments', (_req, res) => {
  const data = loadData();
  res.json(data.historicalShipments || []);
});

router.get('/cash-flow', (req, res) => {
  const year = req.query.year ? String(req.query.year) : '2025';
  const data  = loadData();
  res.json(data.cashFlow?.[year] || data.cashFlow?.['2025'] || {});
});

router.get('/profitability', (req, res) => {
  const year = req.query.year ? String(req.query.year) : '2025';
  const data  = loadData();
  res.json(data.profitability?.[year] || data.profitability?.['2025'] || []);
});

router.get('/risk', (req, res) => {
  const year = req.query.year ? String(req.query.year) : '2025';
  const data  = loadData();
  res.json(data.risk?.[year] || data.risk?.['2025'] || {});
});

router.get('/seasonal', (_req, res) => {
  const data = loadData();
  res.json(data.seasonal || []);
});

router.get('/forecast', (_req, res) => {
  const data = loadData();
  res.json(data.forecast || {});
});

router.get('/product-list', (_req, res) => {
  const data = loadData();
  const list = (data.products?.['2025'] || []).map(p => p.product);
  res.json(list);
});

router.get('/origin-list', (_req, res) => {
  const data = loadData();
  const list = (data.origins?.['2025'] || []).map(o => o.origin);
  res.json(list);
});

router.get('/transactions', (req, res) => {
  const { year, trader, product, origin, limit } = req.query;
  const data = loadData();
  let txns   = data.transactions || [];
  if (year)    txns = txns.filter(t => t.year    === parseInt(year));
  if (trader)  txns = txns.filter(t => t.trader  === trader);
  if (product) txns = txns.filter(t => t.product === product);
  if (origin)  txns = txns.filter(t => t.origin  === origin);
  if (limit)   txns = txns.slice(0, parseInt(limit));
  res.json(txns);
});

// Ingest – POST endpoint for future Excel ingestion
router.post('/ingest', (req, res) => {
  const { dir } = req.body || {};
  console.log('📥 Ingest requested. Directory:', dir || '(default)');
  // TODO: add xlsx processing here (npm install xlsx)
  res.json({ success: true, message: 'Ingest received. Add Excel processing logic to server.js.' });
});

// ── Mount router ──────────────────────────────────────────────────────────────
app.use('/api', router);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  ScionAxon Backend running at http://localhost:${PORT}`);
  console.log(`🔑  API Key authentication: ENABLED`);
  console.log(`❤   Health: http://localhost:${PORT}/api/health\n`);
});
