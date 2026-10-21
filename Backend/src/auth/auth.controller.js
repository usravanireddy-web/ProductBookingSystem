const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../users/user.model');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    const user = await User.findOne({ username: username?.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash)))
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    const token = jwt.sign(
      { username: user.username, role: user.role },
      process.env.JWT_SECRET || 'development-only-secret',
      { expiresIn: '8h' },
    );
    return res.json({ success: true, token, user: { username: user.username, role: user.role } });
  } catch (error) {
    return next(error);
  }
};
module.exports = { login };
