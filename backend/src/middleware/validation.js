function validateName(name) {
  return typeof name === 'string' && name.trim().length >= 20 && name.trim().length <= 60;
}

function validatePassword(password) {
  return typeof password === 'string'
    && password.length >= 8
    && password.length <= 16
    && /[A-Z]/.test(password)
    && /[^A-Za-z0-9]/.test(password);
}

function validateEmail(email) {
  return typeof email === 'string'
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validateAddress(address) {
  return typeof address === 'string' && address.trim().length <= 400 && address.trim().length > 0;
}

function validateUserInput(body, { passwordRequired = true } = {}) {
  const errors = [];
  if (!validateName(body.name)) errors.push('Name must be between 20 and 60 characters.');
  if (!validateEmail(body.email)) errors.push('Please provide a valid email.');
  if (!validateAddress(body.address)) errors.push('Address is required and must be at most 400 characters.');
  if (passwordRequired && !validatePassword(body.password)) {
    errors.push('Password must be 8–16 characters and contain at least one uppercase letter and one special character.');
  }
  return errors;
}

module.exports = { validatePassword, validateUserInput, validateEmail, validateName, validateAddress };
