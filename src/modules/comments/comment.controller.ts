import { NextFunction, Request, Response } from 'express';
import { sendResponse } from '../../utils/sendResponse';
import { catchAsync } from '../../utils/catchAsync';
import { commentService } from './comment.service';
import httpStatus from 'http-status';

const createComment = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const id = req.user?.id;
        const payload = req.body;

        const newComment = await commentService.createCommentIntoDB(
            payload,
            id as string,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: 'Comment Created SuccessFully',
            data: newComment,
        });
    },
);

const getCommentByCommentId = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { commentId } = req.params;

        if (!commentId) {
            throw new Error('Comment Id Required In Params');
        }

        const result = await commentService.getCommentByCommentIdIntoDB(
            commentId as string,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Post retrieved Successfully',
            data: result,
        });
    },
);

const getCommentByAuthorId = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { authorId } = req.params;

        if (!authorId) {
            throw new Error('Author Id Required In Params');
        }

        const results = await commentService.getCommentByAuthorIdIntoDB(
            authorId as string,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'All comments retrieved Successfully',
            data: results,
        });
    },
);

const updateComment = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {},
);

const deleteComment = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {},
);

const moderateComment = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {},
);

export const commentController = {
    createComment,
    getCommentByCommentId,
    getCommentByAuthorId,
    updateComment,
    deleteComment,
    moderateComment,
};
