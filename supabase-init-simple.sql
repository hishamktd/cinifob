-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Movie" (
    "id" SERIAL PRIMARY KEY,
    "tmdbId" INTEGER NOT NULL UNIQUE,
    "title" TEXT NOT NULL,
    "overview" TEXT,
    "posterPath" TEXT,
    "backdropPath" TEXT,
    "releaseDate" DATE,
    "genres" JSONB DEFAULT '[]',
    "runtime" INTEGER,
    "voteAverage" DOUBLE PRECISION,
    "voteCount" INTEGER,
    "cachedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "UserMovie" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "watchedAt" TIMESTAMPTZ,
    "rating" INTEGER,
    "comment" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT fk_movie FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE,
    UNIQUE("userId", "movieId")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT PRIMARY KEY,
    "sessionToken" TEXT NOT NULL UNIQUE,
    "userId" INTEGER NOT NULL,
    "expires" TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_session_user FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_movie_tmdbid ON "Movie"("tmdbId");
CREATE INDEX IF NOT EXISTS idx_movie_title ON "Movie"("title");
CREATE INDEX IF NOT EXISTS idx_usermovie_userid_status ON "UserMovie"("userId", "status");
CREATE INDEX IF NOT EXISTS idx_usermovie_status ON "UserMovie"("status");