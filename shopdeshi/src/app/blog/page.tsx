'use client';

import React, { useState, useEffect } from 'react';
import { Play, Calendar, User, Search, Plus, Youtube, ArrowLeft, Loader2 } from 'lucide-react';
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
  const [videos, setVideos] = useState<TutorialVideo[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Backend URL - adjust this to match your backend server
  const API_BASE_URL = 'http://localhost:4000';

  // Fetch tutorials from backend
  const fetchTutorials = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/alltutorials`);
      const data = await response.json();
      
      if (data.success) {
        setVideos(data.tutorials);
      } else {
        console.error('Failed to fetch tutorials');
      }
    } catch (error) {
      console.error('Error fetching tutorials:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load tutorials when component mounts
  useEffect(() => {
    fetchTutorials();
  }, []);

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : '';
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newVideo.title && newVideo.description && newVideo.youtubeUrl && newVideo.author) {
      try {
        setSubmitting(true);
        
        const response = await fetch(`${API_BASE_URL}/addtutorial`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: newVideo.title,
            description: newVideo.description,
            youtubeUrl: newVideo.youtubeUrl,
            author: newVideo.author
          })
        });

        const data = await response.json();
        
        if (data.success) {
          // Refresh the tutorials list
          await fetchTutorials();
          setNewVideo({ title: '', description: '', youtubeUrl: '', author: '' });
          setShowAddForm(false);
          alert('Tutorial added successfully!');
        } else {
          alert('Error: ' + (data.message || 'Failed to add tutorial'));
        }
      } catch (error) {
        console.error('Error adding tutorial:', error);
        alert('Error adding tutorial. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleVideoSelect = async (video: TutorialVideo) => {
    try {
      // Increment view count when video is selected
      await fetch(`${API_BASE_URL}/tutorial/${video.id}`);
      setSelectedVideo(video);
    } catch (error) {
      console.error('Error updating view count:', error);
      setSelectedVideo(video);
    }
  };

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {/* Header */}
      <header className="text-white shadow-lg bg-gradient-to-r from-pink-500 to-pink-600">
        <div className="container px-4 py-8 mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-pink-100 transition-colors duration-300 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Shop
              </Link>
              <div className="w-px h-6 bg-pink-300"></div>
              <div>
                <h1 className="flex items-center gap-3 mb-2 text-4xl font-bold">
                  <Youtube className="w-8 h-8 text-orange-300" />
                  ShopDeshi Tutorials
                </h1>
                <p className="text-lg text-pink-100">Learn pottery, crochet, and handcraft skills</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-6 py-3 transition-all duration-300 bg-orange-500 rounded-full shadow-lg hover:bg-orange-600 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Add Tutorial
            </button>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8 mx-auto">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute w-5 h-5 text-pink-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search tutorials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 pl-10 pr-4 transition-colors duration-300 border-2 border-pink-200 rounded-full focus:outline-none focus:border-pink-400"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 mr-3 text-pink-500 animate-spin" />
            <p className="text-gray-600">Loading tutorials...</p>
          </div>
        )}

        {/* Video Grid */}
        {!loading && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="overflow-hidden transition-all duration-300 bg-white border border-pink-100 shadow-lg rounded-2xl hover:shadow-2xl hover:scale-105"
              >
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="object-cover w-full h-48"
                  />
                  <button
                    onClick={() => handleVideoSelect(video)}
                    className="absolute inset-0 flex items-center justify-center transition-all duration-300 bg-black bg-opacity-40 group hover:bg-opacity-60"
                  >
                    <Play className="w-16 h-16 text-white transition-transform duration-300 group-hover:scale-110 drop-shadow-lg" />
                  </button>
                  <div className="absolute px-2 py-1 text-sm text-white bg-black rounded-full top-3 right-3 bg-opacity-70">
                    {video.views} views
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="mb-3 text-xl font-bold text-gray-800 transition-colors cursor-pointer hover:text-pink-600">
                    {video.title}
                  </h3>
                  <p className="mb-4 text-gray-600 line-clamp-3">
                    {video.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 font-medium text-orange-600">
                      <User className="w-4 h-4" />
                      {video.author}
                    </div>
                    <div className="flex items-center gap-2 text-pink-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(video.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredVideos.length === 0 && (
          <div className="py-16 text-center">
            <Youtube className="w-16 h-16 mx-auto mb-4 text-pink-300" />
            <h3 className="mb-2 text-2xl font-semibold text-gray-600">No tutorials found</h3>
            <p className="text-gray-500">Try adjusting your search terms or add a new tutorial!</p>
          </div>
        )}
      </div>

      {/* Add Video Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-gray-800">
              <Plus className="w-6 h-6 text-pink-500" />
              Add New Tutorial
            </h2>
            <form onSubmit={handleAddVideo} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Tutorial Title
                </label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  className="w-full px-4 py-3 transition-colors border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-400"
                  placeholder="e.g., Beginner's Guide to Pottery Wheel"
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={newVideo.description}
                  onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                  className="w-full px-4 py-3 transition-colors border-2 border-pink-200 rounded-lg resize-none focus:outline-none focus:border-pink-400"
                  rows={4}
                  placeholder="Describe what this tutorial covers, techniques taught, materials needed, etc."
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={newVideo.youtubeUrl}
                  onChange={(e) => setNewVideo({ ...newVideo, youtubeUrl: e.target.value })}
                  className="w-full px-4 py-3 transition-colors border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-400"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Author Name
                </label>
                <input
                  type="text"
                  value={newVideo.author}
                  onChange={(e) => setNewVideo({ ...newVideo, author: e.target.value })}
                  className="w-full px-4 py-3 transition-colors border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-400"
                  placeholder="Enter instructor/author name..."
                  required
                  disabled={submitting}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center flex-1 gap-2 py-3 font-medium text-white transition-colors bg-pink-500 rounded-lg hover:bg-pink-600 disabled:bg-pink-300"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Tutorial'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  disabled={submitting}
                  className="flex-1 py-3 font-medium text-gray-700 transition-colors bg-gray-300 rounded-lg hover:bg-gray-400 disabled:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
          <div className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="aspect-video">
              <iframe
                src={selectedVideo.youtubeUrl}
                title={selectedVideo.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-6">
              <h2 className="mb-3 text-2xl font-bold text-gray-800">{selectedVideo.title}</h2>
              <p className="mb-4 text-gray-600">{selectedVideo.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 font-medium text-orange-600">
                  <User className="w-5 h-5" />
                  {selectedVideo.author}
                </div>
                <div className="flex items-center gap-2 text-pink-500">
                  <Calendar className="w-5 h-5" />
                  {new Date(selectedVideo.date).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="w-full py-3 font-medium text-white transition-colors bg-pink-500 rounded-lg hover:bg-pink-600"
              >
                Close Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPage;