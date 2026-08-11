// src/pages/Features.jsx

const FEATURES = [
  { icon: "⚡", title: "Instant Shortening", desc: "Paste any long URL and get a short link right away" },
  { icon: "🔗", title: "Custom Alias", desc: "Pick your own memorable alias instead of a random code" },
  { icon: "⏰", title: "Expiry Dates", desc: "Set an optional expiry date so old links stop working automatically" },
  { icon: "📊", title: "Click Analytics", desc: "See total clicks and a day-wise chart for every link" },
  { icon: "🔍", title: "Quick Search", desc: "Find any of your links by URL or short code in seconds" },
  { icon: "🔒", title: "Secure & Private", desc: "Login-protected dashboard — your links stay only yours" }
];

function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-purple-950 px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-white text-center mb-3">Why choose Shortr?</h1>
        <div  className="text-gray-400 text-center mt-3"><p>
          Everything Shortr gives you to shorten, manage, and track your links.
        </p></div>

        <div className="grid md:grid-cols-3 gap-10 mt-14">
          {FEATURES.map((feature, i) => (
            <div key={i} className="bg-black/50 p-8 rounded-3xl border border-purple-900/40 shadow-sm hover:shadow-xl hover:shadow-purple-900/30 hover:border-purple-700/60 transition">
              <div className="w-12 h-12 bg-purple-600/20 text-purple-400 rounded-2xl flex items-center justify-center text-2xl mb-6">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Features;