import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Global error handling middleware
export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction): void => {
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Default error values
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // MongoDB specific errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Please check the form and correct the highlighted fields.',
      details: process.env.NODE_ENV === 'development' ? err.message : 'Some fields contain invalid data.'
    });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({
      error: 'Invalid Request',
      message: 'The requested resource ID is not valid. Please check and try again.'
    });
    return;
  }

  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern || {})[0];
    const friendlyField = field === 'email' ? 'Email address' : field;
    res.status(409).json({
      error: 'Already Exists',
      message: `${friendlyField} is already registered. Please use a different one or login instead.`
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'Authentication Failed',
      message: 'Your session is invalid. Please login again to continue.'
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'Session Expired',
      message: 'Your session has expired. Please login again to continue.'
    });
    return;
  }

  // Generic error response
  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal Server Error' : message,
    message: process.env.NODE_ENV === 'development' ? message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Async error wrapper - wraps async route handlers to catch errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 Not Found handler
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: process.env.NODE_ENV === 'development' ? [
      '/api/auth/login',
      '/api/auth/register',
      '/api/inventory',
      '/api/donors',
      '/api/requests'
    ] : undefined
  });
};
