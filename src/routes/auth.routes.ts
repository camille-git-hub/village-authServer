import { Router } from 'express';
import User from '../models/User.ts';
import { registerSchema } from '#schemas';
import { login, logout, profile, refresh, register } from '#controllers';
import verifyToken from '../middleware/verifyToken.ts';

const authRoutes = Router();

authRoutes.post('/register', register);

authRoutes.post('/login', login);

authRoutes.post('/refresh', refresh);

authRoutes.delete('/logout', logout);

authRoutes.get('/me', verifyToken, profile);

export default authRoutes;
