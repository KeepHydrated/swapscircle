import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('GOOGLE_CLOUD_VISION_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_CLOUD_VISION_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Google Cloud Vision API - Web Detection
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { source: { imageUri: imageUrl } },
            features: [{ type: 'WEB_DETECTION', maxResults: 10 }]
          }]
        })
      }
    );

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error('Google Vision API error:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to check image',
          isOriginal: true // Fail open - allow image if API fails
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const visionData = await visionResponse.json();
    const webDetection = visionData.responses?.[0]?.webDetection;

    // Check for web entities and pages with matching images
    const hasWebEntities = webDetection?.webEntities?.length > 0;
    const hasFullMatchingImages = webDetection?.fullMatchingImages?.length > 0;
    const hasPartialMatchingImages = webDetection?.partialMatchingImages?.length > 0;
    const hasPagesWithMatchingImages = webDetection?.pagesWithMatchingImages?.length > 0;

    // Consider image as potentially non-original if it has multiple matches
    const matchCount = (webDetection?.fullMatchingImages?.length || 0) + 
                      (webDetection?.pagesWithMatchingImages?.length || 0);

    const isOriginal = matchCount < 3; // Allow up to 2 matches (could be legitimate duplicates)
    
    const result = {
      isOriginal,
      matchCount,
      webEntities: webDetection?.webEntities?.slice(0, 5) || [],
      matchingPages: webDetection?.pagesWithMatchingImages?.slice(0, 3)?.map((page: any) => ({
        url: page.url,
        title: page.pageTitle
      })) || [],
      warning: !isOriginal ? 
        'This image appears on multiple websites. Please ensure you own the rights to this photo.' : 
        null
    };

    console.log('Image check result:', { imageUrl, isOriginal, matchCount });

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-image-originality:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        isOriginal: true // Fail open
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
