const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required: No bearer token provided.' });
  }

  const token = authHeader.split(' ')[1];

  // SECURITY: JWT_SECRET MUST be provided via Environment Variable in production.
  const secret = process.env.JWT_SECRET;
  if (!secret) {
      console.error("[CRITICAL] JWT_SECRET environment variable is missing.");
      return res.status(500).json({ message: "Internal server configuration error." });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired clinical session token.' });
  }
};
