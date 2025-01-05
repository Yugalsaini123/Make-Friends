// routes/friends.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all friends
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('friends');
    const friends = user.friends;
    res.json(friends);
  } catch (error) {
    console.error('Error fetching friends:', error.message);
    res.status(500).json({ message: 'Error fetching friends' });
  }
});

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const searchTerm = req.query.username;
    const users = await User.find({
      username: { $regex: searchTerm, $options: 'i' },
      _id: { $ne: req.userId }
    }).select('-password');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error searching users' });
  }
});

// Get pending friend requests 
router.get('/pending', auth, async (req, res) => { 
  try { 
    const user = await User.findById(req.userId).populate('pendingFriendRequests'); 
    const pendingRequests = user.pendingFriendRequests; 
    res.json(pendingRequests); 
  } 
  catch (error) { 
    console.error('Error fetching pending friend requests:', error.message); 
    res.status(500).json({ message: 'Error fetching pending friend requests' }); 
  } 
});

// Send friend request
router.post('/request/:userId', auth, async (req, res) => {
  try {
    const sender = await User.findById(req.userId);
    const receiver = await User.findById(req.params.userId);

    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (sender.friends.includes(receiver._id)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    if (!receiver.pendingFriendRequests.includes(sender._id)) {
      receiver.pendingFriendRequests.push(sender._id);
      sender.sentFriendRequests.push(receiver._id);
      
      await receiver.save();
      await sender.save();
    }

    res.json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending friend request' });
  }
});

// Accept friend request
router.post('/accept/:userId', auth, async (req, res) => {
  try {
    const receiver = await User.findById(req.userId);
    const sender = await User.findById(req.params.userId);

    if (!sender) {
      return res.status(404).json({ message: 'User not found' });
    }

    receiver.pendingFriendRequests = receiver.pendingFriendRequests.filter(
      id => id.toString() !== sender._id.toString()
    );
    sender.sentFriendRequests = sender.sentFriendRequests.filter(
      id => id.toString() !== receiver._id.toString()
    );

    receiver.friends.push(sender._id);
    sender.friends.push(receiver._id);

    await receiver.save();
    await sender.save();

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting friend request' });
  }
});

// Get friend recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('friends');
    const friendIds = user.friends.map(friend => friend._id.toString());

    const friendsOfFriends = await User.find({
      _id: {
        $nin: [...friendIds, user._id.toString()],
        $nin: user.pendingFriendRequests,
        $nin: user.sentFriendRequests
      }
    }).populate('friends');

    const recommendations = friendsOfFriends
      .map(potential => {
        const mutualFriends = potential.friends.filter(friend => 
          friendIds.includes(friend._id.toString())
        ).length;
        return {
          user: potential,
          mutualFriends
        };
      })
      .filter(rec => rec.mutualFriends > 0 && rec.user._id.toString() !== user._id.toString())  // Exclude current user
      .sort((a, b) => b.mutualFriends - a.mutualFriends)
      .slice(0, 5);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Error getting recommendations' });
  }
});


// Unfriend user
router.post('/unfriend/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const friend = await User.findById(req.params.userId);

    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.friends = user.friends.filter(id => id.toString() !== friend._id.toString());
    friend.friends = friend.friends.filter(id => id.toString() !== user._id.toString());

    await user.save();
    await friend.save();

    res.json({ message: 'Friend removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing friend' });
  }
});

module.exports = router;