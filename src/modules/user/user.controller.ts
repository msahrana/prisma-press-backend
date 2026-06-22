import { Request, Response } from 'express';
import { userService } from './user.service';
import HttpStatus from 'http-status';

const registerUser = async (req: Request, res: Response) => {
    try {
        const payload = req.body;

        const user = await userService.registerUserIntoDB(payload);

        res.status(HttpStatus.CREATED).json({
            success: true,
            statusCode: HttpStatus.CREATED,
            message: 'User Created Successfully!',
            data: {
                user,
            },
        });
    } catch (error) {
        console.log(error);

        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Failed to register user!',
            error: (error as Error).message,
        });
    }
};

export const userController = { registerUser };
