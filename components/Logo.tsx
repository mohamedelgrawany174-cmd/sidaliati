
import React from 'react';
import { BrandSettings } from '../types';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
  settings?: BrandSettings;
}

const Logo: React.FC<LogoProps> = ({ 
  className = "w-10 h-10", 
  variant = 'full',
  settings = {
    appName: 'صيدلياتي',
    subtitle: 'Saydaliyati',
    logoType: 'icon',
    logoUrl: '',
    primaryColor: '#e11d48'
  }
}) => {
  const primaryColor = settings.primaryColor || '#e11d48';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Icon Mark or Image */}
      <div className="relative w-10 h-10 flex-shrink-0">
        {settings.logoType === 'image' && settings.logoUrl ? (
          <img 
            src={settings.logoUrl} 
            alt={settings.appName} 
            className="w-full h-full object-contain drop-shadow-lg rounded-lg"
          />
        ) : (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                {/* Lighter shade calculated roughly or static, logic handled in App css overrides usually, but here specific for SVG */}
                <stop offset="0%" stopColor={primaryColor} stopOpacity="0.7" /> 
                <stop offset="100%" stopColor={primaryColor} /> 
              </linearGradient>
              <linearGradient id="leafGradient" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fff1f2" stopOpacity="0.9" />
                <stop offset="100%" stopColor={primaryColor} stopOpacity="0.4" />
              </linearGradient>
            </defs>
            
            {/* Base Shape: Abstract Medical Cross / Flower Petals */}
            <path 
              d="M50 20 C65 20 75 30 80 50 C75 70 65 80 50 80 C35 80 25 70 20 50 C25 30 35 20 50 20 Z" 
              fill="url(#logoGradient)" 
            />
            
            {/* Inner Abstract "S" / Serum Drop curve */}
            <path 
              d="M50 25 C58 25 65 32 65 42 C65 55 45 55 45 68 C45 72 48 75 50 75" 
              stroke="url(#leafGradient)" 
              strokeWidth="6" 
              strokeLinecap="round"
            />
            
            {/* Sparkle Dot */}
            <circle cx="65" cy="35" r="3" fill="#fff" className="animate-pulse" />
          </svg>
        )}
      </div>

      {/* Text */}
      {variant === 'full' && (
        <div className="flex flex-col">
          <h1 className="font-serif-display text-2xl font-bold text-white leading-none tracking-tight">
            {settings.appName}
          </h1>
          <span 
            className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mt-1"
            style={{ color: primaryColor }} // Dynamic subtitle color
          >
            {settings.subtitle}
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
