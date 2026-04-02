const express   = require('express');
const cors      = require('cors');

const authRoutes      = require('./routes/auth');
const userRoutes      = require('./routes/user');
const reminderRoutes  = require('./routes/reminders');

const app  = express();
const PORT = 3000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log every incoming request
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/user',      userRoutes);
app.use('/api/reminders', reminderRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'RemindMe Backend is running ✅',
    endpoints: {
      register:         'POST   /api/auth/register',
      login:            'POST   /api/auth/login',
      getProfile:       'GET    /api/user/profile',
      updateProfile:    'PUT    /api/user/profile',
      getReminders:     'GET    /api/reminders',
      createReminder:   'POST   /api/reminders',
      completeReminder: 'PUT    /api/reminders/:id/complete',
      deleteReminder:   'DELETE /api/reminders/:id',
    }
  });
});

// ── Listen on ALL interfaces (0.0.0.0) so emulator can reach it ──
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 RemindMe backend running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Android emulator use: http://10.0.2.2:${PORT}`);
  console.log(`🌐 Physical device use:  http://YOUR_LAN_IP:${PORT}`);
});
