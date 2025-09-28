import axios from 'axios';

class TVShowService {
  private baseUrl = '/api';

  async searchTVShows(query: string, page = 1) {
    const response = await axios.get('/api/tv/search', {
      params: { query, page }
    });
    return response.data;
  }

  async getTVShowDetails(tvShowId: number) {
    const response = await axios.get(`/api/tv/${tvShowId}`);
    return response.data;
  }

  async addToWatchlist(tvShowId: number) {
    const response = await axios.post('/api/user/tv/watchlist', {
      tvShowId
    });
    return response.data;
  }

  async removeFromWatchlist(tvShowId: number) {
    const response = await axios.delete('/api/user/tv/watchlist', {
      data: { tvShowId }
    });
    return response.data;
  }

  async markAsWatching(tvShowId: number) {
    const response = await axios.post('/api/user/tv/watching', {
      tvShowId
    });
    return response.data;
  }

  async markAsCompleted(tvShowId: number, rating?: number) {
    const response = await axios.post('/api/user/tv/completed', {
      tvShowId,
      rating
    });
    return response.data;
  }

  async getSeasonDetails(tvShowId: number, seasonNumber: number) {
    const response = await axios.get(`/api/tv/${tvShowId}/season/${seasonNumber}`);
    return response.data;
  }

  async markEpisodeAsWatched(tvShowId: number, seasonNumber: number, episodeNumber: number) {
    const response = await axios.post('/api/user/episodes/watched', {
      tvShowId,
      seasonNumber,
      episodeNumber
    });
    return response.data;
  }

  async getWatchingShows() {
    const response = await axios.get('/api/user/tv/watching');
    return response.data;
  }

  async getCompletedShows() {
    const response = await axios.get('/api/user/tv/completed');
    return response.data;
  }

  async getTVShowStatus(tvShowId: number) {
    const response = await axios.get('/api/user/tv/status', {
      params: { tvShowId }
    });
    return response.data;
  }

  async getEpisodeStatus(tvShowId: number, seasonNumber: number) {
    const response = await axios.get('/api/user/episodes/status', {
      params: { tvShowId, seasonNumber }
    });
    return response.data;
  }

  async updateProgress(tvShowId: number, progress: number) {
    const response = await axios.put('/api/user/tv/progress', {
      tvShowId,
      progress
    });
    return response.data;
  }

  async getBrowseTVShows(category: string, page = 1) {
    const response = await axios.get('/api/tv/browse', {
      params: { category, page }
    });
    return response.data;
  }
}

export const tvShowService = new TVShowService();