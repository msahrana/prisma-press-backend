import { Role } from '../../../generated/prisma/enums';
import { userController } from './user.controller';
import { auth } from '../../middleware/auth';
import { Router } from 'express';

const router = Router();

router.post('/register', userController.registerUser);
router.get(
    '/me',
    auth(Role.ADMIN, Role.USER, Role.AUTHOR),
    userController.getMyProfile,
);

export const userRouter = router;
