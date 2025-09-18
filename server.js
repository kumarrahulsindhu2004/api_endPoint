import express from "express";
import { connectDB } from "./db.js";
import bodyParser from "body-parser";
import personRoute from "./routes/personRoutes.js";
import menuRoute from "./routes/menuRoutes.js";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import dotenv from "dotenv";
import { Person } from "./models/Person.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey"; // store in .env

// middleware funcation
const logRequest = (req, res, next) => {
  console.log(
    `[${new Date().toLocaleDateString()}] Request Made to : ${req.originalUrl}`
  );
  next();
};

// dataBase Connection
connectDB();

// executive middleware
app.use(express.json());
app.use(logRequest);


app.use(cors({
  origin: ["http://localhost:5173",
           "https://api-restaurant-managemnt.netlify.app",
           "https://api-endpoint-imzw.onrender.com",
          //  "https://your-frontend.onrender.com"
          ], 
  methods: ["GET,POST,PUT,DELETE"],
  credentials: true
}));


// implement passport-local for login
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      console.log("Received credentials: ", username, password);
      const user = await Person.findOne({ username: username });
      if (!user) return done(null, false, { message: "Incorrect username" });

      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch)
        return done(null, false, { message: "Incorrect password" });

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

app.use(passport.initialize());

// ---------------- JWT ROUTES ----------------

// Signup route (hash password before save)
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

// Login route (generate JWT)
app.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: info ? info.message : "Login failed",
      });
    }
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.json({ message: "Login successful", token });
  })(req, res, next);
});

// Middleware to verify JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Protected route
app.get("/", authenticateJWT, (req, res) => {
  res.send(`Welcome ${req.user.username}, you are authenticated!`);
});

// app routes
app.use("/person", authenticateJWT,personRoute);
app.use("/menu", authenticateJWT, menuRoute);

// server create
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
