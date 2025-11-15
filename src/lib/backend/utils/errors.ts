// Custom error classes for API layer
// Maps application errors to appropriate HTTP status codes

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 400, code || "VALIDATION_ERROR");
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required", code?: string) {
    super(message, 401, code || "AUTHENTICATION_ERROR");
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Not authorized", code?: string) {
    super(message, 403, code || "AUTHORIZATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource", code?: string) {
    super(`${resource} not found`, 404, code || "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 409, code || "CONFLICT");
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Rate limit exceeded", resetTime?: number) {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
    this.resetTime = resetTime;
  }
  resetTime?: number;
}

export class ServiceError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 500, code || "SERVICE_ERROR");
  }
}
