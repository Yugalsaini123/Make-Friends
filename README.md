Friend Recommendation System
This project is a simple friend recommendation system with a frontend and backend setup. Follow the steps below to get everything up and running.

Prerequisites
Make sure you have the following installed on your machine:

Node.js(v14 or later)

npm (v6 or later)

MongoDB

Backend Setup
Clone the Repository

bash
git clone https://github.com/your-repo/Repo_Name.git
cd friend-recommendation-system/backend
Install Dependencies

bash
npm install
Environment Variables

Create a .env file in the backend directory and add the following environment variables:

env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/database_name
JWT_SECRET=your_jwt_secret
Run the Backend Server

bash
npm start
The backend server should now be running on http://localhost:5000.

Frontend Setup
Navigate to the Frontend Directory

bash
cd ../frontend
Install Dependencies

bash
npm install
 

bash
npm start
The frontend server should now be running on http://localhost:3000.

Usage
Open your browser and navigate to http://localhost:3000.

Register a few users and log in.

Use the friend recommendation feature to find new friends based on mutual connections.

Troubleshooting
Ensure MongoDB is running before starting the backend server.

Check that the environment variables are set correctly in both the backend and frontend.

Use browser dev tools and server logs to debug any issues that arise.
