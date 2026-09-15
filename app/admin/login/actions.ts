"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_NAME,
  EDITOR_COOKIE_NAME,
  checkEditorPassword,
  checkPassword,
  createEditorSessionToken,
  createSessionToken,
} from "@/lib/auth-token";
import { getGameById } from "@/lib/db";

export type LoginState = { error: string };

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const gameId = String(formData.get("gameId") ?? "").trim();
  const isAdmin = await checkPassword(password);

  const store = await cookies();
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30,
  };

  if (isAdmin) {
    store.set(ADMIN_COOKIE_NAME, await createSessionToken(), { ...cookieOptions, path: "/" });
    redirect(gameId ? `/admin/jogos/${encodeURIComponent(gameId)}/ao-vivo` : "/admin");
  }

  if (gameId) {
    const game = await getGameById(gameId);
    if (game?.access === "editor" && await checkEditorPassword(password)) {
      const path = `/admin/jogos/${encodeURIComponent(gameId)}/ao-vivo`;
      store.set(EDITOR_COOKIE_NAME, await createEditorSessionToken(gameId), { ...cookieOptions, path });
      redirect(path);
    }
  }

  return { error: "Palavra-passe incorreta ou acesso não autorizado." };
}
