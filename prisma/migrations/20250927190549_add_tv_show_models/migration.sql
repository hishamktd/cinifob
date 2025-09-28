-- CreateTable
CREATE TABLE IF NOT EXISTS "TVShow" (
    "id" SERIAL NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "originalName" TEXT,
    "overview" TEXT,
    "posterPath" TEXT,
    "backdropPath" TEXT,
    "firstAirDate" DATE,
    "lastAirDate" DATE,
    "episodeRunTime" INTEGER[],
    "voteAverage" DOUBLE PRECISION,
    "voteCount" INTEGER,
    "numberOfSeasons" INTEGER,
    "numberOfEpisodes" INTEGER,
    "inProduction" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT,
    "type" TEXT,
    "homepage" TEXT,
    "originalLanguage" TEXT,
    "popularity" DOUBLE PRECISION,
    "tagline" TEXT,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TVShow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TVShowGenre" (
    "id" SERIAL NOT NULL,
    "tvShowId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,

    CONSTRAINT "TVShowGenre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Season" (
    "id" SERIAL NOT NULL,
    "tvShowId" INTEGER NOT NULL,
    "seasonNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "overview" TEXT,
    "posterPath" TEXT,
    "airDate" DATE,
    "episodeCount" INTEGER,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Episode" (
    "id" SERIAL NOT NULL,
    "tvShowId" INTEGER NOT NULL,
    "seasonId" INTEGER,
    "episodeNumber" INTEGER NOT NULL,
    "seasonNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "overview" TEXT,
    "stillPath" TEXT,
    "airDate" DATE,
    "runtime" INTEGER,
    "voteAverage" DOUBLE PRECISION,
    "voteCount" INTEGER,
    "productionCode" TEXT,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Network" (
    "id" SERIAL NOT NULL,
    "tvShowId" INTEGER NOT NULL,
    "networkId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "logoPath" TEXT,
    "originCountry" TEXT,

    CONSTRAINT "Network_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TVShowProductionCompany" (
    "id" SERIAL NOT NULL,
    "tvShowId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "logoPath" TEXT,
    "originCountry" TEXT,

    CONSTRAINT "TVShowProductionCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Creator" (
    "id" SERIAL NOT NULL,
    "tvShowId" INTEGER NOT NULL,
    "personId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "profilePath" TEXT,

    CONSTRAINT "Creator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "UserTVShow" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tvShowId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WATCHLIST',
    "currentSeason" INTEGER,
    "currentEpisode" INTEGER,
    "rating" INTEGER,
    "notes" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTVShow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "UserEpisode" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "episodeId" INTEGER NOT NULL,
    "watched" BOOLEAN NOT NULL DEFAULT false,
    "watchedAt" TIMESTAMP(3),
    "rating" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEpisode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TVShow_tmdbId_key" ON "TVShow"("tmdbId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TVShow_tmdbId_idx" ON "TVShow"("tmdbId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TVShow_name_idx" ON "TVShow"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TVShowGenre_tvShowId_genreId_key" ON "TVShowGenre"("tvShowId", "genreId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TVShowGenre_tvShowId_idx" ON "TVShowGenre"("tvShowId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TVShowGenre_genreId_idx" ON "TVShowGenre"("genreId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Season_tvShowId_seasonNumber_key" ON "Season"("tvShowId", "seasonNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Season_tvShowId_idx" ON "Season"("tvShowId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Episode_tvShowId_seasonNumber_episodeNumber_key" ON "Episode"("tvShowId", "seasonNumber", "episodeNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Episode_tvShowId_idx" ON "Episode"("tvShowId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Episode_seasonId_idx" ON "Episode"("seasonId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Network_tvShowId_networkId_key" ON "Network"("tvShowId", "networkId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Network_tvShowId_idx" ON "Network"("tvShowId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TVShowProductionCompany_tvShowId_companyId_key" ON "TVShowProductionCompany"("tvShowId", "companyId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TVShowProductionCompany_tvShowId_idx" ON "TVShowProductionCompany"("tvShowId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Creator_tvShowId_personId_key" ON "Creator"("tvShowId", "personId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Creator_tvShowId_idx" ON "Creator"("tvShowId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "UserTVShow_userId_tvShowId_key" ON "UserTVShow"("userId", "tvShowId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserTVShow_userId_status_idx" ON "UserTVShow"("userId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserTVShow_status_idx" ON "UserTVShow"("status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "UserEpisode_userId_episodeId_key" ON "UserEpisode"("userId", "episodeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserEpisode_userId_idx" ON "UserEpisode"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserEpisode_episodeId_idx" ON "UserEpisode"("episodeId");

-- AddForeignKey
ALTER TABLE "TVShowGenre" ADD CONSTRAINT "TVShowGenre_tvShowId_fkey" FOREIGN KEY ("tvShowId") REFERENCES "TVShow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TVShowGenre" ADD CONSTRAINT "TVShowGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_tvShowId_fkey" FOREIGN KEY ("tvShowId") REFERENCES "TVShow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_tvShowId_fkey" FOREIGN KEY ("tvShowId") REFERENCES "TVShow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Network" ADD CONSTRAINT "Network_tvShowId_fkey" FOREIGN KEY ("tvShowId") REFERENCES "TVShow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TVShowProductionCompany" ADD CONSTRAINT "TVShowProductionCompany_tvShowId_fkey" FOREIGN KEY ("tvShowId") REFERENCES "TVShow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creator" ADD CONSTRAINT "Creator_tvShowId_fkey" FOREIGN KEY ("tvShowId") REFERENCES "TVShow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTVShow" ADD CONSTRAINT "UserTVShow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTVShow" ADD CONSTRAINT "UserTVShow_tvShowId_fkey" FOREIGN KEY ("tvShowId") REFERENCES "TVShow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEpisode" ADD CONSTRAINT "UserEpisode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEpisode" ADD CONSTRAINT "UserEpisode_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;