import "dotenv/config";
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import { authRoutes } from '#routes';
import { usersRoutes } from "#routes";
import './db/index.ts';
// import { errorHandler, notFoundHandler } from '#middleware';

const app = express();
const port = process.env.PORT || '4000';

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true, // sends and receives secure cookies
    exposedHeaders: ['WWW-Authenticate'] // needed to send the 'refresh trigger''
  })
);

app.use(express.json(), cookieParser());

app.use('/auth', authRoutes);

app.use('/users', usersRoutes);

// app.use('*splat', notFoundHandler);
// app.use(errorHandler);

app.listen(port, () => {
  console.log(`Auth Server listening on port ${port} || http://localhost:4000`);
});
