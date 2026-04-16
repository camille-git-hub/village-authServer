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
    const { _id } = req.params;
    const user = await User.findById(_id);
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
};

export const updateUser: RequestHandler = async (req, res) => {
  try {
    const {
      params: { _id },
    } = req;

    const user = await User.findByIdAndUpdate(_id, req.body, { new: true });
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
};

export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const { _id } = req.params;
    await User.findByIdAndDelete(_id);
    res.status(204).end();
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
};

export const getSavedListings: RequestHandler = async (req, res, next) => {
    try {
        const { _id } = req.params;
        
        const user = await User.findById(_id).populate('savedListings');
        res.status(200).json({ data: user?.savedListings || [] });
    } catch (error) {
        next(error);
    }
};

export const removeSavedListing: RequestHandler = async (req, res, next) => {
    try {
        const { _id, listingId } = req.params;
        
        await User.findByIdAndUpdate(
            _id,
            { $pull: { savedListings: listingId } },
            { new: true }
        );
        
        res.status(200).json({ message: "Listing removed from user" });
    } catch (error) {
        next(error);
    }
};

export const addSavedListing: RequestHandler = async (req, res, next) => {
    try {
        const { _id } = req.params;
        const { listingId } = req.body;
        
        await User.findByIdAndUpdate(
            _id,
            { $addToSet: { savedListings: listingId } },
            { new: true }
        );
        
        res.status(200).json({ message: "Listing saved to user" });
    } catch (error) {
        next(error);
    }
};