import React, { useState } from 'react';

interface ChurchLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ChurchLogo: React.FC<ChurchLogoProps> = ({ className = '', size = 'md' }) => {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const selectedSize = className.includes('w-') || className.includes('h-') ? className : `${sizeMap[size]} ${className}`;

  return (
    <div className={`relative rounded-full border-2 border-[#F5A623] bg-[#180B05] p-0.5 shadow-lg overflow-hidden shrink-0 flex items-center justify-center ${selectedSize}`}>
      {!imgError ? (
        <img
          src="/logo.jpg"
          alt="Haymete Abrham Sunday School Logo"
          className="w-full h-full object-cover rounded-full"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      ) : (
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full text-[#F5A623]"
          xmlns="http://www.w3.org/2000/svg"
        >
        <defs>
          <path
            id="topArcPath"
            d="M 30,150 A 120,120 0 0,1 270,150"
            fill="none"
          />
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBB03B" />
            <stop offset="50%" stopColor="#F5A623" />
            <stop offset="100%" stopColor="#E5921A" />
          </linearGradient>
          <linearGradient id="bibleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF2E0" />
            <stop offset="100%" stopColor="#F7E5C8" />
          </linearGradient>
        </defs>

        {/* Outer Circular Frame & Borders */}
        <circle cx="150" cy="150" r="146" fill="#180B05" stroke="#F5A623" strokeWidth="4" />
        <circle cx="150" cy="150" r="138" fill="none" stroke="#F5A623" strokeWidth="1.5" strokeDasharray="4 2" />

        {/* Outer Curved Ge'ez Text */}
        <text className="text-[9px] font-bold fill-[#F5A623]" letterSpacing="0.5">
          <textPath href="#topArcPath" startOffset="50%" textAnchor="middle">
            በኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን አዲስ አበባ ሀገረ ስብከት የጀሞ ቁ.3 ደብረ ኃይል ቅዱስ ገብርኤል ቤተክርስቲያን
          </textPath>
        </text>

        {/* Inner Arch Line */}
        <path
          d="M 40,150 A 110,110 0 0,1 260,150"
          fill="none"
          stroke="#F5A623"
          strokeWidth="2"
        />

        {/* Inscriptions inside upper arch */}
        <text x="75" y="70" className="text-[9px] font-bold fill-[#F7E5C8]" textAnchor="middle">
          ፍቅር እግዚአብሔር
        </text>
        <text x="225" y="70" className="text-[9px] font-bold fill-[#F7E5C8]" textAnchor="middle">
          ፍቅር ቢጽ
        </text>
        <text x="150" y="115" className="text-[11px] font-black fill-[#FFF2E0]" textAnchor="middle">
          ቃለ ሥጋ ሆነ
        </text>

        {/* --- 5 Domes Architecture --- */}
        {/* Outer Left Dome (Dome 1) */}
        <g>
          <path d="M 50,160 C 50,130 80,130 80,160 Z" fill="url(#goldGradient)" stroke="#180B05" strokeWidth="1.5" />
          <path d="M 65,118 L 65,130 M 60,123 L 70,123" stroke="#FBB03B" strokeWidth="2.5" />
        </g>

        {/* Inner Left Dome (Dome 2) */}
        <g>
          <path d="M 80,150 C 80,110 120,110 120,150 Z" fill="url(#goldGradient)" stroke="#180B05" strokeWidth="1.5" />
          <path d="M 100,98 L 100,110 M 94,103 L 106,103" stroke="#FBB03B" strokeWidth="2.5" />
        </g>

        {/* Inner Right Dome (Dome 3) */}
        <g>
          <path d="M 180,150 C 180,110 220,110 220,150 Z" fill="url(#goldGradient)" stroke="#180B05" strokeWidth="1.5" />
          <path d="M 200,98 L 200,110 M 194,103 L 206,103" stroke="#FBB03B" strokeWidth="2.5" />
        </g>

        {/* Outer Right Dome (Dome 4) */}
        <g>
          <path d="M 220,160 C 220,130 250,130 250,160 Z" fill="url(#goldGradient)" stroke="#180B05" strokeWidth="1.5" />
          <path d="M 235,118 L 235,130 M 230,123 L 240,123" stroke="#FBB03B" strokeWidth="2.5" />
        </g>

        {/* Main Central Large Dome (Dome 5) */}
        <g>
          <path d="M 110,150 C 110,80 190,80 190,150 Z" fill="url(#goldGradient)" stroke="#180B05" strokeWidth="2" />
          {/* Main Top Cross */}
          <path d="M 150,60 L 150,80 M 140,70 L 160,70" stroke="#FBB03B" strokeWidth="4" strokeLinecap="round" />
          <circle cx="150" cy="70" r="3" fill="#180B05" />
        </g>

        {/* --- Traditional Instruments --- */}
        {/* Left: Kebero (Drum) */}
        <g transform="translate(42, 162) scale(0.65)">
          <path d="M 10,10 L 30,15 L 25,45 L 15,45 Z" fill="#F5A623" stroke="#180B05" strokeWidth="1" />
          <line x1="10" y1="10" x2="25" y2="45" stroke="#180B05" strokeWidth="1" />
          <line x1="30" y1="15" x2="15" y2="45" stroke="#180B05" strokeWidth="1" />
        </g>

        {/* Right: Tsenatsil (Sistrum) & Begena */}
        <g transform="translate(235, 162) scale(0.65)">
          <path d="M 10,40 L 10,15 C 10,5 30,5 30,15 L 30,40" fill="none" stroke="#F5A623" strokeWidth="2" />
          <line x1="10" y1="20" x2="30" y2="20" stroke="#F7E5C8" strokeWidth="1.5" />
          <line x1="10" y1="30" x2="30" y2="30" stroke="#F7E5C8" strokeWidth="1.5" />
        </g>

        {/* --- Radiating Light Beams beneath Bible --- */}
        <g stroke="#F5A623" strokeWidth="1.5" opacity="0.8">
          <line x1="150" y1="210" x2="150" y2="255" />
          <line x1="150" y1="210" x2="120" y2="250" />
          <line x1="150" y1="210" x2="180" y2="250" />
          <line x1="150" y1="210" x2="90" y2="245" />
          <line x1="150" y1="210" x2="210" y2="245" />
        </g>

        {/* --- Open Holy Bible in Foreground --- */}
        <g>
          {/* Left Page */}
          <path d="M 30,220 Q 90,195 150,215 Q 90,205 30,230 Z" fill="url(#bibleGradient)" stroke="#F5A623" strokeWidth="2" />
          {/* Right Page */}
          <path d="M 270,220 Q 210,195 150,215 Q 210,205 270,230 Z" fill="url(#bibleGradient)" stroke="#F5A623" strokeWidth="2" />
          {/* Center Spine Cross */}
          <path d="M 150,210 L 150,230" stroke="#180B05" strokeWidth="2" />
          <path d="M 145,218 L 155,218" stroke="#180B05" strokeWidth="2" />
        </g>

        {/* --- Two Praising Angels at Bottom Corners --- */}
        {/* Left Angel */}
        <g transform="translate(25, 225) scale(0.5)">
          <path d="M 20,20 C 10,10 0,30 20,40 C 30,20 40,10 20,20 Z" fill="#F7E5C8" />
          <circle cx="25" cy="15" r="5" fill="#F5A623" />
        </g>

        {/* Right Angel */}
        <g transform="translate(240, 225) scale(0.5)">
          <path d="M 20,20 C 30,10 40,30 20,40 C 10,20 0,10 20,20 Z" fill="#F7E5C8" />
          <circle cx="15" cy="15" r="5" fill="#F5A623" />
        </g>

        {/* --- Bottom Text Banner Box --- */}
        <g>
          <rect x="50" y="250" width="200" height="38" rx="4" fill="#F7E5C8" stroke="#F5A623" strokeWidth="2" />
          <text x="150" y="264" className="text-[10px] font-bold fill-[#180B05]" textAnchor="middle">
            ፪፬፻፮ ዓ.ም  •  2006 E.C
          </text>
          <text x="150" y="280" className="text-[12px] font-extrabold fill-[#180B05]" textAnchor="middle">
            ሐይመተ አብርሃም ሰ/ት/ቤት
          </text>
        </g>
      </svg>
      )}
    </div>
  );
};
