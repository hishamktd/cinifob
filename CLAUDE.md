# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CiniFob is a movie and TV show tracking application built with Next.js 15, Material-UI v7, and PostgreSQL. Users can track watched content, manage watchlists, and discover new movies/shows via TMDb API integration.

## Essential Commands

```bash
# Development
npm run dev                    # Start dev server with Turbopack on port 3000
npm run build                  # Production build with Prisma generation
npm run start                  # Start production server

# Code Quality
npm run lint                   # Run ESLint with custom ignore patterns
npm run lint:fix               # Auto-fix linting issues

# Database
npx prisma generate            # Generate Prisma client
npx prisma db push             # Push schema changes to database
npm run db:cleanup             # Clean up orphaned database records
npm run db:seed:genres         # Seed genre data

# Testing
npm test                       # Run Vitest tests (watch mode)
npm test -- --run              # Run Vitest tests once
npm run test:coverage          # Run tests with coverage
npm run test:e2e               # Run Playwright E2E tests
npm run test:e2e:run           # Run E2E tests with dev server
npm run test:e2e:ui            # Run E2E tests with UI
npm run test:all               # Run all tests
```

## High-Level Architecture

### Technology Stack

- **Frontend**: Next.js 15.5.4 with App Router, Material-UI v7.3.2
- **Backend**: Next.js API Routes with Prisma ORM
- **Database**: PostgreSQL on Supabase (connection pooling enabled)
- **Auth**: NextAuth.js with JWT sessions
- **State**: Redux Toolkit
- **PWA**: Workbox with multiple caching strategies

### Directory Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes (auth, movies, tv, user data)
│   ├── (auth)/            # Auth pages (login, register)
│   └── [main pages]       # Dashboard, movies, tv shows, etc.
├── components/            # Feature-specific components
├── core/                  # Shared utilities and components
│   ├── components/        # Reusable UI components
│   ├── services/          # API service layers
│   ├── store/            # Redux store configuration
│   └── utils/            # Utility functions
├── hooks/                # Custom React hooks
└── lib/                  # Third-party integrations (NextAuth, Prisma)
```

### Database Schema

The application uses Prisma with PostgreSQL, featuring:

- User authentication and sessions
- Movie and TV show tracking (watched, watchlist, ratings)
- Comprehensive metadata (genres, cast, crew, providers)
- Activity tracking and statistics

Key models: User, Movie, TVShow, UserMovie, UserTVShow, Genre, Cast, Crew, Provider

### API Structure

All API routes follow RESTful conventions under `/api/`:

- `/api/auth/*` - Authentication endpoints
- `/api/movies/*` - Movie data and user interactions
- `/api/tv/*` - TV show data and user interactions
- `/api/user/*` - User profile and statistics
- `/api/search` - Unified search across content

### Key Development Patterns

1. **Service Layer Pattern**: All external API calls go through service classes in `src/core/services/`
2. **Type Safety**: Comprehensive TypeScript types and Zod validation schemas
3. **Path Aliases**: Use `@/`, `@components/`, `@core/`, etc. for imports
4. **Environment Variables**: Required vars in `.env` - database URLs, API keys, NextAuth config
5. **Caching Strategy**: Smart caching for TMDb data, user preferences in cookies
6. **Error Handling**: Centralized error pages and API error responses

### Material-UI Integration

- Custom theme with light/dark mode support
- Responsive breakpoints configured
- Custom components extending MUI (AppSelect, AppDatePicker, AppIcon)
- Consistent use of MUI Grid v7 syntax (size prop instead of Grid2)

### Authentication Flow

- NextAuth with JWT strategy
- Protected routes using middleware
- Session data includes user ID for database queries
- Automatic session refresh

### Progressive Web App

- Service worker with Workbox
- Multiple caching strategies for different resource types
- Offline support for critical pages
- Web app manifest for installation

## Important Configurations

### Environment Setup

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string (pooled)
- `DIRECT_URL` - Direct database connection (for migrations)
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET` - Authentication config
- `TMDB_API_KEY`, `TMDB_API_TOKEN` - TMDb API access

### Git Hooks (via lefthook)

Pre-commit: Linting and formatting
Pre-push: Type checking and tests
Commit-msg: Conventional commit format validation

### Testing Strategy

- Unit tests with Vitest for utilities and hooks
- E2E tests with Playwright for critical user flows
- API route testing with mock data

## Common Development Tasks

When adding new features:

1. Create feature components in `src/components/[feature]/`
2. Add shared components to `src/core/components/`
3. Update services in `src/core/services/` for API calls
4. Add API routes in `src/app/api/`
5. Update Prisma schema and run migrations if needed
6. Use existing patterns for consistency

When fixing issues:

1. Check for TypeScript errors first
2. Verify Prisma client is generated
3. Ensure environment variables are set
4. Check browser console for client-side errors
5. Review API response formats match expected types
