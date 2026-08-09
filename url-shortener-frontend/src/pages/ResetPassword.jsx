// src/pages/ResetPassword.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function ResetPassword() {
  const navigate = useNavigate();

  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [linkInvalid, setLinkInvalid] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // 👇 Supabase reset email hume yahan is tarah bhejta hai:
  // /reset-password#access_token=xxx&refresh_token=xxx&type=recovery
  // Ye "hash" mein hota hai (query string mein nahi), isliye window.location.hash se nikalna padega
  useEffect(() => {
    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;

    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    const refresh = params.get('refresh_token');
    const type = params.get('type');

    if (!token || type !== 'recovery') {
      setLinkInvalid(true);
      return;
    }

    setAccessToken(token);
    setRefreshToken(refresh);

    // 👇 Token ko URL se hata do — taaki wo browser history/address bar mein na dikhe
    window.history.replaceState(null, '', window.location.pathname);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in both fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
          new_password: newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Could not reset password. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess('Password updated! Redirecting to login...');

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError('Could not connect to server. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-purple-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-black/60 p-8 rounded-3xl border border-purple-900/50 shadow-xl shadow-purple-900/30">
        <h2 className="text-3xl font-bold text-white text-center mb-2">Reset Password</h2>
        <p className="text-gray-400 text-center mb-8">Choose a new password for your account</p>

        {linkInvalid ? (
          <div className="text-center">
            <p className="text-red-400 text-sm bg-red-950/30 border border-red-900/40 rounded-xl px-4 py-3">
              This reset link is invalid or has expired.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition"
            >
              Request a new link
            </Link>
          </div>
        ) : success ? (
          <p className="text-green-400 text-sm text-center bg-green-950/30 border border-green-900/40 rounded-xl px-4 py-3">
            {success}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 bg-black/40 text-white placeholder-gray-500 border border-purple-900/60 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="w-full px-4 py-3 bg-black/40 text-white placeholder-gray-500 border border-purple-900/60 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white font-semibold rounded-xl transition"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        {!success && (
          <p className="text-center text-gray-400 text-sm mt-6">
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
              Back to Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;