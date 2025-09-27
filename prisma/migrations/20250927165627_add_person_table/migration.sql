/*
  Warnings:

  - You are about to drop the column `credits` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `genres` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `productionCompanies` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `productionCountries` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `spokenLanguages` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `videos` on the `Movie` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Movie" DROP COLUMN "credits",
DROP COLUMN "genres",
DROP COLUMN "productionCompanies",
DROP COLUMN "productionCountries",
DROP COLUMN "spokenLanguages",
DROP COLUMN "videos";

-- CreateTable
CREATE TABLE "public"."Genre" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Person" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "profilePath" TEXT,
    "biography" TEXT,
    "birthday" TIMESTAMP(3),
    "deathday" TIMESTAMP(3),
    "placeOfBirth" TEXT,
    "popularity" DOUBLE PRECISION,
    "knownForDepartment" TEXT,
    "alsoKnownAs" TEXT[],
    "homepage" TEXT,
    "imdbId" TEXT,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MovieGenre" (
    "id" SERIAL NOT NULL,
    "movieId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,

    CONSTRAINT "MovieGenre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Video" (
    "id" TEXT NOT NULL,
    "movieId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "size" INTEGER,
    "type" TEXT NOT NULL,
    "official" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Cast" (
    "id" SERIAL NOT NULL,
    "movieId" INTEGER NOT NULL,
    "personId" INTEGER NOT NULL,
    "character" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Crew" (
    "id" SERIAL NOT NULL,
    "movieId" INTEGER NOT NULL,
    "personId" INTEGER NOT NULL,
    "job" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Crew_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductionCompany" (
    "id" SERIAL NOT NULL,
    "movieId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "logoPath" TEXT,
    "originCountry" TEXT,

    CONSTRAINT "ProductionCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductionCountry" (
    "id" SERIAL NOT NULL,
    "movieId" INTEGER NOT NULL,
    "iso31661" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ProductionCountry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SpokenLanguage" (
    "id" SERIAL NOT NULL,
    "movieId" INTEGER NOT NULL,
    "iso6391" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "englishName" TEXT,

    CONSTRAINT "SpokenLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MovieGenre_movieId_idx" ON "public"."MovieGenre"("movieId");

-- CreateIndex
CREATE INDEX "MovieGenre_genreId_idx" ON "public"."MovieGenre"("genreId");

-- CreateIndex
CREATE UNIQUE INDEX "MovieGenre_movieId_genreId_key" ON "public"."MovieGenre"("movieId", "genreId");

-- CreateIndex
CREATE INDEX "Video_movieId_idx" ON "public"."Video"("movieId");

-- CreateIndex
CREATE INDEX "Cast_movieId_idx" ON "public"."Cast"("movieId");

-- CreateIndex
CREATE INDEX "Cast_personId_idx" ON "public"."Cast"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "Cast_movieId_personId_character_key" ON "public"."Cast"("movieId", "personId", "character");

-- CreateIndex
CREATE INDEX "Crew_movieId_idx" ON "public"."Crew"("movieId");

-- CreateIndex
CREATE INDEX "Crew_personId_idx" ON "public"."Crew"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "Crew_movieId_personId_job_key" ON "public"."Crew"("movieId", "personId", "job");

-- CreateIndex
CREATE INDEX "ProductionCompany_movieId_idx" ON "public"."ProductionCompany"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionCompany_movieId_companyId_key" ON "public"."ProductionCompany"("movieId", "companyId");

-- CreateIndex
CREATE INDEX "ProductionCountry_movieId_idx" ON "public"."ProductionCountry"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionCountry_movieId_iso31661_key" ON "public"."ProductionCountry"("movieId", "iso31661");

-- CreateIndex
CREATE INDEX "SpokenLanguage_movieId_idx" ON "public"."SpokenLanguage"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "SpokenLanguage_movieId_iso6391_key" ON "public"."SpokenLanguage"("movieId", "iso6391");

-- AddForeignKey
ALTER TABLE "public"."MovieGenre" ADD CONSTRAINT "MovieGenre_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MovieGenre" ADD CONSTRAINT "MovieGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "public"."Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Video" ADD CONSTRAINT "Video_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cast" ADD CONSTRAINT "Cast_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cast" ADD CONSTRAINT "Cast_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Crew" ADD CONSTRAINT "Crew_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Crew" ADD CONSTRAINT "Crew_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductionCompany" ADD CONSTRAINT "ProductionCompany_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductionCountry" ADD CONSTRAINT "ProductionCountry_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SpokenLanguage" ADD CONSTRAINT "SpokenLanguage_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
