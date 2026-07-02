import { subscriptionService } from './subscription.service';
import { NextFunction, Request, Response } from 'express';
import { sendResponse } from '../../utils/sendResponse';
import { catchAsync } from '../../utils/catchAsync';
import httpStatus from 'http-status';

const createCheckoutSession = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;

        const result = await subscriptionService.createCheckoutSessionIntoDB(
            userId as string,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Checkout Completed Successfully!',
            data: result,
        });
    },
);

const handleWebhook = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const event = req.body as Buffer;

        // Get the signature sent by Stripe
        const signature = req.headers['stripe-signature']!;

        await subscriptionService.handleWebhookIntoDB(
            event,
            signature as string,
        );

        sendResponse(res, {
            success: true,
            statusCode: 200,
            message: 'Webhook triggered successfully',
            data: null,
        });
    },
);

const getSubscriptionStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;

        const result = await subscriptionService.getSubscriptionStatusIntoDB(
            userId as string,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Subscription status retrieved successfully!',
            data: result,
        });
    },
);

export const subscriptionController = {
    createCheckoutSession,
    handleWebhook,
    getSubscriptionStatus,
};
