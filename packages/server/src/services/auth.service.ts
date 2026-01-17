import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { getRedisClient } from '../config/redis';
import { generateVerificationCode } from '../utils/helpers';
import { AppError } from '../middleware/error.middleware';
import { VERIFICATION_CODE_EXPIRES_IN } from '@health-checkup/shared';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone: string;
  birthDate: Date;
  gender: 'male' | 'female';
  marketingConsent?: boolean;
}

interface LoginResult {
  user: Omit<IUser, 'password'>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(input: RegisterInput): Promise<IUser> {
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw new AppError('이미 가입된 이메일입니다.', 409);
    }

    const existingPhone = await User.findOne({ phone: input.phone });
    if (existingPhone) {
      throw new AppError('이미 가입된 휴대폰 번호입니다.', 409);
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const user = await User.create({
      ...input,
      password: hashedPassword,
    });

    return user;
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('이메일 또는 비밀번호가 올바르지 않습니다.', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('이메일 또는 비밀번호가 올바르지 않습니다.', 401);
    }

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in Redis
    const redis = getRedisClient();
    await redis.set(
      `refresh_token:${user._id}`,
      refreshToken,
      'EX',
      7 * 24 * 60 * 60 // 7 days
    );

    const userObj = user.toObject();
    const { password: _, ...userWithoutPassword } = userObj;

    return {
      user: userWithoutPassword as Omit<IUser, 'password'>,
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const decoded = verifyRefreshToken(refreshToken);

    const redis = getRedisClient();
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (!storedToken || storedToken !== refreshToken) {
      throw new AppError('유효하지 않은 리프레시 토큰입니다.', 401);
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError('사용자를 찾을 수 없습니다.', 401);
    }

    const accessToken = generateAccessToken(user);

    return { accessToken };
  }

  async logout(userId: string): Promise<void> {
    const redis = getRedisClient();
    await redis.del(`refresh_token:${userId}`);
  }

  async sendPhoneVerification(phone: string): Promise<void> {
    const code = generateVerificationCode();
    const redis = getRedisClient();

    await redis.set(
      `phone_verification:${phone}`,
      code,
      'EX',
      VERIFICATION_CODE_EXPIRES_IN
    );

    // TODO: Send SMS via SmsService
    console.log(`[DEV] Verification code for ${phone}: ${code}`);
  }

  async verifyPhone(phone: string, code: string): Promise<boolean> {
    const redis = getRedisClient();
    const storedCode = await redis.get(`phone_verification:${phone}`);

    if (!storedCode || storedCode !== code) {
      throw new AppError('인증번호가 올바르지 않습니다.', 400);
    }

    await redis.del(`phone_verification:${phone}`);
    return true;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('사용자를 찾을 수 없습니다.', 404);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('현재 비밀번호가 올바르지 않습니다.', 400);
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
  }
}
