import jwt from "jsonwebtoken";

// Auth Guard
export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.role = decoded.role; // Should Delete this?
    next();
  } catch {
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
