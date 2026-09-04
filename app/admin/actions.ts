"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { ADMIN_COOKIE_NAME } from "@/lib/auth-token";
import { deleteGame, deletePlayer, insertGame, updateGame, upsertPlayer } from "@/lib/db";
import type { Game, GameTeam } from "@/lib/data";

export async function saveGameAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const date = String(formData.get("date") ?? "");
  const venue = String(formData.get("venue") ?? "").trim();
  const teamA = JSON.parse(String(formData.get("teamA"))) as GameTeam;
  const teamB = JSON.parse(String(formData.get("teamB"))) as GameTeam;

  const game: Game = {
    id: id || crypto.randomUUID(),
    date,
    venue: venue || undefined,
    teamA: { ...teamA, name: "A" },
    teamB: { ...teamB, name: "B" },
  };

  if (id) await updateGame(game);
  else await insertGame(game);

  redirect("/admin");
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
