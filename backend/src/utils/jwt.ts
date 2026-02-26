import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export const generateToken = (payload: object) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as any);
};

export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpiresIn } as any);
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret) as any;
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, config.jwtRefreshSecret) as any;
};
