/**
 * Frontend Password Validation Utility
 */

export const validatePassword = (password) => {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  const passedCount = Object.values(requirements).filter(v => v).length;
  const strength = passedCount < 2 ? 'weak' : passedCount < 4 ? 'medium' : 'strong';

  return {
    isValid: Object.values(requirements).every(req => req),
    requirements,
    strength,
    passedCount,
    totalCount: Object.keys(requirements).length
  };
};

export const getPasswordStrengthColor = (strength) => {
  switch(strength) {
    case 'weak':
      return '#dc3545'; // Red
    case 'medium':
      return '#ffc107'; // Yellow
    case 'strong':
      return '#28a745'; // Green
    default:
      return '#e0e0e0';
  }
};
