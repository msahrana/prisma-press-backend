import { prisma } from '../../lib/prisma';
import config from '../../config';
import bcrypt from 'bcryptjs';
import { IRegisterUserPayload } from './user.interface';

const registerUserIntoDB = async (payload: IRegisterUserPayload) => {
    const { name, email, password, profilePhoto } = payload;

    const isUserExist = await prisma.user.findUnique({
        where: { email },
    });

    if (isUserExist) {
        throw new Error('User with the email already exit!');
    }

    const hashedPassword = await bcrypt.hash(
        password,
        Number(config.BCRYPT_SALT_ROUNDS),
    );

    // method-1 start:>
    const createUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            profile: {
                create: {
                    profilePhoto,
                },
            },
        },
    });
    // method-1 end:

    // method-2 start:>
    // const createUser = await prisma.user.create({
    //     data: {
    //         name,
    //         email,
    //         password: hashedPassword,
    //     },
    // });

    // await prisma.profile.create({
    //     data: {
    //         userId: createUser.id,
    //         profilePhoto,
    //     },
    // });
    // method-2 end:

    const newUser = await prisma.user.findUnique({
        where: {
            id: createUser.id,
            email: createUser.email || email,
        },
        omit: {
            password: true,
        },
        include: {
            profile: true,
        },
    });

    return newUser;
};

export const userService = { registerUserIntoDB };
