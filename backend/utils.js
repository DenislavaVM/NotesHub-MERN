const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/jwtConfig");

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: true, message: "Access token is missing" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: true, message: "Invalid access token" });
        }
        req.user = decoded.user;
        next();
    });
}

module.exports = {
    authenticateToken,
};