import React from 'react';

interface CbeLogoProps {
  className?: string;
  size?: number; // width and height in pixels
}

export default function CbeLogo({ className = '', size = 100 }: CbeLogoProps) {
  const officialCbeLogoUrl = 'https://upload.wikimedia.org/wikipedia/commons/e/e5/LOGO_OF_COMMERCIAL_BANK_OF_ETHIOPIA_%28BAANKII_DALDALA_ITIYOOPHIYAA%29.jpg';

  return (
    <div 
      className={`relative flex items-center justify-center select-none overflow-hidden rounded-full p-0.5 bg-white border border-amber-500/10 shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={officialCbeLogoUrl}
        alt="CBE - Commercial Bank of Ethiopia"
        className="w-full h-full object-contain rounded-full bg-white"
        referrerPolicy="no-referrer"
        onError={(e) => {
          // Robust local fallback in case Wikimedia has any connection latency in the cloud sandbox environment
          e.currentTarget.src = 'https://combanketh.et/wp-content/uploads/2023/10/logo.png';
        }}
      />
    </div>
  );
}
