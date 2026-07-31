// src/pages/Home.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { handleAuthError } from '../utils/handleAuthError';
import toast from 'react-hot-toast';
import '../App.css';

function Home() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!url) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    // Agar user logged in nahi hai, toh login page pe bhej do
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ original_url: url }),
      });

      if (handleAuthError(response, logout)) return;

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      setShortUrl(result.short_url);
    } catch (err) {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-purple-950">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 pt-16 sm:pt-24 pb-16 text-center rounded-sm">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight">
          Shorten URLs.<br />
          <span className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-400 bg-clip-text text-transparent mt-10 mb-10">
            Share smarter.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-gray-400 max-w-4xl mx-auto mt-4 mb-8 leading-relaxed px-2">
          Free, fast, and reliable URL shortener with analytics, custom aliases, and expiry dates.
        </p>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-8">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste your long URL here..."
              className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg bg-black/40 text-white placeholder-gray-500 border border-purple-900/60 rounded-2xl sm:rounded-3xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 sm:px-10 py-3 sm:py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white font-semibold rounded-2xl sm:rounded-3xl text-base sm:text-lg transition flex items-center justify-center gap-2"
            >
              {loading ? 'Shortening...' : 'Shorten Now'}
            </button>
          </div>

          {error && <p className="text-red-400 mt-3 text-sm">{error}</p>}

          {!token && (
            <p className="text-gray-400 text-sm mt-3">
              You'll need to{' '}
              <Link to="/login" className="text-purple-400 hover:underline">
                login
              </Link>{' '}
              to shorten a URL.
            </p>
          )}
        </form>

        {shortUrl && (
          <div className="mt-8 p-4 sm:p-6 bg-black/60 rounded-3xl shadow-xl shadow-purple-900/30 max-w-2xl mx-auto border border-purple-900/50">
            <p className="text-sm text-gray-400 mb-2">Your shortened URL:</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-white/5 p-4 rounded-2xl">
              <code className="flex-1 text-base sm:text-lg font-medium text-purple-400 break-all">{shortUrl}</code>
              <button
                onClick={copyToClipboard}
                className="px-6 py-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-500 transition font-medium shrink-0"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;