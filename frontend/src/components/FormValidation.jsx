import { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

const FormField = ({ 
  label, 
  error, 
  success, 
  children, 
  required = false, 
  helpText = "",
  className = ""
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {children}
        
        {/* Success Icon */}
        {success && !error && (
          <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
        )}
        
        {/* Error Icon */}
        {error && (
          <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
        )}
      </div>
      
      {/* Help Text */}
      {helpText && !error && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
      
      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
};

const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return "";

    for (const rule of rules) {
      const error = rule(value, values);
      if (error) return error;
    }
    return "";
  };

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Validate field if it has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      newErrors[name] = error;
      if (error) isValid = false;
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {}));

    return isValid;
  };

  const handleSubmit = async (onSubmit) => {
    setIsSubmitting(true);
    
    try {
      const isValid = validateAll();
      if (isValid) {
        await onSubmit(values);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    validateAll,
    setValues,
    setErrors
  };
};

// Common validation rules
export const validationRules = {
  required: (value) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return "This field is required";
    }
    return "";
  },
  
  minLength: (min) => (value) => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters long`;
    }
    return "";
  },
  
  maxLength: (max) => (value) => {
    if (value && value.length > max) {
      return `Must not exceed ${max} characters`;
    }
    return "";
  },
  
  email: (value) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Please enter a valid email address";
    }
    return "";
  },
  
  url: (value) => {
    if (value && !/^https?:\/\/.+/.test(value)) {
      return "Please enter a valid URL starting with http:// or https://";
    }
    return "";
  },
  
  number: (value) => {
    if (value && isNaN(Number(value))) {
      return "Please enter a valid number";
    }
    return "";
  },
  
  positiveNumber: (value) => {
    if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
      return "Please enter a positive number";
    }
    return "";
  }
};

export { FormField, useFormValidation };
