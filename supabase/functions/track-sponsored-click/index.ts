import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple hash function for IP addresses
function hashIP(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productId, searchQuery } = await req.json();
    
    if (!productId) {
      throw new Error("Product ID is required");
    }

    console.log("[TRACK-CLICK] Tracking click for product:", productId);

    // Create Supabase client with service role for bypassing RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user ID if authenticated
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      userId = data.user?.id || null;
    }

    // Get IP hash for fraud prevention
    const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
    const ipHash = hashIP(clientIP);

    // Get the sponsored product to check budget and get cost per click
    const { data: product, error: productError } = await supabaseAdmin
      .from("sponsored_products")
      .select("id, cost_per_click, daily_budget, total_spent, total_clicks, is_active, status")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      console.error("[TRACK-CLICK] Product not found:", productError);
      throw new Error("Product not found");
    }

    if (!product.is_active || product.status !== "approved") {
      console.log("[TRACK-CLICK] Product not active or not approved");
      return new Response(JSON.stringify({ success: false, reason: "Product not active" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check for duplicate clicks within 24 hours (fraud prevention)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentClicks } = await supabaseAdmin
      .from("sponsored_product_clicks")
      .select("id")
      .eq("product_id", productId)
      .eq("ip_hash", ipHash)
      .gte("created_at", twentyFourHoursAgo)
      .limit(1);

    if (recentClicks && recentClicks.length > 0) {
      console.log("[TRACK-CLICK] Duplicate click from same IP within 24h, not charging");
      return new Response(JSON.stringify({ success: true, charged: false, reason: "Duplicate click" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const costPerClick = Number(product.cost_per_click);

    // Insert click record
    const { error: clickError } = await supabaseAdmin
      .from("sponsored_product_clicks")
      .insert({
        product_id: productId,
        user_id: userId,
        ip_hash: ipHash,
        cost: costPerClick,
        search_query: searchQuery || null,
      });

    if (clickError) {
      console.error("[TRACK-CLICK] Error inserting click:", clickError);
      throw new Error("Failed to record click");
    }

    // Update product stats
    const { error: updateError } = await supabaseAdmin
      .from("sponsored_products")
      .update({
        total_clicks: (product.total_clicks || 0) + 1,
        total_spent: Number(product.total_spent || 0) + costPerClick,
      })
      .eq("id", productId);

    if (updateError) {
      console.error("[TRACK-CLICK] Error updating product stats:", updateError);
    }

    console.log("[TRACK-CLICK] Click tracked successfully, cost:", costPerClick);

    return new Response(JSON.stringify({ success: true, charged: true, cost: costPerClick }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[TRACK-CLICK] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
