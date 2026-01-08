import jwt from "jsonwebtoken";

// Auth Guard
export const requireAuth = (req, res, next) => {
    // console.log("🔍 Auth Check:");
    // console.log("Headers:", req.headers);
    // console.log("Authorization:", req.headers.authorization);

  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    console.log("❌ No Bearer token found");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = header.split(" ")[1];
  console.log("Token: ", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("✅ Token decoded:", decoded);
    req.userId = decoded.userId;
    req.role = decoded.role; // Should Delete this?
    next();
  } catch (err) {
    console.log("Token verification failed:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Role Guard
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
