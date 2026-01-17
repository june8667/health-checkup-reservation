import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  // MongoDB
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/health-checkup',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-key-32chars!!',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key-32chars!',

  // 토스페이먼츠
  tossClientKey: process.env.TOSS_CLIENT_KEY || '',
  tossSecretKey: process.env.TOSS_SECRET_KEY || '',

  // 알리고 SMS
  aligoApiKey: process.env.ALIGO_API_KEY || '',
  aligoUserId: process.env.ALIGO_USER_ID || '',
  aligoSender: process.env.ALIGO_SENDER || '',

  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
};
