import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// 정적 파일 제공
app.use(express.static('public'));

// 루트 경로(/) 접속시 로그인 페이지로 리다이렉션
app.get('/', (req, res) => {
    res.redirect('/html/login.html');
});

app.listen(port, () => {
   console.log(`Frontend server running at port ${port}`);
});