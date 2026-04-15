import "dotenv/config";
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import { authRoutes } from '#routes';
import { usersRoutes } from "#routes";
import { errorHandler, notFoundHandler } from '#middleware';
import './db/index.ts';

const app = express();
const port = process.env.PORT || '4000';

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    exposedHeaders: ['WWW-Authenticate']
  })
);

app.use(express.json(), cookieParser());

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.get('/health', (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Error handling (MUST be last)
app.use('/*splat', notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Auth Server listening on port ${port} || http://localhost:${port}`);
});