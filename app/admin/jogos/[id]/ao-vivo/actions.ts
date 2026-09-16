"use server";

import { cookies } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireLiveGameAccess } from "@/lib/auth";
import { EDITOR_COOKIE_NAME } from "@/lib/auth-token";
import { adjustPlayerGoal, assignPlayerToTeam, getGameById } from "@/lib/db";

async function authorize(gameId: string) {
  const game = await getGameById(gameId);
  if (!game) throw new Error("Jogo não encontrado.");
  await requireLiveGameAccess(game);
}

export async function adjustGoalAction(gameId: string, team: "A" | "B", playerId: string, delta: number) {
  await authorize(gameId);
  await adjustPlayerGoal(gameId, team, playerId, delta);
  updateTag("games");
  revalidatePath(`/admin/jogos/${gameId}/ao-vivo`);
  revalidatePath("/admin");
}

export async function assignPlayerAction(gameId: string, playerId: string, team: "A" | "B" | null) {
  await authorize(gameId);
  await assignPlayerToTeam(gameId, playerId, team);
  updateTag("games");
  revalidatePath(`/admin/jogos/${gameId}/ao-vivo`);
  revalidatePath("/admin");
}

export async function logoutEditorAction(gameId: string) {
  const store = await cookies();
  store.set(EDITOR_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/admin/jogos/${gameId}/ao-vivo`,
    maxAge: 0,
  });
  redirect("/");
}
