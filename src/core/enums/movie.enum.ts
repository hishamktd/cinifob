export enum MovieStatus {
  WATCHLIST = 'watchlist',
  WATCHED = 'watched',
}

export enum MovieSearchType {
  SEARCH = 'search',
  POPULAR = 'popular',
  TRENDING = 'trending',
  UPCOMING = 'upcoming',
  NOW_PLAYING = 'now_playing',
  TOP_RATED = 'top_rated',
}

export enum MovieGenre {
  ACTION = 28,
  ADVENTURE = 12,
  ANIMATION = 16,
  COMEDY = 35,
  CRIME = 80,
  DOCUMENTARY = 99,
  DRAMA = 18,
  FAMILY = 10751,
  FANTASY = 14,
  HISTORY = 36,
  HORROR = 27,
  MUSIC = 10402,
  MYSTERY = 9648,
  ROMANCE = 10749,
  SCIENCE_FICTION = 878,
  TV_MOVIE = 10770,
  THRILLER = 53,
  WAR = 10752,
  WESTERN = 37,
}

export enum MovieRating {
  ONE_STAR = 1,
  TWO_STARS = 2,
  THREE_STARS = 3,
  FOUR_STARS = 4,
  FIVE_STARS = 5,
}

export enum MovieSortBy {
  POPULARITY_DESC = 'popularity.desc',
  POPULARITY_ASC = 'popularity.asc',
  RELEASE_DATE_DESC = 'release_date.desc',
  RELEASE_DATE_ASC = 'release_date.asc',
  REVENUE_DESC = 'revenue.desc',
  REVENUE_ASC = 'revenue.asc',
  PRIMARY_RELEASE_DATE_DESC = 'primary_release_date.desc',
  PRIMARY_RELEASE_DATE_ASC = 'primary_release_date.asc',
  ORIGINAL_TITLE_DESC = 'original_title.desc',
  ORIGINAL_TITLE_ASC = 'original_title.asc',
  VOTE_AVERAGE_DESC = 'vote_average.desc',
  VOTE_AVERAGE_ASC = 'vote_average.asc',
  VOTE_COUNT_DESC = 'vote_count.desc',
  VOTE_COUNT_ASC = 'vote_count.asc',
}