# Prisma Press Backend

## Overview

Prisma Press Backend is a modular blog API built with **Express.js**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**. The application provides secure authentication, user profile management, blog post operations, comment management, and administrative reporting functionalities.

This backend follows a modular architecture to ensure scalability, maintainability, and clean code practices.

---

## Features

### Authentication & Authorization

- User Registration
- User Login
- JWT Access Token Authentication
- Refresh Token Support
- Protected Routes
- Role-Based Access Control (RBAC)

### User Management

- Retrieve Logged-in User Profile
- Update User Profile
- User Role Management

### Blog Posts

- Create Posts
- Get All Posts
- Search Posts
- Update Posts
- Delete Posts
- Post Statistics

### Comments

- Create Comments
- Retrieve Comments
- Comment Ownership Verification
- Comment Moderation

### Admin Features

- User Management
- Content Moderation
- Reporting & Statistics
- Administrative Controls

---

## Technology Stack

| Technology    | Purpose               |
| ------------- | --------------------- |
| Node.js       | Runtime Environment   |
| Express.js    | Backend Framework     |
| TypeScript    | Type Safety           |
| Prisma ORM    | Database ORM          |
| PostgreSQL    | Relational Database   |
| JWT           | Authentication        |
| Cookie Parser | Cookie Management     |
| dotenv        | Environment Variables |

---

## Project Structure

```text
src/
├── app/
│   ├── modules/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── post/
│   │   ├── comment/
│   │   └── admin/
│   ├── middleware/
│   ├── routes/
│   ├── interfaces/
│   ├── services/
│   └── utils/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── app.ts
├── server.ts
└── config/
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd prisma-press-backend
```

### Install Dependencies

Using pnpm:

```bash
pnpm install
```

Using npm:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000

DATABASE_URL="postgresql://username:password@localhost:5432/prisma_press"

JWT_ACCESS_SECRET=your_access_secret

JWT_REFRESH_SECRET=your_refresh_secret

NODE_ENV=development
```

---

## Running the Application

### Development Mode

Using pnpm:

```bash
pnpm dev
```

Using npm:

```bash
npm run dev
```

### Production Build

Using pnpm:

```bash
pnpm build
```

Using npm:

```bash
npm run build
```

### Start Production Server

Using pnpm:

```bash
pnpm start
```

Using npm:

```bash
npm start
```

---

## Server Startup Requirements

Before starting the application, the server must:

1. Load environment variables.
2. Connect to Prisma Database.
3. Start listening only after a successful database connection.
4. Disconnect Prisma and terminate the process if startup fails.

---

## Root Route

### GET /

Returns:

```json
{
    "message": "Hello, World!"
}
```

---

## API Conventions

### Request Formats

The API accepts:

- JSON Request Body
- URL Encoded Request Body
- Cookies on Every Request

---

## Protected Routes

Protected endpoints require a valid access token.

Example:

```http
Authorization: your_access_token
```

> Note: The current middleware reads the raw token directly from the Authorization header. Do not prepend "Bearer" unless explicitly required by the implementation.

---

## User Roles

### USER

Regular authenticated user.

Permissions:

- Manage own profile
- Create posts
- Edit own posts
- Delete own posts
- Create comments

### ADMIN

Administrator user.

Permissions:

- Manage all users
- Moderate comments
- Access reports
- Manage all content

---

## Main Modules

### Auth Module

Responsibilities:

- User Registration
- User Login
- Token Refresh
- Authentication Validation

### User Module

Responsibilities:

- Get Profile
- Update Profile
- User Information Management

### Post Module

Responsibilities:

- Create Post
- Read Posts
- Search Posts
- Update Post
- Delete Post
- Post Analytics

### Comment Module

Responsibilities:

- Create Comment
- Get Comments
- Ownership Verification
- Moderation

### Admin Module

Responsibilities:

- User Administration
- Content Moderation
- Reporting
- System Monitoring

---

## Database

Database management is handled through Prisma ORM.

Generate Prisma Client:

```bash
npx prisma generate
```

Run Migration:

```bash
npx prisma migrate dev
```

Deploy Migration:

```bash
npx prisma migrate deploy
```

---

## Security

- JWT Authentication
- Protected Routes
- Role-Based Authorization
- Cookie Support
- Input Validation
- Secure Environment Variables

---

## Future Improvements

- Email Verification
- Password Reset
- Post Categories & Tags
- File Upload Support
- Swagger API Documentation
- Pagination & Filtering Enhancements
- Notification System

---

## Author

MD. SAYED ANOWER HOSSAIN

---

## License

This project is licensed under the MIT License.
