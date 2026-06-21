import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/db';
import { AppError } from '../../utils/AppError';
import crypto from 'crypto';

// Generates a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const registerUser = async (name: string, email: string, passwordHash: string) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('User already exists', 409);
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
  });

  const otp = generateOTP();
  await prisma.oTP.create({
    data: {
      userId: user.id,
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
    },
  });

  return { user, otp };
};export const loginUser = async (email: string, passwordHashAttempt: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('User not registered', 404);
  }

  const isValid = await bcrypt.compare(passwordHashAttempt, user.passwordHash);
  if (!isValid) {
    throw new AppError('Incorrect password', 401);
  }

  return user;
};

export const verifyOtp = async (email: string, code: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('User not registered', 404);
  }

  const otpRecord = await prisma.oTP.findFirst({
    where: {
      userId: user.id,
      code,
      isUsed: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!otpRecord) {
    throw new AppError('Invalid or expired OTP', 400);
  }

  await prisma.oTP.update({
    where: { id: otpRecord.id },
    data: { isUsed: true },
  });

  return user;
};

export const generateForgotPasswordOtp = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('User not registered', 404);
  }

  const otp = generateOTP();
  await prisma.oTP.create({
    data: {
      userId: user.id,
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
    },
  });

  return { user, otp };
};

export const resetPasswordWithOtp = async (email: string, code: string, newPasswordHash: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('User not registered', 404);
  }

  const otpRecord = await prisma.oTP.findFirst({
    where: {
      userId: user.id,
      code,
      isUsed: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!otpRecord) {
    throw new AppError('Invalid or expired OTP', 400);
  }

  await prisma.oTP.update({
    where: { id: otpRecord.id },
    data: { isUsed: true },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newPasswordHash },
  });

  return user;
};
export const generateTokens = async (user: { id: string; role: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET as string,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES as any }
  );

  const refreshTokenString = crypto.randomUUID();
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshTokenString,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  const refreshToken = jwt.sign(
    { id: user.id, token: refreshTokenString },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES as any }
  );

  return { accessToken, refreshToken };
};
