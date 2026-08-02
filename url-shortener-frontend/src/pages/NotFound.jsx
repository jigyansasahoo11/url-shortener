// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-black via-gray-950 to-purple-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-black/50 border border-purple-900/40 rounded-3xl p-10 shadow-xl shadow-purple-900/20">
        <p className="text-6xl font-bold bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-400 bg-clip-text text-transparent mb-4">
          404
        </p>
        <h1 className="text-2xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-12">
          The page you're looking for doesn't exist, may have been moved, or the URL was mistyped.
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;