const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../db');

const router = express.Router();
const JWT_SECRET = 'remindme_secret_key_2025';

// ── POST /api/auth/register ───────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password, phone = '', role = 'Student' } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: 'Name, email and password are required' });

  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' });

  try {
    // Check duplicate email
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE email = ?', [email.toLowerCase()]
    );
    if (existing.length > 0)
      return res.status(409).json({ message: 'Email already registered' });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    const joined = new Date().toLocaleDateString('en-IN', {
      month: 'long', year: 'numeric'
    });

    // Insert user
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, phone, role, joined) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), hashed, phone, role, joined]
    );

    res.status(201).json({
      message: 'Account created successfully',
      userId: result.insertId
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]
    );

    if (rows.length === 0)
      return res.status(401).json({ message: 'Invalid email or password' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(401).json({ message: 'Invalid email or password' });

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user without password
    const { password: _pw, ...safeUser } = user;

    res.json({ message: 'Login successful', token, user: safeUser });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
