# Quiz App - Backend (Node.js + Express + MongoDB)

## What this backend does
- User registration and login
- Quiz creation (questions + multiple choice options + correct answer)
- Quiz listing and browsing
- Taking a quiz (correct answers stay hidden until you submit)
- Scoring and results
- Tracking past attempts
- Forgot password / reset password support

## Setup Steps

### 1. Install dependencies

### 2. Create a .env file
Copy `.env.example` to `.env` and fill in the values:
- `MONGO_URI` -> get this from MongoDB Atlas
- `PORT` -> server port (default 5000)
- `JWT_SECRET` -> any random long string
- `CLIENT_URL` -> your frontend URL (localhost:5173 or the live URL once deployed)
- `EMAIL_USER` / `EMAIL_PASS` -> Gmail app password, used for sending password reset emails

### 3. Run the server

## Folder Structure
quiz-app-backend/
├── config/ -> database connection and email setup
├── controllers/ -> business logic
├── middleware/ -> auth check
├── models/ -> User, Quiz, Attempt schemas
├── routes/ -> API endpoints
└── server.js -> main entry file

## Main API Endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/forgot-password
- POST /api/auth/reset-password/:token
- GET  /api/quizzes (list all, browse)
- POST /api/quizzes (create quiz - protected)
- GET  /api/quizzes/:id/take (get quiz to take - answers hidden)
- POST /api/quizzes/:id/submit (submit answers, get score)
- GET  /api/quizzes/my-quizzes (quizzes I created)
- GET  /api/quizzes/my-attempts (my quiz history)