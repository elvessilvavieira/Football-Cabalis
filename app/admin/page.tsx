import { getArchivedGames, getGames, getPlayers, teamColors } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";
import { GameForm } from "@/components/admin/GameForm";
import { ArchivedGameListActions, GameListActions } from "@/components/admin/GameListActions";
import { deletePlayerAction, logoutAction, savePlayerAction, saveGameAction, startLiveGameAction } from "./actions";

export default async function AdminPage() {
  await requireAdmin();
  const [games, archivedGames, players] = await Promise.all([getGames(), getArchivedGames(), getPlayers()]);

  return (
    <main className="container admin-page">
      <div className="admin-header">
        <h1>Administração</h1>
        <form action={logoutAction}><button type="submit" className="admin-logout">Sair</button></form>
      </div>

      <section className="admin-section">
        <h2>Nova partida</h2>
        <GameForm players={players} teamColors={teamColors} action={saveGameAction} liveAction={startLiveGameAction} submitLabel="Guardar partida" />
      </section>

      <section className="admin-section">
        <h2>Partidas</h2>
        <ul className="admin-list">
          {games.map((game) => (
            <li key={game.id} className="admin-game-item">
              <div className="admin-list-game">
                <span className="admin-list-date">
                  {new Date(game.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                <span className="admin-matchup">
                  <span className="admin-score-chip" style={{ color: teamColors[game.teamA.color].hex }}>
                    {teamColors[game.teamA.color].label} <b>{game.teamA.score}</b>
                  </span>
                  <span className="admin-score-sep">—</span>
                  <span className="admin-score-chip" style={{ color: teamColors[game.teamB.color].hex }}>
                    <b>{game.teamB.score}</b> {teamColors[game.teamB.color].label}
                  </span>
                </span>
              </div>
              <GameListActions gameId={game.id} access={game.access} />
            </li>
          ))}
          {games.length === 0 && <li className="admin-empty">Ainda não há partidas registadas.</li>}
        </ul>
      </section>

      <section className="admin-section admin-archived-section">
        <h2>Partidas arquivadas <small>{archivedGames.length}</small></h2>
        <p className="admin-section-description">Não aparecem no site nem contam para temporadas, perfis ou estatísticas.</p>
        <ul className="admin-list">
          {archivedGames.map((game) => (
            <li key={game.id} className="admin-game-item is-archived">
              <div className="admin-list-game">
                <span className="admin-list-date">
                  {new Date(game.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                <span className="admin-matchup">
                  <span className="admin-score-chip" style={{ color: teamColors[game.teamA.color].hex }}>
                    {teamColors[game.teamA.color].label} <b>{game.teamA.score}</b>
                  </span>
                  <span className="admin-score-sep">—</span>
                  <span className="admin-score-chip" style={{ color: teamColors[game.teamB.color].hex }}>
                    <b>{game.teamB.score}</b> {teamColors[game.teamB.color].label}
                  </span>
                </span>
              </div>
              <ArchivedGameListActions gameId={game.id} />
            </li>
          ))}
          {archivedGames.length === 0 && <li className="admin-empty">Não há partidas arquivadas.</li>}
        </ul>
      </section>

      <section className="admin-section">
        <h2>Jogadores</h2>
        <form action={savePlayerAction} className="admin-player-form">
          <input name="id" placeholder="id (ex: joao)" required />
          <input name="name" placeholder="Nome" required />
          <input name="photo" placeholder="/team/joao.png (opcional)" />
          <button type="submit">Guardar jogador</button>
        </form>
        <ul className="admin-list">
          {players.map((player) => (
            <li key={player.id}>
              <span>{player.name} <small>({player.id})</small></span>
              <form action={deletePlayerAction}>
                <input type="hidden" name="id" value={player.id} />
                <button type="submit">Eliminar</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
