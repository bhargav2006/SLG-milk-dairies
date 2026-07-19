const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io = null;

const initSocket = (server, corsOptions) => {
  io = new Server(server, {
    cors: corsOptions,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      console.warn(`[Socket Auth Warning] No token provided for socket ${socket.id}`);
      return next(new Error("Authentication error: Token is required"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      // Allow role from handshake/query or default to customer
      socket.role = socket.handshake.auth?.role || socket.handshake.query?.role || "customer";
      next();
    } catch (err) {
      console.error(`[Socket Auth Error] Token verification failed for socket ${socket.id}:`, err.message);
      return next(new Error("Authentication error: Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    // console.log(`[Socket Connected] Socket ID: ${socket.id} (User ID: ${socket.userId}, Role: ${socket.role})`);

    // Join room specific to this user ID
    socket.join(socket.userId);

    // Join role-specific rooms
    if (socket.role === "accountant" || socket.role === "admin") {
      socket.join("accountants");
      // console.log(`[Socket Room] User ${socket.userId} joined room: accountants`);
    } else {
      socket.join("customers");
      // console.log(`[Socket Room] User ${socket.userId} joined room: customers`);
    }

    socket.on("disconnect", () => {
      // console.log(`[Socket Disconnected] Socket ID: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  return io; // Returns null if not yet initialized
};

module.exports = {
  initSocket,
  getIO,
};
