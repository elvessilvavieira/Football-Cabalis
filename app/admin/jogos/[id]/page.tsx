import { notFound } from "next/navigation";
import { getGameById, getPlayers, teamColors } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";
import { GameForm } from "@/components/admin/GameForm";
import { saveGameAction } from "../../actions";

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [game, players] = await Promise.all([getGameById(id), getPlayers()]);
  if (!game) notFound();

  return (
    <main className="container admin-page">
      <h1>Editar partida</h1>
      <GameForm players={players} teamColors={teamColors} action={saveGameAction} submitLabel="Guardar alterações" initial={game} />
    </main>
  );
}
