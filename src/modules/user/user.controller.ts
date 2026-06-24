import { NextFunction, Request, RequestHandler, Response } from 'express';
import { userService } from './user.service';
import HttpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import jwt from 'jsonwebtoken';
import config from '../../config';

// method-1 (by catchAsync) start:>
const registerUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body;

        const user = await userService.registerUserIntoDB(payload);

        sendResponse(res, {
            success: true,
            statusCode: HttpStatus.CREATED,
            message: 'User Created Successfully!',
            data: { user },
        });
    },
);
// method-1 end:

// method-2 (general method) start:>
// const registerUser = async (req: Request, res: Response) => {
//     try {
//         const payload = req.body;

//         const user = await userService.registerUserIntoDB(payload);

//         res.status(HttpStatus.CREATED).json({
//             success: true,
//             statusCode: HttpStatus.CREATED,
//             message: 'User Created Successfully!',
//             data: {
//                 user,
//             },
//         });
//     } catch (error) {
//         console.log(error);

//         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
//             success: false,
//             statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
//             message: 'Failed to register user!',
//             error: (error as Error).message,
//         });
//     }
// };
// method-2 end:

const getMyProfile = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const profile = await userService.getMyProfileIntoDB(req.user?.id as string);

        sendResponse(res, {
            success: true,
            statusCode: HttpStatus.OK,
            message: 'User profile fetched successfully',
            data: {profile},
        });
    },
);

export const userController = { registerUser, getMyProfile };
