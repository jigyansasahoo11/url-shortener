// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';

// 👇 Twinkling background stars ke liye random positions generate kar rahe hain
// (module-level pe ek hi baar banta hai, re-render pe dobara random nahi hoga)
const twinkleStars = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  top: Math.random() * 100,
  left: Math.random() * 100,
  size: Math.random() * 2 + 1,
  delay: Math.random() * 4,
  duration: Math.random() * 3 + 2,
}));

// 👇 Falling comets/stars — diagonal animation ke liye
const fallingStars = [
  { id: 1, top: '5%', left: '10%', delay: '0s', duration: '4s' },
  { id: 2, top: '15%', left: '70%', delay: '1.5s', duration: '5s' },
  { id: 3, top: '0%', left: '40%', delay: '3s', duration: '4.5s' },
];

function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-gray-950 to-purple-950 flex items-center justify-center px-4">
      {/* Inline <style> — keyframe animations jo Tailwind se directly nahi ho sakti */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
        @keyframes fallDiagonal {
          0% { transform: translate(0, 0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(-220px, 220px); opacity: 0; }
        }
        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes floatUpDown {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
      `}</style>

      {/* Twinkling stars background */}
      <div className="absolute inset-0 pointer-events-none">
        {twinkleStars.map((star) => (
          <span
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animation: `twinkle ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Falling comets — chhoti streak lines diagonally girti hui */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {fallingStars.map((s) => (
          <span
            key={s.id}
            className="absolute w-16 h-px bg-gradient-to-r from-transparent via-purple-300 to-white rotate-[135deg]"
            style={{
              top: s.top,
              left: s.left,
              animation: `fallDiagonal ${s.duration} linear infinite`,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>

      {/* Orbiting ring with planets — content ke peeche, decorative */}
      <div
        className="absolute w-[520px] h-[520px] md:w-[640px] md:h-[640px] pointer-events-none"
        style={{ animation: 'orbitSpin 40s linear infinite' }}
      >
        <div className="w-full h-full rounded-full border border-purple-700/30" style={{ transform: 'rotateX(70deg)' }}>
          {/* Planet 1 on the ring */}
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-fuchsia-500 shadow-[0_0_16px_4px_rgba(217,70,239,0.5)]" />
          {/* Planet 2 on the ring */}
          <span className="absolute top-1/2 -right-2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_3px_rgba(34,211,238,0.5)]" />
        </div>
      </div>

      {/* Floating decorative planets, corners */}
      <div
        className="absolute top-16 left-10 md:left-24 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-700 shadow-[0_0_30px_8px_rgba(217,70,239,0.35)] pointer-events-none"
        style={{ animation: 'floatUpDown 6s ease-in-out infinite' }}
      />
      <div
        className="absolute bottom-24 right-10 md:right-28 w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-red-600 shadow-[0_0_30px_8px_rgba(251,146,60,0.3)] pointer-events-none"
        style={{ animation: 'floatUpDown 7s ease-in-out infinite', animationDelay: '1s' }}
      />
      <div
        className="absolute top-1/3 right-16 md:right-40 w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-blue-700 shadow-[0_0_20px_6px_rgba(56,189,248,0.35)] pointer-events-none"
        style={{ animation: 'floatUpDown 5s ease-in-out infinite', animationDelay: '2s' }}
      />

      {/* Main content — sabse upar (z-10) */}
      <div className="relative z-10 max-w-lg w-full text-center">
        <p className="text-7xl md:text-8xl font-extrabold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-300 bg-clip-text text-transparent mb-4 drop-shadow-[0_0_25px_rgba(168,85,247,0.35)]">
          404
        </p>
        <h1 className="text-xl md:text-2xl font-semibold text-white mb-3">
          Oops! Looks like this page got lost in space
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-10">
          The link you followed may be broken, or the page may have been moved to a different galaxy.
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-3 mt-10 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition shadow-lg shadow-purple-900/40"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;