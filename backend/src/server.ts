import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import assetsRoutes from './routes/assets.routes';
import documentsRoutes from './routes/documents.routes';
import nomineesRoutes from './routes/nominees.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middleware/error.middleware';

// Initialize Express app
const app: Application = express();
const PORT = env.PORT;

// Configure CORS middleware with frontend URL whitelist
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman) in development
    if (!origin && env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Whitelist frontend URL(s)
    const allowedOrigins = [env.FRONTEND_URL];
    
    // In development, also allow common development ports
    if (env.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173');
    }
    
    // In production, strictly enforce CORS
    if (origin && allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      if (env.NODE_ENV === 'production') {
        console.error(`🚫 CORS blocked request from unauthorized origin: ${origin}`);
      } else {
        console.warn(`🚫 CORS blocked request from origin: ${origin}`);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // Cache preflight requests for 24 hours
};

app.use(cors(corsOptions));

// Configure express.json() for JSON parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure rate limiting (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for health check endpoint
  skip: (req: Request) => req.path === '/health',
});

app.use(limiter);

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    success: true,
    status: 'ok', 
    message: 'LifeVault API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount all route handlers
app.use('/auth', authRoutes);
app.use('/assets', assetsRoutes);
app.use('/nominees', nomineesRoutes);
app.use('/admin', adminRoutes);
app.use('/', documentsRoutes); // Document routes include /assets/:id/documents and /documents/:id/download

// 404 handler for undefined routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Global error handler middleware
app.use(errorHandler);

// Start server on configured PORT
if (require.main === module) {
  app.listen(PORT, () => {
    if (env.NODE_ENV === 'development') {
      console.log(`🚀 LifeVault API server is running on port ${PORT}`);
      console.log(`📝 Environment: ${env.NODE_ENV}`);
      console.log(`🔒 CORS enabled for: ${env.FRONTEND_URL}`);
      console.log(`⏱️  Rate limit: 100 requests per 15 minutes`);
    }
  });
}

export { app };
export default app;
