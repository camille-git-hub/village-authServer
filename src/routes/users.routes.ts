import { Router } from 'express';
import { addSavedListing, getUser, updateUser, removeSavedListing, getSavedListings } from '#controllers';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { verifyToken } from '#middleware';

const usersRouter = Router();

// Protected routes - require authentication
usersRouter.get('/:id', authMiddleware, getUser);
usersRouter.put('/:id', authMiddleware, updateUser);
usersRouter.get("/:userId/saved", verifyToken, getSavedListings);
usersRouter.post("/:userId/saved", verifyToken, addSavedListing);
usersRouter.delete("/:userId/saved/:listingId", verifyToken, removeSavedListing);

export default usersRouter;