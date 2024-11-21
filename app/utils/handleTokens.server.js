// https://github.com/auth0/node-jsonwebtoken
import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET;

export function generateResetToken(userId) {
  const payload = {
    userId,
    createdAt: Date.now(),
  };
  const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
  return token;
}

export function validateResetToken(token) {
  try {
    const decoded = jwt.verify(token, secretKey); // Automatically checks expiration
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}
