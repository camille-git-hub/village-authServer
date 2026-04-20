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
        const { userId } = req.params;

        console.log(`Fetching saved listings for user ${userId}`);
        
        if (!userId) {
            res.status(400).json({ message: "Missing userId" });
            return;
        }
        
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({ data: user?.savedListings || [] });
    } catch (error) {
      console.error('Error in getSavedListings:', error);
        next(error);
    }
};

export const addSavedListing: RequestHandler = async (req, res, next) => {
    try {
        const { userId } = req.params;  
        const { listingId } = req.body;
                
        if (!userId || !listingId) {
            res.status(400).json({ 
                message: "Missing userId or listingId",
                userId,
                listingId
            });
            return;
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,  
            { $addToSet: { savedListings: listingId } },
            { new: true }
        );
        
        if (!updatedUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        
        res.status(200).json({ message: "Listing saved to user", data: updatedUser.savedListings });
    } catch (error) {
        console.error('Error in addSavedListing:', error);
        next(error);
    }
};

export const removeSavedListing: RequestHandler = async (req, res, next) => {
    try {
        const { userId } = req.params;  
        const {listingId} = req.body;
        
        
        if (!userId || !listingId) {
            res.status(400).json({ 
                message: "Missing userId or listingId" 
            });
            return;
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { $pull: { savedListings: listingId } },
            { new: true }
        );
        
        if (!updatedUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        
        res.status(200).json({ message: "Listing removed from user", data: updatedUser.savedListings });
    } catch (error) {
        console.error('Error in removeSavedListing:', error);
        next(error);
    }
};