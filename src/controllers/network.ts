declare global {
  namespace Express {
    interface Request {
      user: { _id: string; email: string };
    }
  }
}

import User from '../models/User.ts';
import type { User as UserType } from '../models/User.ts';
import type { RequestHandler } from 'express';

// Get user's network (all connections)
export const getNetwork: RequestHandler = async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId)
      .populate('network.connections', 'firstName lastName email')
      .lean() as UserType | null;

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      connections: user.network?.connections || [],
      receivedCount: user.network?.receivedRequests?.length || 0,
      sentCount: user.network?.sentRequests?.length || 0
    });
  } catch (error) {
    console.error('Error fetching network:', error);
    res.status(500).json({ message: 'Failed to fetch network' });
  }
};

// Send connection request
export const sendConnectionRequest: RequestHandler = async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetUserId } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (userId === targetUserId) {
      res.status(400).json({ message: 'Cannot connect with yourself' });
      return;
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!user.network || !targetUser.network) {
      res.status(500).json({ message: 'Network not initialized' });
      return;
    }

    // Check if already connected
    const isConnected = user.network.connections.some(
      (id: any) => id.toString() === targetUserId
    );
    if (isConnected) {
      res.status(400).json({ message: 'Already connected' });
      return;
    }

    // Check if request already sent
    const requestSent = user.network.sentRequests.some(
      (id: any) => id.toString() === targetUserId
    );
    if (requestSent) {
      res.status(400).json({ message: 'Request already sent' });
      return;
    }

    // Add to sender's sentRequests and receiver's receivedRequests
    user.network.sentRequests.push(targetUserId as any);
    targetUser.network.receivedRequests.push(userId as any);

    await user.save();
    await targetUser.save();

    res.json({ message: 'Connection request sent' });
  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json({ message: 'Failed to send connection request' });
  }
};

// Accept connection request
export const acceptConnectionRequest: RequestHandler = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { fromUserId } = req.params;

    if (!currentUserId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const currentUser = await User.findById(currentUserId);
    const otherUser = await User.findById(fromUserId);

    if (!currentUser || !otherUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!currentUser.network || !otherUser.network) {
      res.status(500).json({ message: 'Network not initialized' });
      return;
    }

    // Add to connections
    const alreadyConnected = currentUser.network.connections.some(
      (id: any) => id.toString() === fromUserId
    );
    if (!alreadyConnected) {
      currentUser.network.connections.push(fromUserId as any);
    }

    const otherAlreadyConnected = otherUser.network.connections.some(
      (id: any) => id.toString() === currentUserId
    );
    if (!otherAlreadyConnected) {
      otherUser.network.connections.push(currentUserId as any);
    }

    // Remove from requests
    currentUser.network.receivedRequests = currentUser.network.receivedRequests
      .filter((id: any) => id.toString() !== fromUserId);
    otherUser.network.sentRequests = otherUser.network.sentRequests
      .filter((id: any) => id.toString() !== currentUserId);

    await currentUser.save();
    await otherUser.save();

    res.json({ message: 'Connection accepted' });
  } catch (error) {
    console.error('Error accepting connection request:', error);
    res.status(500).json({ message: 'Failed to accept connection request' });
  }
};

// Decline connection request
export const declineConnectionRequest: RequestHandler = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { fromUserId } = req.params;

    if (!currentUserId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const currentUser = await User.findById(currentUserId);
    const otherUser = await User.findById(fromUserId);

    if (!currentUser || !otherUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!currentUser.network || !otherUser.network) {
      res.status(500).json({ message: 'Network not initialized' });
      return;
    }

    // Remove from requests
    currentUser.network.receivedRequests = currentUser.network.receivedRequests
      .filter((id: any) => id.toString() !== fromUserId);
    otherUser.network.sentRequests = otherUser.network.sentRequests
      .filter((id: any) => id.toString() !== fromUserId);

    await currentUser.save();
    await otherUser.save();

    res.json({ message: 'Connection request declined' });
  } catch (error) {
    console.error('Error declining connection request:', error);
    res.status(500).json({ message: 'Failed to decline connection request' });
  }
};

// Remove from network
export const removeConnection: RequestHandler = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId: userToRemove } = req.params;

    if (!currentUserId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const currentUser = await User.findById(currentUserId);
    const otherUser = await User.findById(userToRemove);

    if (!currentUser || !otherUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!currentUser.network || !otherUser.network) {
      res.status(500).json({ message: 'Network not initialized' });
      return;
    }

    // Remove from connections
    currentUser.network.connections = currentUser.network.connections
      .filter((id: any) => id.toString() !== userToRemove);
    otherUser.network.connections = otherUser.network.connections
      .filter((id: any) => id.toString() !== currentUserId);

    await currentUser.save();
    await otherUser.save();

    res.json({ message: 'Removed from network' });
  } catch (error) {
    console.error('Error removing connection:', error);
    res.status(500).json({ message: 'Failed to remove connection' });
  }
};

// Get connection requests
export const getConnectionRequests: RequestHandler = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId)
      .populate('network.receivedRequests', 'firstName lastName email')
      .populate('network.sentRequests', 'firstName lastName email')
      .lean() as UserType | null;

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      received: user.network?.receivedRequests || [],
      sent: user.network?.sentRequests || []
    });
  } catch (error) {
    console.error('Error fetching connection requests:', error);
    res.status(500).json({ message: 'Failed to fetch connection requests' });
  }
};
