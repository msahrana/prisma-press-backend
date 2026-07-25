import { PostWhereInput } from '../../../generated/prisma/models';
import { IPostQuery } from './post.interface';

export const buildPostFilters = (query: IPostQuery): PostWhereInput => {
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

    // Title
    if (query.title) {
        andConditions.push({
            title: query.title,
        });
    }

    // Content
    if (query.content) {
        andConditions.push({
            content: query.content,
        });
    }

    // Author
    if (query.authorId) {
        andConditions.push({
            authorId: query.authorId,
        });
    }

    // Status
    if (query.status) {
        andConditions.push({
            status: query.status,
        });
    }

    // Featured
    if (query.isFeatured) {
        andConditions.push({
            isFeatured: query.isFeatured === 'true',
        });
    }

    // Premium
    andConditions.push({
        isPremium: false,
    });

    // Tags
    if (query.tags) {
        const tagsArray = query.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean);

        if (tagsArray.length > 0) {
            andConditions.push({
                tags: {
                    hasSome: tagsArray,
                },
            });
        }
    }

    return {
        AND: andConditions,
    };
};
