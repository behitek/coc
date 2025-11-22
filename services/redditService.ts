export interface RedditPost {
  id: string;
  title: string;
  author: string;
  url: string;
  permalink: string;
  created_utc: number;
  score: number;
  num_comments: number;
  selftext?: string;
  thumbnail?: string;
  is_video: boolean;
  stickied: boolean;
}

interface RedditApiResponse {
  data: {
    children: Array<{
      data: RedditPost;
    }>;
  };
}

const REDDIT_API_BASE = 'https://www.reddit.com';
const SUBREDDIT = 'ClashOfClans';

export type RedditTimePeriod = 'day' | 'week' | 'month';

/**
 * Fetch top 10 posts from r/ClashOfClans sorted by upvotes
 */
export const getRedditTopPosts = async (timePeriod: RedditTimePeriod = 'day'): Promise<RedditPost[]> => {
  try {
    // Using Reddit's top.json endpoint with time filter to get top posts
    const response = await fetch(`${REDDIT_API_BASE}/r/${SUBREDDIT}/top.json?t=${timePeriod}&limit=10`);

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data: RedditApiResponse = await response.json();

    // Return all posts (already sorted by score/upvotes from Reddit API)
    const topPosts = data.data.children.map(child => child.data);

    return topPosts;
  } catch (error) {
    console.error('Failed to fetch Reddit posts:', error);
    throw error;
  }
};

/**
 * Format Reddit timestamp to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now() / 1000; // Convert to seconds
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60);
  const hours = Math.floor(diff / 3600);
  const days = Math.floor(diff / 86400);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
};
