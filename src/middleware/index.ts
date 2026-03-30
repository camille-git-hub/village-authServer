// TODO: Implement
// - notFoundHandler.ts
// - errorHandler.ts
// - validateBodyZod.ts

import User from "#models/User";
import { registerSchema } from "#schemas";
import type { RequestHandler } from "express";

export const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ message: 'Invalid request body', errors: validation.error.issues });
      return;
    }
    const { firstName, lastName, email, password } = validation.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: 'Email is already registered' });
      return;
    }

    // Create new user
    const user = new User({ firstName, lastName, email, password, roles: ['user'] });

    await user.save();

    res.status(201).json({ message: 'User registered successfully'});
  } catch (error) {
    console.error('Error in authMiddleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

