# Movie Listing Web App - Requirements Analysis

## 1. MVP Feature List (Prioritized)

### MVP (Must Have)
1. **User Authentication**
   - Register with email/password
   - Login/logout functionality
   - Password hashing (bcrypt)
   - Session management

2. **Movie Search & Browse**
   - Search movies by title
   - View paginated movie listings
   - View individual movie details
   - Cache external API data locally

3. **Personal Watchlist**
   - Add movies to watchlist
   - Remove movies from watchlist
   - View personal watchlist
   - Prevent duplicate entries

4. **Watched Movies Tracking**
   - Mark movies as watched
   - Unmark watched status
   - View watched movies list
   - Record watched date

### V1 Features (Should Have)
1. **Movie Ratings**
   - Rate watched movies (1-5 stars)
   - Update ratings
   - View personal ratings

2. **User Dashboard**
   - Total movies watched count
   - Watchlist count
   - Top 5 genres chart
   - Monthly activity graph (12 months)
   - Recent activity feed

3. **Advanced Search**
   - Filter by genre
   - Filter by year
   - Sort options (title, date, rating)
   - Infinite scroll

### V2 Features (Nice to Have)
1. **Social Features**
   - Google OAuth login
   - User profiles with avatars
   - Comments on movies
   - Public/private watchlists

2. **Data Management**
   - Export watchlist to CSV
   - Import watchlist from CSV
   - Bulk operations

3. **Recommendations**
   - Based on watched history
   - Based on genres
   - Trending movies

## 2. Data Model

### Core Tables

```prisma
User {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  name          String?
  password      String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

Movie {
  id            Int       @id @default(autoincrement())
  tmdbId        Int       @unique
  title         String
  overview      String?
  posterPath    String?
  backdropPath  String?
  releaseDate   DateTime?
  genres        String[]
  runtime       Int?
  voteAverage   Float?
  voteCount     Int?
  cachedAt      DateTime  @default(now())
  createdAt     DateTime  @default(now())
}

UserMovie {
  id            Int       @id @default(autoincrement())
  userId        Int
  movieId       Int
  status        String    // 'watchlist' | 'watched'
  watchedAt     DateTime?
  rating        Int?      // 1-5
  comment       String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@unique([userId, movieId])
}

Session {
  // NextAuth session table
}
```

## 3. API Surface

### Authentication Endpoints
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - End user session
- `GET /api/auth/session` - Get current session

### Movie Endpoints
- `GET /api/movies?query=&page=&genre=&year=&sort=` - Search/list movies
- `GET /api/movies/[tmdbId]` - Get movie details

### User Movie Management
- `GET /api/user/watchlist` - Get user's watchlist
- `POST /api/user/watchlist` - Add to watchlist
- `DELETE /api/user/watchlist/[tmdbId]` - Remove from watchlist
- `GET /api/user/watched` - Get watched movies
- `POST /api/user/watched` - Mark as watched
- `DELETE /api/user/watched/[tmdbId]` - Unmark as watched
- `PUT /api/user/movies/[tmdbId]/rating` - Update rating

### Statistics
- `GET /api/user/stats` - Get user statistics
- `GET /api/user/activity?limit=10` - Get recent activity

## 4. UI Pages & Components

### Pages
1. **Public Pages**
   - `/` - Landing/home page
   - `/login` - User login
   - `/register` - User registration
   - `/movies` - Browse movies (public)
   - `/movies/[tmdbId]` - Movie details

2. **Protected Pages**
   - `/dashboard` - User dashboard with stats
   - `/watchlist` - Personal watchlist
   - `/watched` - Watched movies list
   - `/profile` - User profile management

### Core Components
1. **Layout Components**
   - `Header` - MUI AppBar with navigation
   - `Footer` - Site footer with MUI Typography
   - `Layout` - Main layout with MUI Container
   - `ProtectedRoute` - Auth wrapper
   - `ResponsiveDrawer` - MUI Drawer for mobile navigation

2. **Movie Components**
   - `MovieCard` - MUI Card with movie thumbnail
   - `MovieList` - MUI Grid/ImageList for movies
   - `MovieDetail` - Full movie info with MUI components
   - `MovieSearch` - MUI TextField with Autocomplete
   - `MovieActions` - MUI SpeedDial/ButtonGroup

3. **UI Components**
   - `AuthForm` - MUI TextField, Button forms
   - `StatCard` - MUI Card with statistics
   - `ActivityFeed` - MUI List with ListItems
   - `Chart` - MUI Charts (X Charts)
   - `Pagination` - MUI Pagination
   - `Rating` - MUI Rating component
   - `Modal` - MUI Dialog
   - `Toast` - MUI Snackbar/Alert

## 5. Non-Functional Requirements

### Performance
- **Caching Strategy**
  - Cache TMDb API responses in SQLite for 24 hours
  - Implement pagination (20 items per page)
  - Use infinite scroll for movie lists
  - Optimize images with Next/Image
  - Lazy load components and images

### Security
- **Authentication**
  - Bcrypt password hashing (10 rounds)
  - Secure HTTP-only cookies for sessions
  - CSRF protection
  - Session timeout (7 days)

- **Authorization**
  - Per-user data isolation
  - Protected API routes
  - Input validation with Zod
  - SQL injection prevention via Prisma

- **Rate Limiting**
  - TMDb API: 40 requests/10 seconds
  - Auth endpoints: 5 attempts/minute
  - General API: 100 requests/minute per user

### Responsiveness
- **Mobile-First Design with MUI**
  - MUI Breakpoints: xs (0px), sm (600px), md (900px), lg (1200px), xl (1536px)
  - MUI Grid system with responsive columns
  - MUI useMediaQuery hook for responsive behavior
  - MUI Drawer for mobile navigation
  - MUI Container with responsive maxWidth
  - Touch-optimized MUI components
  - MUI theme with responsive typography scale
  - Minimum tap target size (48x48px per Material Design)

### Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Proper ARIA labels
- Color contrast ratios
- Focus indicators

### Error Handling
- Graceful API failure handling
- User-friendly error messages
- Fallback UI states
- Retry logic for external APIs
- Comprehensive logging

### Deployment Constraints (SQLite)
- **Limitations**
  - Requires persistent filesystem
  - Not suitable for serverless (Vercel)
  - Single-writer limitation
  - File-based backups needed

- **Suitable Hosts**
  - DigitalOcean App Platform
  - Render
  - Fly.io
  - Railway
  - Self-hosted VPS

- **Alternative**
  - PostgreSQL for serverless deployment
  - Provide migration path in documentation

## 6. Success Criteria

### Feature-Specific Criteria

1. **Authentication**
   - ✓ Users can register with unique email
   - ✓ Passwords are hashed before storage
   - ✓ Users can login and maintain session
   - ✓ Unauthorized access redirects to login

2. **Movie Search**
   - ✓ Search returns relevant results
   - ✓ Results are paginated
   - ✓ Movie details load completely
   - ✓ External API failures don't crash app

3. **Watchlist Management**
   - ✓ Movies can be added/removed
   - ✓ No duplicate entries allowed
   - ✓ List persists across sessions
   - ✓ Only owner can view/modify

4. **Watch Tracking**
   - ✓ Watched status toggles correctly
   - ✓ Watched date is recorded
   - ✓ Rating can be added/updated
   - ✓ Stats reflect changes immediately

5. **Dashboard**
   - ✓ All metrics update in real-time
   - ✓ Charts render correctly
   - ✓ Activity feed shows last 10 actions
   - ✓ Data is user-specific

### Performance Criteria
- Page load time < 3 seconds
- API response time < 500ms
- Search results appear < 2 seconds
- Smooth scrolling and interactions

### Quality Criteria
- 80% test coverage minimum
- Zero critical security vulnerabilities
- Mobile-responsive design
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

## 7. Technical Stack Summary

### Core Technologies
- **Framework**: Next.js 15+ (Latest with App Router)
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) v7 (Latest)
- **Styling**: MUI + Emotion (CSS-in-JS)
- **Database**: SQLite (Prisma ORM Latest)
- **Authentication**: NextAuth.js v4
- **State Management**: Redux Toolkit + RTK Query
- **Validation**: Zod
- **Testing**: Vitest + Playwright (Latest)

### UI Components
- **Select Component**: react-select v5 (Material themed)
- **Date Picker**: react-datepicker v8 (Material themed)
- **Icons**: Iconify React v6
- **Date Utilities**: dayjs v1

### Development Tools
- ESLint + Prettier
- TypeScript ESLint
- Import sorting plugins
- Husky + lint-staged
- GitHub Actions (CI/CD)

### External Services
- TMDb API (primary movie data)
- OMDb API (fallback option)

## 8. Development Phases

### Phase 1: Foundation (Tasks 0-2)
- Requirements analysis
- Project setup
- Database schema

### Phase 2: Core Features (Tasks 3-6)
- External API integration
- Authentication system
- CRUD operations
- Basic UI

### Phase 3: Enhancement (Tasks 7-8)
- Dashboard & statistics
- UX improvements
- Edge case handling

### Phase 4: Quality & Deployment (Tasks 9-12)
- Testing suite
- Security hardening
- Performance optimization
- Deployment setup

### Phase 5: Documentation & Polish (Tasks 13-14)
- Complete documentation
- Optional features
- Final refinements

## 9. Risk Mitigation

### Technical Risks
- **SQLite Limitations**: Document PostgreSQL migration path
- **API Rate Limits**: Implement caching and queuing
- **Authentication Security**: Use established libraries (NextAuth)
- **Data Loss**: Regular backup strategy

### Project Risks
- **Scope Creep**: Strict MVP definition
- **Performance Issues**: Early optimization planning
- **Security Vulnerabilities**: Regular dependency updates
- **Deployment Challenges**: Test deployment early

## 10. Acceptance Checklist

### MVP Delivery
- [ ] All MVP features implemented
- [ ] Authentication working end-to-end
- [ ] Movie data cached and displayed
- [ ] User data properly isolated
- [ ] Basic tests passing
- [ ] Deployment instructions clear
- [ ] README comprehensive
- [ ] Security basics implemented
- [ ] Mobile responsive design
- [ ] Error handling in place