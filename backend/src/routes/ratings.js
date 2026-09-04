const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, authorize('USER'), async (req, res) => {
  try {
    const storeId = Number(req.body.storeId);
    const rating = Number(req.body.rating);

    if (!Number.isInteger(storeId) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
    }

    const [stores] = await pool.query('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (!stores.length) return res.status(404).json({ message: 'Store not found.' });

    await pool.query(`
      INSERT INTO ratings (user_id, store_id, rating)
      VALUES (?,?,?)
      ON DUPLICATE KEY UPDATE rating = VALUES(rating), updated_at = CURRENT_TIMESTAMP
    `, [req.user.id, storeId, rating]);

    res.json({ message: 'Rating submitted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to submit rating.' });
  }
});

module.exports = router;
