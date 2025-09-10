import React from 'react';

// Validation utility functions and types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Email validation
export const validateEmail = (email: string): ValidationError | null => {
  if (!email.trim()) {
    return { field: 'email', message: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { field: 'email', message: 'Please enter a valid email address' };
  }
  
  return null;
};

// Password validation
export const validatePassword = (password: string): ValidationError | null => {
  if (!password) {
    return { field: 'password', message: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { field: 'password', message: 'Password must be at least 6 characters long' };
  }
  
  return null;
};

// Name validation
export const validateName = (name: string, fieldName: string = 'name'): ValidationError | null => {
  if (!name.trim()) {
    return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required` };
  }
  
  if (name.trim().length < 2) {
    return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least 2 characters long` };
  }
  
  if (name.trim().length > 50) {
    return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be less than 50 characters` };
  }
  
  return null;
};

// Phone validation
export const validatePhone = (phone: string): ValidationError | null => {
  if (!phone.trim()) {
    return { field: 'phone', message: 'Phone number is required' };
  }
  
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  if (!phoneRegex.test(cleanPhone)) {
    return { field: 'phone', message: 'Please enter a valid phone number' };
  }
  
  if (cleanPhone.length < 10) {
    return { field: 'phone', message: 'Phone number must be at least 10 digits' };
  }
  
  return null;
};

// VIN validation
export const validateVIN = (vin: string): ValidationError | null => {
  if (!vin.trim()) {
    return { field: 'vin', message: 'VIN is required' };
  }
  
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
  if (!vinRegex.test(vin.toUpperCase())) {
    return { field: 'vin', message: 'VIN must be exactly 17 characters (letters and numbers, excluding I, O, Q)' };
  }
  
  return null;
};

// License plate validation
export const validateLicensePlate = (licensePlate: string): ValidationError | null => {
  if (!licensePlate.trim()) {
    return { field: 'licensePlate', message: 'License plate is required' };
  }
  
  if (licensePlate.trim().length < 2) {
    return { field: 'licensePlate', message: 'License plate must be at least 2 characters' };
  }
  
  if (licensePlate.trim().length > 10) {
    return { field: 'licensePlate', message: 'License plate must be less than 10 characters' };
  }
  
  return null;
};

// Year validation
export const validateYear = (year: number): ValidationError | null => {
  const currentYear = new Date().getFullYear();
  
  if (!year) {
    return { field: 'year', message: 'Year is required' };
  }
  
  if (year < 1900) {
    return { field: 'year', message: 'Year must be 1900 or later' };
  }
  
  if (year > currentYear + 1) {
    return { field: 'year', message: `Year cannot be more than ${currentYear + 1}` };
  }
  
  return null;
};

// Mileage validation
export const validateMileage = (mileage: number): ValidationError | null => {
  if (mileage < 0) {
    return { field: 'mileage', message: 'Mileage cannot be negative' };
  }
  
  if (mileage > 1000000) {
    return { field: 'mileage', message: 'Mileage seems unrealistic (over 1,000,000)' };
  }
  
  return null;
};

// Address validation
export const validateAddress = (address: string): ValidationError | null => {
  if (!address.trim()) {
    return { field: 'address', message: 'Address is required' };
  }
  
  if (address.trim().length < 10) {
    return { field: 'address', message: 'Please enter a complete address (at least 10 characters)' };
  }
  
  if (address.trim().length > 200) {
    return { field: 'address', message: 'Address must be less than 200 characters' };
  }
  
  return null;
};

// Service description validation
export const validateServiceDescription = (description: string): ValidationError | null => {
  if (!description.trim()) {
    return { field: 'description', message: 'Service description is required' };
  }
  
  if (description.trim().length < 10) {
    return { field: 'description', message: 'Service description must be at least 10 characters' };
  }
  
  if (description.trim().length > 500) {
    return { field: 'description', message: 'Service description must be less than 500 characters' };
  }
  
  return null;
};

// Cost validation
export const validateCost = (cost: number): ValidationError | null => {
  if (cost < 0) {
    return { field: 'cost', message: 'Cost cannot be negative' };
  }
  
  if (cost > 100000) {
    return { field: 'cost', message: 'Cost seems unrealistic (over $100,000)' };
  }
  
  return null;
};

// Generic required field validation
export const validateRequired = (value: string, fieldName: string): ValidationError | null => {
  if (!value || !value.trim()) {
    return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required` };
  }
  return null;
};

// Validate multiple fields at once
export const validateFields = (validations: (() => ValidationError | null)[]): ValidationResult => {
  const errors: ValidationError[] = [];
  
  validations.forEach(validation => {
    const error = validation();
    if (error) {
      errors.push(error);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Hook for form validation
export const useFormValidation = () => {
  const [errors, setErrors] = React.useState<ValidationError[]>([]);
  
  const validateForm = (validations: (() => ValidationError | null)[]): boolean => {
    const result = validateFields(validations);
    setErrors(result.errors);
    return result.isValid;
  };
  
  const clearErrors = () => setErrors([]);
  
  const getFieldError = (fieldName: string): string | undefined => {
    const error = errors.find(e => e.field === fieldName);
    return error?.message;
  };
  
  const hasFieldError = (fieldName: string): boolean => {
    return errors.some(e => e.field === fieldName);
  };
  
  return {
    errors,
    validateForm,
    clearErrors,
    getFieldError,
    hasFieldError
  };
};
