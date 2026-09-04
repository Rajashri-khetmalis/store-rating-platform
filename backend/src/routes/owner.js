const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, authorize('STORE_OWNER'));

router.get('/dashboard', async (req, res) => {
  try {
    const [stores] = await pool.query('SELECT id,name,email,address FROM stores WHERE owner_id = ?', [req.user.id]);
    if (!stores.length) return res.json({ store: null, averageRating: 0, raters: [] });

    const store = stores[0];
    const [[avg]] = await pool.query(
      'SELECT ROUND(COALESCE(AVG(rating),0),2) AS averageRating FROM ratings WHERE store_id = ?',
      [store.id]
    );

    const [raters] = await pool.query(`
      SELECT u.id,u.name,u.email,r.rating,r.updated_at
      FROM ratings r
      JOIN users u ON u.id = r.user_id
      WHERE r.store_id = ?
      ORDER BY r.updated_at DESC
    `, [store.id]);

    res.json({ store, averageRating: avg.averageRating, raters });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to load owner dashboard.' });
  }
});

module.exports = router;
