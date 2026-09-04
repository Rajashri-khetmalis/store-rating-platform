const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize('USER'), async (req, res) => {
  try {
    const search = `%${String(req.query.search || '').trim()}%`;
    const sortMap = { name: 's.name', address: 's.address', rating: 'overall_rating' };
    const sort = sortMap[req.query.sort] || 's.name';
    const dir = String(req.query.direction).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const [rows] = await pool.query(`
      SELECT s.id, s.name, s.address,
             ROUND(COALESCE(AVG(allr.rating),0),2) AS overall_rating,
             my.rating AS my_rating
      FROM stores s
      LEFT JOIN ratings allr ON allr.store_id = s.id
      LEFT JOIN ratings my ON my.store_id = s.id AND my.user_id = ?
      WHERE s.name LIKE ? OR s.address LIKE ?
      GROUP BY s.id, my.rating
      ORDER BY ${sort} ${dir}
    `, [req.user.id, search, search]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to load stores.' });
  }
});

router.get('/all', authenticate, authorize('ADMIN'), async (req, res) => {
  const [rows] = await pool.query('SELECT id,name,email,address,owner_id FROM stores ORDER BY name ASC');
  res.json(rows);
});

module.exports = router;
