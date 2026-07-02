import { subscriptionController } from './subscription.controller';
import { Role } from '../../../generated/prisma/enums';
import { auth } from '../../middleware/auth';
import { Router } from 'express';

const router = Router();

router.post(
    '/checkout',
    auth(Role.USER, Role.AUTHOR, Role.ADMIN),
    subscriptionController.createCheckoutSession,
);

router.post('webhook', subscriptionController.handleWebhook);

router.get(
    '/status',
    auth(Role.USER, Role.AUTHOR, Role.ADMIN),
    subscriptionController.getSubscriptionStatus,
);

export const subscriptionRouter = router;
