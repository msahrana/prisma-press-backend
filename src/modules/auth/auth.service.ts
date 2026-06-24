import { ILoginUser } from './auth.interface';
import { prisma } from '../../lib/prisma';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../../config';
import { jwtUtils } from '../../utils/jwt';

const loginUserIntoDB = async (payload: ILoginUser) => {
    const { email, password } = payload;

    // by findUniqueOrThrow: start:>
    const user = await prisma.user.findUniqueOrThrow({
        where: { email },
    });
    // by findUniqueOrThrow: end:

    // by findUnique: start:>
    // const user = await prisma.user.findUnique({
    //     where: { email },
    // });
    // if (!user) {
    //     throw new Error('User not found!');
    // }
    // by findUnique: end:

    if (user.activeStatus === 'BLOCKED') {
        throw new Error(
            'Your account has been blocked. Please contact support.',
        );
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
        throw new Error('Password not matched!');
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.JWT_ACCESS_SECRET,
        config.JWT_ACCESS_EXPIRES_IN as SignOptions,
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.JWT_REFRESH_SECRET,
        config.JWT_REFRESH_EXPIRES_IN as SignOptions,
    );

    return { user, accessToken, refreshToken };
};

export const authService = {
    loginUserIntoDB,
};
