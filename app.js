// Dot Env
require("dotenv").config();
// Express
const express = require("express");
const app = express();
// CORS
const cors = require("cors");
app.use(cors({ origin: /^http:\/\/localhost:\d+$/ }));
// Middleware Json
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// Port
const port = process.env.PORT || 5000;
// DB Connection
const mongoose = require("mongoose");
async function dbConnection() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected!");
  } catch (error) {
    console.log(error);
  }
}

// Routes
const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const commentRoutes = require("./routes/commentRoutes");

app.use("/api", authRoutes);
app.use("/api", ticketRoutes);
app.use("/api", commentRoutes);

dbConnection();

const errorMiddleware = require("./Middleware/errorMiddleware");

app.use(errorMiddleware);
// Run Server
app.listen(port, () => {
  console.log(`Server Is Running At Port ${port}`);
});