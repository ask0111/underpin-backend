// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const User = require("./models/user");
require("dotenv").config();
const cors = require("cors");

const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URI, // Client URL
    methods: ["GET", "POST"],
  },
});

connectDB();

io.on("connection", (socket) => {
  socket.on("clickBanana", async (playerId) => {
    try {
      // Find user by ID and increment click count
      const user = await User.findByIdAndUpdate(
        playerId,
        { $inc: { clickCount: 1 } },
        { new: true } // Return updated document
      );

      const allUsers = await User.find();

      if (user && allUsers) {
        // Emit the updated user data to all clients
        io.emit("userUpdated", {
            user: {
                userId: user._id,
                clickCount: user.clickCount,
            },
            users: allUsers,
        });
      }
    } catch (error) {
      console.error("Error updating click count:", error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
