import { NextFunction, Request, Response } from 'express';
import { sendResponse } from '../../utils/sendResponse';
import { catchAsync } from '../../utils/catchAsync';
import { authService } from './auth.service';
import HttpStatus from 'http-status';

const loginUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body;
        const loginResult = await authService.loginUserIntoDB(payload);

        sendResponse(res,{
            success: true,
            statusCode: HttpStatus.OK,
            message: 'User login successfully!',
            data: loginResult
        })
    },
);

export const authController = {
    loginUser,
};
