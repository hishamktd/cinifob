export enum TVShowStatus {
  WATCHLIST = 'WATCHLIST',
  WATCHING = 'WATCHING',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  DROPPED = 'DROPPED',
  PLAN_TO_WATCH = 'PLAN_TO_WATCH',
}

export enum TVShowSearchType {
  POPULAR = 'popular',
  ON_THE_AIR = 'on_the_air',
  AIRING_TODAY = 'airing_today',
  TOP_RATED = 'top_rated',
}

export enum TVShowSortBy {
  POPULARITY_DESC = 'popularity.desc',
  POPULARITY_ASC = 'popularity.asc',
  VOTE_AVERAGE_DESC = 'vote_average.desc',
  VOTE_AVERAGE_ASC = 'vote_average.asc',
  FIRST_AIR_DATE_DESC = 'first_air_date.desc',
  FIRST_AIR_DATE_ASC = 'first_air_date.asc',
  NAME_ASC = 'name.asc',
  NAME_DESC = 'name.desc',
}

export enum EpisodeStatus {
  WATCHED = 'WATCHED',
  PLANNED = 'PLANNED',
  SKIPPED = 'SKIPPED',
}

export enum TVGenre {
  ACTION_ADVENTURE = 10759,
  ANIMATION = 16,
  COMEDY = 35,
  CRIME = 80,
  DOCUMENTARY = 99,
  DRAMA = 18,
  FAMILY = 10751,
  KIDS = 10762,
  MYSTERY = 9648,
  NEWS = 10763,
  REALITY = 10764,
  SCI_FI_FANTASY = 10765,
  SOAP = 10766,
  TALK = 10767,
  WAR_POLITICS = 10768,
  WESTERN = 37,
}

export const TV_GENRE_NAMES: Record<number, string> = {
  [TVGenre.ACTION_ADVENTURE]: 'Action & Adventure',
  [TVGenre.ANIMATION]: 'Animation',
  [TVGenre.COMEDY]: 'Comedy',
  [TVGenre.CRIME]: 'Crime',
  [TVGenre.DOCUMENTARY]: 'Documentary',
  [TVGenre.DRAMA]: 'Drama',
  [TVGenre.FAMILY]: 'Family',
  [TVGenre.KIDS]: 'Kids',
  [TVGenre.MYSTERY]: 'Mystery',
  [TVGenre.NEWS]: 'News',
  [TVGenre.REALITY]: 'Reality',
  [TVGenre.SCI_FI_FANTASY]: 'Sci-Fi & Fantasy',
  [TVGenre.SOAP]: 'Soap',
  [TVGenre.TALK]: 'Talk',
  [TVGenre.WAR_POLITICS]: 'War & Politics',
  [TVGenre.WESTERN]: 'Western',
};
