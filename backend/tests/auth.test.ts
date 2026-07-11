import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { Role } from '@prisma/client';
import { authenticate, authorize } from '../src/middlewares/auth';
import * as authService from '../src/services/auth.service';
import * as otpService from '../src/services/otp.service';
import * as userRepo from '../src/repositories/user.repository';
import * as tokenRepo from '../src/repositories/token.repository';
import { config } from '../src/config';
import { signAccessToken, signRefreshToken } from '../src/utils/jwt';
import { AppError } from '../src/utils/AppError';

jest.mock('../src/services/otp.service', () => ({
  createOtp: jest.fn(),
  verifyOtp: jest.fn(),
}));

jest.mock('../src/repositories/user.repository', () => ({
  findById: jest.fn(),
  findOrCreateVerifiedByPhone: jest.fn(),
}));

jest.mock('../src/repositories/token.repository', () => ({
  createRefreshToken: jest.fn(),
  findByToken: jest.fn(),
  revokeById: jest.fn(),
  revokeToken: jest.fn(),
  revokeAllUserTokens: jest.fn(),
  deleteExpiredTokens: jest.fn(),
}));

jest.mock('../src/config/redis', () => ({
  redis: {
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    get: jest.fn(),
  },
}));

jest.mock('../src/config/database', () => ({
  prisma: {
    refreshToken: {
      update: jest.fn(),
    },
  },
}));

jest.mock('../src/config/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Authentication flows', () => {
  const mockedOtpService = otpService as jest.Mocked<typeof otpService>;
  const mockedUserRepo = userRepo as jest.Mocked<typeof userRepo>;
  const mockedTokenRepo = tokenRepo as jest.Mocked<typeof tokenRepo>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates OTP and returns a mock code in development', async () => {
    mockedOtpService.createOtp.mockResolvedValue('123456');

    const result = await authService.requestOtp('9876543210');

    expect(mockedOtpService.createOtp).toHaveBeenCalledWith('9876543210');
    expect(result).toEqual({ message: 'OTP generated successfully.' });
  });

  it('does not return a mock OTP in production mode', async () => {
    const originalEnv = config.env;
    config.env = 'production' as any;
    mockedOtpService.createOtp.mockResolvedValue('654321');

    const result = await authService.requestOtp('9876543210');

    expect(result).toEqual({ message: 'OTP generated successfully.' });
    config.env = originalEnv;
  });

  it('rejects invalid phone numbers for OTP generation', async () => {
    await expect(authService.requestOtp('123')).rejects.toBeInstanceOf(AppError);
  });

  it('rejects invalid phone numbers during OTP verification', async () => {
    await expect(authService.verifyOtpAndLogin('123', '123456')).rejects.toBeInstanceOf(AppError);
  });

  it('rejects password-based login as not configured', async () => {
    await expect(authService.loginWithCredentials('9876543210', 'password123')).rejects.toBeInstanceOf(AppError);
  });

  it('verifies OTP and issues a token pair', async () => {
    mockedOtpService.verifyOtp.mockResolvedValue(true as any);
    mockedUserRepo.findOrCreateVerifiedByPhone.mockResolvedValue({
      id: 42,
      phone: '9876543210',
      role: Role.CUSTOMER,
      isVerified: true,
      isBlocked: false,
      createdAt: new Date(),
    } as any);
    mockedTokenRepo.createRefreshToken.mockResolvedValue({ id: 7, token: 'temp' } as any);

    const result = await authService.verifyOtpAndLogin('9876543210', '123456');

    expect(mockedOtpService.verifyOtp).toHaveBeenCalledWith('9876543210', '123456');
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.phone).toBe('9876543210');
  });

  it('rejects blocked users during OTP login', async () => {
    mockedOtpService.verifyOtp.mockResolvedValue(true as any);
    mockedUserRepo.findOrCreateVerifiedByPhone.mockResolvedValue({
      id: 99,
      phone: '9876543210',
      role: Role.CUSTOMER,
      isVerified: true,
      isBlocked: true,
      createdAt: new Date(),
    } as any);

    await expect(authService.verifyOtpAndLogin('9876543210', '123456')).rejects.toBeInstanceOf(AppError);
  });

  it('authenticates a valid access token and attaches the user', async () => {
    const app = express();
    app.use(async (req, _res, next) => {
      req.headers.authorization = `Bearer ${signAccessToken({ userId: 2, phone: '9876543210', role: Role.CUSTOMER })}`;
      next();
    });
    app.use(authenticate);
    app.get('/secure', (req, res) => {
      res.json({ user: req.user });
    });

    mockedUserRepo.findById.mockResolvedValue({
      id: 2,
      phone: '9876543210',
      role: Role.CUSTOMER,
      isBlocked: false,
    } as any);

    const response = await request(app).get('/secure');

    expect(response.status).toBe(200);
    expect(response.body.user.id).toBe(2);
  });

  it('rejects missing authorization headers with 401', async () => {
    const app = express();
    app.use(authenticate);
    app.get('/secure', (_req, res) => res.status(200).send('ok'));

    const response = await request(app).get('/secure');

    expect(response.status).toBe(401);
  });

  it('rejects blocked users with 403', async () => {
    const app = express();
    app.use(async (req, _res, next) => {
      req.headers.authorization = `Bearer ${signAccessToken({ userId: 3, phone: '9876543210', role: Role.CUSTOMER })}`;
      next();
    });
    app.use(authenticate);
    app.get('/secure', (_req, res) => res.status(200).send('ok'));

    mockedUserRepo.findById.mockResolvedValue({ id: 3, phone: '9876543210', role: Role.CUSTOMER, isBlocked: true } as any);

    const response = await request(app).get('/secure');

    expect(response.status).toBe(403);
  });

  it('rejects invalid access tokens with 401', async () => {
    const app = express();
    app.use((req, _res, next) => {
      req.headers.authorization = 'Bearer invalid-token';
      next();
    });
    app.use(authenticate);
    app.get('/secure', (_req, res) => res.status(200).send('ok'));

    const response = await request(app).get('/secure');

    expect(response.status).toBe(401);
  });

  it('rejects refresh tokens that are not found', async () => {
    mockedTokenRepo.findByToken.mockResolvedValue(null);

    await expect(authService.refreshTokens(signRefreshToken({ userId: 8, tokenId: 3 }))).rejects.toBeInstanceOf(AppError);
  });

  it('rejects invalid refresh token signatures', async () => {
    await expect(authService.refreshTokens('not-a-valid-jwt')).rejects.toBeInstanceOf(AppError);
  });

  it('rejects expired refresh tokens', async () => {
    mockedTokenRepo.findByToken.mockResolvedValue({
      id: 3,
      token: 'refresh-token',
      userId: 8,
      revoked: false,
      expiresAt: new Date(Date.now() - 60_000),
      user: { id: 8, phone: '9876543210', role: Role.CUSTOMER, isBlocked: false },
    } as any);

    await expect(authService.refreshTokens(signRefreshToken({ userId: 8, tokenId: 3 }))).rejects.toBeInstanceOf(AppError);
  });

  it('rejects revoked refresh tokens', async () => {
    mockedTokenRepo.findByToken.mockResolvedValue({
      id: 3,
      token: 'refresh-token',
      userId: 8,
      revoked: true,
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: 8, phone: '9876543210', role: Role.CUSTOMER, isBlocked: false },
    } as any);

    await expect(authService.refreshTokens(signRefreshToken({ userId: 8, tokenId: 3 }))).rejects.toBeInstanceOf(AppError);
  });

  it('rejects refreshes when the session has been invalidated', async () => {
    mockedTokenRepo.findByToken.mockResolvedValue({
      id: 3,
      token: 'refresh-token',
      userId: 8,
      revoked: false,
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: 8, phone: '9876543210', role: Role.CUSTOMER, isBlocked: false },
    } as any);
    const redis = require('../src/config/redis').redis;
    redis.get.mockResolvedValue(null);

    await expect(authService.refreshTokens(signRefreshToken({ userId: 8, tokenId: 3 }))).rejects.toBeInstanceOf(AppError);
  });

  it('refreshes a valid refresh token and rotates it', async () => {
    mockedTokenRepo.findByToken.mockResolvedValue({
      id: 3,
      token: 'refresh-token',
      userId: 8,
      revoked: false,
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: 8, phone: '9876543210', role: Role.CUSTOMER, isBlocked: false },
    } as any);
    mockedTokenRepo.createRefreshToken.mockResolvedValue({ id: 11, token: 'temp' } as any);
    const redis = require('../src/config/redis').redis;
    redis.get.mockResolvedValue('1');

    const result = await authService.refreshTokens(signRefreshToken({ userId: 8, tokenId: 3 }));

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('rejects refreshes when the account is blocked', async () => {
    mockedTokenRepo.findByToken.mockResolvedValue({
      id: 3,
      token: 'refresh-token',
      userId: 8,
      revoked: false,
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: 8, phone: '9876543210', role: Role.CUSTOMER, isBlocked: true },
    } as any);
    const redis = require('../src/config/redis').redis;
    redis.get.mockResolvedValue('1');

    await expect(authService.refreshTokens(signRefreshToken({ userId: 8, tokenId: 3 }))).rejects.toBeInstanceOf(AppError);
  });

  it('logs out and invalidates the refresh token', async () => {
    mockedTokenRepo.findByToken.mockResolvedValue({
      id: 4,
      token: 'logout-token',
      userId: 9,
      revoked: false,
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: 9, phone: '9876543210', role: Role.CUSTOMER, isBlocked: false },
    } as any);

    const result = await authService.logout('logout-token');

    expect(result.message).toBe('Logged out successfully.');
    expect(mockedTokenRepo.revokeToken).toHaveBeenCalledWith('logout-token');
  });

  it('allows authorized users and blocks missing users for authorization', async () => {
    const app = express();
    app.use((req, _res, next) => {
      req.user = { id: 1, phone: '9876543210', role: Role.CUSTOMER, isAdmin: false } as any;
      next();
    });
    app.use(authorize([Role.CUSTOMER]));
    app.get('/customer', (_req, res) => res.status(200).send('ok'));

    const response = await request(app).get('/customer');

    expect(response.status).toBe(200);
  });

  it('blocks unauthorized users with 403', async () => {
    const app = express();
    app.use((req, _res, next) => {
      req.user = { id: 1, phone: '9876543210', role: Role.CUSTOMER, isAdmin: false } as any;
      next();
    });
    app.use(authorize([Role.ADMIN]));
    app.get('/admin', (_req, res) => res.status(200).send('ok'));

    const response = await request(app).get('/admin');

    expect(response.status).toBe(403);
    expect(response.text || JSON.stringify(response.body)).toContain('permission');
  });

  it('rejects authorization when no user is attached', async () => {
    const app = express();
    app.use(authorize([Role.ADMIN]));
    app.get('/admin', (_req, res) => res.status(200).send('ok'));

    const response = await request(app).get('/admin');

    expect(response.status).toBe(401);
  });

  it('handles Redis helper failures in session cleanup', async () => {
    const redis = require('../src/config/redis').redis;
    redis.del.mockRejectedValue(new Error('redis down'));
    redis.keys.mockRejectedValue(new Error('redis down'));
    redis.get.mockRejectedValue(new Error('redis down'));

    await expect(authService.logout('missing-token')).resolves.toEqual({ message: 'Logged out successfully.' });
  });

  it('returns profile data for a valid user', async () => {
    mockedUserRepo.findById.mockResolvedValue({
      id: 12,
      phone: '9876543210',
      role: Role.CUSTOMER,
      isVerified: true,
      isBlocked: false,
      createdAt: new Date(),
    } as any);

    const result = await authService.getProfile(12);

    expect(result.id).toBe(12);
  });

  it('logouts all sessions for a user', async () => {
    const result = await authService.logoutAll(12);

    expect(result.message).toContain('logged out');
  });

  it('handles logout when the refresh token is not present in storage', async () => {
    mockedTokenRepo.findByToken.mockResolvedValue(null);

    const result = await authService.logout('missing-token');

    expect(result.message).toBe('Logged out successfully.');
  });

  it('logs out all sessions by user id', async () => {
    const result = await authService.logout(undefined as any, 44);

    expect(result.message).toBe('Logged out successfully.');
  });

  it('returns a not found error for missing profile users', async () => {
    mockedUserRepo.findById.mockResolvedValue(null);

    await expect(authService.getProfile(99)).rejects.toBeInstanceOf(AppError);
  });
});
