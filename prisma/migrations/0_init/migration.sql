-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Movie" (
    "id" SERIAL NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "overview" TEXT,
    "posterPath" TEXT,
    "backdropPath" TEXT,
    "releaseDate" DATE,
    "genres" JSONB NOT NULL DEFAULT '[]',
    "runtime" INTEGER,
    "voteAverage" DOUBLE PRECISION,
    "voteCount" INTEGER,
    "budget" BIGINT,
    "revenue" BIGINT,
    "tagline" TEXT,
    "homepage" TEXT,
    "imdbId" TEXT,
    "originalLanguage" TEXT,
    "originalTitle" TEXT,
    "popularity" DOUBLE PRECISION,
    "productionCompanies" JSONB NOT NULL DEFAULT '[]',
    "productionCountries" JSONB NOT NULL DEFAULT '[]',
    "spokenLanguages" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT,
    "videos" JSONB,
    "credits" JSONB,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserMovie" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "watchedAt" TIMESTAMP(3),
    "rating" INTEGER,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMovie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_tmdbId_key" ON "public"."Movie"("tmdbId");

-- CreateIndex
CREATE INDEX "Movie_tmdbId_idx" ON "public"."Movie"("tmdbId");

-- CreateIndex
CREATE INDEX "Movie_title_idx" ON "public"."Movie"("title");

-- CreateIndex
CREATE INDEX "Movie_imdbId_idx" ON "public"."Movie"("imdbId");

-- CreateIndex
CREATE INDEX "UserMovie_userId_status_idx" ON "public"."UserMovie"("userId", "status");

-- CreateIndex
CREATE INDEX "UserMovie_status_idx" ON "public"."UserMovie"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UserMovie_userId_movieId_key" ON "public"."UserMovie"("userId", "movieId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- AddForeignKey
ALTER TABLE "public"."UserMovie" ADD CONSTRAINT "UserMovie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserMovie" ADD CONSTRAINT "UserMovie_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

