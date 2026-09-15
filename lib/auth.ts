import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_NAME,
  EDITOR_COOKIE_NAME,
  isValidEditorSessionToken,
  isValidSessionToken,
} from "@/lib/auth-token";
import type { Game } from "@/src/data/types";

export async function isAuthenticated() {
  const store = await cookies();
  return isValidSessionToken(store.get(ADMIN_COOKIE_NAME)?.value);
}

export async function requireAdmin() {
  if (!(await isAuthenticated())) redirect("/admin/login");
}

export async function requireLiveGameAccess(game: Game): Promise<"admin" | "editor"> {
  if (await isAuthenticated()) return "admin";

  const store = await cookies();
  const editorToken = store.get(EDITOR_COOKIE_NAME)?.value;
  if (game.access === "editor" && await isValidEditorSessionToken(editorToken, game.id)) return "editor";

  redirect(`/admin/login?gameId=${encodeURIComponent(game.id)}`);
}
