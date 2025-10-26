import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Middleware to handle validation errors
export const handleValidationErrors = (req: any, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((err: any) => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg
      }))
    });
    return;
  }
  next();
};

// Authentication validation rules
export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('role')
    .isIn(['admin', 'hospital', 'donor', 'external'])
    .withMessage('Invalid role specified'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),
  handleValidationErrors
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Donor validation rules
export const donorRegistrationValidation = [
  body('bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group'),
  body('dateOfBirth')
    .isISO8601()
    .toDate()
    .withMessage('Invalid date of birth'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Invalid gender'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address too long'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City name too long'),
  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State name too long'),
  body('pincode')
    .optional()
    .matches(/^[0-9]{6}$/)
    .withMessage('Pincode must be 6 digits'),
  handleValidationErrors
];

// Blood request validation rules
export const bloodRequestValidation = [
  body('bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group'),
  body('units')
    .isInt({ min: 1, max: 50 })
    .withMessage('Units must be between 1 and 50'),
  body('urgency')
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid urgency level'),
  body('patientName')
    .trim()
    .notEmpty()
    .withMessage('Patient name is required')
    .isLength({ max: 100 })
    .withMessage('Patient name too long'),
  body('hospitalName')
    .trim()
    .notEmpty()
    .withMessage('Hospital name is required')
    .isLength({ max: 200 })
    .withMessage('Hospital name too long'),
  body('contactNumber')
    .matches(/^[0-9]{10}$/)
    .withMessage('Contact number must be 10 digits'),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ max: 500 })
    .withMessage('Reason too long'),
  handleValidationErrors
];

// Inventory validation rules
export const inventoryValidation = [
  body('bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group'),
  body('units')
    .isInt({ min: 0, max: 1000 })
    .withMessage('Units must be between 0 and 1000'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Invalid expiry date'),
  handleValidationErrors
];

// MongoDB ObjectId validation
export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Pagination validation
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Medical report validation
export const medicalReportValidation = [
  body('reportType')
    .isIn(['blood_test', 'health_checkup', 'medical_clearance', 'other'])
    .withMessage('Invalid report type'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes too long'),
  handleValidationErrors
];
