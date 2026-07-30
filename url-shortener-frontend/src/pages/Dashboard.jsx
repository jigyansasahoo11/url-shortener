// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API_BASE_URL, SHORT_URL_DISPLAY } from '../config';
import { handleAuthError } from '../utils/handleAuthError';

function Dashboard() {
  const { token, logout } = useAuth();

  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newUrl, setNewUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const [copiedId, setCopiedId] = useState(null);
  const [qrForId, setQrForId] = useState(null);

  const [analyticsForId, setAnalyticsForId] = useState(null);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [detailsForId, setDetailsForId] = useState(null);
  const [clickTimestamps, setClickTimestamps] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editAlias, setEditAlias] = useState('');
  const [editExpiry, setEditExpiry] = useState('');
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  // Backend se user ke URLs fetch karta hai (search + pagination ke saath)
  const fetchUrls = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: page,
        limit: 5,
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`${API_BASE_URL}/api/urls?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (handleAuthError(response, logout)) return;

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Could not load your URLs');
        setLoading(false);
        return;
      }

      setUrls(result.data);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [search, page]);

  // Naya URL create karna (custom alias aur expiry date ke saath)
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!newUrl) {
      setFormError('Please enter a URL');
      return;
    }

    try {
      new URL(newUrl);
    } catch {
      setFormError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    setCreating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          original_url: newUrl,
          custom_alias: customAlias || undefined,
          expires_at: expiryDate || undefined,
        }),
      });

      if (handleAuthError(response, logout)) return;

      const result = await response.json();

      if (!response.ok) {
        setFormError(result.error || 'Something went wrong');
        setCreating(false);
        return;
      }

      setNewUrl('');
      setCustomAlias('');
      setExpiryDate('');
      setPage(1);
      setSearch('');
      fetchUrls();
      toast.success('Short URL created!');
    } catch (err) {
      setFormError('Could not connect to server.');
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (shortCode, id) => {
    const fullShortUrl = `${API_BASE_URL}/${shortCode}`;
    navigator.clipboard.writeText(fullShortUrl);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadQr = async (shortCode) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${API_BASE_URL}/${shortCode}`;

    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();

      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `qr-${shortCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      toast.error('Could not download QR code. Please try again.');
    }
  };

  const handleShare = async (shortCode) => {
    const shareUrl = `${API_BASE_URL}/${shortCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this link',
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleToggleAnalytics = async (urlId) => {
    if (analyticsForId === urlId) {
      setAnalyticsForId(null);
      return;
    }

    setAnalyticsForId(urlId);
    setAnalyticsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/urls/${urlId}/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (handleAuthError(response, logout)) return;

      const result = await response.json();

      if (response.ok) {
        setAnalyticsData(result.data);
      } else {
        setAnalyticsData([]);
      }
    } catch (err) {
      setAnalyticsData([]);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const getExpiryStatus = (item) => {
    if (!item.expires_at) {
      return { text: 'No expiry (permanent link)', className: 'text-green-400' };
    }

    const expiryDate = new Date(item.expires_at);
    const formatted = expiryDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    if (expiryDate < new Date()) {
      return { text: `⚠️ Expired on ${formatted}`, className: 'text-red-400' };
    }

    return { text: `Expires on ${formatted}`, className: 'text-yellow-400' };
  };

  const formatClickTime = (isoString) => {
    return new Date(isoString).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleToggleDetails = async (urlId) => {
    if (detailsForId === urlId) {
      setDetailsForId(null);
      return;
    }

    setDetailsForId(urlId);
    setDetailsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/urls/${urlId}/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (handleAuthError(response, logout)) return;

      const result = await response.json();

      if (response.ok) {
        setClickTimestamps(result.timestamps || []);
      } else {
        setClickTimestamps([]);
      }
    } catch (err) {
      setClickTimestamps([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditValue(item.original_url);
    setEditAlias(item.short_code);
    // Supabase se ISO datetime aata hai, date input ke liye sirf yyyy-mm-dd chahiye
    setEditExpiry(item.expires_at ? item.expires_at.split('T')[0] : '');
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
    setEditAlias('');
    setEditExpiry('');
    setEditError('');
  };

  const saveEdit = async (id) => {
    setEditError('');

    if (!editValue) {
      setEditError('URL cannot be empty');
      return;
    }

    try {
      new URL(editValue);
    } catch {
      setEditError('Please enter a valid URL');
      return;
    }

    if (!editAlias) {
      setEditError('Short code cannot be empty');
      return;
    }

    if (!/^[a-zA-Z0-9-]+$/.test(editAlias)) {
      setEditError('Short code can only contain letters, numbers, and hyphens');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/urls/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          original_url: editValue,
          short_code: editAlias,
          expires_at: editExpiry || undefined,
        }),
      });

      if (handleAuthError(response, logout)) return;

      const result = await response.json();

      if (!response.ok) {
        setEditError(result.error || 'Could not update URL');
        setSaving(false);
        return;
      }

      setEditingId(null);
      fetchUrls();
      toast.success('URL updated!');
    } catch (err) {
      setEditError('Could not connect to server.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this URL? This cannot be undone.');

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/urls/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (handleAuthError(response, logout)) return;

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Could not delete URL');
        return;
      }

      fetchUrls();
      toast.success('URL deleted successfully');
    } catch (err) {
      toast.error('Could not connect to server.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-purple-950 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">My Dashboard</h1>

        {/* Create URL form */}
        <form onSubmit={handleCreate} className="flex flex-col gap-3 mb-4">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Paste your long URL here..."
              className="flex-1 px-5 py-3 bg-black/40 text-white placeholder-gray-500 border border-purple-900/60 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition"
            />
            <button
              type="submit"
              disabled={creating}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white font-semibold rounded-xl transition"
            >
              {creating ? 'Creating...' : 'Shorten'}
            </button>
          </div>

          {/* Custom alias + Expiry — grouped in one styled card */}
          <div className="bg-purple-950/20 border border-purple-900/30 rounded-2xl p-4 flex flex-col md:flex-row gap-4">
            {/* Custom alias input */}
            <div className="flex-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-fuchsia-400 mb-1.5">
                <span>🔗</span> Custom alias
              </label>
              <div className="flex items-center bg-black/40 border border-purple-900/50 rounded-lg focus-within:border-fuchsia-500 focus-within:ring-2 focus-within:ring-fuchsia-500/20 transition overflow-hidden">
                <span className="pl-3 pr-1 py-2.5 text-gray-500 text-sm shrink-0 select-none">
                  {SHORT_URL_DISPLAY}/
                </span>
                <input
                  type="text"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  placeholder="my-link (optional)"
                  className="flex-1 pr-3 py-2.5 bg-transparent text-white placeholder-gray-600 text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Expiry date input */}
            <div className="flex-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-amber-400 mb-1.5">
                <span>⏰</span> Expires on
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2.5 bg-black/40 text-white text-sm border border-purple-900/50 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition [color-scheme:dark]"
              />
              <span className="text-gray-600 text-xs mt-1 block">Leave empty for no expiry</span>
            </div>
          </div>
        </form>
        {formError && <p className="text-red-400 text-sm mb-6">{formError}</p>}

        {/* Search bar */}
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by URL or short code..."
          className="w-full px-5 py-3 mb-6 bg-black/30 text-white placeholder-gray-500 border border-purple-900/40 rounded-xl focus:outline-none focus:border-purple-500 transition"
        />

        {/* URLs list */}
        {loading && <p className="text-gray-400">Loading your URLs...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && urls.length === 0 && (
          <p className="text-gray-400">No URLs found.</p>
        )}

        <div className="space-y-3">
          {urls.map((item) => (
            <div
              key={item.id}
              className="bg-black/50 border border-purple-900/40 rounded-2xl p-5"
            >
              <div>
                <p className="text-purple-400 font-medium">
                  {SHORT_URL_DISPLAY}/{item.short_code}
                </p>

                {editingId === item.id ? (
                  <div className="mt-2 space-y-2">
                    <div>
                      <label className="text-gray-500 text-xs">Original URL</label>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-3 py-2 bg-black/40 text-white text-sm border border-purple-500 rounded-lg focus:outline-none"
                      />
                    </div>

                    <div className="bg-purple-950/20 border border-purple-900/30 rounded-xl p-3 flex flex-col gap-3">
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-fuchsia-400 mb-1">
                          <span>🔗</span> Short code / alias
                        </label>
                        <div className="flex items-center bg-black/40 border border-purple-900/50 rounded-lg focus-within:border-fuchsia-500 focus-within:ring-2 focus-within:ring-fuchsia-500/20 transition overflow-hidden">
                          <span className="pl-3 pr-1 py-2 text-gray-500 text-sm shrink-0 select-none">
                            {SHORT_URL_DISPLAY}/
                          </span>
                          <input
                            type="text"
                            value={editAlias}
                            onChange={(e) => setEditAlias(e.target.value)}
                            className="flex-1 pr-3 py-2 bg-transparent text-white text-sm focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-amber-400 mb-1">
                          <span>⏰</span> Expires on
                        </label>
                        <input
                          type="date"
                          value={editExpiry}
                          onChange={(e) => setEditExpiry(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 bg-black/40 text-white text-sm border border-purple-900/50 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition [color-scheme:dark]"
                        />
                        <span className="text-gray-600 text-xs mt-1 block">Leave empty for no expiry</span>
                      </div>
                    </div>

                    {editError && <p className="text-red-400 text-xs mt-1">{editError}</p>}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => saveEdit(item.id)}
                        disabled={saving}
                        className="px-3 py-1 bg-green-600/80 hover:bg-green-600 text-white text-xs rounded-lg transition"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm truncate">{item.original_url}</p>
                )}

                <p className="text-gray-500 text-xs mt-1">{item.clicks} clicks</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-purple-900/30">
                <button
                  onClick={() => startEdit(item)}
                  className="px-4 py-2 bg-blue-600/70 hover:bg-blue-600 text-white text-sm rounded-lg transition"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleCopy(item.short_code, item.id)}
                  className="px-4 py-2 bg-purple-600/80 hover:bg-purple-600 text-white text-sm rounded-lg transition"
                >
                  {copiedId === item.id ? 'Copied ✓' : 'Copy'}
                </button>

                <button
                  onClick={() => setQrForId(qrForId === item.id ? null : item.id)}
                  className="px-4 py-2 bg-gray-700/80 hover:bg-gray-700 text-white text-sm rounded-lg transition"
                >
                  QR Code
                </button>

                <button
                  onClick={() => handleShare(item.short_code)}
                  className="px-4 py-2 bg-gray-700/80 hover:bg-gray-700 text-white text-sm rounded-lg transition"
                >
                  Share
                </button>

                <button
                  onClick={() => handleToggleAnalytics(item.id)}
                  className="px-4 py-2 bg-teal-700/70 hover:bg-teal-700 text-white text-sm rounded-lg transition"
                >
                  Analytics
                </button>

                <button
                  onClick={() => handleToggleDetails(item.id)}
                  className="px-4 py-2 bg-indigo-700/70 hover:bg-indigo-700 text-white text-sm rounded-lg transition"
                >
                  Details
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-4 py-2 bg-red-700/70 hover:bg-red-700 text-white text-sm rounded-lg transition ml-auto"
                >
                  Delete
                </button>
              </div>

              {qrForId === item.id && (
                <div className="mt-4 pt-4 border-t border-purple-900/30 flex flex-col items-center gap-3">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${API_BASE_URL}/${item.short_code}`}
                    alt={`QR code for ${item.short_code}`}
                    className="rounded-lg bg-white p-2"
                  />
                  <button
                    onClick={() => handleDownloadQr(item.short_code)}
                    className="px-4 py-2 bg-purple-600/60 hover:bg-purple-600 text-white text-xs rounded-lg transition"
                  >
                    Download QR
                  </button>
                </div>
              )}

              {analyticsForId === item.id && (
                <div className="mt-4 pt-4 border-t border-purple-900/30">
                  {analyticsLoading && (
                    <p className="text-gray-400 text-sm text-center">Loading analytics...</p>
                  )}

                  {!analyticsLoading && analyticsData.length === 0 && (
                    <p className="text-gray-400 text-sm text-center">No clicks yet for this URL.</p>
                  )}

                  {!analyticsLoading && analyticsData.length > 0 && (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analyticsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4c1d95" opacity={0.3} />
                        <XAxis dataKey="date" stroke="#a78bfa" fontSize={12} />
                        <YAxis allowDecimals={false} stroke="#a78bfa" fontSize={12} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1e1b2e', border: '1px solid #7c3aed', borderRadius: '8px' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="count" fill="#a855f7" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}

              {detailsForId === item.id && (
                <div className="mt-4 pt-4 border-t border-purple-900/30 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Expiry status:</span>
                    <span className={getExpiryStatus(item).className}>
                      {getExpiryStatus(item).text}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total clicks:</span>
                    <span className="text-white font-medium">{item.clicks}</span>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-2">Click history:</p>

                    {detailsLoading && (
                      <p className="text-gray-500 text-xs text-center">Loading click history...</p>
                    )}

                    {!detailsLoading && clickTimestamps.length === 0 && (
                      <p className="text-gray-500 text-xs text-center">No clicks yet for this URL.</p>
                    )}

                    {!detailsLoading && clickTimestamps.length > 0 && (
                      <ul className="max-h-40 overflow-y-auto space-y-1 pr-1">
                        {clickTimestamps.map((ts, i) => (
                          <li
                            key={i}
                            className="text-xs text-gray-300 bg-black/30 px-3 py-2 rounded-lg"
                          >
                            {formatClickTime(ts)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination controls */}
        {!loading && urls.length > 0 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-purple-600/80 hover:bg-purple-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-sm rounded-lg transition"
            >
              Previous
            </button>

            <span className="text-gray-400 text-sm">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-purple-600/80 hover:bg-purple-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-sm rounded-lg transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;