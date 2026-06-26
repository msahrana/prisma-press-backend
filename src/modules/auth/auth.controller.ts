import { NextFunction, Request, Response } from 'express';
import { sendResponse } from '../../utils/sendResponse';
import { catchAsync } from '../../utils/catchAsync';
import { authService } from './auth.service';
import HttpStatus from 'http-status';

const loginUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body;
        const { accessToken, refreshToken } =
            await authService.loginUserIntoDB(payload);

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'none',
            maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'none',
            maxAge: 1000 * 60 * 60 * 24 * 30, // 1 month or 30 day
        });

        sendResponse(res, {
            success: true,
            statusCode: HttpStatus.OK,
            message: 'User login successfully!',
            data: { accessToken, refreshToken },
        });
    },
);

const refreshToken = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const refreshToken = req.cookies.refreshToken;

        const { accessToken } =
            await authService.refreshTokenIntoDB(refreshToken);

        res.cookie('newAccessToken', accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'none',
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year or 365 day
        });

        sendResponse(res, {
            success: true,
            statusCode: HttpStatus.OK,
            message: 'Token refreshed is done',
            data: { accessToken },
        });
    },
);

export const authController = {
    loginUser,
    refreshToken,
};
