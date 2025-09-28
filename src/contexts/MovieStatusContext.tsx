import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MovieStatus {
  isInWatchlist: boolean;
  isWatched: boolean;
  rating?: number;
  watchedDate?: Date;
}

interface MovieStatusContextType {
  movieStatuses: Record<number, MovieStatus>;
  updateMovieStatus: (movieId: number, status: Partial<MovieStatus>) => void;
  getMovieStatus: (movieId: number) => MovieStatus;
}

const MovieStatusContext = createContext<MovieStatusContextType | undefined>(undefined);

export const useMovieStatus = () => {
  const context = useContext(MovieStatusContext);
  if (!context) {
    throw new Error('useMovieStatus must be used within a MovieStatusProvider');
  }
  return context;
};

interface MovieStatusProviderProps {
  children: ReactNode;
}

export const MovieStatusProvider: React.FC<MovieStatusProviderProps> = ({ children }) => {
  const [movieStatuses, setMovieStatuses] = useState<Record<number, MovieStatus>>({});

  const updateMovieStatus = (movieId: number, status: Partial<MovieStatus>) => {
    setMovieStatuses(prev => ({
      ...prev,
      [movieId]: {
        ...prev[movieId],
        ...status
      }
    }));
  };

  const getMovieStatus = (movieId: number): MovieStatus => {
    return movieStatuses[movieId] || {
      isInWatchlist: false,
      isWatched: false
    };
  };

  return (
    <MovieStatusContext.Provider
      value={{
        movieStatuses,
        updateMovieStatus,
        getMovieStatus
      }}
    >
      {children}
    </MovieStatusContext.Provider>
  );
};