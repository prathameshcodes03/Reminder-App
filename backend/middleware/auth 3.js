const jwt = require('jsonwebtoken');
const JWT_SECRET = 'remindme_secret_key_2025';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token)
    return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token. Please login again.' });
  }
};

module.exports = authMiddleware;
