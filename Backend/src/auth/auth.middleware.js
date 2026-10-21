const jwt = require('jsonwebtoken');
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token)
    return res.status(401).json({ success: false, message: 'Authentication is required.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'development-only-secret');
    return next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: 'Your session is invalid or has expired.' });
  }
};
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Administrator access is required.' });
  return next();
};
module.exports = { requireAuth, requireAdmin };
