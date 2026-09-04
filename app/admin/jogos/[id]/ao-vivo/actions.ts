"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { adjustPlayerGoal } from "@/lib/db";

export async function adjustGoalAction(gameId: string, team: "A" | "B", playerId: string, delta: number) {
  await requireAdmin();
  await adjustPlayerGoal(gameId, team, playerId, delta);
  revalidatePath(`/admin/jogos/${gameId}/ao-vivo`);
  revalidatePath("/admin");
}
