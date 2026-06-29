import { CommentStatus, PostStatus } from '../../../generated/prisma/enums';
import { PostWhereInput } from '../../../generated/prisma/models';
import { prisma } from '../../lib/prisma';
import {
    ICreatePostPayload,
    IPostQuery,
    IUpdatePostPayload,
} from './post.interface';

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

const getAllPostsIntoDB = async (query: IPostQuery) => {
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ? query.sortBy : 'createdAt';
    const sortOrder = query.sortOrder ? query.sortOrder : 'desc';
    const tags = query.tags ? JSON.parse(query.tags as string) : null;
    const tagsArray = Array.isArray(tags) ? tags : [];

    const andConditions: PostWhereInput[] = [];

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

    if (query.title) {
        andConditions.push({
            title: query.title,
        });
    }

    if (query.content) {
        andConditions.push({
            content: query.content,
        });
    }

    if (query.authorId) {
        andConditions.push({
            authorId: query.authorId,
        });
    }

    if (query.isFeatured) {
        andConditions.push({
            isFeatured: Boolean(query.isFeatured),
        });
    }

    if (query.status) {
        andConditions.push({
            status: query.status,
        });
    }

    if (query.tags) {
        andConditions.push({
            tags: {
                hasSome: tagsArray, // [hasSome-> any tags(partial); byt equals-> all tags(exact)]
            },
        });
    }

    const posts = await prisma.post.findMany({
        // ** search and filter start:> **

        // (1.1) Filtering: (Exact match)
        // where:{
        //     title:'Pele', // Only one item
        // },

        // (1.2) Filtering: (Exact match)
        // where:{
        //     title:'Pele',
        //     content: 'Pele is a great footballer'
        // },

        // (1.3) Filtering: (Exact match by AND operator)
        // where: {
        //     AND: [
        //         {
        //             title: 'Pele',
        //         },
        //         {
        //             content: 'Pele is a great footballer',
        //         },
        //         {
        //             tags: {
        //                 equals: ['database', 'indexing', 'sql'], // all tags
        //             },
        //         },
        //     ],
        // },

        // (1.4) Filtering: (Exact match by AND operator)[best]
        // where: {
        //     AND: [
        //         {
        //             title: 'Pele',
        //         },
        //         {
        //             content: 'Pele is a great footballer',
        //         },
        //         {
        //             tags: {
        //                 has: 'sql', // any tags [kind of partial]
        //             },
        //         },
        //     ],
        // },

        // (2.1) Search: (Partial match)
        // where:{
        //     title: {
        //         contains: "Pele",
        //         mode:"insensitive"
        //     }
        // },

        // (2.2) Search: (Partial match)[Not ideal for partial match]
        // where:{
        //     title: {
        //         contains: "Pele",
        //         mode:"insensitive"
        //     },
        //     content: {
        //         contains: "Pele",
        //         mode:"insensitive"
        //     }
        // },

        // (2.3) Search: (Partial match by OR operator)[best]
        // where: {
        //     OR: [
        //         {
        //             title: {
        //                 contains: 'Pele',
        //                 mode: 'insensitive',
        //             }
        //         },
        //         {
        //             content: {
        //                 contains: 'Pele',
        //                 mode: 'insensitive',
        //             }
        //         },
        //     ],
        // },

        // (2.4) Search: (Partial match by OR operator)[best]
        // where: {
        //     OR: [
        //         {
        //             title: {
        //                 contains: 'Ronaldo',
        //                 mode: 'insensitive',
        //             }
        //         },
        //         {
        //             content: {
        //                 contains: 'Ronaldo',
        //                 mode: 'insensitive',
        //             }
        //         },
        //     ],
        // },

        // (3) combining search (OR Operator) and filtering (AND operator)
        // (3.1) filtering & searching combined
        // where: {
        //     AND: [
        //         {
        //             // searching
        //             OR: [
        //                 {
        //                     title: {
        //                         contains: 'Pe',
        //                         mode: 'insensitive',
        //                     },
        //                 },
        //                 {
        //                     content: {
        //                         contains: 'Pe',
        //                         mode: 'insensitive',
        //                     },
        //                 },
        //             ],
        //         },

        //         // filtering
        //         {
        //             title: 'Pele',
        //         },
        //         {
        //             content: 'Pele',
        //         },
        //     ],
        // },

        // ** search and filter end: **

        // ** [Pagination with (limit or take) and (skip or page )] start:> **
        // take: 1,
        // take : 2,
        //  skip : 0   // for first page; {Not assignable :> skip : 0 }
        // skip : 1, // visiting page 2
        // skip : 2, // visiting page 3
        // skip : 3, // visiting page 4
        //page =4 , limit / take = 1 => skip : [(page-1) * limit] => [formula]
        //page = 3, limit / take = 10 => skip : (page -1 ) * limit = (3-1) * 10 = 20 [per page 10]
        // ** [Pagination with (limit or take) and (skip or page )] end: **

        // ** (sorting in ascending or descending order on specific fields) start:> **
        // orderBy : {
        //     createdAt : "desc",
        //     title : "asc",
        //     content : "desc"
        //     // fieldName : asc/desc
        // },
        // ** (sorting in ascending or descending order on specific fields) end: **

        // ** dynamic searching, filtering start:> [Not ideal] **
        // where: {
        //     AND: [
        //         query.searchTerm
        //             ? {
        //                   OR: [
        //                       {
        //                           title: {
        //                               contains: query.searchTerm,
        //                               mode: 'insensitive',
        //                           },
        //                       },
        //                       {
        //                           content: {
        //                               contains: query.searchTerm,
        //                               mode: 'insensitive',
        //                           },
        //                       },
        //                   ],
        //               }
        //             : {},

        //         //title filtering
        //         query.title ? { title: query.title } : {},

        //         //content filtering
        //         query.content ? { content: query.content } : {},
        //         {
        //             tags: {
        //                 hasSome:[ ""] // [one or many tags]
        //             }
        //         }
        //     ],
        // },
        // ** dynamic searching, filtering end: **

        // ** dynamic searching, filtering by andConditions start : [best] **
        where: {
            AND: andConditions,
        },
        // ** dynamic searching, filtering by andConditions end: **

        // ** dynamic pagination and sorting start:> **
        take: limit,
        skip: skip,
        orderBy: {
            [sortBy]: sortOrder, // left e [sortBy ]: right e sortOrder
        },
        // **dynamic pagination and sorting end: **

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
