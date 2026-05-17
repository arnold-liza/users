const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Check if the Authorization header exists and follows the Bearer scheme
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or malformed' });
  }

  // 2. Extract the token string
  const token = authHeader.split(' ')[1];

  // 3. Prevent silent server crashes if JWT_SECRET is missing from environmental variables
  if (!process.env.JWT_SECRET) {
    console.error('❌ CRITICAL ERROR: JWT_SECRET is not defined in your environment variables (.env)');
    return res.status(500).json({ message: 'Internal server configuration error' });
  }

  try {
    // 4. Verify the token token integrity
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Inject decoded payload data into the request object for downstream routes
    req.user = { 
      id: decoded.id, 
      role: decoded.role 
    };
    
    next(); // Pass control to the next middleware or controller
  } catch (err) {
    console.error(`⚠️ JWT Verification Failed: ${err.message}`);
    return res.status(401).json({ 
      message: 'Invalid or expired token', 
      error: err.message 
    });
  }
};