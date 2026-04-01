import type { ErrorRequestHandler } from 'express';

interface CustomError extends Error {
  cause?: { status?: number; code?: string };
}

export const errorHandler: ErrorRequestHandler = (err: CustomError, req, res, next) => {
  const status = err.cause?.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] Status: ${status}, Message: ${message}`);

  res.status(status).json({
    error: {
      message,
      code: err.cause?.code,
      status,
    },
  });
};

export default errorHandler;