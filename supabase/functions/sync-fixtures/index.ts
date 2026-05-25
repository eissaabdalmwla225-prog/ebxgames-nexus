import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FEATURED_LEAGUES = [39, 140, 135, 78, 61, 2, 3];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const API_KEY = Deno.env.get("API_FOOTBALL_KEY");
    if (!API_KEY) throw new Error("API_FOOTBALL_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const season = new Date().getFullYear();
    let totalUpserted = 0;
    const errors: string[] = [];

    for (const leagueId of FEATURED_LEAGUES) {
      try {
        const url = `https://v3.football.api-sports.io/fixtures?league=${leagueId}&season=${season}&next=20`;
        const resp = await fetch(url, {
          headers: { "x-apisports-key": API_KEY },
        });
        if (!resp.ok) {
          errors.push(`League ${leagueId}: HTTP ${resp.status}`);
          continue;
        }
        const json = await resp.json();
        const fixtures = json.response || [];

        const rows = fixtures.map((f: any) => ({
          id: f.fixture.id,
          league_id: f.league.id,
          league_name: f.league.name,
          home_team: f.teams.home.name,
          away_team: f.teams.away.name,
          home_logo: f.teams.home.logo,
          away_logo: f.teams.away.logo,
          kickoff_at: f.fixture.date,
          status: f.fixture.status.short,
          home_score: f.goals.home,
          away_score: f.goals.away,
          is_live: ["1H", "2H", "HT", "ET", "P", "LIVE"].includes(f.fixture.status.short),
          updated_at: new Date().toISOString(),
        }));

        if (rows.length > 0) {
          const { error } = await supabase.from("matches").upsert(rows, {
            onConflict: "id",
            ignoreDuplicates: false,
          });
          if (error) errors.push(`League ${leagueId} upsert: ${error.message}`);
          else totalUpserted += rows.length;
        }
      } catch (e: any) {
        errors.push(`League ${leagueId}: ${e.message}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, upserted: totalUpserted, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("sync-fixtures error:", e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
