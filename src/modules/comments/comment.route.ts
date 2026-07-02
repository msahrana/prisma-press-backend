import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { Role } from '../../../generated/prisma/enums';
import { commentController } from './comment.controller';

const router = Router();

router.post(
    '/',
    auth(Role.USER, Role.ADMIN, Role.AUTHOR),
    commentController.createComment,
);

router.get('/:postId', commentController.getCommentByPostId);

router.get('/author/:authorId', commentController.getCommentByAuthorId);

router.patch(
    '/:commentId',
    auth(Role.ADMIN, Role.AUTHOR),
    commentController.updateComment,
);

router.delete('/:commentId', auth(Role.ADMIN), commentController.deleteComment);

router.put(
    '/moderate/:commentId',
    auth(Role.ADMIN),
    commentController.moderateComment,
);

export const commentRouter = router;
