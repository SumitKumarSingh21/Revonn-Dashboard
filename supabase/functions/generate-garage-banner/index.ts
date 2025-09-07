import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { garageName, location, services = [], rating, reviewCount } = await req.json();

    if (!garageName) {
      throw new Error('Garage name is required');
    }

    // Create a detailed prompt for a professional garage banner
    const servicesText = services.length > 0 ? services.join(', ') : 'automotive services';
    const ratingText = rating > 0 ? `${rating.toFixed(1)} star rating` : '';
    const reviewText = reviewCount > 0 ? `${reviewCount} reviews` : '';
    
    const prompt = `Create a professional, modern automotive garage banner image for "${garageName}" located in ${location}. 

Design requirements:
- Professional automotive garage aesthetic with modern design
- Clean, bold typography featuring the garage name "${garageName}"
- Include location "${location}" in smaller text
- Automotive theme with car silhouettes, tools, or garage elements
- Professional color scheme (blues, grays, reds, or automotive colors)
- Banner format suitable for business header (16:9 aspect ratio)
- Include subtle icons representing services: ${servicesText}
- Modern, trustworthy, and professional appearance
- High quality, commercial-grade design
- No people or faces, focus on branding and automotive elements
- Clean background with garage/automotive workshop elements
- Typography should be bold and easily readable

Style: Professional business banner, automotive industry, modern design, commercial quality`;

    console.log('Generating banner with prompt:', prompt);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1792x1024', // 16:9 aspect ratio for banner
        quality: 'high',
        output_format: 'webp',
        background: 'opaque'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data[0] || !data.data[0].b64_json) {
      throw new Error('Invalid response from OpenAI API');
    }

    console.log('Banner generated successfully');

    // Return the base64 image data
    return new Response(JSON.stringify({ 
      success: true, 
      imageData: data.data[0].b64_json,
      imageFormat: 'webp'
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