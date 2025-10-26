import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { connectToDatabase } from './config/db';
import apiRouter from './routes';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// Security middleware
app.use(cors({ origin: true, credentials: true }));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      mediaSrc: ["'self'"],
      objectSrc: ["'self'"],
    },
  },
}));

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Rate limiting for all API routes
app.use('/api/', apiLimiter);

// Serve uploaded files with proper error handling
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    // Set proper MIME types
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
    // Allow files to be displayed in browser
    res.setHeader('Content-Disposition', 'inline');
  }
}));

// Handle 404 for missing upload files
app.use('/uploads/*', (_req, res) => {
  res.status(404).json({ 
    error: 'File not found',
    message: 'The requested file does not exist or has been deleted'
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'arts-blood-foundation-backend' });
});

// API routes
app.use('/api', apiRouter);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', err);
    process.exit(1);
  });


