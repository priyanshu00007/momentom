# Momentom Setup Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB database (local or cloud)
- Clerk account for authentication

## Environment Configuration

Create a `.env.local` file in your project root with the following variables:

```bash
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/momentom

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Next.js
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Clerk Authentication
1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy your publishable key and secret key
4. Add them to your `.env.local` file

### 3. Configure MongoDB
1. Set up a MongoDB database (local or MongoDB Atlas)
2. Update the `MONGODB_URI` in your `.env.local` file
3. Ensure your database is accessible

### 4. Run the Application
```bash
npm run dev
```

## Features Implemented

### Authentication & User Management
- ✅ Clerk authentication integration
- ✅ User data stored in MongoDB
- ✅ New users start with reset values (0 XP, 0 progress)
- ✅ User-specific data isolation

### Progress Tracking
- ✅ XP and leveling system
- ✅ Focus time tracking
- ✅ Task completion tracking
- ✅ Pomodoro session tracking
- ✅ Daily/weekly/monthly statistics
- ✅ Achievement system
- ✅ Streak tracking

### Data Persistence
- ✅ All data stored in MongoDB
- ✅ User-specific task management
- ✅ Progress history tracking
- ✅ User preferences storage

### Security
- ✅ Protected API routes
- ✅ User authentication required for all features
- ✅ Data isolation between users

## How It Works

1. **New User Registration**: When a user signs in for the first time, they get a fresh start with all progress values reset to 0
2. **Progress Tracking**: As users complete tasks, focus sessions, and pomodoro sessions, their progress is automatically tracked and stored
3. **Data Isolation**: Each user only sees and manages their own data
4. **Real-time Updates**: Progress updates are immediately reflected in the database and UI

## API Endpoints

- `POST /api/user` - Create/update user profile
- `GET /api/user` - Get user profile
- `PATCH /api/user/progress` - Update user progress
- `GET /api/user/progress` - Get progress summary
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks` - Update task
- `DELETE /api/tasks` - Delete task

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your `MONGODB_URI` is correct
   - Ensure MongoDB is running
   - Check network connectivity

2. **Authentication Errors**
   - Verify Clerk keys are correct
   - Check environment variables are loaded
   - Ensure Clerk application is properly configured

3. **Data Not Loading**
   - Check browser console for errors
   - Verify user is authenticated
   - Check MongoDB connection

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set
3. Ensure MongoDB and Clerk are properly configured
4. Check the terminal for server-side errors
