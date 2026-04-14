const express   = require('express');
const cors      = require('cors');
const config    = require('./config');
const { initializeDatabase, pingDatabase } = require('./db');

const authRoutes      = require('./routes/auth');
const userRoutes      = require('./routes/user');
const reminderRoutes  = require('./routes/reminders');

const app  = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: config.app.corsOrigin }));
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
app.get('/', async (req, res) => {
  let database = 'connected';
  try {
    await pingDatabase();
  } catch (error) {
    database = 'disconnected';
  }

  res.json({
    status: 'RemindMe Backend is running ✅',
    database,
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

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const startServer = async () => {
  try {
    await initializeDatabase();
    await pingDatabase();

    const server = app.listen(config.app.port, config.app.host, () => {
      console.log(`🚀 RemindMe backend running on http://${config.app.host}:${config.app.port}`);
      console.log(`📱 Android emulator use: http://10.0.2.2:${config.app.port}`);
      console.log('🌐 Physical device use:  set EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:3000');
      console.log(`✅ Database "${config.db.database}" is ready`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${config.app.port} is already in use. Stop the old backend process and try again.`);
        return;
      }

      console.error('❌ Backend startup error:', err.message);
    });
  } catch (error) {
    console.error('❌ Failed to start backend:', error.message);
    process.exit(1);
  }
};

startServer();
