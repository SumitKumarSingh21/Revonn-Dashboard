import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { garageName, location, services = [], rating, reviewCount } = await req.json();

    if (!garageName) {
      throw new Error('Garage name is required');
    }

    console.log('Generating banner for:', garageName, location);
    
    // Create a simple SVG banner
    const servicesText = services.length > 0 ? services.slice(0, 3).join(' • ') : 'Automotive Services';
    const ratingText = rating > 0 ? `★ ${rating.toFixed(1)}` : '';
    const reviewText = reviewCount > 0 ? `(${reviewCount} reviews)` : '';
    
    const svgBanner = `
      <svg width="800" height="450" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="800" height="450" fill="url(#bgGradient)" />
        
        <!-- Decorative elements -->
        <circle cx="700" cy="100" r="60" fill="rgba(255,255,255,0.1)" />
        <circle cx="750" cy="350" r="40" fill="rgba(255,255,255,0.08)" />
        <rect x="50" y="50" width="3" height="350" fill="rgba(255,255,255,0.2)" />
        
        <!-- Main content container -->
        <rect x="80" y="120" width="640" height="210" fill="rgba(255,255,255,0.95)" rx="8" filter="url(#shadow)" />
        
        <!-- Garage name -->
        <text x="400" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="bold" fill="#1e40af">${garageName}</text>
        
        <!-- Location -->
        <text x="400" y="215" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#64748b">📍 ${location}</text>
        
        <!-- Services -->
        <text x="400" y="250" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#475569">${servicesText}</text>
        
        <!-- Rating and reviews -->
        ${rating > 0 ? `<text x="400" y="285" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#f59e0b">${ratingText} ${reviewText}</text>` : ''}
        
        <!-- Decorative car icon -->
        <g transform="translate(100, 140)">
          <rect x="0" y="15" width="40" height="15" rx="2" fill="#1e40af" opacity="0.6"/>
          <circle cx="8" cy="32" r="5" fill="#374151"/>
          <circle cx="32" cy="32" r="5" fill="#374151"/>
          <rect x="5" y="10" width="30" height="8" rx="1" fill="#60a5fa" opacity="0.8"/>
        </g>
        
        <!-- Decorative wrench icon -->
        <g transform="translate(660, 140)">
          <rect x="0" y="10" width="25" height="4" rx="2" fill="#1e40af" opacity="0.6" transform="rotate(45 12.5 12)"/>
          <circle cx="5" cy="12" r="3" fill="none" stroke="#1e40af" stroke-width="2" opacity="0.6"/>
          <circle cx="20" cy="12" r="3" fill="none" stroke="#1e40af" stroke-width="2" opacity="0.6"/>
        </g>
      </svg>
    `;

    // Convert SVG to base64
    const svgBase64 = btoa(unescape(encodeURIComponent(svgBanner)));
    
    console.log('Banner generated successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      imageData: svgBase64,
      imageFormat: 'svg'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating garage banner:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});