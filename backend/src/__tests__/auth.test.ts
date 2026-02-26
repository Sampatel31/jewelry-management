import { Request, Response, NextFunction } from 'express';

jest.mock('../utils/jwt', () => ({
  verifyToken: jest.fn(),
}));

import { authenticate } from '../middleware/auth';
import { verifyToken } from '../utils/jwt';

const mockVerifyToken = verifyToken as jest.Mock;

function makeRes() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe('authenticate middleware', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when no Authorization header', () => {
    const req = { headers: {} } as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when scheme is not Bearer', () => {
    const req = { headers: { authorization: 'Basic abc123' } } as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() with a valid token', () => {
    const decoded = { id: 1, role: 'admin' };
    mockVerifyToken.mockReturnValue(decoded);
    const req = { headers: { authorization: 'Bearer valid.token.here' } } as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;
    authenticate(req, res, next);
    expect(next).toHaveBeenCalled();
    expect((req as any).user).toEqual(decoded);
  });

  it('returns 401 when token verification throws', () => {
    mockVerifyToken.mockImplementation(() => { throw new Error('invalid'); });
    const req = { headers: { authorization: 'Bearer bad.token.here' } } as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
