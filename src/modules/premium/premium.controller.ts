import { NextFunction, Request, Response } from 'express';
import { sendResponse } from '../../utils/sendResponse';
import { catchAsync } from '../../utils/catchAsync';
import { premiumService } from './premium.service';
import httpStatus from 'http-status';

const getPremiumContent = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const query = req.query;

        const result = await premiumService.getPremiumContentIntoDB(query);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Premium Content Retrieved Successfully!',
            data: result.data,
            meta: result.meta,
        });
    },
);

export const premiumController = { getPremiumContent };
