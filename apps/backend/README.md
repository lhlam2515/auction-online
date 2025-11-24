# Backend Directory - Auction Online

Backend server cho ứng dụng đấu giá trực tuyến được xây dựng với Express.js, TypeScript, và Drizzle ORM.

## 📁 Cấu trúc thư mục

```text
backend/
├── src/                     # Source code chính
│   ├── config/             # Configuration files (database, logger, etc.)
│   ├── controllers/        # Express controllers xử lý business logic
│   ├── middlewares/        # Express middlewares (auth, validation, error handling)
│   ├── models/            # Drizzle ORM schema definitions
│   ├── routes/            # API route definitions
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions và helpers
│   ├── validations/       # Zod validation schemas
│   ├── app.ts             # Express app configuration
│   ├── index.ts           # Application entry point
│   └── server.ts          # HTTP server setup
├── supabase/              # Database migrations và schemas
├── drizzle.config.ts      # Drizzle ORM configuration
├── package.json           # Dependencies và scripts
├── tsconfig.json          # TypeScript configuration
└── README.md             # File này
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- pnpm package manager

### Installation

```bash
# Clone và install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Configure database connection trong .env file
DATABASE_URL="YOUR_DATABASE_URL"

# Generate và run migrations
pnpm run db:generate
pnpm run db:migrate

# Start development server
pnpm run dev
```

### Available Scripts

```bash
# Development
pnpm run dev          # Start development server với hot reload
pnpm run build        # Build TypeScript to JavaScript
pnpm run start        # Start production server

# Database
pnpm run db:generate  # Generate Drizzle migrations
pnpm run db:migrate   # Run database migrations
pnpm run db:studio    # Open Drizzle Studio (database GUI)

# Code Quality
pnpm run lint         # Run ESLint
pnpm run type-check   # Run TypeScript type checking
```

## 🏗️ Architecture Overview

### Tech Stack

- **Framework**: Express.js với TypeScript
- **Database**: PostgreSQL với Drizzle ORM
- **Validation**: Zod schemas
- **Authentication**: JWT tokens (planned)
- **Logging**: Winston logger
- **Error Handling**: Custom error classes với global handler

### Design Patterns

- **MVC Pattern**: Controllers handle HTTP, Services handle business logic
- **Repository Pattern**: Data access layer với Drizzle ORM
- **Middleware Pattern**: Express middlewares cho cross-cutting concerns
- **Factory Pattern**: Error classes và response handlers

## 📚 Directory Guides

Mỗi thư mục có file README.md riêng với chi tiết conventions:

| Thư mục                                     | Mục đích              | Convention File        |
| ------------------------------------------- | --------------------- | ---------------------- |
| [config/](./src/config/README.md)           | App configurations    | Configuration patterns |
| [controllers/](./src/controllers/README.md) | HTTP request handlers | Controller conventions |
| [middlewares/](./src/middlewares/README.md) | Express middlewares   | Middleware patterns    |
| [models/](./src/models/README.md)           | Database schemas      | Drizzle ORM schemas    |
| [routes/](./src/routes/README.md)           | API endpoints         | RESTful routing        |
| [types/](./src/types/README.md)             | TypeScript types      | Type definitions       |
| [utils/](./src/utils/README.md)             | Utility functions     | Helper functions       |
| [validations/](./src/validations/README.md) | Zod schemas           | Input validation       |

## 🔧 Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured với custom rules
- **Prettier**: Code formatting
- **Naming**: camelCase cho functions, PascalCase cho classes

### API Design

- **RESTful**: Follow REST principles
- **JSON**: All requests/responses in JSON
- **HTTP Status**: Proper status codes
- **Error Handling**: Consistent error format
- **Validation**: Input validation với Zod

### Database

- **Tables**: camelCase names (e.g., `userProfiles`)
- **Columns**: snake_case names (e.g., `created_at`)
- **Foreign Keys**: Proper relationships
- **Migrations**: Version controlled

## 📝 API Documentation

### Base URL

```plaintext
Development: http://localhost:3000/api/v1
Production: https://api.auction-online.com/v1
```

### Response Format

#### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Error Response

```json
{
  "success": false,
  "error": {
    "name": "ValidationError",
    "message": "Invalid input data",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": [...],
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/users"
  }
}
```

### Authentication

```bash
# Include JWT token trong headers
Authorization: Bearer <jwt_token>
```

## 🔒 Security

### Implemented

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Zod schema validation
- **Error Handling**: Secure error messages
- **Logging**: Request/response logging

### Planned

- **JWT Authentication**: User authentication
- **Rate Limiting**: API rate limiting
- **Password Hashing**: bcrypt password hashing
- **Data Sanitization**: Input sanitization
- **SQL Injection Protection**: Drizzle ORM parameterized queries

## 📊 Monitoring & Logging

### Logging Levels

- **error**: Application errors
- **warn**: Warning conditions
- **info**: General information
- **debug**: Debug information

### Log Format

```json
{
  "level": "info",
  "message": "User created successfully",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "meta": {
    "userId": "123",
    "action": "create_user"
  }
}
```

## 🚀 Deployment

### Environment Variables

```bash
# Server
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="postgresql://..."

# Logging
LOG_LEVEL=info
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Security headers enabled
- [ ] Error handling tested
- [ ] Logging configured
- [ ] Health checks implemented

## 🤝 Contributing

### Development Workflow

1. **Branch**: Tạo feature branch từ `main`
2. **Code**: Implement feature theo conventions
3. **Test**: Write tests cho new code
4. **Lint**: Run ESLint và fix issues
5. **Commit**: Use conventional commit messages
6. **PR**: Create pull request với description

### Commit Messages

```bash
feat(auth): add JWT authentication
fix(validation): handle edge case in user validation
docs(readme): update API documentation
refactor(controllers): simplify error handling
```

### Code Review

- **Functionality**: Code works as expected
- **Tests**: Adequate test coverage
- **Convention**: Follows project conventions
- **Performance**: No performance issues
- **Security**: No security vulnerabilities

## 📞 Support

- **Documentation**: Check directory README files
- **Issues**: Create GitHub issue
- **Discussions**: Use GitHub discussions
- **Code Review**: Request review từ team
