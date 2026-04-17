"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface FormErrorProps {
  message?: string;
}

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

interface FormTextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
}

/**
 * Form Error Display Component
 */
export const FormError: React.FC<FormErrorProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-2 mt-1 text-red-600 text-sm">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};

/**
 * Form Input Field Component
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  className = "",
  ...props
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {props.required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <input
        {...props}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 ${
          error ? "border-red-500 bg-red-50" : "border-gray-300"
        } ${className}`}
      />
      {error && <FormError message={error} />}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

/**
 * Form Select Component
 */
export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  error,
  options,
  className = "",
  ...props
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {props.required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <select
        {...props}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer text-gray-900 ${
          error ? "border-red-500 bg-red-50" : "border-gray-300"
        } ${className}`}
      >
        <option value="">-- Select {label.toLowerCase()} --</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <FormError message={error} />}
    </div>
  );
};

/**
 * Form TextArea Component
 */
export const FormTextArea: React.FC<FormTextAreaProps> = ({
  label,
  error,
  helperText,
  className = "",
  ...props
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {props.required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <textarea
        {...props}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-vertical text-gray-900 ${
          error ? "border-red-500 bg-red-50" : "border-gray-300"
        } ${className}`}
      />
      {error && <FormError message={error} />}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
