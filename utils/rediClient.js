const redis = require("redis");

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
  },
  password: process.env.REDIS_PASSWORD,
});

redisClient.connect().catch((err) => {
  console.error("Redis connection failed:", err);
});

module.exports = redisClient;
