import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// SVG representing the premium blue faceted gem brand identity for LUMORA PWA
const pwaIconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Rounded corner background mimicking a premium app icon with crisp light gray/white vertical gradient -->
  <rect width="512" height="512" rx="112" fill="url(#bgLightGrad)" />
  
  <!-- Subtle wave patterns reflecting light and luxury -->
  <path d="M0 409.6 C153.6 307.2 358.4 460.8 512 256 L512 512 L0 512 Z" fill="#00D2FF" fill-opacity="0.04" />
  <path d="M0 460.8 C204.8 256 307.2 409.6 512 102.4 L512 512 L0 512 Z" fill="#0A3D91" fill-opacity="0.02" />

  <defs>
    <!-- Background linear gradient representing premium white and light gray -->
    <linearGradient id="bgLightGrad" x1="0" y1="0" x2="0" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#FFFFFF" />
      <stop offset="100%" stopColor="#F6F8FC" />
    </linearGradient>

    <!-- Diamond Facets with Royal Blue gradients -->
    <linearGradient id="facetGrad1" x1="194.5" y1="51.2" x2="358.4" y2="256" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#00E5FF" />
      <stop offset="100%" stopColor="#1E60D2" />
    </linearGradient>
    <linearGradient id="facetGrad2" x1="358.4" y1="51.2" x2="512" y2="256" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#1E5CBA" />
      <stop offset="100%" stopColor="#1254BE" />
    </linearGradient>
    <linearGradient id="facetGrad3" x1="358.4" y1="153.6" x2="460.8" y2="358.4" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#1254BE" />
      <stop offset="100%" stopColor="#0A3D91" />
    </linearGradient>
    <linearGradient id="facetGrad4" x1="256" y1="256" x2="358.4" y2="460.8" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#0A3D91" />
      <stop offset="100%" stopColor="#041E4E" />
    </linearGradient>

    <!-- Premium 3D drop shadow filter for depth on white background -->
    <filter id="ribbonShadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#061A3F" floodOpacity="0.14" />
      <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#06122d" floodOpacity="0.08" />
    </filter>
  </defs>

  <g filter="url(#ribbonShadow)" transform="translate(32, 96) scale(3.2)">
    <!-- Top-Left Outer Facet -->
    <polygon points="70,10 70,30 38,24" fill="url(#facetGrad1)" stroke="rgba(255,255,255,0.4)" stroke-width="0.4" />
    
    <!-- Top-Right Outer Facet -->
    <polygon points="70,10 70,30 102,24" fill="url(#facetGrad2)" stroke="rgba(255,255,255,0.4)" stroke-width="0.4" />
    
    <!-- Inside Top-Left Facet -->
    <polygon points="70,30 70,50 50,50" fill="url(#facetGrad1)" stroke="rgba(255,255,255,0.4)" stroke-width="0.4" />
    
    <!-- Inside Top-Right Facet -->
    <polygon points="70,30 70,50 90,50" fill="url(#facetGrad2)" stroke="rgba(255,255,255,0.4)" stroke-width="0.4" />

    <!-- Right-Top Outer Facet -->
    <polygon points="102,24 90,50 114,50" fill="url(#facetGrad2)" stroke="rgba(255,255,255,0.4)" stroke-width="0.4" />
    
    <!-- Right-Bottom Outer Facet -->
    <polygon points="114,50 90,50 102,76" fill="url(#facetGrad3)" stroke="rgba(255,255,255,0.4)" stroke-width="0.4" />

    <!-- Bottom-Right Outer Facet -->
    <polygon points="102,76 70,70 70,90" fill="url(#facetGrad3)" stroke="rgba(255,255,255,0.4)" stroke-width="0.4" />
    
    <!-- Bottom-Left Outer Facet -->
    <polygon points="38,76 70,70 70,90" fill="url(#facetGrad4)" stroke="rgba(255,255,255,0.4)" stroke-width="0.4" />

    <!-- Inside Bottom-Right Facet -->
    <polygon points="90,50 70,50 70,70" fill="url(#facetGrad3)" stroke="rgba(255,255,255,0.4)" stroke-width="0.4" />
    
    <!-- Inside Bottom-Left Facet -->
    <polygon points="50,50 70,50 70,70" fill="url(#facetGrad4)" stroke="rgba(255,255,255,0.4)" stroke-width="0.4" />

    <!-- Left-Bottom Outer Facet -->
    <polygon points="38,76 50,50 26,50" fill="url(#facetGrad4)" stroke="rgba(255,255,255,0.4)" stroke-width="0.4" />
    
    <!-- Left-Top Outer Facet -->
    <polygon points="26,50 50,50 38,24" fill="url(#facetGrad1)" stroke="rgba(255,255,255,0.4)" stroke-width="0.4" />

    <!-- Letter L Lineage embedded inside left structural facets -->
    <polyline points="38,24 50,50 70,70 70,90" stroke="#00E5FF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.85" style="mix-blend-mode: overlay" />
    
    <!-- Letter M Lineage embedded inside center/right structural facets -->
    <polyline points="70,10 70,30 90,50 102,76" stroke="#00E5FF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.85" style="mix-blend-mode: overlay" />
  </g>
</svg>
`;

async function main() {
  const pwa512Buffer = Buffer.from(pwaIconSvg);
  
  console.log('Rendering Premium Blue Faceted Ribbon SVG App Icons on Sharp...');
  
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Create 512x512 PWA App Icon
  await sharp(pwa512Buffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'lumora_pwa_icon_v9.png'));
    
  console.log('✔ Created public/lumora_pwa_icon_v9.png');

  // Create 192x192 PWA App Icon
  await sharp(pwa512Buffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'lumora_pwa_icon_v9_192.png'));
    
  console.log('✔ Created public/lumora_pwa_icon_v9_192.png');

  // Overwrite older/fallback icons to ensure no cached file paths still read old versions!
  const legacyDestinations = [
    'logo.png',
    'lumora_new_icon.png',
    'lumora_app_icon_v7.png',
    'lumora_app_icon_v8.png',
    'lumora_app_icon_v8_192.png',
  ];
  
  for (const name of legacyDestinations) {
    await sharp(pwa512Buffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, name));
    console.log(`✔ Overwrote legacy file public/${name} with new blue faceted diamond system layout!`);
  }

  // Generate Favicon sizes
  const faviconDestinations = [
    'favicon.ico',
    'favicon_new.ico',
    'favicon_v7.ico',
    'favicon_v8.ico'
  ];

  for (const name of faviconDestinations) {
    try {
      await sharp(pwa512Buffer)
        .resize(48, 48)
        .png()
        .toFile(path.join(publicDir, name));
      console.log(`✔ Overwrote favicon public/${name} with premium downscaled version!`);
    } catch (err) {
      console.error(`Error rendering favicon public/${name}:`, err);
    }
  }
}

main().catch(console.error);
