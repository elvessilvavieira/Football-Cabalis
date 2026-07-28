import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronRight, Medal, TrendingUp } from "lucide-react";
import { GameCard } from "@/components/GameCard";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { getStandings, players, sortedGames } from "@/lib/data";

export default function Home() {
  const standings = getStandings();
  const lastGame = sortedGames()[0];
  const totalGoals = sortedGames().reduce((sum, game) => sum + game.teamA.score + game.teamB.score, 0);

  return (
    <main>
      <section className="hero">
        <div className="hero-pattern" />
        <div className="container hero-content">
          <span className="eyebrow"><span /> TEMPORADA 2026</span>
          <h1>O jogo acaba.<br /><em>A história fica.</em></h1>
          <p>Resultados, golos e a classificação oficial da nossa pelada.</p>
          <div className="hero-stats">
            <div><strong>{sortedGames().length}</strong><span>partidas</span></div>
            <div><strong>{totalGoals}</strong><span>golos</span></div>
            <div><strong>{players.length}</strong><span>jogadores</span></div>
          </div>
        </div>
      </section>

      <section className="container content-section standings-section">
        <div className="section-heading">
          <div><span className="section-kicker"><TrendingUp size={15} /> RANKING ATUAL</span><h2>Classificação</h2></div>
          <p>Vitória <b>+1 pt</b> · Empate <b>0 pt</b> · Derrota <b>−1 pt</b></p>
        </div>
        <div className="table-card">
          <div className="table-scroll">
            <table>
              <thead><tr><th>#</th><th>Jogador</th><th>J</th><th>V</th><th>D</th><th>Pontos</th><th>Golos marcados</th><th>Golos a favor</th><th>Golos sofridos</th></tr></thead>
              <tbody>
                {standings.map((row, index) => (
                  <tr key={row.player.id}>
                    <td><span className={`position position-${index + 1}`}>{index < 3 ? <Medal size={16} /> : index + 1}</span></td>
                    <td><div className="player-cell"><PlayerAvatar player={row.player} /><strong>{row.player.name}</strong></div></td>
                    <td>{row.games}</td><td>{row.wins}</td><td>{row.losses}</td><td><span className={`points ${row.points > 0 ? "positive" : row.points < 0 ? "negative" : ""}`}>{row.points > 0 ? "+" : ""}{row.points}</span></td>
                    <td>{row.goalsScored}</td><td>{row.goalsFor}</td><td>{row.goalsAgainst}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="table-note">J = jogos · V = vitórias · D = derrotas · Desempate: golos marcados</p>
        </div>
      </section>

      <section className="latest-section">
        <div className="container">
          <div className="section-heading light">
            <div><span className="section-kicker"><CalendarDays size={15} /> ÚLTIMA PARTIDA</span><h2>Resultado do último jogo</h2></div>
            <Link className="text-link" href="/jogos">Ver todos os jogos <ArrowRight size={17} /></Link>
          </div>
          <GameCard game={lastGame} featured />
          <Link className="mobile-all-games" href="/jogos">Ver todos os jogos <ChevronRight size={17} /></Link>
        </div>
      </section>
    </main>
  );
}
