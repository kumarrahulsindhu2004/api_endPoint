import express from "express";
import { connectDB } from "./db.js";
import personRoute from "./routes/personRoutes.js";
import menuRoute from "./routes/menuRoutes.js";
import passport from "./auth.js";
import { generateToken, authenticateJWT } from "./jwt.js";

import dotenv from "dotenv";
import { Person } from "./models/Person.js";
import bcrypt from "bcrypt";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://api-restaurant-managemnt.netlify.app",
    "https://api-endpoint-imzw.onrender.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// DB connect
connectDB();

// Passport init
app.use(passport.initialize());

// Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleDateString()}] Request to: ${req.originalUrl}`);
  next();
});

// ---------------- AUTH ROUTES ----------------

// Signup
app.post("/signup", async (req, res) => {
  try {
    const { username, password, ...otherFields } = req.body;
    const existing = await Person.findOne({ username });

    if (existing) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Person({ username, password: hashedPassword, ...otherFields });
    await newUser.save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: info ? info.message : "Login failed",
      });
    }

    const token = generateToken(user);
    return res.json({ message: "Login successful", token });
  })(req, res, next);
});

// Protected route
app.get("/", authenticateJWT, (req, res) => {
  res.send(`Welcome ${req.user.username}, you are authenticated!`);
});

// Other routes
app.use("/person", authenticateJWT, personRoute);
app.use("/menu", authenticateJWT, menuRoute);

// Server start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
