# Momentom

A productivity and task management web application built with Next.js, Express, and MySQL. It features Pomodoro timer, focus mode, AI assistant, user statistics, and a customizable dashboard.

## Features
- User authentication and profile management
- Task manager with CRUD operations
- Pomodoro timer and focus mode
- AI assistant integration
- Productivity statistics and streak tracking
- Responsive dashboard UI

## Technologies Used
- Next.js (Frontend)
- Express.js (Backend API)
- MySQL (Database)
- NodeMailer (Email integration)
- Gemini AI (Chatbot integration)

## Standard File Structure
```
momentom/
├── app/
│   ├── aiassist/
│   ├── dashboard/
│   ├── focus/
│   ├── pomodoro/
│   ├── taskmanager/
│   ├── components/
│   ├── data/
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── components/
│   └── ui/
├── lib/
│   ├── db.js         # MySQL connection and setup
│   ├── server.js     # Express backend server
│   └── utils.js
├── models/
│   ├── Task.js       # MySQL task model & queries
│   └── User.js       # MySQL user model & queries
├── public/
│   └── *.svg         # Static assets
├── .env              # Environment variables
├── .env.example      # Example env file
├── package.json
├── README.md
└── ...other config files
```

## Setup Instructions
1. **Clone the repository**
2. **Install dependencies**
	```bash
	npm install
	```
3. **Configure environment variables**
	- Copy `.env.example` to `.env` and fill in your MySQL, email, and API credentials.
4. **Start MySQL server**
5. **Run the backend server**
	```bash
	node lib/server.js
	```
6. **Run the Next.js frontend**
	```bash
	npm run dev
	```

## API Endpoints
- `POST /api/users` - Create user
- `GET /api/users/:userId` - Get user profile
- `POST /api/tasks` - Create task
- `GET /api/tasks/:userId` - Get all tasks for user
- `GET /api/tasks/:userId/:id` - Get specific task
- `PUT /api/tasks/:userId/:id` - Update task
- `DELETE /api/tasks/:userId/:id` - Delete task

## Project Prompt
> Build a full-stack productivity app called "Momentom" with Next.js and Express. The app should allow users to manage tasks, track productivity stats, use Pomodoro and focus modes, and interact with an AI assistant. Data should be stored in MySQL, and the backend should provide RESTful APIs for all features. Include user authentication, statistics, and a modern, responsive UI.

---

For any issues or contributions, please open an issue or pull request on GitHub.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
