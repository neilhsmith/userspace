# Userspace

A full-stack application built with TanStack Start, Better Auth, Prisma, and shadcn/ui.

## Features

- **Authentication**: Email/password auth powered by Better Auth
- **Role-Based Access Control**: User and Admin roles
- **Posts System**: Create, edit, delete posts with authorization
- **Modern UI**: Built with shadcn/ui and Tailwind CSS
- **Type-Safe**: End-to-end TypeScript with Zod validation

## Tech Stack

- [TanStack Start](https://tanstack.com/start) - Full-stack React framework
- [TanStack Query](https://tanstack.com/query) - Data fetching and caching
- [TanStack Router](https://tanstack.com/router) - Type-safe routing
- [Better Auth](https://better-auth.com) - Authentication library
- [Prisma](https://prisma.io) - Database ORM
- [SQLite](https://sqlite.org) - Database (easily swappable to PostgreSQL)
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Zod](https://zod.dev) - Schema validation

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd userspace
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   # .env is already created with defaults
   # Update BETTER_AUTH_SECRET for production
   ```

4. Set up the database:
   ```bash
   pnpm db:migrate
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm db:migrate` - Run database migrations
- `pnpm db:push` - Push schema changes to database
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:studio` - Open Prisma Studio

## Project Structure

```
src/
├── components/
│   └── ui/              # shadcn components
├── lib/
│   ├── auth.ts          # Better Auth server config
│   ├── auth-client.ts   # Better Auth client
│   ├── middleware.ts    # Auth middleware
│   ├── prisma.ts        # Prisma client
│   ├── rbac.ts          # Role-based access control
│   └── utils.ts         # Utilities
├── routes/
│   ├── __root.tsx       # Root layout
│   ├── index.tsx        # Home page
│   ├── login.tsx        # Login page
│   ├── signup.tsx       # Signup page
│   ├── _authed.tsx      # Protected layout
│   ├── _authed/
│   │   ├── dashboard.tsx
│   │   └── posts/
│   │       ├── index.tsx
│   │       ├── new.tsx
│   │       └── $postId.tsx
│   └── api/
│       └── auth/
│           └── $.ts     # Better Auth API handler
├── server/
│   └── posts.ts         # Post server functions
└── router.tsx           # Router configuration
```

## Authorization

### Roles

- **User**: Can create posts, edit/delete own posts
- **Admin**: Can edit/delete any post

### Upgrading a User to Admin

Using Prisma Studio:
```bash
pnpm db:studio
```
Then update the user's `role` field from `"user"` to `"admin"`.

## Switching to PostgreSQL

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
   }
   ```

2. Update `prisma.config.ts` with your PostgreSQL connection URL

3. Update `src/lib/auth.ts`:
   ```typescript
   database: prismaAdapter(prisma, {
     provider: "postgresql",
   }),
   ```

4. Run migrations:
   ```bash
   pnpm db:migrate
   ```

## Adding OAuth Providers

Better Auth supports many OAuth providers. To add Google auth:

1. Update `src/lib/auth.ts`:
   ```typescript
   export const auth = betterAuth({
     // ...existing config
     socialProviders: {
       google: {
         clientId: process.env.GOOGLE_CLIENT_ID!,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
       },
     },
   })
   ```

2. Add OAuth buttons to login/signup pages using:
   ```typescript
   authClient.signIn.social({ provider: "google" })
   ```

## License

MIT
