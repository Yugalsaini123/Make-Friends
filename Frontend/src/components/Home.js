// src/components/Home.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { token, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    fetchFriends();
    fetchRecommendations();
    fetchPendingRequests();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetch('http://localhost:5000/friends', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setFriends(data);
    } catch (error) {
        console.error('Error fetching friends:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('http://localhost:5000/friends/recommendations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/friends/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setPendingRequests(data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:5000/friends/search?username=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      await fetch(`http://localhost:5000/friends/request/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      handleSearch(); // Refresh search results
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const acceptFriendRequest = async (userId) => {
    try {
      await fetch(`http://localhost:5000/friends/accept/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPendingRequests();
      fetchFriends();
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const unfriend = async (userId) => {
    try {
      await fetch(`http://localhost:5000/friends/unfriend/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFriends();
    } catch (error) {
      console.error('Error unfriending user:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Friend Management</h1>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Search Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Search
            </button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-4">Search Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map(user => (
                  <div key={user._id} className="border p-4 rounded">
                    <p className="font-medium">{user.username}</p>
                    <button
                      onClick={() => sendFriendRequest(user._id)}
                      className="mt-2 bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                    >
                      Add Friend
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Friend Requests Section */}
        {pendingRequests.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">Pending Friend Requests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRequests.map(request => (
                <div key={request._id} className="border p-4 rounded">
                  <p className="font-medium">{request.username}</p>
                  <button
                    onClick={() => acceptFriendRequest(request._id)}
                    className="mt-2 bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">My Friends</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map(friend => (
              <div key={friend._id} className="border p-4 rounded">
                <p className="font-medium">{friend.username}</p>
                <button
                  onClick={() => unfriend(friend._id)}
                  className="mt-2 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                >
                  Unfriend
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recommended Friends</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map(rec => (
              <div key={rec.user._id} className="border p-4 rounded">
                <p className="font-medium">{rec.user.username}</p>
                <p className="text-sm text-gray-600">{rec.mutualFriends} mutual friends</p>
                <button
                  onClick={() => sendFriendRequest(rec.user._id)}
                  className="mt-2 bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                >
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;