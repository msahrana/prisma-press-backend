import { prisma } from '../../lib/prisma';
import {
    ICreateCommentPayload,
    IUpdateCommentPayload,
} from './comment.interface';

const createCommentIntoDB = async (
    payload: ICreateCommentPayload,
    userId: string,
) => {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        throw new Error('User not found..!');
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
        where: {
            id: payload.postId,
        },
    });
    if (!post) {
        throw new Error('Post not found.');
    }

    // Create comment
    const result = await prisma.comment.create({
        data: {
            content: payload.content,
            postId: post.id,
            authorId: user.id,
        },

        omit: {
            createdAt: true,
            updatedAt: true,
        },
    });

    return result;
};

const getCommentByCommentIdIntoDB = async (commentId: string) => {
    const results = await prisma.comment.findUnique({
        where: {
            id: commentId,
        },
    });

    if (!results) {
        throw new Error('Comment not found!');
    }

    return results;
};

const getCommentByAuthorIdIntoDB = async (authorId: string) => {
    // Check if the user exists
    const user = await prisma.user.findUnique({
        where: {
            id: authorId,
        },
    });

    if (!user) {
        throw new Error('User not found!');
    }

    // Get all comments by this author
    const comments = await prisma.comment.findMany({
        where: {
            authorId,
        },

        orderBy: {
            createdAt: 'desc',
        },
    });

    return comments;
};

const updateCommentIntoDB = async (
    commentId: string,
    payload: IUpdateCommentPayload,
    authorId: string,
    isAdmin: boolean,
) => {
    const comment = await prisma.comment.findUniqueOrThrow({
        where: {
            id: commentId,
        },
    });

    if (!isAdmin && comment.authorId !== authorId) {
        throw new Error('You are not the owner of this post!');
    }

    const updateComment = await prisma.comment.update({
        where: {
            id: commentId,
        },

        data: payload,
    });

    return updateComment;
};

const deleteCommentIntoDB = async (
    commentId: string,
    authorId: string,
    isAdmin: boolean,
) => {
    const comment = await prisma.comment.findUniqueOrThrow({
        where: {
            id: commentId,
        },
    });

    if (!isAdmin && comment.authorId !== authorId) {
        throw new Error('You are not the owner of this post!');
    }

    await prisma.comment.delete({
        where: {
            id: commentId,
        },
    });
};

const moderateCommentIntoDB = async (
    commentId: string,
    status: 'APPROVED' | 'REJECT',
    isAdmin: boolean,
) => {
    if (!isAdmin) {
        throw new Error('Only admin can moderate comments.');
    }

    const comment = await prisma.comment.findUnique({
        where: {
            id: commentId,
        },
    });

    if (!comment) {
        throw new Error('Comment not found.');
    }

    const result = await prisma.comment.update({
        where: {
            id: commentId,
        },
        data: {
            status,
        },
        include: {
            author: {
                omit: {
                    password: true,
                },
            },
        },
    });

    return result;
};

export const commentService = {
    createCommentIntoDB,
    getCommentByCommentIdIntoDB,
    getCommentByAuthorIdIntoDB,
    updateCommentIntoDB,
    deleteCommentIntoDB,
    moderateCommentIntoDB,
};
