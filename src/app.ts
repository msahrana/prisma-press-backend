import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import config from './config';
import cookieParser from 'cookie-parser';
import { userRouter } from './modules/user/user.route';
import { authRouter } from './modules/auth/auth.route';
import { postRouter } from './modules/posts/post.route';
import { commentRouter } from './modules/comments/comment.route';

const app: Application = express();

app.use(
    cors({
        origin: config.APP_URL,
        credentials: true,
    }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, Welcome our Prisma Press Backend server...!');
});

app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);

export default app;
