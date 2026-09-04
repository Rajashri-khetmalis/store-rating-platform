const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const { validateUserInput } = require('../middleware/validation');

const router = express.Router();
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', async (req, res) => {
  try {
    const [[users]] = await pool.query('SELECT COUNT(*) AS total FROM users');
    const [[stores]] = await pool.query('SELECT COUNT(*) AS total FROM stores');
    const [[ratings]] = await pool.query('SELECT COUNT(*) AS total FROM ratings');
    res.json({
      totalUsers: users.total,
      totalStores: stores.total,
      totalRatings: ratings.total
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to load dashboard.' });
  }
});

router.get('/stores', async (req, res) => {
  try {
    const search = `%${String(req.query.search || '').trim()}%`;
    const sortMap = { name: 's.name', email: 's.email', address: 's.address', rating: 'average_rating' };
    const sort = sortMap[req.query.sort] || 's.name';
    const dir = String(req.query.direction).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const [rows] = await pool.query(`
      SELECT s.id, s.name, s.email, s.address,
             ROUND(COALESCE(AVG(r.rating), 0), 2) AS rating,
             s.owner_id,
             owner.name AS owner_name
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      LEFT JOIN users owner ON owner.id = s.owner_id
      WHERE s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?
      GROUP BY s.id
      ORDER BY ${sort} ${dir}
    `, [search, search, search]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to load stores.' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const search = `%${String(req.query.search || '').trim()}%`;
    const role = String(req.query.role || '').trim();
    const sortMap = { name: 'u.name', email: 'u.email', address: 'u.address', role: 'u.role' };
    const sort = sortMap[req.query.sort] || 'u.name';
    const dir = String(req.query.direction).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const params = [search, search, search];
    let roleSql = '';
    if (['ADMIN','USER','STORE_OWNER'].includes(role)) {
      roleSql = ' AND u.role = ?';
      params.push(role);
    }

    const [rows] = await pool.query(`
      SELECT u.id, u.name, u.email, u.address, u.role,
             ROUND(COALESCE(AVG(r.rating), 0), 2) AS rating
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE (u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ?)
      ${roleSql}
      GROUP BY u.id
      ORDER BY ${sort} ${dir}
    `, params);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to load users.' });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id,u.name,u.email,u.address,u.role,
             s.id AS store_id,s.name AS store_name,
             ROUND(COALESCE(AVG(r.rating),0),2) AS rating
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE u.id = ?
      GROUP BY u.id,s.id
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ message: 'User not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to load user details.' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const errors = validateUserInput(req.body);
    if (errors.length) return res.status(400).json({ message: errors.join(' ') });

    const role = ['ADMIN','USER','STORE_OWNER'].includes(req.body.role) ? req.body.role : 'USER';
    const email = req.body.email.trim().toLowerCase();
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ message: 'Email is already registered.' });

    const hash = await bcrypt.hash(req.body.password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (name,email,password_hash,address,role) VALUES (?,?,?,?,?)',
      [req.body.name.trim(), email, hash, req.body.address.trim(), role]
    );

    res.status(201).json({ message: 'User created.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to create user.' });
  }
});

router.post('/stores', async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;
    if (!name || name.trim().length < 1) return res.status(400).json({ message: 'Store name is required.' });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Valid store email is required.' });
    if (!address || address.trim().length > 400) return res.status(400).json({ message: 'Address is required and must be at most 400 characters.' });

    if (ownerId) {
      const [owner] = await pool.query('SELECT id FROM users WHERE id = ? AND role = "STORE_OWNER"', [ownerId]);
      if (!owner.length) return res.status(400).json({ message: 'Selected owner is not a Store Owner.' });
    }

    const [result] = await pool.query(
      'INSERT INTO stores (name,email,address,owner_id) VALUES (?,?,?,?)',
      [name.trim(), email.trim().toLowerCase(), address.trim(), ownerId || null]
    );
    res.status(201).json({ message: 'Store created.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to create store.' });
  }
});

module.exports = router;
