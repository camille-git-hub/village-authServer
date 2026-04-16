import { Router } from 'express';
import { addSavedListing, getUser, updateUser, removeSavedListing, getSavedListings } from '#controllers';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const usersRouter = Router();

// Protected routes - require authentication
usersRouter.get('/:id', authMiddleware, getUser);
usersRouter.put('/:id', authMiddleware, updateUser);
usersRouter.get("/:userId/saved", authMiddleware, getSavedListings);
usersRouter.post("/:userId/saved", authMiddleware, addSavedListing);
usersRouter.delete("/:userId/saved/:listingId", authMiddleware, removeSavedListing);

export default usersRouter;