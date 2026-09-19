"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { Archive, ArchiveRestore, Pencil, Radio, ShieldCheck } from "lucide-react";
import { archiveGameAction, restoreGameAction, updateGameAccessAction } from "@/app/admin/actions";
import type { GameAccess } from "@/lib/data";

export function GameListActions({ gameId, access }: { gameId: string; access: GameAccess }) {
  const [optimisticAccess, setOptimisticAccess] = useOptimistic(access);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const nextAccess: GameAccess = optimisticAccess === "admin" ? "editor" : "admin";

  function toggleAccess() {
    startTransition(async () => {
      setError("");
      setOptimisticAccess(nextAccess);
      try {
        await updateGameAccessAction(gameId, nextAccess);
      } catch {
        setError("Não foi possível alterar o acesso. Confirma a migração da base de dados.");
      }
    });
  }

  return (
    <div className="admin-list-actions">
      <button
        type="button"
        className={`admin-access-switch is-${optimisticAccess}`}
        role="switch"
        aria-checked={optimisticAccess === "editor"}
        aria-label={`Acesso atual: ${optimisticAccess}. Alterar para ${nextAccess}`}
        title={`Só ${optimisticAccess === "admin" ? "administradores" : "editores deste jogo"} podem editar`}
        disabled={pending}
        onClick={toggleAccess}
      >
        <span className="admin-access-switch-track" aria-hidden="true"><i /></span>
        <span>{optimisticAccess === "admin" ? <ShieldCheck size={14} /> : <Pencil size={14} />}</span>
        {optimisticAccess === "admin" ? "Admin" : "Editor"}
      </button>
      {error && <span className="admin-access-error" role="alert" title={error}>!</span>}

      <span className="admin-action-divider" aria-hidden="true" />

      <Link className="admin-action-button is-live" href={`/admin/jogos/${gameId}/ao-vivo`} title="Abrir edição ao vivo">
        <Radio size={15} /> <span>Ao vivo</span>
      </Link>
      <Link className="admin-action-button" href={`/admin/jogos/${gameId}`} title="Editar todos os dados do jogo">
        <Pencil size={15} /> <span>Editar</span>
      </Link>
      <form
        action={archiveGameAction}
        onSubmit={(event) => {
          if (!window.confirm("Arquivar esta partida? Ela deixará de aparecer no site e não contará nas estatísticas.")) event.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={gameId} />
        <button className="admin-action-button is-archive" type="submit" title="Arquivar partida">
          <Archive size={15} /> <span className="admin-action-icon-label">Arquivar</span>
        </button>
      </form>
    </div>
  );
}

export function ArchivedGameListActions({ gameId }: { gameId: string }) {
  return (
    <form action={restoreGameAction}>
      <input type="hidden" name="id" value={gameId} />
      <button className="admin-action-button is-restore" type="submit" title="Desarquivar partida">
        <ArchiveRestore size={15} /> <span>Desarquivar</span>
      </button>
    </form>
  );
}
