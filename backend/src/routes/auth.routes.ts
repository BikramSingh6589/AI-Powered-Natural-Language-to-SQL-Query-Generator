import { Router } from 'express';
import { 
  register, 
  login, 
  verifyOtpController, 
  me, 
  googleLogin, 
  checkEmail,
  forgotPassword,
  resetPassword 
} from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { registerSchema, loginSchema, verifyOtpSchema } from '../validators/auth.validator';

const router = Router();

router.get('/check-email', checkEmail);
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/google', googleLogin);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtpController);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authenticate, me);

export default router;
