"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { error: "" };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <main className="container admin-auth">
      <form className="admin-auth-form" action={formAction}>
        <h1>Acesso administrativo</h1>
        <p>Introduz a palavra-passe para gerir partidas e jogadores.</p>
        <label htmlFor="password">Palavra-passe</label>
        <input id="password" name="password" type="password" required autoFocus />
        {state.error && <p className="admin-error">{state.error}</p>}
        <button type="submit" disabled={pending}>{pending ? "A entrar…" : "Entrar"}</button>
      </form>
    </main>
  );
}
