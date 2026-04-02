const express        = require('express');
const db             = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require valid JWT
router.use(authMiddleware);

// ── GET /api/reminders ────────────────────────────────────────
// Get all reminders for the logged-in user
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, title, description, iso_date, display_date, display_time, is_done, created_at
       FROM reminders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.userId]
    );

    // Map is_done from 0/1 to false/true for frontend
    const reminders = rows.map(r => ({ ...r, done: r.is_done === 1 }));
    res.json({ reminders });

  } catch (err) {
    console.error('Get reminders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/reminders ───────────────────────────────────────
// Create a new reminder
router.post('/', async (req, res) => {
  const { title, description = '', iso_date, display_date, display_time } = req.body;

  if (!title || !iso_date)
    return res.status(400).json({ message: 'Title and date are required' });

  try {
    const [result] = await db.execute(
      `INSERT INTO reminders (user_id, title, description, iso_date, display_date, display_time, is_done)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [req.userId, title.trim(), description.trim(), iso_date, display_date, display_time]
    );

    const [rows] = await db.execute(
      'SELECT * FROM reminders WHERE id = ?', [result.insertId]
    );

    const reminder = { ...rows[0], done: rows[0].is_done === 1 };
    res.status(201).json({ message: 'Reminder created', reminder });

  } catch (err) {
    console.error('Create reminder error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PUT /api/reminders/:id/complete ──────────────────────────
// Mark a reminder as done
router.put('/:id/complete', async (req, res) => {
  try {
    const [check] = await db.execute(
      'SELECT id FROM reminders WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (check.length === 0)
      return res.status(404).json({ message: 'Reminder not found' });

    await db.execute(
      'UPDATE reminders SET is_done = 1 WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    res.json({ message: 'Reminder marked as complete' });

  } catch (err) {
    console.error('Complete reminder error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── DELETE /api/reminders/:id ─────────────────────────────────
// Delete a reminder
router.delete('/:id', async (req, res) => {
  try {
    const [check] = await db.execute(
      'SELECT id FROM reminders WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (check.length === 0)
      return res.status(404).json({ message: 'Reminder not found' });

    await db.execute(
      'DELETE FROM reminders WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    res.json({ message: 'Reminder deleted' });

  } catch (err) {
    console.error('Delete reminder error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
