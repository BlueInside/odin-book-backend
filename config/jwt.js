const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, firstName: user.firstName, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer token

  if (token == null)
    return res
      .status(401)
      .json({ message: 'Access denied. No token provided.' }); // No token provided

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    } // Token is not valid
    req.user = user;
    next();
  });
};

module.exports = {
  generateToken,
  authenticateToken,
};
