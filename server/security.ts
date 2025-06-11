import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import type { Express } from "express";

export function setupSecurity(app: Express) {
  // Enable trust proxy for proper rate limiting behind reverse proxy
  app.set("trust proxy", 1);

  // Security headers with Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "wss:", "https:"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  // CORS configuration
  app.use(cors({
    origin: process.env.NODE_ENV === "production" 
      ? process.env.REPLIT_DOMAINS?.split(",").map(domain => `https://${domain}`)
      : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }));

  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      error: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 auth requests per windowMs
    message: {
      error: "Too many authentication attempts, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const uploadLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit uploads to 5 per minute
    message: {
      error: "Too many uploads, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply rate limiters
  app.use("/api/", apiLimiter);
  app.use("/api/login", authLimiter);
  app.use("/api/callback", authLimiter);
  app.use("/api/upload", uploadLimiter);
  app.use("/api/analyze-food", uploadLimiter);
}