# Quiz App - Backend (Node.js + Express + MongoDB)

## Yeh backend kya karta hai
- User registration/login
- Quiz creation (questions + multiple choice options + correct answer)
- Quiz listing and browsing
- Taking a quiz (correct answers hidden until submit)
- Scoring and results
- Tracking past attempts

## Setup Steps (jaise Job Board mein kiya tha)

### 1. Dependencies install karo
```
npm install
```

### 2. .env file banao
`.env.example` ko copy karke `.env` banao, values daalo:
- `MONGO_URI` -> MongoDB Atlas se milega
- `JWT_SECRET` -> koi bhi random long string
- `CLIENT_URL` -> frontend ka URL (localhost:5173 ya live URL)

### 3. Server chalao
```
npm run dev
```

## Folder Structure
```
quiz-app-backend/
├── config/          -> database connection
├── controllers/      -> business logic
├── middleware/        -> auth check
├── models/          -> User, Quiz, Attempt schemas
├── routes/          -> API endpoints
└── server.js         -> main entry file
```

## Main API Endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET  /api/quizzes (list all, browse)
- POST /api/quizzes (create quiz - protected)
- GET  /api/quizzes/:id/take (get quiz to take - answers hidden)
- POST /api/quizzes/:id/submit (submit answers, get score)
- GET  /api/quizzes/my-quizzes (quizzes I created)
- GET  /api/quizzes/my-attempts (my quiz history)
