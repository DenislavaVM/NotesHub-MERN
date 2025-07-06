const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET } = require("../config/jwtConfig");
const { AuthenticationError } = require("../errors");

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return next(new AuthenticationError("Access token is missing"));
    };

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return next(new AuthenticationError("Invalid or expired access token"));
        };
        req.user = decoded.user;
        next();
    });
}

module.exports = {
    authenticateToken,
};