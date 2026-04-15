import jwt from 'jsonwebtoken';
import type { RequestHandler } from 'express';

export const verifyToken: RequestHandler = (req, res, next) => {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    let accessToken = req.cookies?.accessToken; // requires cookie-parser dependency

  if (!accessToken){
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7);
    }
  }
  if (!accessToken)
    return next(new Error("Not authenticated", { cause: { status: 401 } }));

  try {
    const decoded = jwt.verify(accessToken, secret) as jwt.JwtPayload;
    const { _id, email} = decoded;

    req.user = { _id, email };
    next();

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(
        new Error("Expired access token", {
          cause: { status: 401, code: "ACCESS_TOKEN_EXPIRED" },
        }),
      );
    }
    return next(new Error("Invalid access token.", { cause: { status: 401 } }));
  }
};

export default verifyToken;