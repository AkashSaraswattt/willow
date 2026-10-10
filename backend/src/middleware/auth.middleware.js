const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js');

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    // Retry MongoDB query on connection reset
    let user;
    let retries = 2;
    
    while (retries > 0) {
      try {
        user = await User.findById(decoded.userId).select("-password");
        break;
      } catch (dbError) {
        if (dbError.code === 'ECONNRESET' && retries > 1) {
          retries--;
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }
        throw dbError;
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { protectRoute };