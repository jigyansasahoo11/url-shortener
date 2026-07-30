// src/components/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null); // 👈 dropdown ke DOM element ko "track" karne ke liye

  // Dropdown ke bahar click hote hi band ho jaaye
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    // Cleanup: component hatte hi listener bhi hata do (memory leak se bachne ke liye)
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  // Email ka pehla letter nikala, avatar mein dikhane ke liye
  const initial = user?.email ? user.email.charAt(0).toUpperCase() : '?';

  return (
    <nav className="bg-black/70 backdrop-blur-md border-b border-purple-900/50 sticky top-0 z-20 p-1 rounded-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Shortr Logo" className="w-26 h-16 object-cover" />
          <h1 className="text-2xl font-bold text-white tracking-tight">SHORTR</h1>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-lg font-medium text-gray-300">
          <Link to="/" className="hover:text-purple-400 transition">Home</Link>
          <Link to="/features" className="hover:text-purple-400 transition">Features</Link>
          <Link to="/faq" className="hover:text-purple-400 transition">FAQ</Link>
        </div>

        {token ? (
          <div className="relative" ref={menuRef}>
            {/* Avatar button — click se dropdown open/close hota hai */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="w-10 h-10 rounded-full bg-teal-600 hover:bg-teal-500 text-white font-semibold flex items-center justify-center text-lg transition"
            >
              {initial}
            </button>

            {/* Dropdown — sirf menuOpen true hone par render hota hai */}
            {menuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-gray-900 border border-purple-900/50 rounded-2xl shadow-xl shadow-black/50 overflow-hidden">
                <div className="px-4 py-3 border-b border-purple-900/40">
                  <p className="text-sm text-gray-400">Signed in as</p>
                  <p className="text-white font-medium truncate">{user?.email}</p>
                </div>

                {/* 👇 Naya link — Dashboard pe le jaata hai */}
                <Link
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-gray-200 hover:bg-purple-950/40 transition text-sm font-medium"
                >
                  My Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-950/40 transition text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-500 hover:text-white transition font-medium text-sm h-10 flex items-center"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition font-medium text-sm h-10 flex items-center justify-center"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;