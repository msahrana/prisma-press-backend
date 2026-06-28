import { NextFunction, Request, Response } from 'express';
import { sendResponse } from '../../utils/sendResponse';
import { catchAsync } from '../../utils/catchAsync';
import { postService } from './post.service';
import httpStatus from 'http-status';

const createPost = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const id = req.user?.id;
        const payload = req.body;

        const newPost = await postService.createPostIntoDB(
            payload,
            id as string,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: 'New Post Created SuccessFully',
            data: newPost,
        });
    },
);

const getAllPosts = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const results = await postService.getAllPostsIntoDB();

        if (results.length === 0) {
            throw new Error('No post yet!!!');
        }

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'All Posts Retrieved Successfully',
            data: results,
        });
    },
);

const getPostById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const postId = req.params.postId;

        if (!postId) {
            throw new Error('Post Id Required In Params');
        }

        const result = await postService.getPostByIdIntoDB(postId as string);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Single Post retrieved Successfully',
            data: result,
        });
    },
);

const updatePost = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const authorId = req.user?.id;
        const isAdmin = req.user?.role === 'ADMIN';
        const payload = req.body;
        const postId = req.params.postId;

        if (!postId) {
            throw new Error('Post Id Required In Params');
        }

        const result = await postService.updatePostIntoDB(
            postId as string,
            payload,
            authorId as string,
            isAdmin,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Post updated successfully',
            data: result,
        });
    },
);

const deletePost = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const authorId = req.user?.id;
        const isAdmin = req.user?.role === 'ADMIN';

        const postId = req.params.postId;
        if (!postId) {
            throw new Error('Post Id Required In Params');
        }

        const result = await postService.deletePostIntoDB(
            postId as string,
            authorId as string,
            isAdmin,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Post deleted successfully',
            data: result,
        });
    },
);

const getPostsStats = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const result = await postService.getPostsStatsIntoDB();

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Post stats retrieved successfully',
            data: result,
        });
    },
);

const getMyPosts = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const authorId = req.user?.id;

        const results = await postService.getMyPostsIntoDB(authorId as string);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'My Posts retrieved successfully',
            data: results,
        });
    },
);

export const postController = {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    getPostsStats,
    getMyPosts,
};
