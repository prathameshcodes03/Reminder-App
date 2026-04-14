const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../db');
const config   = require('../config');
const { sanitizeUser } = require('../utils');

const router = express.Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── POST /api/auth/register ───────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password, phone = '', role = 'Student' } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();
  const normalizedName = name?.trim();

  if (!normalizedName || !normalizedEmail || !password)
    return res.status(400).json({ message: 'Name, email and password are required' });

  if (!emailRegex.test(normalizedEmail))
    return res.status(400).json({ message: 'Please enter a valid email address' });

  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' });

  try {
    // Check duplicate email
    const existing = await db.query(
      'SELECT id FROM users WHERE email = ?', [normalizedEmail]
    );
    if (existing.length > 0)
      return res.status(409).json({ message: 'Email already registered' });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    const joined = new Date().toLocaleDateString('en-IN', {
      month: 'long', year: 'numeric'
    });

    // Insert user
    const result = await db.run(
      'INSERT INTO users (name, email, password, phone, role, joined) VALUES (?, ?, ?, ?, ?, ?)',
      [normalizedName, normalizedEmail, hashed, phone?.trim() || '', role?.trim() || 'Student', joined]
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
  const normalizedEmail = email?.toLowerCase().trim();

  if (!normalizedEmail || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    const rows = await db.query(
      'SELECT * FROM users WHERE email = ?', [normalizedEmail]
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
      config.app.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Login successful', token, user: sanitizeUser(user) });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
