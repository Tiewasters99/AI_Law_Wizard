// Common validation utilities

import { ValidationError } from "./errors";

/**
 * Validate that a value exists and is not empty
 */
export function validateRequired<T>(
  value: T | null | undefined,
  fieldName: string
): T {
  if (value === null || value === undefined || value === "") {
    throw new ValidationError(`${fieldName} is required`);
  }
  return value;
}

/**
 * Validate that a value is one of the allowed values
 */
export function validateEnum<T extends string>(
  value: string,
  allowedValues: readonly T[],
  fieldName: string
): T {
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(", ")}`
    );
  }
  return value as T;
}

/**
 * Validate email format
 */
export function validateEmail(
  email: string,
  fieldName: string = "Email"
): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError(`${fieldName} must be a valid email address`);
  }
  return email;
}

/**
 * Validate that a string is not empty after trimming
 */
export function validateNonEmptyString(
  value: string | null | undefined,
  fieldName: string
): string {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty`);
  }
  return trimmed;
}

/**
 * Validate numeric value is within range
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): number {
  if (value < min || value > max) {
    throw new ValidationError(`${fieldName} must be between ${min} and ${max}`);
  }
  return value;
}

/**
 * Validate that a value is a valid UUID
 */
export function validateUUID(value: string, fieldName: string): string {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    throw new ValidationError(`${fieldName} must be a valid UUID`);
  }
  return value;
}
