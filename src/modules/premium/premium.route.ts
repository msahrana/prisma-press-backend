import { subscriptionGuard } from '../../middleware/premiumGuard';
import { Role } from '../../../generated/prisma/enums';
import { auth } from '../../middleware/auth';
import { Router } from 'express';
import { premiumController } from './premium.controller';

const router = Router();

router.get(
    '/',
    auth(Role.ADMIN, Role.AUTHOR, Role.USER),
    subscriptionGuard(),
    premiumController.getPremiumContent,
);

export const premiumRouter = router;
