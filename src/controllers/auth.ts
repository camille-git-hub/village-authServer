import { User } from "../models/index.ts";
import { type RequestHandler } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import RefreshToken from "../models/RefreshToken.ts";
import { JWT_SECRET, SALT_ROUNDS, REFRESH_TOKEN_TTL } from "#config";

declare global {
  namespace Express {
    interface Request {
      user: { _id: string; email: string };
    }
  }
}

export const register: RequestHandler = async (req, res, next) => {
  try {
    const {
      body: { email, password, firstName, lastName },
    } = req;

    const found = await User.exists({ email });
    if (found)
      throw new Error("user already exists", { cause: { status: 409 } });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({ email, password: hash, firstName, lastName });

    const payload = { email: user.email, id: user._id };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "8h",
    });

    const refreshToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL || '2592000000'); // Default to 30 days if not set

    await RefreshToken.create({ token: refreshToken, userId: user._id, expiresAt });

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ msg: "Sucessfully registered", accessToken: token, token: token});
  } catch (error) {
    next(error);
  }
};
export const login: RequestHandler = async (req, res, next) => {
  try {
    const {
      body: { email, password },
    } = req;

    const user = await User.findOne({ email }).select("+password");

    if (!user)
      throw new Error("Invalid credintial", { cause: { status: 401 } });

    const match = await bcrypt.compare(password, user.password);

    if (!match)
      throw new Error("Invalid credintial", { cause: { status: 401 } });

    const payload = { email: user.email, _id: user._id };

    const token = jwt.sign(payload, `${process.env.JWT_SECRET}`, {
      expiresIn: "8h",
    });

    await RefreshToken.deleteMany({ userId: user._id });

    const refreshToken = crypto.randomUUID();

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await RefreshToken.create({ token: refreshToken, userId: user._id, expiresAt });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.status(200).json({ msg: "Sucessfully loggedin", accessToken: token, token: token });
  } catch (error) {
    next(error);
  }
};

export const refresh: RequestHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken)
      throw new Error("No Refresh Token Provided", { cause: { status: 401 } });

    const token = await RefreshToken.findOne({ token: refreshToken });

    if (!token)
      throw new Error("Refresh Token Not Found", { cause: { status: 401 } });

    const user = await User.findById(token.userId);

    if (!user) throw new Error("User Not Found", { cause: { status: 401 } });

    await RefreshToken.findByIdAndDelete(token._id);

    const newRefreshToken = crypto.randomUUID();

    await RefreshToken.create({ token: newRefreshToken, userId: user._id });

    const payload = { email: user.email, _id: user._id };

    const newAccessToken = jwt.sign(payload, `${process.env.JWT_SECRET}`, {
      expiresIn: "8h",
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.json({ accessToken: newAccessToken, token: newAccessToken });
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    console.log(refreshToken);

    await RefreshToken.deleteOne({ token: refreshToken });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.end();
  } catch (error) {
    next(error);
  }
};

export const profile: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.json(user);
  } catch (error) {
    next(error);
  }
};
