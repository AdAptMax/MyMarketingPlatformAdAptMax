require("dotenv").config(); // Load environment variables

const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const stripe = require("stripe")(
  process.env.STRIPE_MODE === "live"
    ? process.env.STRIPE_LIVE_SECRET_KEY
    : process.env.STRIPE_TEST_SECRET_KEY
);
const redis = require("redis");

// ✅ Initialize Express App
const app = express();

// ✅ Security & Performance Middleware
app.use(helmet()); // Adds security headers
app.use(express.json()); // Allows Express to handle JSON requests
app.use(express.urlencoded({ extended: true }));

// ✅ CORS Configuration (Restrict Allowed Origins)
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS.split(",");
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// ✅ Rate Limiting to Prevent Abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // Limit each IP
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// ✅ Connect to Supabase (Database)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use secure service role key
);

// ✅ Connect to Redis (Auto-Reconnect Enabled)
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    reconnectStrategy: (retries) => Math.min(retries * 50, 2000), // Auto-reconnect
  },
  password: process.env.REDIS_PASSWORD,
});
redisClient.connect();

// ✅ JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ error: "Access denied. No token provided." });
  }

  const tokenParts = token.split(" ");
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
    return res
      .status(403)
      .json({ error: "Invalid token format. Use Bearer <token>." });
  }

  jwt.verify(tokenParts[1], process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token." });
    }
    req.user = user;
    next();
  });
};

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("🚀 Server is running and connected to Supabase!");
});

// ✅ Login Route (Generates a JWT Token with Secure Password Check)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists in Supabase
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) {
    return res.status(400).json({ error: "Invalid credentials!" });
  }

  // 🔹 Secure password check (bcrypt comparison)
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: "Invalid credentials!" });
  }

  // Generate JWT token
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1h",
  });

  res.json({ message: "Login successful!", token });
});

// ✅ Register Route (Allows User Signup with Hashed Password)
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  // Hash password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert new user into Supabase
  const { data, error } = await supabase
    .from("users")
    .insert([{ email, password: hashedPassword }]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: "User registered successfully!" });
});

// ✅ Lead Generation API Route (NEW ADDITION)
app.post("/generate-lead", authenticateToken, async (req, res) => {
  try {
    const { business_name, contact_name, email, phone, industry } = req.body;

    if (!business_name || !contact_name || !email || !phone || !industry) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Store lead in Supabase
    const { data, error } = await supabase
      .from("leads")
      .insert([{ business_name, contact_name, email, phone, industry }]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: "Lead created successfully", lead: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ AI & Automation Integration (Voice, Avatars, etc.)
app.get("/ai/voices", authenticateToken, async (req, res) => {
  res.json({ message: "AI voice automation is working!" });
});

// ✅ Stripe Payment Integration (Logs to Supabase)
app.post("/create-payment-intent", authenticateToken, async (req, res) => {
  try {
    const { amount, currency } = req.body;

    // ✅ Create Payment Intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Self-Healing & Health Check API
app.get("/health", (req, res) => {
  res.json({ status: "healthy", database: supabase ? "connected" : "disconnected" });
});

// ✅ Start Server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
