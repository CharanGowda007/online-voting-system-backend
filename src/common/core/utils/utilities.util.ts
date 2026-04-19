/** Returns true if value looks like a bcrypt hash (e.g. pre-hashed). */
export const isBcryptHash = (value: string): boolean => {
  if (!value || value.length < 50) return false;
  return /^\$2[aby]\$\d{2}\$/.test(value);
};

export const checkPasswordValidation = (value: string): string | null => {
  if (!value) return 'Password is required.';
  if (isBcryptHash(value)) return null;
  const isWhitespace = /^(?=.*\s)/;
  if (isWhitespace.test(value)) {
    return 'Password must not contain Whitespaces.';
  }
  const isContainsUppercase = /^(?=.*[A-Z])/;
  if (!isContainsUppercase.test(value)) {
    return 'Password must have at least one Uppercase Character.';
  }
  const isContainsLowercase = /^(?=.*[a-z])/;
  if (!isContainsLowercase.test(value)) {
    return 'Password must have at least one Lowercase Character.';
  }
  const isContainsNumber = /^(?=.*[0-9])/;
  if (!isContainsNumber.test(value)) {
    return 'Password must contain at least one Digit.';
  }
  const isContainsSymbol = /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹])/;
  if (!isContainsSymbol.test(value)) {
    return 'Password must contain at least one Special Character.';
  }
  const isValidLength = /^.{10,16}$/;
  if (!isValidLength.test(value)) {
    return 'Password must be 10-16 Characters long.';
  }
  return null;
};

export const checkEmailValidation = (email: string): boolean => {
  const emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return email !== '' && emailFormat.test(email);
};
