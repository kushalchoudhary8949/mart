import { Request, Response } from 'express';
import { catchAsync } from '../middlewares/asyncWrapper';
import { HTTP_STATUS } from '../utils/constants';
import * as authService from '../services/auth.service';

// ─── POST /auth/customer-login ──────────────────────────────────────────────
export const customerLogin = catchAsync(async (req: Request, res: Response) => {
  const { name, phone } = req.body;
  const result = await authService.customerLogin(name, phone);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

// ─── POST /auth/send-otp ────────────────────────────────────────────────────

export const otpRequest = catchAsync(async (req: Request, res: Response) => {
  const { phone } = req.body;
  const result = await authService.requestOtp(phone);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

// ─── POST /auth/verify-otp ──────────────────────────────────────────────────

export const otpVerify = catchAsync(async (req: Request, res: Response) => {
  const { phone, code, name } = req.body;
  const result = await authService.verifyOtpAndLogin(phone, code, name);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

// ─── POST /auth/login ───────────────────────────────────────────────────────

export const login = catchAsync(async (req: Request, res: Response) => {
  const { phone, password } = req.body;
  const result = await authService.loginWithCredentials(phone, password);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

// ─── POST /auth/refresh ─────────────────────────────────────────────────────

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshTokens(refreshToken);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

// ─── POST /auth/logout ──────────────────────────────────────────────────────

export const logout = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body ?? {};
  const result = await authService.logout(refreshToken, req.user?.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

// ─── POST /auth/logout-all ──────────────────────────────────────────────────

export const logoutAll = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.logoutAll(req.user!.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

// ─── GET /auth/me ────────────────────────────────────────────────────────────

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.getProfile(req.user!.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const { name, email } = req.body;
  const result = await authService.updateProfile(req.user!.id, { name, email });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});
