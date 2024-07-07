import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export default function verifyJwt(token) {
  try {
    
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    return {
      valid: true,
      decoded: decoded
    };
  } catch (err) {
    return {
      valid: false,
      error: err.message
    };
  }
}