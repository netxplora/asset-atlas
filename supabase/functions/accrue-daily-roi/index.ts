import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// This Edge Function is called by Supabase's built-in cron scheduler.
// Schedule it in the Supabase Dashboard: Edge Functions → Schedules
// Cron: 0 0 * * * (daily at midnight UTC)

Deno.serve(async (_req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error } = await supabase.rpc("accrue_daily_roi");

    if (error) {
      console.error("accrue_daily_roi failed:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("ROI accrual complete:", data);
    return new Response(JSON.stringify({ success: true, result: data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
