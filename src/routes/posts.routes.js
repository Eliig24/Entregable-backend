import { Router } from 'express';
import { createPost, getPosts, updatePost, deletePost } from '../controllers/posts.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getPosts);

router.post('/', requireAuth, createPost)

router.delete('/:id', requireAuth, deletePost)

router.put('/:id', requireAuth, updatePost)

export default router;