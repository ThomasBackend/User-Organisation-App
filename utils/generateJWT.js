import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export default async function generateJwt(userId) {

  const payload = {
    userId: userId,
  };

  const options = {
    expiresIn: '30m', 
  };

  const token = jwt.sign(payload, process.env.SECRET_KEY , options);

  return token;
}