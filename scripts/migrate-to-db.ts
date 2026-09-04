import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { games } from "../src/data/match";
import { players } from "../src/data/team/players";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to .env.local first (see .env.example).");
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { error: playersError } = await supabase.from("players").upsert(
    players.map((player) => ({ id: player.id, name: player.name, photo: player.photo ?? null })),
  );
  if (playersError) throw new Error(`Failed to migrate players: ${playersError.message}`);
  console.log(`Migrated ${players.length} players.`);

  const { error: gamesError } = await supabase.from("games").upsert(
    games.map((game) => ({ id: game.id, date: game.date, venue: game.venue ?? null, team_a: game.teamA, team_b: game.teamB })),
  );
  if (gamesError) throw new Error(`Failed to migrate games: ${gamesError.message}`);
  console.log(`Migrated ${games.length} games.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
