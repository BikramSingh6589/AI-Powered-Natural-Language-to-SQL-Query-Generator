import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { 
  registerUser, 
  loginUser, 
  verifyOtp, 
  generateTokens, 
  generateForgotPasswordOtp, 
  resetPasswordWithOtp 
} from '../services/auth/auth.service';
import { ApiResponse } from '../utils/ApiResponse';
import { sendOtpEmail } from '../services/auth/email.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'));
    
    const { user, otp } = await registerUser(name, email, passwordHash);

    try {
      await sendOtpEmail(email, otp);
    } catch (emailError) {
      // Could not send email, but user was created
    }

    res.status(201).json(ApiResponse.success('User registered successfully. OTP sent.', { userId: user.id }));
  } catch (error) {
    next(error);
  }
};

export const verifyOtpController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;
    const user = await verifyOtp(email, otp);
    
    // Once verified, log them in automatically
    const tokens = await generateTokens({ id: user.id, role: user.role });
    
    res.status(200).json(ApiResponse.success('OTP verified successfully', {
      user: { id: user.id, name: user.name, email: user.email },
      tokens
    }));
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser(email, password);
    const tokens = await generateTokens({ id: user.id, role: user.role });

    res.status(200).json(ApiResponse.success('Login successful', {
      user: { id: user.id, name: user.name, email: user.email },
      tokens
    }));
  } catch (error) {
    next(error);
  }
};

import { AuthRequest } from '../middlewares/auth.middleware';

export const checkEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.query;
    if (!email) {
      throw new AppError('Email is required', 400);
    }
    const user = await prisma.user.findUnique({ where: { email: String(email) } });
    
    res.status(200).json(ApiResponse.success('Email check complete', {
      isRegistered: !!user
    }));
  } catch (error) {
    next(error);
  }
};

export const me = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // req.user is set by auth middleware
    res.status(200).json(ApiResponse.success('User details retrieved', req.user));
  } catch (error) {
    next(error);
  }
};

import { AppError } from '../utils/AppError';
import prisma from '../config/db';

export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (!token) throw new AppError('Token is required', 400);

    // Fetch user info from Google
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) {
      throw new AppError('Invalid Google token', 401);
    }
    
    const profile = await response.json();
    
    const email = profile.email;
    const name = profile.name || email.split('@')[0];
    
    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Create user with dummy password (Google auth)
      const randomPassword = crypto.randomUUID();
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash
        }
      });
    }

    const tokens = await generateTokens({ id: user.id, role: user.role });
    
    res.status(200).json(ApiResponse.success('Google login successful', {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      tokens
    }));
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const { user, otp } = await generateForgotPasswordOtp(email);

    try {
      await sendOtpEmail(email, otp);
    } catch (emailError) {
      // Could not send email, but OTP was generated
    }

    res.status(200).json(ApiResponse.success('OTP sent for resetting password.', null));
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, password } = req.body;
    
    // Hash new password
    const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'));
    
    await resetPasswordWithOtp(email, otp, passwordHash);

    res.status(200).json(ApiResponse.success('Password reset successful.', null));
  } catch (error) {
    next(error);
  }
};
