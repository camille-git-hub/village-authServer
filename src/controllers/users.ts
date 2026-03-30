import type { RequestHandler } from "express";
import { User } from "../models/index.ts";

export const getUsers: RequestHandler = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
};

export const createUser: RequestHandler = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
};

export const getUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
};

export const updateUser: RequestHandler = async (req, res) => {
  try {
    const {
      params: { id },
    } = req;

    const user = await User.findByIdAndUpdate(id, req.body, { new: true });
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
};

export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(204).end();
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
};
