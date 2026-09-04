"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { ADMIN_COOKIE_NAME } from "@/lib/auth-token";
import { deleteGame, deletePlayer, insertGame, updateGame, upsertPlayer } from "@/lib/db";
import type { Game, GameTeam } from "@/lib/data";

function gameFromFormData(formData: FormData): { id: string; game: Game } {
  const id = String(formData.get("id") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim() || new Date().toISOString();
  const venue = String(formData.get("venue") ?? "").trim();
  const teamA = JSON.parse(String(formData.get("teamA"))) as GameTeam;
  const teamB = JSON.parse(String(formData.get("teamB"))) as GameTeam;

  const gameId = id || crypto.randomUUID();
  return {
    id,
    game: {
      id: gameId,
      date,
      venue: venue || undefined,
      teamA: { ...teamA, name: "A" },
      teamB: { ...teamB, name: "B" },
    },
  };
}

export async function saveGameAction(formData: FormData) {
  await requireAdmin();

  const { id, game } = gameFromFormData(formData);
  if (id) await updateGame(game);
  else await insertGame(game);

  redirect("/admin");
}

export async function startLiveGameAction(formData: FormData) {
  await requireAdmin();

  const { game } = gameFromFormData(formData);
  await insertGame(game);

  redirect(`/admin/jogos/${game.id}/ao-vivo`);
}

export async function deleteGameAction(formData: FormData) {
  await requireAdmin();
  await deleteGame(String(formData.get("id")));
  redirect("/admin");
}

export async function savePlayerAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const photo = String(formData.get("photo") ?? "").trim();
  if (!id || !name) throw new Error("Id e nome são obrigatórios.");

  await upsertPlayer({ id, name, photo: photo || undefined });
  redirect("/admin");
}

export async function deletePlayerAction(formData: FormData) {
  await requireAdmin();
  await deletePlayer(String(formData.get("id")));
  redirect("/admin");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}
