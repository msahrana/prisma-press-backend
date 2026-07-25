import { CommentStatus, PostStatus } from '../../../generated/prisma/enums';
import { PostWhereInput } from '../../../generated/prisma/models';
import { prisma } from '../../lib/prisma';
import {
    ICreatePostPayload,
    IPostQuery,
    IUpdatePostPayload,
} from './post.interface';
import { buildPostFilters } from './utils';

const createPostIntoDB = async (
    payload: ICreatePostPayload,
    userId: string,
) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId,
        },
        include: {
            subscription: true,
        },
    });

    if (payload.isPremium && user.subscription?.status !== 'ACTIVE') {
        throw new Error(
            'You are not a premium user. So You can not create Premium content',
        );
    }

    const result = await prisma.post.create({
        data: {
            ...payload,
            authorId: userId,
        },
    });
    return result;
};

const getAllPostsIntoDB = async (query: IPostQuery) => {
    const limit = Number(query.limit) || 10;
    const page = Number(query.page) || 1;

    const skip = (page - 1) * limit;

    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const tagsArray = query.tags
        ? query.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
        : [];

    const andConditions: PostWhereInput[] = [];

    // Search
    if (query.searchTerm) {
        andConditions.push({
            OR: [
                {
                    title: {
                        contains: query.searchTerm,
                        mode: 'insensitive',
                    },
                },
                {
                    content: {
                        contains: query.searchTerm,
                        mode: 'insensitive',
                    },
                },
            ],
        });
    }

    // Title Filter
    if (query.title) {
        andConditions.push({
            title: query.title,
        });
    }

    // Content Filter
    if (query.content) {
        andConditions.push({
            content: query.content,
        });
    }

    // Author Filter
    if (query.authorId) {
        andConditions.push({
            authorId: query.authorId,
        });
    }

    // Status Filter
    if (query.status) {
        andConditions.push({
            status: query.status,
        });
    }

    // Featured Filter
    if (query.isFeatured) {
        andConditions.push({
            isFeatured: query.isFeatured === 'true',
        });
    }

    // Premium Filter
    if (query.isPremium) {
        andConditions.push({
            isPremium: query.isPremium === 'true',
        });
    }

    // Tags Filter
    if (tagsArray.length > 0) {
        andConditions.push({
            tags: {
                hasSome: tagsArray,
            },
        });
    }

    // Only Published Public Posts
    andConditions.push({
        isPremium: false,
    });

    //Where
    // const where: PostWhereInput = {
    //     AND: andConditions,
    // };

    const where = buildPostFilters(query);

    //Prisma Query
    const posts = await prisma.post.findMany({
        where,

        take: limit,
        skip,

        orderBy: {
            [sortBy]: sortOrder,
        },

        include: {
            author: {
                omit: {
                    password: true,
                },
            },
            comments: true,
        },
    });

    //Count
    const totalPostCount = await prisma.post.count({
        where: {
            AND: andConditions,
        },
    });

    //Return
    return {
        data: posts,
        meta: {
            page,
            limit,
            total: totalPostCount,
            totalPages: Math.ceil(totalPostCount / limit),
        },
    };
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
                isPremium: false,
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
