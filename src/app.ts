import express, { Application, Request, Response } from 'express';
import { commentRouter } from './modules/comments/comment.route';
import { userRouter } from './modules/user/user.route';
import { authRouter } from './modules/auth/auth.route';
import { postRouter } from './modules/posts/post.route';
import { notFound } from './middleware/notFound';
import cookieParser from 'cookie-parser';
import config from './config';
import cors from 'cors';
import { globalErrorHandler } from './middleware/globalErrorHandler';

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

app.use(notFound);
app.use(globalErrorHandler);

export default app;
