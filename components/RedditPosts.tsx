import React, { useEffect, useState } from 'react';
import { MessageSquare, ThumbsUp, ExternalLink, TrendingUp } from 'lucide-react';
import { getRedditTopPosts, formatRelativeTime, RedditPost, RedditTimePeriod } from '../services/redditService';
import { LoadingSpinner } from './LoadingSpinner';

export const RedditPosts: React.FC = () => {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<RedditTimePeriod>('day');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const topPosts = await getRedditTopPosts(timePeriod);
        setPosts(topPosts);
      } catch (err: any) {
        setError(err.message || 'Failed to load Reddit posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [timePeriod]);

  const getTimePeriodLabel = () => {
    switch (timePeriod) {
      case 'day': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-orange-500" /> Top Posts {getTimePeriodLabel()} from r/ClashOfClans
          </h3>
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as RedditTimePeriod)}
            className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-orange-500" /> Top Posts {getTimePeriodLabel()} from r/ClashOfClans
          </h3>
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as RedditTimePeriod)}
            className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
        <div className="text-center py-8 text-slate-400">
          <p>Unable to load Reddit posts</p>
          <p className="text-sm text-slate-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-orange-500" /> Top Posts {getTimePeriodLabel()} from r/ClashOfClans
          </h3>
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as RedditTimePeriod)}
            className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
        <div className="text-center py-8 text-slate-400">
          No top posts available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-orange-500" /> Top Posts {getTimePeriodLabel()} from r/ClashOfClans
        </h3>
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value as RedditTimePeriod)}
          className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
      </div>
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-slate-900/50 rounded-lg border border-slate-700/50 p-4 hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold text-sm leading-tight line-clamp-2 mb-2">
                  {post.title}
                </h4>

                {post.selftext && (
                  <p className="text-slate-400 text-xs mb-3 line-clamp-2">
                    {post.selftext}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {post.score.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {post.num_comments.toLocaleString()}
                  </span>
                  <span>u/{post.author}</span>
                  <span>{formatRelativeTime(post.created_utc)}</span>
                </div>
              </div>

              <a
                href={`https://reddit.com${post.permalink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1 group"
              >
                View
                <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700 text-center">
        <a
          href="https://www.reddit.com/r/ClashOfClans/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-slate-400 hover:text-orange-500 transition-colors inline-flex items-center gap-2"
        >
          View more on r/ClashOfClans
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
