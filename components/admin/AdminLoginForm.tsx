"use client";

import { useActionState } from "react";
import { KeyRound } from "lucide-react";
import { login, type LoginState } from "@/app/admin/login/actions";

const initialState: LoginState = { error: "" };

export function AdminLoginForm({ gameId }: { gameId?: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);
  const editorLogin = Boolean(gameId);

  return (
    <form className="admin-auth-form" action={formAction}>
      <span className="admin-auth-icon"><KeyRound size={22} /></span>
      <h1>{editorLogin ? "Editar jogo ao vivo" : "Acesso administrativo"}</h1>
      <p>
        {editorLogin
          ? "Introduz a palavra-passe de editor. Este acesso fica limitado apenas a este jogo."
          : "Introduz a palavra-passe para gerir partidas e jogadores."}
      </p>
      {gameId && <input type="hidden" name="gameId" value={gameId} />}
      <label htmlFor="password">Palavra-passe</label>
      <input id="password" name="password" type="password" required autoFocus autoComplete="current-password" />
      {state.error && <p className="admin-error" role="alert">{state.error}</p>}
      <button type="submit" disabled={pending}>{pending ? "A entrar…" : "Entrar"}</button>
    </form>
  );
}
