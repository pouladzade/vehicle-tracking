import React from "react";
import { ApiError, ErrorCode } from "../services/api";

interface ErrorMessageProps {
  error: ApiError;
  showDetails?: boolean;
  className?: string;
}

/**
 * Component to display formatted error messages from API errors
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  showDetails = false,
  className = "",
}) => {
  // Define styled classes for different error types
  const getErrorClassName = () => {
    switch (true) {
      case error.isErrorType(ErrorCode.VALIDATION_ERROR):
        return "bg-yellow-50 border-yellow-400 text-yellow-800";
      case error.isErrorType(ErrorCode.UNAUTHORIZED):
      case error.isErrorType(ErrorCode.INVALID_CREDENTIALS):
        return "bg-orange-50 border-orange-400 text-orange-800";
      case error.isErrorType(ErrorCode.RESOURCE_NOT_FOUND):
        return "bg-blue-50 border-blue-400 text-blue-800";
      case error.isErrorType(ErrorCode.INTERNAL_ERROR):
      case error.isErrorType(ErrorCode.SERVICE_UNAVAILABLE):
      default:
        return "bg-red-50 border-red-400 text-red-800";
    }
  };

  const baseClass = "p-4 mb-4 border-l-4 rounded-md";
  const errorClass = getErrorClassName();

  return (
    <div className={`${baseClass} ${errorClass} ${className}`} role="alert">
      <p className="font-medium">{error.getUserFriendlyMessage()}</p>

      {showDetails && error.details && (
        <div className="mt-2 text-sm">
          <h4 className="font-semibold">Details:</h4>
          <pre className="mt-1 whitespace-pre-wrap overflow-auto max-h-40">
            {JSON.stringify(error.details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

interface ValidationErrorsProps {
  error: ApiError;
  className?: string;
}

/**
 * Component to display field-level validation errors
 */
export const ValidationErrors: React.FC<ValidationErrorsProps> = ({
  error,
  className = "",
}) => {
  const fieldErrors = error.getFieldErrors();

  if (!fieldErrors || Object.keys(fieldErrors).length === 0) {
    return null;
  }

  return (
    <div className={`text-sm text-red-600 ${className}`}>
      <ul className="list-disc pl-5 space-y-1">
        {Object.entries(fieldErrors).map(([field, message]) => (
          <li key={field}>
            <span className="font-medium">{field}</span>: {message}
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Higher-order component to handle API errors in forms
 */
export function withErrorHandling<P extends object>(
  Component: React.ComponentType<P & { onError?: (error: ApiError) => void }>
): React.FC<P & { onError?: (error: ApiError) => void }> {
  return (props) => {
    const [error, setError] = React.useState<ApiError | null>(null);

    const handleError = (err: ApiError) => {
      setError(err);
      if (props.onError) {
        props.onError(err);
      }
    };

    return (
      <div>
        {error && <ErrorMessage error={error} />}
        <Component {...props} onError={handleError} />
      </div>
    );
  };
}
