// routes/categories.js
const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/', (req, res) => {
  const { rows } = db.query('SELECT id, name, slug, icon FROM categories ORDER BY sort_order');
  res.json({ categories: rows });
});

module.exports = router;
