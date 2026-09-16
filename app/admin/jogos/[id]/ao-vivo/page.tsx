import Link from "next/link";
import { notFound } from "next/navigation";
import { getGameById, getPlayers, teamColors } from "@/lib/data";
import { requireLiveGameAccess } from "@/lib/auth";
import { LiveScoreboard } from "@/components/admin/LiveScoreboard";
import { logoutEditorAction } from "./actions";

export default async function LiveGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [game, players] = await Promise.all([getGameById(id), getPlayers()]);
  if (!game) notFound();
  const role = await requireLiveGameAccess(game);

  return (
    <main className="container admin-page live-page">
      <div className="admin-header">
        <div>
          <span className="admin-eyebrow">{role === "editor" ? "Acesso de editor" : "Administração"}</span>
          <h1>Jogo ao vivo</h1>
        </div>
        {role === "admin" ? (
          <Link href="/admin" className="admin-logout">Terminar e voltar</Link>
        ) : (
          <form action={logoutEditorAction.bind(null, game.id)}>
            <button type="submit" className="admin-logout">Sair</button>
          </form>
        )}
      </div>
      <LiveScoreboard game={game} players={players} teamColors={teamColors} />
    </main>
  );
}
