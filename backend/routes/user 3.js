const express      = require('express');
const db           = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes here require a valid JWT token
router.use(authMiddleware);

// ── GET /api/user/profile ─────────────────────────────────────
router.get('/profile', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, phone, role, joined, created_at FROM users WHERE id = ?',
      [req.userId]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: 'User not found' });

    res.json({ user: rows[0] });

  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PUT /api/user/profile ─────────────────────────────────────
router.put('/profile', async (req, res) => {
  const { name, phone, role } = req.body;

  if (!name || !name.trim())
    return res.status(400).json({ message: 'Name cannot be empty' });

  try {
    await db.execute(
      'UPDATE users SET name = ?, phone = ?, role = ? WHERE id = ?',
      [name.trim(), phone || '', role || 'Student', req.userId]
    );

    const [rows] = await db.execute(
      'SELECT id, name, email, phone, role, joined, created_at FROM users WHERE id = ?',
      [req.userId]
    );

    res.json({ message: 'Profile updated', user: rows[0] });

  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
