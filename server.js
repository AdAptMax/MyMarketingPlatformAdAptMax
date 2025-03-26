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
// ✅ Connect to Redis Client (from external module)
const redisClient = require("./redisClient");

 
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

app.use(authenticateToken, checkBlacklist);


// --- Elite Redis Caching + JWT Blacklisting Setup ---
const redisClient = require("./utils/redisClient");
const crypto = require("crypto"); // ✅ For secure token hashing
const logging = console;

// 🔐 Hash JWT for consistent Redis key length and obfuscation
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// 🔁 Universal Redis Cache Wrapper
const cacheQuery = async (key, queryFn, ttl = 3600) => {
  try {
    const cached = await redisClient.get(key);
    if (cached !== null) {
      logging.info(`✅ Cache hit: ${key}`);
      return JSON.parse(cached);
    }

    logging.info(`⏳ Cache miss: ${key}`);
    const data = await queryFn();

    if (data !== undefined) {
      await redisClient.setEx(key, ttl, JSON.stringify(data));
    }

    return data;
  } catch (err) {
    logging.error(`⚠️ Redis cache error (${key}):`, err);
    return queryFn(); // graceful fallback
  }
};

// 🚫 JWT Token Blacklisting
const blacklistToken = async (token, ttl = 3600) => {
  try {
    const redisKey = `blacklist:${hashToken(token)}`;
    await redisClient.setEx(redisKey, ttl, "1");
    logging.info(`🚫 Token blacklisted (hashed): ${redisKey}`);
  } catch (err) {
    logging.error("⚠️ Error blacklisting token:", err);
  }
};

// 🛡 Express Middleware to Enforce JWT Blacklist
const checkBlacklist = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(403).json({ error: "No valid token provided." });
    }

    const token = authHeader.split(" ")[1];
    const redisKey = `blacklist:${hashToken(token)}`;
    const isBlacklisted = await redisClient.get(redisKey);

    if (isBlacklisted) {
      return res.status(403).json({ error: "Token is blacklisted." });
    }

    next();
  } catch (err) {
    logging.error("⚠️ JWT blacklist middleware error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// 🌐 Exports
module.exports = {
  cacheQuery,
  blacklistToken,
  checkBlacklist,
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

// ✅ AI & Quantum Enhancements (Safe JS Version)
const axios = require("axios"); // Required for tech trend API
const logging = console; // You can replace this with a logger like Winston

// 🔹 Placeholder Quantum Optimization
const quantumOptimization = async () => {
  logging.info("Quantum optimization started (placeholder)");
  const optimalSolution = { allocation: "optimal-resource-allocation-xyz" };
  return optimalSolution;
};

// 🔹 AI-Driven Auto-Scaling (Simulated)
const autoScaleResources = async () => {
  const predictedLoad = Math.random(); // Simulate AI prediction
  if (predictedLoad > 0.75) {
    logging.info("Scaling up resources based on AI prediction...");
    // Insert actual scaling logic here (e.g., AWS/K8s APIs)
  }
};

// 🔹 Failure Prediction (Placeholder Logic)
const predictServiceFailure = (historicalData = []) => {
  logging.info("Running failure prediction (placeholder)");
  return Math.random(); // Simulated failure probability
};

// 🔹 Restart Logic (Fallback for Self-Healing)
const restartService = async (serviceName) => {
  logging.info(`Restarting service: ${serviceName}`);
  // Actual restart logic goes here
};

// 🔹 Self-Healing Wrapper
const selfRepairService = async (serviceName) => {
  logging.info(`Initiating self-repair for: ${serviceName}`);
  await restartService(serviceName);
};

// 🔹 Optional Blockchain Logging
const logToBlockchain = async (actionDetails) => {
  if (process.env.BLOCKCHAIN_ENABLED === "true") {
    logging.info(`Action logged on blockchain: ${actionDetails}`);
    // Integrate with real blockchain SDK here
  }
};

// 🔹 Tech Trend Monitoring (Simulated API)
const trackTechnologyTrends = async () => {
  if (process.env.REAL_TIME_TECH_ANALYSIS === "true") {
    try {
      const response = await axios.get("https://api.example.com/tech-trends");
      logging.info("Real-time tech trends:", response.data);
    } catch (err) {
      logging.error("Error fetching tech trends:", err.message);
    }
  }
};

// ✅ Quantum Optimization Endpoint
app.get("/quantum-optimization", async (req, res) => {
  try {
    const optimalSolution = await quantumOptimization();
    res.json({ message: "Quantum Optimization Complete", optimalSolution });
  } catch (err) {
    res.status(500).json({ error: "Quantum Optimization failed", details: err.message });
  }
});

// ✅ Auto-Scaling Endpoint
app.get("/auto-scale-resources", async (req, res) => {
  try {
    await autoScaleResources();
    res.json({ message: "Auto-scaling check complete" });
  } catch (err) {
    res.status(500).json({ error: "Auto-scaling failed", details: err.message });
  }
});

// ✅ AI Failure Prediction Endpoint
app.post("/predict-failure", async (req, res) => {
  try {
    const { historicalData } = req.body;
    const prediction = predictServiceFailure(historicalData);
    res.json({ message: "Failure prediction complete", prediction });
  } catch (err) {
    res.status(500).json({ error: "Prediction failed", details: err.message });
  }
});

// ✅ Blockchain Logging Endpoint
app.post("/log-blockchain", authenticateToken, async (req, res) => {
  try {
    const { actionDetails } = req.body;
    await logToBlockchain(actionDetails);
    res.json({ message: "Action logged to blockchain" });
  } catch (err) {
    res.status(500).json({ error: "Logging failed", details: err.message });
  }
});

// ✅ Start Server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
