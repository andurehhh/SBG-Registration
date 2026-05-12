// backend/src/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";

export const idFinderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per IP per minute
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: "Too many requests. Please try again later.",
  },
  handler: (req, res, _next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});
