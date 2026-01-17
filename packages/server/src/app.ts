import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import routes from './routes';

const app = express();

// Middleware
app.use(helmet());

// CORS 설정
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // 개발 환경이거나 origin이 없는 경우 (같은 도메인) 허용
    if (!origin || env.isDev) {
      callback(null, true);
      return;
    }
    // 클라이언트 URL 허용
    if (origin === env.clientUrl || origin.includes('cloudtype.app')) {
      callback(null, true);
      return;
    }
    callback(null, true); // 테스트용: 모든 origin 허용
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Preflight 요청 처리
app.options('*', cors(corsOptions));
app.use(morgan(env.isDev ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api', routes);

// Error handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// Start server
async function startServer() {
  try {
    await connectDatabase();

    app.listen(env.port, () => {
      console.log(`🚀 Server running on http://localhost:${env.port}`);
      console.log(`   Environment: ${env.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
