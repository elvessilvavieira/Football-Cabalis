import Link from "next/link";
import { notFound } from "next/navigation";
import { getGameById, getPlayers, teamColors } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";
import { LiveScoreboard } from "@/components/admin/LiveScoreboard";

export default async function LiveGamePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [game, players] = await Promise.all([getGameById(id), getPlayers()]);
  if (!game) notFound();

  return (
    <main className="container admin-page live-page">
      <div className="admin-header">
        <h1>Jogo ao vivo</h1>
        <Link href="/admin" className="admin-logout">Terminar e voltar</Link>
      </div>
      <LiveScoreboard game={game} players={players} teamColors={teamColors} />
    </main>
  );
}
