# Database Setup with Drizzle ORM and Supabase

This guide will help you set up Drizzle ORM with your Supabase database to manage user authentication.

## 📋 Prerequisites

1. A Supabase account and project
2. Node.js and npm installed
3. Your Supabase database credentials

## 🚀 Setup Instructions

### 1. Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**
4. Copy the **Connection string** under "Connection parameters"
5. It should look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your actual Supabase credentials:
   ```env
   DATABASE_URL="postgresql://postgres:your_password@db.your_project_ref.supabase.co:5432/postgres"
   ```

### 3. Generate and Run Migrations

1. Generate the migration files:
   ```bash
   npm run db:generate
   ```

2. Push the schema to your database:
   ```bash
   npm run db:push
   ```

   Or alternatively, run migrations:
   ```bash
   npm run db:migrate
   ```

3. (Optional) Open Drizzle Studio to view your database:
   ```bash
   npm run db:studio
   ```

## 📁 Database Schema

The users table includes:

- `id` - UUID primary key (auto-generated)
- `email` - Unique email address
- `password` - SHA256 hashed password
- `isVerified` - Boolean for email verification status
- `sharedSecret` - For OTP/2FA functionality
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp
- `lastLogin` - Last login timestamp

## 🔧 Available Scripts

- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Run pending migrations
- `npm run db:push` - Push schema changes directly to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## 🛠 API Endpoints

### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

## 🔒 Security Features

- SHA256 password hashing
- Email uniqueness validation
- Input validation with Zod schemas
- TypeScript type safety
- Prepared statements (SQL injection protection)

## 📦 Database Service Methods

The `UserService` class provides:

- `createUser(userData)` - Create new user with hashed password
- `findUserByEmail(email)` - Find user by email address
- `verifyPassword(plain, hashed)` - Verify password against hash
- `updateSharedSecret(userId, secret)` - Update 2FA secret
- `updateLastLogin(userId)` - Update last login timestamp
- `verifyUser(userId)` - Mark user as verified
- `getAllUsers()` - Get all users (admin function)
- `deleteUser(userId)` - Delete user account

## 🚨 Troubleshooting

### Connection Issues
- Verify your DATABASE_URL is correct
- Check if your Supabase project is active
- Ensure your IP is allowed in Supabase settings

### Migration Issues
- Make sure your .env.local file is properly configured
- Check if the database is accessible
- Verify your Supabase password is correct

### Type Errors
- Run `npm install` to ensure all dependencies are installed
- Check that your TypeScript configuration is correct
