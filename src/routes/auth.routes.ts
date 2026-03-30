import { Router } from 'express';
import User from '../models/User.ts';
import { registerSchema } from '#schemas';
import { login, logout, profile, refresh, register } from '#controllers';
import { authMiddleware } from '#middleware';
// import { validateBodyZod } from '#middleware';

const authRoutes = Router();

authRoutes.post('/register', authMiddleware, register);

authRoutes.post('/login', login);

authRoutes.post('/refresh', refresh);

authRoutes.delete('/logout', logout);

authRoutes.get('/me', profile);

export default authRoutes;
