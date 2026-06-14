// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');

const db = require('./config/db');
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shops');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const compareRoutes = require('./routes/compare');
const builderRoutes = require('./routes/builder');
const { runAll } = require('./scrapers/runScrapers');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Request logging (lightweight)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/builder', builderRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  await db.init();
  console.log('Database initialized');

  app.listen(PORT, () => {
    console.log(`PartSniper API listening on port ${PORT}`);
  });

  // Schedule scraping every 6 hours (requires real network access to
  // shop domains - will fail in sandboxed environments, succeeds on
  // any normally-deployed server)
  cron.schedule('0 */6 * * *', () => {
    console.log('[cron] Running scheduled scrape...');
    runAll().catch((err) => console.error('[cron] Scrape failed:', err));
  });
}

start();
