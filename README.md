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

## Server Startup Requirements

Before starting the application, the server must:

1. Load environment variables.
2. Connect to Prisma Database.
3. Start listening only after a successful database connection.
4. Disconnect Prisma and terminate the process if startup fails.

---

## API Conventions

### Request Formats

The API accepts:

- JSON Request Body
- URL Encoded Request Body
- Cookies on Every Request

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
