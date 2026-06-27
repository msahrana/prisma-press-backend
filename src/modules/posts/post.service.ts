import { CommentStatus, PostStatus } from '../../../generated/prisma/enums';
import { prisma } from '../../lib/prisma';
import { ICreatePostPayload, IUpdatePostPayload } from './post.interface';

const createPostIntoDB = async (
    payload: ICreatePostPayload,
    userId: string,
) => {
    const result = await prisma.post.create({
        data: {
            ...payload,
            authorId: userId,
        },
    });
    return result;
};

const getAllPostsIntoDB = async () => {
    const posts = await prisma.post.findMany({
        include: {
            author: {
                omit: {
                    password: true,
                },
            },
            comments: true,
        },
    });

    return posts;
};

const getPostByIdIntoDB = async (postId: string) => {
    // [age get, pore update]
    // await prisma.post.update({
    //     where: {
    //         id: postId,
    //     },

    //     data: {
    //         views: {
    //             increment: 1,
    //         },
    //     },
    // });

    // throw new Error("Fake Error")

    // const updatedPost = await prisma.post.findUniqueOrThrow({
    //     where: {
    //         id: postId,
    //     },

    //     include: {
    //         author: {
    //             omit: {
    //                 password: true,
    //             },
    //         },

    //         comments: {
    //             where: {
    //                 status: CommentStatus.APPROVED,
    //             },

    //             orderBy: {
    //                 createdAt: 'desc',
    //             },
    //         },

    //         _count: {
    //             select: {
    //                 comments: true,
    //             },
    //         },
    //     },
    // });

    // return updatedPost;

    // [age update, pore get by transaction {It is recommended}]
    const transactionResult = await prisma.$transaction(async (tx) => {
        await tx.post.update({
            where: {
                id: postId,
            },

            data: {
                views: {
                    increment: 1,
                },
            },
        });
        // throw new Error("fake error")
        const post = await tx.post.findUniqueOrThrow({
            where: {
                id: postId,
            },

            include: {
                author: {
                    omit: {
                        password: true,
                    },
                },

                comments: {
                    where: {
                        status: CommentStatus.APPROVED,
                    },

                    orderBy: {
                        createdAt: 'desc',
                    },
                },

                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
        });
        return post;
    });

    return transactionResult;
};

const updatePostIntoDB = async (
    postId: string,
    payload: IUpdatePostPayload,
    authorId: string,
    isAdmin: boolean,
) => {
    const post = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId,
        },
    });

    if (!isAdmin && post.authorId !== authorId) {
        throw new Error('You are not the owner of this post!');
    }

    const updatePost = await prisma.post.update({
        where: {
            id: postId,
        },

        data: payload,

        include: {
            author: {
                omit: {
                    password: true,
                },
            },

            comments: true,
        },
    });

    return updatePost;
};

const deletePostIntoDB = async (
    postId: string,
    authorId: string,
    isAdmin: boolean,
) => {
    const post = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId,
        },
    });

    if (!isAdmin && post.authorId !== authorId) {
        throw new Error('You are not the owner of this post!');
    }

    await prisma.post.delete({
        where: {
            id: postId,
        },
    });
};

const getPostsStatsIntoDB = async () => {
    const transactionResult = await prisma.$transaction(async (tx) => {
        // ** Not recommended because, run one by one **
        // const totalPosts = await tx.post.count();

        // const totalPublishedPosts = await tx.post.count({
        //     where : {
        //         status : PostStatus.PUBLISHED
        //     }
        // })

        // const totalDraftPosts = await tx.post.count({
        //     where : {
        //         status : PostStatus.DRAFT
        //     }
        // })

        // const totalArchivedPosts = await tx.post.count({
        //     where : {
        //         status : PostStatus.ARCHIVED
        //     }
        // })

        // const totalComments = await tx.comment.count();

        // const totalApprovedComments = await tx.comment.count({
        //     where : {
        //         status : CommentStatus.APPROVED
        //     }
        // });

        // const totalRejectedComments = await tx.comment.count({
        //     where : {
        //         status : CommentStatus.REJECT
        //     }
        // });

        // //Not a good approach
        // // const allPosts = await tx.post.findMany();

        // // let totalPostViews = 0;

        // // allPosts.forEach((post)=>{
        // //     totalPostViews = totalPostViews + post.views
        // // })

        // //Good Approach
        // const totalPostViewsAggregate = await tx.post.aggregate({
        //     _sum : {
        //         views : true
        //     }
        // })

        // const totalPostViews = totalPostViewsAggregate._sum.views\

        // return {
        //     totalPosts,
        //     totalPublishedPosts,
        //     totalDraftPosts,
        //     totalArchivedPosts,
        //     totalComments,
        //     totalApprovedComments,
        //     totalRejectedComments,
        //     totalPostViews
        // }

        // [** It is recommended because, run together**]
        const [
            totalPosts,
            totalPublishedPosts,
            totalDraftPosts,
            totalArchivedPosts,
            totalComments,
            totalApprovedComments,
            totalRejectedComments,
            totalPostViewsAggregate,
        ] = await Promise.all([
            await tx.post.count(),
            await tx.post.count({
                where: {
                    status: PostStatus.PUBLISHED,
                },
            }),
            await tx.post.count({
                where: {
                    status: PostStatus.DRAFT,
                },
            }),
            await tx.post.count({
                where: {
                    status: PostStatus.ARCHIVED,
                },
            }),
            await tx.comment.count(),
            await tx.comment.count({
                where: {
                    status: CommentStatus.APPROVED,
                },
            }),
            await tx.comment.count({
                where: {
                    status: CommentStatus.REJECT,
                },
            }),
            await tx.post.aggregate({
                _sum: {
                    views: true,
                },
            }),
        ]);

        return {
            totalPosts,
            totalPublishedPosts,
            totalDraftPosts,
            totalArchivedPosts,
            totalComments,
            totalApprovedComments,
            totalRejectedComments,
            totalPostViews: totalPostViewsAggregate._sum.views,
        };
    });

    return transactionResult;
};

const getMyPostsIntoDB = async (authorId: string) => {
    const myPosts = await prisma.post.findMany({
        where: {
            authorId,
        },

        orderBy: {
            createdAt: 'desc',
        },

        include: {
            comments: true,

            author: {
                omit: {
                    password: true,
                },
            },

            _count: {
                select: {
                    comments: true,
                },
            },
        },
    });

    return myPosts;
};

export const postService = {
    createPostIntoDB,
    getAllPostsIntoDB,
    getPostByIdIntoDB,
    updatePostIntoDB,
    deletePostIntoDB,
    getPostsStatsIntoDB,
    getMyPostsIntoDB,
};
