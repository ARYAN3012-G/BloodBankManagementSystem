// Standardized API response utilities

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  timestamp: string;
}

/**
 * Create a standardized success response
 */
export const successResponse = <T = any>(
  data: T,
  message?: string
): SuccessResponse<T> => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString()
});

/**
 * Create a standardized error response
 */
export const errorResponse = (
  error: string,
  code?: string,
  details?: any
): ErrorResponse => ({
  success: false,
  error,
  code,
  details,
  timestamp: new Date().toISOString()
});

/**
 * Create a standardized paginated response
 */
export const paginatedResponse = <T = any>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): PaginatedResponse<T> => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    message,
    timestamp: new Date().toISOString()
  };
};

/**
 * Create a standardized created response (201)
 */
export const createdResponse = <T = any>(
  data: T,
  message: string = 'Resource created successfully'
): SuccessResponse<T> => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString()
});

/**
 * Create a standardized updated response
 */
export const updatedResponse = <T = any>(
  data: T,
  message: string = 'Resource updated successfully'
): SuccessResponse<T> => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString()
});

/**
 * Create a standardized deleted response
 */
export const deletedResponse = (
  message: string = 'Resource deleted successfully'
): SuccessResponse<null> => ({
  success: true,
  data: null,
  message,
  timestamp: new Date().toISOString()
});
