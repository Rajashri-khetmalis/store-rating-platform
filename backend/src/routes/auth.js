const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { validateUserInput, validatePassword } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

router.post('/signup', async (req, res) => {
  try {
    const errors = validateUserInput(req.body);
    if (errors.length) return res.status(400).json({ message: errors.join(' ') });

    const { name, email, password, address } = req.body;
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length) return res.status(409).json({ message: 'Email is already registered.' });

    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (name,email,password_hash,address,role) VALUES (?,?,?,?,?)',
      [name.trim(), email.trim().toLowerCase(), hash, address.trim(), 'USER']
    );

    const user = { id: result.insertId, role: 'USER', email: email.trim().toLowerCase(), name: name.trim() };
    res.status(201).json({ message: 'Signup successful.', token: signToken(user), user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to create account.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    const [rows] = await pool.query('SELECT id,name,email,password_hash,address,role FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid email or password.' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password.' });

    const safeUser = { id: user.id, name: user.name, email: user.email, address: user.address, role: user.role };
    res.json({ message: 'Login successful.', token: signToken(safeUser), user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to login.' });
  }
});

router.put('/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!validatePassword(newPassword)) {
      return res.status(400).json({ message: 'New password must be 8–16 characters with at least one uppercase letter and one special character.' });
    }

    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found.' });

    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) return res.status(400).json({ message: 'Current password is incorrect.' });

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to update password.' });
  }
});

module.exports = router;
