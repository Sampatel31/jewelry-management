jest.mock('../config/env', () => ({
  config: {
    jwtSecret: 'test-secret',
    jwtRefreshSecret: 'test-refresh-secret',
    jwtExpiresIn: '15m',
    jwtRefreshExpiresIn: '7d',
  },
}));

import { generateToken, verifyToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

describe('JWT utilities', () => {
  const payload = { id: 1, role: 'admin' };

  it('generateToken returns a string', () => {
    const token = generateToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  });

  it('verifyToken returns the original payload', () => {
    const token = generateToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.role).toBe(payload.role);
  });

  it('verifyToken throws on invalid token', () => {
    expect(() => verifyToken('invalid.token.here')).toThrow();
  });

  it('generateRefreshToken returns a string', () => {
    const token = generateRefreshToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  });

  it('verifyRefreshToken returns the original payload', () => {
    const token = generateRefreshToken(payload);
    const decoded = verifyRefreshToken(token);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.role).toBe(payload.role);
  });

  it('verifyRefreshToken throws when using wrong secret', () => {
    const accessToken = generateToken(payload);
    expect(() => verifyRefreshToken(accessToken)).toThrow();
  });
});
