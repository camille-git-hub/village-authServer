import { Router } from 'express';
import { getUser, updateUser } from '#controllers';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const usersRouter = Router();

// Protected routes - require authentication
usersRouter.get('/:id', authMiddleware, getUser);
usersRouter.put('/:id', authMiddleware, updateUser);

export default usersRouter;