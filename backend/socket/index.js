const logger = require("../logger");
const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET } = require("../config/jwtConfig");

const socketAuthMiddleware = (socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        logger.warn(`Socket connection without token from ${socket.id}`);
        return next(new Error("Authentication error: Token not provided."));
    };

    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        if (!decoded || !decoded.user?._id) {
            logger.warn(`Socket connection with invalid token from ${socket.id}`);
            return next(new Error("Authentication error: Invalid token."));
        };
        socket.user = decoded.user;
        next();
    } catch (error) {
        logger.warn(`Socket ${socket.id} failed to authenticate: ${error.message}`);
        return next(new Error("Authentication error: Invalid or expired token."));
    };
};

module.exports = (io) => {
    io.use(socketAuthMiddleware);
    io.on("connection", (socket) => {
        logger.info(`New client connected and authenticated: ${socket.id}, User: ${socket.user.email}`);
        const userId = socket.user._id;
        const userRoom = `user_${userId}`;
        socket.join(userRoom);
        logger.info(`Socket ${socket.id} joined personal room ${userRoom}`);

        socket.on("note:join", (noteId) => {
            socket.join(noteId);
            logger.info(`Socket ${socket.id} joined room for note: ${noteId}`);
        });
        socket.on("note:update", (data) => {
            socket.to(data.noteId).emit("note:updated", data);
        });
        socket.on("note:leave", (noteId) => {
            socket.leave(noteId);
            logger.info(`Socket ${socket.id} left room for note: ${noteId}`);
        });

        socket.on("disconnect", () => {
            logger.info(`Client disconnected: ${socket.id}`);
        });
    });
};