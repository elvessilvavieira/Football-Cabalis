import { createClient } from "@supabase/supabase-js";
import { revalidateTag, unstable_cache } from "next/cache";
import type { Game, GameTeam, Player } from "@/src/data/types";

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

type GameRow = { id: string; date: string; venue: string | null; team_a: GameTeam; team_b: GameTeam };
type PlayerRow = { id: string; name: string; photo: string | null };

function rowToGame(row: GameRow): Game {
  return { id: row.id, date: row.date, venue: row.venue ?? undefined, teamA: row.team_a, teamB: row.team_b };
}

function rowToPlayer(row: PlayerRow): Player {
  return { id: row.id, name: row.name, photo: row.photo ?? undefined };
}

export const getGames = unstable_cache(
  async (): Promise<Game[]> => {
    const { data, error } = await getClient().from("games").select("*").order("date", { ascending: false });
    if (error) throw new Error(`Failed to fetch games: ${error.message}`);
    return (data as GameRow[]).map(rowToGame);
  },
  ["games"],
  { tags: ["games"] },
);

export const getPlayers = unstable_cache(
  async (): Promise<Player[]> => {
    const { data, error } = await getClient().from("players").select("*").order("name");
    if (error) throw new Error(`Failed to fetch players: ${error.message}`);
    return (data as PlayerRow[]).map(rowToPlayer);
  },
  ["players"],
  { tags: ["players"] },
);

export async function insertGame(game: Game) {
  const { error } = await getClient().from("games").insert({
    id: game.id,
    date: game.date,
    venue: game.venue ?? null,
    team_a: game.teamA,
    team_b: game.teamB,
  });
  if (error) throw new Error(`Failed to create game: ${error.message}`);
  revalidateTag("games", "max");
}

export async function updateGame(game: Game) {
  const { error } = await getClient().from("games").update({
    date: game.date,
    venue: game.venue ?? null,
    team_a: game.teamA,
    team_b: game.teamB,
  }).eq("id", game.id);
  if (error) throw new Error(`Failed to update game: ${error.message}`);
  revalidateTag("games", "max");
}

export async function deleteGame(id: string) {
  const { error } = await getClient().from("games").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete game: ${error.message}`);
  revalidateTag("games", "max");
}

export async function upsertPlayer(player: Player) {
  const { error } = await getClient().from("players").upsert({
    id: player.id,
    name: player.name,
    photo: player.photo ?? null,
  });
  if (error) throw new Error(`Failed to save player: ${error.message}`);
  revalidateTag("players", "max");
}

export async function deletePlayer(id: string) {
  const { error } = await getClient().from("players").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete player: ${error.message}`);
  revalidateTag("players", "max");
}
