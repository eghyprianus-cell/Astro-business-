import React from 'react';

export interface PlanetIconProps {
  className?: string;
  size?: number;
}

// 1. Planet Saturnus (Golden Ring of Revenue, Inventory, and Structure)
export const SaturnPlanetIcon: React.FC<PlanetIconProps> = ({ className = '', size = 44 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Planet Saturnus"
    >
      <defs>
        <radialGradient id="saturnBody" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#f59e0b" />
          <stop offset="85%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </radialGradient>
        <linearGradient id="saturnRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#d97706" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#fef3c7" stopOpacity="0.4" />
        </linearGradient>
        <filter id="saturnGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="glow" />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>
      </defs>

      {/* Back half of the ring */}
      <ellipse
        cx="24"
        cy="24"
        rx="21"
        ry="6.5"
        transform="rotate(-24 24 24)"
        stroke="url(#saturnRing)"
        strokeWidth="3"
        strokeDasharray="45 20"
        strokeLinecap="round"
        opacity="0.45"
      />

      {/* Atmospheric Halo */}
      <circle cx="24" cy="24" r="14" fill="#fbbf24" opacity="0.15" filter="url(#saturnGlow)" />

      {/* Planet Body */}
      <circle cx="24" cy="24" r="13" fill="url(#saturnBody)" />

      {/* Cloud bands on Saturn */}
      <path
        d="M12 21 C16 23, 32 23, 36 21"
        stroke="#78350f"
        strokeWidth="1.2"
        opacity="0.5"
        strokeLinecap="round"
      />
      <path
        d="M13 26 C17 28, 31 28, 35 26"
        stroke="#fde68a"
        strokeWidth="1"
        opacity="0.6"
        strokeLinecap="round"
      />

      {/* Front half of the ring with metallic glow */}
      <ellipse
        cx="24"
        cy="24"
        rx="21"
        ry="6.5"
        transform="rotate(-24 24 24)"
        stroke="url(#saturnRing)"
        strokeWidth="3.2"
        strokeDasharray="30 45"
        strokeLinecap="round"
      />

      {/* Tiny companion moon */}
      <circle cx="41" cy="15" r="1.5" fill="#fef08a" opacity="0.9" />
    </svg>
  );
};

// 2. Planet Mars (Crimson Operational Energy / Expenses & Logistics)
export const MarsPlanetIcon: React.FC<PlanetIconProps> = ({ className = '', size = 44 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Planet Mars"
    >
      <defs>
        <radialGradient id="marsBody" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="35%" stopColor="#ef4444" />
          <stop offset="75%" stopColor="#991b1b" />
          <stop offset="100%" stopColor="#450a0a" />
        </radialGradient>
        <filter id="marsGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="glow" />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>
      </defs>

      {/* Atmospheric Halo */}
      <circle cx="24" cy="24" r="15" fill="#f43f5e" opacity="0.2" filter="url(#marsGlow)" />

      {/* Orbit Dust Path */}
      <circle cx="24" cy="24" r="21" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2 4" opacity="0.3" />

      {/* Mars Body */}
      <circle cx="24" cy="24" r="13.5" fill="url(#marsBody)" />

      {/* Craters and Volcanic Ridges */}
      <ellipse cx="20" cy="18" rx="3.5" ry="2" fill="#7f1d1d" opacity="0.65" transform="rotate(-15 20 18)" />
      <ellipse cx="28" cy="27" rx="4" ry="2.5" fill="#7f1d1d" opacity="0.55" transform="rotate(25 28 27)" />
      <circle cx="17" cy="28" r="1.8" fill="#7f1d1d" opacity="0.6" />
      <ellipse cx="29" cy="17" rx="2" ry="1.2" fill="#fecaca" opacity="0.5" />

      {/* Polar Ice Cap */}
      <path
        d="M20 11.5 C22 11, 26 11, 28 11.5 C26 13, 22 13, 20 11.5 Z"
        fill="#ffffff"
        opacity="0.8"
      />

      {/* Phobos moon */}
      <circle cx="8" cy="30" r="1.5" fill="#fca5a5" opacity="0.8" />
    </svg>
  );
};

// 3. Planet Jupiter (Giant Storm Core / Net Profit, Growth & Scale)
export const JupiterPlanetIcon: React.FC<PlanetIconProps> = ({ className = '', size = 44 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Planet Jupiter"
    >
      <defs>
        <radialGradient id="jupiterBody" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="30%" stopColor="#c084fc" />
          <stop offset="65%" stopColor="#7e22ce" />
          <stop offset="100%" stopColor="#3b0764" />
        </radialGradient>
        <filter id="jupiterGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="glow" />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>
      </defs>

      {/* Outer Magnetic Sphere */}
      <circle cx="24" cy="24" r="16" fill="#a855f7" opacity="0.25" filter="url(#jupiterGlow)" />
      <circle cx="24" cy="24" r="22" stroke="#c084fc" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.3" />

      {/* Body */}
      <circle cx="24" cy="24" r="14" fill="url(#jupiterBody)" />

      {/* Gas Storm Belts */}
      <path
        d="M10.5 20 C16 18.5, 32 18.5, 37.5 20"
        stroke="#581c87"
        strokeWidth="2.2"
        opacity="0.75"
        strokeLinecap="round"
      />
      <path
        d="M10.2 24 C16 22.5, 32 22.5, 37.8 24"
        stroke="#f3e8ff"
        strokeWidth="1.5"
        opacity="0.6"
        strokeLinecap="round"
      />
      <path
        d="M11 28 C16 26.5, 32 26.5, 37 28"
        stroke="#4c1d95"
        strokeWidth="2.5"
        opacity="0.8"
        strokeLinecap="round"
      />

      {/* Great Red/Violet Spot */}
      <ellipse cx="28" cy="26" rx="3.5" ry="2" fill="#ec4899" opacity="0.9" />

      {/* Galilean moons */}
      <circle cx="39" cy="34" r="1.8" fill="#e9d5ff" opacity="0.9" />
      <circle cx="9" cy="14" r="1.2" fill="#c084fc" opacity="0.8" />
    </svg>
  );
};

// 4. Planet Merkurius (Swift Velocity / Cash Flow, POS Transactions)
export const MercuryPlanetIcon: React.FC<PlanetIconProps> = ({ className = '', size = 44 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Planet Merkurius"
    >
      <defs>
        <radialGradient id="mercuryBody" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="35%" stopColor="#38bdf8" />
          <stop offset="70%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#082f49" />
        </radialGradient>
        <filter id="mercuryGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="glow" />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>
      </defs>

      {/* Orbit Rings */}
      <ellipse cx="24" cy="24" rx="20" ry="8" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" transform="rotate(30 24 24)" />

      {/* Atmospheric Aura */}
      <circle cx="24" cy="24" r="14.5" fill="#0ea5e9" opacity="0.2" filter="url(#mercuryGlow)" />

      {/* Planet Body */}
      <circle cx="24" cy="24" r="13" fill="url(#mercuryBody)" />

      {/* High-speed atmospheric bands */}
      <path
        d="M12 21 C18 20, 28 20, 36 21"
        stroke="#e0f2fe"
        strokeWidth="1.2"
        opacity="0.8"
        strokeLinecap="round"
      />
      <path
        d="M13 25 C19 24, 29 24, 35 25"
        stroke="#0369a1"
        strokeWidth="1.8"
        opacity="0.6"
        strokeLinecap="round"
      />
      <circle cx="20" cy="26" r="1.5" fill="#ffffff" opacity="0.9" />

      {/* Orbiting Satellite */}
      <circle cx="39" cy="18" r="1.6" fill="#7dd3fc" opacity="0.95" />
    </svg>
  );
};

// 5. Planet Venus (Warm Radiance / Customer Relations, CRM & Loyalty)
export const VenusPlanetIcon: React.FC<PlanetIconProps> = ({ className = '', size = 44 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Planet Venus"
    >
      <defs>
        <radialGradient id="venusBody" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="30%" stopColor="#fde047" />
          <stop offset="65%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#7c2d12" />
        </radialGradient>
        <filter id="venusGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="glow" />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>
      </defs>

      {/* Golden Aura of Warmth */}
      <circle cx="24" cy="24" r="16" fill="#f59e0b" opacity="0.25" filter="url(#venusGlow)" />
      <circle cx="24" cy="24" r="21" stroke="#fbbf24" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.3" />

      {/* Body */}
      <circle cx="24" cy="24" r="13" fill="url(#venusBody)" />

      {/* Dense Cloud Swirls */}
      <path
        d="M13 19 C18 17, 30 17, 35 19"
        stroke="#fffbeb"
        strokeWidth="1.5"
        opacity="0.7"
        strokeLinecap="round"
      />
      <path
        d="M12 24 C17 26, 31 26, 36 24"
        stroke="#9a3412"
        strokeWidth="2"
        opacity="0.6"
        strokeLinecap="round"
      />
      <ellipse cx="22" cy="22" rx="2.5" ry="1.5" fill="#ffffff" opacity="0.5" />
    </svg>
  );
};

// 6. Planet Neptunus (Deep Azure Intelligence / Analytics, Automated Reports)
export const NeptunePlanetIcon: React.FC<PlanetIconProps> = ({ className = '', size = 44 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Planet Neptunus"
    >
      <defs>
        <radialGradient id="neptuneDeepBody" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="35%" stopColor="#3b82f6" />
          <stop offset="70%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#172554" />
        </radialGradient>
        <filter id="neptuneBlueGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="glow" />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>
      </defs>

      <circle cx="24" cy="24" r="15" fill="#3b82f6" opacity="0.25" filter="url(#neptuneBlueGlow)" />
      <circle cx="24" cy="24" r="22" stroke="#60a5fa" strokeWidth="0.8" strokeDasharray="2 4" opacity="0.3" />
      <circle cx="24" cy="24" r="13" fill="url(#neptuneDeepBody)" />

      {/* High-Altitude Methane Clouds */}
      <path
        d="M12 20 C18 19, 30 19, 36 20"
        stroke="#dbeafe"
        strokeWidth="1.2"
        opacity="0.85"
        strokeLinecap="round"
      />
      <path
        d="M14 26 C20 27, 28 27, 34 26"
        stroke="#1e3a8a"
        strokeWidth="2"
        opacity="0.8"
        strokeLinecap="round"
      />
      {/* Great Dark Spot */}
      <ellipse cx="20" cy="23" rx="3" ry="1.8" fill="#0f172a" opacity="0.75" />
      <circle cx="38" cy="14" r="1.4" fill="#93c5fd" opacity="0.9" />
    </svg>
  );
};

// 7. Planet Uranus (Cyan Crystal Ring / Products & Innovation)
export const UranusPlanetIcon: React.FC<PlanetIconProps> = ({ className = '', size = 44 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Planet Uranus"
    >
      <defs>
        <radialGradient id="uranusBody" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ccfbf1" />
          <stop offset="40%" stopColor="#2dd4bf" />
          <stop offset="75%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#134e4a" />
        </radialGradient>
        <linearGradient id="uranusVerticalRing" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5eead4" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#99f6e4" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Vertical Ring (Unique 98-degree axial tilt) */}
      <ellipse
        cx="24"
        cy="24"
        rx="7"
        ry="20"
        transform="rotate(15 24 24)"
        stroke="url(#uranusVerticalRing)"
        strokeWidth="2.4"
        strokeDasharray="30 20"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Planet Body */}
      <circle cx="24" cy="24" r="12.5" fill="url(#uranusBody)" />

      {/* Ring foreground */}
      <ellipse
        cx="24"
        cy="24"
        rx="7"
        ry="20"
        transform="rotate(15 24 24)"
        stroke="url(#uranusVerticalRing)"
        strokeWidth="2.4"
        strokeDasharray="15 35"
        strokeLinecap="round"
      />
    </svg>
  );
};

// 8. Planet Bumi (Earth / Co-Working, Community & Omnichannel)
export const EarthPlanetIcon: React.FC<PlanetIconProps> = ({ className = '', size = 44 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Planet Bumi"
    >
      <defs>
        <radialGradient id="earthOceans" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="35%" stopColor="#0284c7" />
          <stop offset="75%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </radialGradient>
      </defs>

      {/* Atmospheric Halo */}
      <circle cx="24" cy="24" r="14.5" fill="#38bdf8" opacity="0.25" />
      <circle cx="24" cy="24" r="13" fill="url(#earthOceans)" />

      {/* Continents (Emerald Green) */}
      <path
        d="M20 16 C22 15, 27 16, 29 19 C28 22, 24 23, 21 21 Z"
        fill="#10b981"
        opacity="0.9"
      />
      <path
        d="M17 25 C19 23, 23 25, 25 28 C23 31, 18 30, 17 25 Z"
        fill="#059669"
        opacity="0.9"
      />
      {/* Cloud streaks */}
      <path
        d="M13 18 C16 19, 21 17, 24 18"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
};

// 9. Sun / Central Stellar Core (Star Gold / Business Target & Strategic Vision)
export const SunPlanetIcon: React.FC<PlanetIconProps> = ({ className = '', size = 44 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Pusat Orbit Bintang"
    >
      <defs>
        <radialGradient id="sunCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
        <filter id="sunRayGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="glow" />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>
      </defs>

      {/* Corona Flare */}
      <circle cx="24" cy="24" r="18" fill="#fbbf24" opacity="0.3" filter="url(#sunRayGlow)" />
      <circle cx="24" cy="24" r="14" fill="url(#sunCore)" />

      {/* Solar Flare Corona Rings */}
      <circle cx="24" cy="24" r="22" stroke="#fde047" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
      <circle cx="24" cy="24" r="7" fill="#ffffff" opacity="0.6" />
    </svg>
  );
};

// HELPER: Map Business Category to Corresponding Planet
export type BusinessCategoryMapping = {
  planetName: string;
  roleDescription: string;
  colorClass: string;
  badgeBg: string;
  IconComponent: React.FC<PlanetIconProps>;
};

export function getCategoryPlanet(categoryName: string): BusinessCategoryMapping {
  const norm = (categoryName || '').toLowerCase();

  // 1. Minuman Kopi / Signature Drinks / Cashflow
  if (norm.includes('kopi') || norm.includes('coffee') || norm.includes('beverage') || norm.includes('espresso')) {
    return {
      planetName: 'Planet Saturnus',
      roleDescription: 'Signature & Aset Kopi',
      colorClass: 'text-amber-300',
      badgeBg: 'bg-amber-400/10 border-amber-400/20 text-amber-300',
      IconComponent: SaturnPlanetIcon,
    };
  }

  // 2. Operasional, Logistik, Biaya, Bahan Baku
  if (norm.includes('operasional') || norm.includes('biaya') || norm.includes('beban') || norm.includes('listrik') || norm.includes('sewa')) {
    return {
      planetName: 'Planet Mars',
      roleDescription: 'Energi & Beban Operasional',
      colorClass: 'text-rose-400',
      badgeBg: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
      IconComponent: MarsPlanetIcon,
    };
  }

  // 3. Keuntungan Bersih, Pertumbuhan, Retail, Skala Usaha
  if (norm.includes('laba') || norm.includes('untung') || norm.includes('profit') || norm.includes('retail') || norm.includes('biji')) {
    return {
      planetName: 'Planet Jupiter',
      roleDescription: 'Pertumbuhan & Margin Usaha',
      colorClass: 'text-purple-300',
      badgeBg: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
      IconComponent: JupiterPlanetIcon,
    };
  }

  // 4. Kasir POS, Transaksi, Kecepatan Layanan, Tunai/QRIS
  if (norm.includes('transaksi') || norm.includes('pos') || norm.includes('kasir') || norm.includes('arus kas') || norm.includes('keuangan')) {
    return {
      planetName: 'Planet Merkurius',
      roleDescription: 'Kecepatan Transaksi Kasir',
      colorClass: 'text-sky-300',
      badgeBg: 'bg-sky-500/10 border-sky-500/20 text-sky-300',
      IconComponent: MercuryPlanetIcon,
    };
  }

  // 5. CRM, Pelanggan, Gaji Barista, Pastry & Makanan
  if (norm.includes('pelanggan') || norm.includes('customer') || norm.includes('crm') || norm.includes('gaji') || norm.includes('pastry') || norm.includes('makanan')) {
    return {
      planetName: 'Planet Venus',
      roleDescription: 'Hubungan Pelanggan & Hospitality',
      colorClass: 'text-amber-200',
      badgeBg: 'bg-amber-400/10 border-amber-400/20 text-amber-200',
      IconComponent: VenusPlanetIcon,
    };
  }

  // 6. Analisis, Laporan Otomatis, Intelijen Usaha, Non-Kopi
  if (norm.includes('laporan') || norm.includes('analisis') || norm.includes('report') || norm.includes('tren') || norm.includes('non-kopi')) {
    return {
      planetName: 'Planet Neptunus',
      roleDescription: 'Analisis & Intelijen Bisnis',
      colorClass: 'text-blue-300',
      badgeBg: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
      IconComponent: NeptunePlanetIcon,
    };
  }

  // 7. Merchandise, Inovasi, Peralatan Mesin
  if (norm.includes('merchandise') || norm.includes('alat') || norm.includes('inovasi') || norm.includes('tumbler')) {
    return {
      planetName: 'Planet Uranus',
      roleDescription: 'Inovasi & Produk Retail',
      colorClass: 'text-teal-300',
      badgeBg: 'bg-teal-500/10 border-teal-500/20 text-teal-300',
      IconComponent: UranusPlanetIcon,
    };
  }

  // 8. Default: Komunitas & Layanan
  return {
    planetName: 'Planet Bumi',
    roleDescription: 'Layanan Terpadu',
    colorClass: 'text-emerald-300',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    IconComponent: EarthPlanetIcon,
  };
}

// Visual Category Badge with Planet Representation
export const PlanetCategoryBadge: React.FC<{
  category: string;
  size?: number;
  showIconOnly?: boolean;
}> = ({ category, size = 18, showIconOnly = false }) => {
  const planet = getCategoryPlanet(category);
  const Icon = planet.IconComponent;

  if (showIconOnly) {
    return <Icon size={size} />;
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[11px] font-medium backdrop-blur-sm ${planet.badgeBg}`}
      title={`${category} — Terhubung dengan ${planet.planetName} (${planet.roleDescription})`}
    >
      <Icon size={size} />
      <span>{category}</span>
    </div>
  );
};
