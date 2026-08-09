// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      // 👇 Backend hamesha same success message bhejta hai (email exist kare ya nahi),
      // isliye hum bhi wahi message dikhate hain — form ko disable kar dete hain taaki
      // user dobara-dobara request na bheje
      setSuccess(result.message || 'If an account exists with this email, a password reset link has been sent.');
    } catch (err) {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-purple-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-black/60 p-8 rounded-3xl border border-purple-900/50 shadow-xl shadow-purple-900/30">
        <h2 className="text-3xl font-bold text-white text-center mb-2">Forgot Password?</h2>
        <p className="text-gray-400 text-center mb-8">
          Enter your email and we'll send you a link to reset it
        </p>

        {success ? (
          <div className="text-center">
            <p className="text-green-400 text-sm bg-green-950/30 border border-green-900/40 rounded-xl px-4 py-3">
              {success}
            </p>
            <p className="text-gray-500 text-xs mt-4">
              Didn't get the email? Check your spam folder, or{' '}
              <button
                onClick={() => setSuccess('')}
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                try again
              </button>
              .
            </p>
          </div>
        ) : (
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

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white font-semibold rounded-xl transition"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="text-center text-gray-400 text-sm mt-6">
          Remembered your password?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;