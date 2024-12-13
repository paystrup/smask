export const sanitizeInput = (input) => {
  // Remove script tags and other potentially harmful tags
  const stripped = input.replace(
    /<\s*script[^>]*>.*?<\s*\/\s*script\s*>|<\/?\s*\w+[^>]*>/gi,
    "",
  );

  // Return the sanitized input and indicate it's valid (no further validation needed)
  return { sanitized: stripped, isValid: true };
};

export const sanitizeInputs = (inputs) => {
  const sanitizedInputs = {};
  const errors = {};

  for (const [key, value] of Object.entries(inputs)) {
    if (typeof value === "string") {
      const { sanitized, isValid } = sanitizeInput(value);
      if (!isValid) {
        errors[key] = `${key} contains disallowed characters`;
      } else {
        sanitizedInputs[key] = sanitized;
      }
    }
  }

  return { sanitizedInputs, errors };
};
