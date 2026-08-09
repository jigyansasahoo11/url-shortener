// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth(); // 👈 AuthContext se login function nikala

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      // 👇 Yahan asli kaam ho raha hai: token + user ko AuthContext mein save karo
      login(result.token, result.user);

      navigate('/'); // login ke baad home page pe bhej do
    } catch (err) {
      setError('Could not connect to server. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-purple-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-black/60 p-8 rounded-3xl border border-purple-900/50 shadow-xl shadow-purple-900/30">
        <h2 className="text-3xl font-bold text-white text-center mb-2">Welcome Back</h2>
        <p className="text-gray-400 text-center mb-8">Login to manage your URLs</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="youremail@gmail.com"
              className="w-full px-4 py-3 bg-black/40 text-white placeholder-gray-500 border border-purple-900/60 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-400">Password</label>
              <Link to="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 font-medium">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-black/40 text-white placeholder-gray-500 border border-purple-900/60 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white font-semibold rounded-xl transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;