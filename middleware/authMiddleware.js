const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeaders = req.headers.authorization;
    if (!authHeaders) return res.status(401).json({ msg: "Token Required" });

    const token = authHeaders.split(" ")[1];

    const payload = jwt.verify(token, process.env.SECRET_KEY);

    req.user = payload.id;
    req.userRole = payload.role;

    next();
  } catch (error) {
    return res.status(401).json({ msg: "Token Invalid" });
  }
};

const allowedTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.userRole))
    return res.status(403).json({ msg: "Access denied" });
  next();
};

module.exports = { authMiddleware, allowedTo };