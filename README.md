# TechSkills Hub - RESTful API

Features:
- Node.js + Express API
- MySQL connection via `mysql2`
- JWT authentication
- Role-based authorization (admin, trainer, trainee)
- Password hashing with bcrypt

Quick start:

1. Copy `.env.example` to `.env` and fill values.
2. Create the database: run `sql/trainer.sql` in your MySQL server.
3. Install deps: `npm install`
4. Start server: `npm run dev` (requires `nodemon`) or `npm start`.

Endpoints:
- `POST /register` Register user
- `POST /login` Login user
- `GET /users` Get all users (admin only)
- `GET /users/:id` Get user (admin or owner)
- `PUT /users/:id` Update user (admin or owner)
- `DELETE /users/:id` Delete user (admin or owner)

Testing:
- Use Postman to import `postman_collection.json` and test all endpoints.
