import React from 'react';

interface GalaxyDecorationProps {
  className?: string;
  variant?: 'spiral' | 'constellation' | 'banner';
}

export const GalaxyDecoration: React.FC<GalaxyDecorationProps> = ({
  className = '',
  variant = 'spiral',
}) => {
  if (variant === 'constellation') {
    return (
      <svg
        viewBox="0 0 300 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`pointer-events-none select-none ${className}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="constellationLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.3" />
          </linearGradient>
          <filter id="starNodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        {/* Constellation Link Vectors */}
        <polyline
          points="25,45 80,20 150,55 210,30 275,65"
          stroke="url(#constellationLineGrad)"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />
        <polyline
          points="80,20 120,90 150,55 230,95 275,65"
          stroke="url(#constellationLineGrad)"
          strokeWidth="1"
          strokeOpacity="0.6"
        />
        <line x1="25" y1="45" x2="120" y2="90" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.3" />

        {/* Star Nodes */}
        <circle cx="25" cy="45" r="3" fill="#38bdf8" filter="url(#starNodeGlow)" />
        <circle cx="80" cy="20" r="3.5" fill="#fde047" filter="url(#starNodeGlow)" />
        <circle cx="150" cy="55" r="4.5" fill="#ffffff" filter="url(#starNodeGlow)" />
        <circle cx="120" cy="90" r="3" fill="#c084fc" filter="url(#starNodeGlow)" />
        <circle cx="210" cy="30" r="3.5" fill="#38bdf8" filter="url(#starNodeGlow)" />
        <circle cx="230" cy="95" r="3.2" fill="#a855f7" filter="url(#starNodeGlow)" />
        <circle cx="275" cy="65" r="4" fill="#fbbf24" filter="url(#starNodeGlow)" />

        {/* Subtle coordinate labels */}
        <text x="88" y="18" fill="#94a3b8" fontSize="7" fontFamily="monospace" opacity="0.6">α-01</text>
        <text x="158" y="53" fill="#fef08a" fontSize="7" fontFamily="monospace" opacity="0.8">CORE</text>
        <text x="282" y="68" fill="#94a3b8" fontSize="7" fontFamily="monospace" opacity="0.6">Ω-07</text>
      </svg>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        {/* Deep space radial glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-violet-600/15 via-purple-700/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 rounded-full bg-gradient-to-tr from-sky-600/15 via-indigo-600/10 to-transparent blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl" />

        {/* Subtle Constellation Lines SVG overlay */}
        <svg className="w-full h-full opacity-25" viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="80" r="2" fill="#fff" />
          <circle cx="220" cy="40" r="2.5" fill="#fde047" />
          <circle cx="360" cy="110" r="3" fill="#38bdf8" />
          <circle cx="500" cy="50" r="2.5" fill="#c084fc" />
          <circle cx="680" cy="90" r="2" fill="#fff" />
          <polyline points="100,80 220,40 360,110 500,50 680,90" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>
    );
  }

  // Default: Spiral Galaxy illustration
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="galaxyCoreGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="25%" stopColor="#fef08a" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#c084fc" stopOpacity="0.45" />
          <stop offset="80%" stopColor="#38bdf8" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0a0d1f" stopOpacity="0" />
        </radialGradient>
        <filter id="spiralGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Core Halo */}
      <circle cx="100" cy="100" r="32" fill="url(#galaxyCoreGrad)" filter="url(#spiralGlow)" />

      {/* Galaxy Arm 1 (Clockwise logarithmic spiral) */}
      <path
        d="M100 100 C115 80, 145 75, 165 95 C185 115, 180 155, 150 175 C120 195, 75 185, 45 160 C15 135, 15 85, 45 50"
        stroke="url(#galaxyCoreGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Galaxy Arm 2 (Counter-arm spiral) */}
      <path
        d="M100 100 C85 120, 55 125, 35 105 C15 85, 20 45, 50 25 C80 5, 125 15, 155 40 C185 65, 185 115, 155 150"
        stroke="#818cf8"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
      />

      {/* Interstellar Dust Clumps */}
      <circle cx="140" cy="85" r="2.5" fill="#fde047" opacity="0.8" />
      <circle cx="160" cy="130" r="2" fill="#38bdf8" opacity="0.75" />
      <circle cx="60" cy="115" r="2.2" fill="#f472b6" opacity="0.7" />
      <circle cx="45" cy="70" r="1.8" fill="#bae6fd" opacity="0.8" />
      <circle cx="115" cy="50" r="2.8" fill="#ffffff" opacity="0.9" />

      {/* Center Supermassive Core */}
      <circle cx="100" cy="100" r="6" fill="#ffffff" />
      <circle cx="100" cy="100" r="10" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
    </svg>
  );
};
