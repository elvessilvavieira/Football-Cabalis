import { notFound } from "next/navigation";
import { getGames, getPlayers, teamColors } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";
import { GameForm } from "@/components/admin/GameForm";
import { saveGameAction } from "../../actions";

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [games, players] = await Promise.all([getGames(), getPlayers()]);
  const game = games.find((candidate) => candidate.id === id);
  if (!game) notFound();

  return (
    <main className="container admin-page">
      <h1>Editar partida</h1>
      <GameForm players={players} teamColors={teamColors} action={saveGameAction} submitLabel="Guardar alterações" initial={game} />
    </main>
  );
}
