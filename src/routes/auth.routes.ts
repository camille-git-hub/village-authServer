import { Router } from 'express';
import User from '#models/User';
import { registerSchema } from '#schemas';
import { login, logout, me, refresh, register } from '#controllers';
import { authMiddleware } from '#middleware';
// import { validateBodyZod } from '#middleware';

const authRoutes = Router();

authRoutes.post('/register', authMiddleware, register);

authRoutes.post('/login', login);

authRoutes.post('/refresh', refresh);

authRoutes.delete('/logout', logout);

authRoutes.get('/me', me);

export default authRoutes;
