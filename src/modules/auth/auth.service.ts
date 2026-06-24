import { ILoginUser } from './auth.interface';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';

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

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
        throw new Error('Password not matched!');
    }

    return user;
};

export const authService = {
    loginUserIntoDB,
};
