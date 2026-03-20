const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(403).json({ message: "Token required" });

  const token = header.split(" ")[1];
  if (!token) return res.status(403).json({ message: "Token required" });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
}

module.exports = verifyToken;
