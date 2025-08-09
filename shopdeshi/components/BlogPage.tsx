'use client';

import React, { useState, useEffect } from 'react';
import {
  Play, Calendar, User, Search, Plus, Youtube, ArrowLeft, Loader2,
  Eye, Heart, Star, Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface TutorialVideo {
  id: number;
  title: string;
  description: string;
  youtubeUrl: string;
  videoId: string;
  author: string;
  date: string;
  thumbnail: string;
  views: number;
}

const BlogPage: React.FC = () => {
  const [videos, setVideos] = useState<TutorialVideo[]>([
    {
      id: 1,
      title: 'Pottery Wheel Basics - Your First Beautiful Bowl',
      description: 'Learn the magical art of pottery wheel throwing!',
      youtubeUrl: 'https://www.youtube.com/watch?v=tyHnS-8jKsA',
      videoId: 'tyHnS-8jKsA',
      author: 'Clay Artist Studio',
      date: '2024-01-15',
      thumbnail: 'https://img.youtube.com/vi/tyHnS-8jKsA/hqdefault.jpg',
      views: 1248
    },
    {
      id: 2,
      title: 'Hand Building Pottery - Ancient Coil Technique',
      description: 'Master the timeless art of coil pottery!',
      youtubeUrl: 'https://www.youtube.com/watch?v=2rX2QRD9sII',
      videoId: '2rX2QRD9sII',
      author: 'Pottery Masters',
      date: '2024-01-12',
      thumbnail: 'https://img.youtube.com/vi/2rX2QRD9sII/hqdefault.jpg',
      views: 892
    },
    // ... you can keep the rest of your demo videos here ...
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<TutorialVideo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    author: ''
  });

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : '';
  };

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newVideo.title && newVideo.description && newVideo.youtubeUrl && newVideo.author) {
      setSubmitting(true);

      setTimeout(() => {
        const videoId = extractVideoId(newVideo.youtubeUrl);
        if (videoId) {
          const video: TutorialVideo = {
            id: Date.now(),
            title: newVideo.title,
            description: newVideo.description,
            youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
            videoId,
            author: newVideo.author,
            date: new Date().toISOString().split('T')[0],
            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            views: 0
          };
          setVideos([video, ...videos]);
          setNewVideo({ title: '', description: '', youtubeUrl: '', author: '' });
          setShowAddForm(false);
        }
        setSubmitting(false);
      }, 1000);
    }
  };

  const handleVideoSelect = (video: TutorialVideo) => {
    setVideos(prev =>
      prev.map(v => (v.id === video.id ? { ...v, views: v.views + 1 } : v))
    );
    setSelectedVideo({ ...video, views: video.views + 1 });
  };

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-pink-50 to-yellow-50">
      <header className="flex items-center justify-between p-6 mb-12 text-white shadow-lg bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl">
        <Link href="/" className="flex items-center gap-2 hover:underline">
          <ArrowLeft />
          Back to Shop
        </Link>
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <Youtube className="text-yellow-300" />
          ShopDeshi Tutorials
        </h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-5 py-3 text-white bg-yellow-400 shadow-md hover:bg-yellow-500 rounded-xl"
        >
          <Plus />
          Add Tutorial
        </button>
      </header>

      <div className="max-w-4xl mx-auto mb-12">
        <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-full shadow">
          <Search className="text-gray-400" />
          <input
            type="text"
            placeholder="Search for a tutorial..."
            className="flex-1 bg-transparent outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
        {filteredVideos.map(video => (
          <div
            key={video.id}
            className="overflow-hidden transition-all bg-white shadow-xl rounded-xl hover:shadow-2xl"
          >
            <div className="relative group">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="object-cover w-full h-56 group-hover:brightness-75"
              />
              <button
                onClick={() => handleVideoSelect(video)}
                className="absolute inset-0 flex items-center justify-center text-white transition opacity-0 bg-black/40 group-hover:opacity-100"
              >
                <Play className="w-16 h-16" />
              </button>
              <div className="absolute flex items-center gap-1 px-3 py-1 text-sm text-white rounded-full top-4 right-4 bg-black/60">
                <Eye className="w-4 h-4" />
                {video.views}
              </div>
            </div>
            <div className="p-5">
              <h2 className="mb-2 text-xl font-semibold">{video.title}</h2>
              <p className="mb-4 text-gray-600 line-clamp-2">{video.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {video.author}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(video.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for adding new video */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-xl p-6 space-y-4 bg-white shadow-2xl rounded-xl">
            <h2 className="text-2xl font-bold">Add New Tutorial</h2>
            <form onSubmit={handleAddVideo} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={newVideo.title}
                onChange={e => setNewVideo({ ...newVideo, title: e.target.value })}
                className="w-full p-3 border rounded-lg"
                required
              />
              <textarea
                placeholder="Description"
                value={newVideo.description}
                onChange={e => setNewVideo({ ...newVideo, description: e.target.value })}
                className="w-full p-3 border rounded-lg"
                rows={4}
                required
              />
              <input
                type="url"
                placeholder="YouTube URL"
                value={newVideo.youtubeUrl}
                onChange={e => setNewVideo({ ...newVideo, youtubeUrl: e.target.value })}
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Author"
                value={newVideo.author}
                onChange={e => setNewVideo({ ...newVideo, author: e.target.value })}
                className="w-full p-3 border rounded-lg"
                required
              />
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-pink-500 rounded-lg hover:bg-pink-600"
                  disabled={submitting}
                >
                  {submitting ? 'Adding...' : 'Add Tutorial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for video player */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-4xl overflow-hidden bg-white shadow-2xl rounded-xl">
            <div className="relative aspect-video">
              {selectedVideo.videoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.videoId}?rel=0`}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <p className="p-8 text-center text-red-500">Video unavailable.</p>
              )}
            </div>
            <div className="p-6">
              <h3 className="mb-2 text-xl font-bold">{selectedVideo.title}</h3>
              <p className="mb-4 text-gray-600">{selectedVideo.description}</p>
              <button
                onClick={() => setSelectedVideo(null)}
                className="w-full py-3 text-white bg-pink-500 rounded-lg hover:bg-pink-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
