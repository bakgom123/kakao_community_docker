import path from 'path';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import xss from 'xss-clean';

// 라우트 모듈
import authRoutes from './src/routes/authRoutes.js';
import postRoutes from './src/routes/postRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import commentRoutes from './src/routes/commentRoutes.js';
import likeRoutes from './src/routes/likeRoutes.js';
import viewRoutes from './src/routes/viewRoutes.js';

// 데이터베이스 설정
import './src/config/database.js';

// Express 앱 초기화 및 환경 설정
const app = express();
const PORT = process.env.PORT || 3000;
dotenv.config();

// XSS 방지
app.use(xss());

app.use(cors({
    origin: ['http://43.203.237.161', 'http://david-kakao-community-env-front.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com'],  // 프론트엔드 도메인
    credentials: true  // 쿠키/세션 허용
}));

// 요청 본문 파싱 설정
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 세션 설정
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'my-secret-key', // 환경변수로 변경 권장
        resave: true,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // 프로덕션에서만 secure 활성화
            maxAge: 24 * 60 * 60 * 1000, // 24시간
            sameSite: 'none',
        },
    }),
);

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// 정적 파일 제공 설정
// CORS 헤더가 포함된 uploads 디렉토리 접근 설정
app.use(
    '/uploads',
    (req, res, next) => {
        // 배열로 처리
        const allowedOrigins = ['http://43.203.237.161','http://david-kakao-community-env-front.eba-an3dmmwe.ap-northeast-2.elasticbeanstalk.com'];
        const origin = req.headers.origin;
        
        if (allowedOrigins.includes(origin)) {
            res.header('Access-Control-Allow-Origin', origin);
        }
        
        res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        next();
    },
    express.static(path.join(process.cwd(), 'uploads')),
);

// 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/user', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/views', viewRoutes);

// health check
app.get('/health', (req, res)=>{
    res.send('ok');
});

// 서버 시작
app.listen(PORT, () =>
    console.log(`✅ Server running at http://localhost:${PORT}`),
);