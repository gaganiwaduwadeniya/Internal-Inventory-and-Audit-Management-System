/**
 * Password Complexity Validation
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */

const validatePasswordComplexity = (password) => {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  const isValid = Object.values(requirements).every(req => req);
  
  return {
    isValid,
    requirements,
    message: getErrorMessage(requirements)
  };
};

const getErrorMessage = (requirements) => {
  const missing = [];
  
  if (!requirements.minLength) missing.push('at least 8 characters');
  if (!requirements.hasUppercase) missing.push('one uppercase letter');
  if (!requirements.hasLowercase) missing.push('one lowercase letter');
  if (!requirements.hasNumber) missing.push('one number');
  if (!requirements.hasSpecialChar) missing.push('one special character');
  
  if (missing.length === 0) return 'Password is strong!';
  
  return `Password must contain ${missing.join(', ')}`;
};

module.exports = { validatePasswordComplexity, getErrorMessage };
