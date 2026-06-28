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
    async (req: Request, res: Response, next: NextFunction) => {
        const authorId = req.user?.id;
        const isAdmin = req.user?.role === 'ADMIN';
        const payload = req.body;
        const commentId = req.params.commentId;

        if (!commentId) {
            throw new Error('Comment Id Required In Params');
        }

        const result = await commentService.updateCommentIntoDB(
            commentId as string,
            payload,
            authorId as string,
            isAdmin,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Comment updated successfully',
            data: result,
        });
    },
);

const deleteComment = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const authorId = req.user?.id;
        const isAdmin = req.user?.role === 'ADMIN';

        const { commentId } = req.params;
        if (!commentId) {
            throw new Error('Comment Id Required In Params');
        }

        const result = await commentService.deleteCommentIntoDB(
            commentId as string,
            authorId as string,
            isAdmin,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Comment deleted successfully',
            data: result,
        });
    },
);

const moderateComment = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const isAdmin = req.user?.role === 'ADMIN';
        const { commentId } = req.params;
        const { status } = req.body;

        if (!commentId) {
            throw new Error('Comment Id Required In Params');
        }

        if (!['APPROVED', 'REJECT'].includes(status)) {
            throw new Error('Status must be APPROVED or REJECT.');
        }

        const result = await commentService.moderateCommentIntoDB(
            commentId as string,
            status,
            isAdmin,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Comment moderated successfully',
            data: result,
        });
    },
);

export const commentController = {
    createComment,
    getCommentByCommentId,
    getCommentByAuthorId,
    updateComment,
    deleteComment,
    moderateComment,
};
