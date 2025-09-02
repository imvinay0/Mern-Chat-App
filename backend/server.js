const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const path = require("path");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();
app.use(express.json()); // accept JSON

// Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// Deployment
const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  // Serve frontend static files
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  // Serve frontend for any other route
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  // Only in development: simple test route
  
  // app.get("/", (req, res) => {
  //   res.send("API is Running Successfully");
  // });
}

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

// Socket.IO setup
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: { origin: "http://localhost:3000" },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
    socket.userId = userData._id;
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    const chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    if (socket.userId) socket.leave(socket.userId);
  });
});
