import { PostStatus } from '../../../generated/prisma/enums';

export interface ICreatePostPayload {
    title: string;
    content: string;
    thumbnail?: string;
    isFeatured?: boolean;
    isPremium?: boolean;
    status?: PostStatus;
    tags: string[];
}

export interface IUpdatePostPayload {
    title?: string;
    content?: string;
    thumbnail?: string;
    isFeatured?: boolean;
    isPremium?: boolean;
    status?: PostStatus;
    tags?: string[];
}

export interface IPostQuery {
    // Pagination
    page?: string;
    limit?: string;

    // Search
    searchTerm?: string;

    // Filters
    title?: string;
    content?: string;
    authorId?: string;
    status?: PostStatus;

    isFeatured?: string;
    isPremium?: string;

    tags?: string;

    // Sorting
    sortBy?: 'createdAt' | 'title';
    sortOrder?: 'asc' | 'desc';
}
