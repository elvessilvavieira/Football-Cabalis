import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { StandingsTable } from "@/components/StandingsTable";
import { TeamStandingsTable } from "@/components/TeamStandingsTable";
import { TopScorersTable } from "@/components/TopScorersTable";
import { getGames, getSeasons, getStatisticsStandings, getStatisticsTeamStandings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Estatísticas | Cabalis Futebol",
  description: "Ranking histórico de jogadores de todos os jogos e temporadas do Cabalis Futebol.",
};

export default async function StatisticsPage() {
  const [games, standings, teamStandings, seasons] = await Promise.all([
    getGames(),
    getStatisticsStandings(),
    getStatisticsTeamStandings(),
    getSeasons(),
  ]);
  const topScorers = [...standings]
    .filter((row) => row.goalsScored > 0)
    .sort((a, b) => b.goalsScored - a.goalsScored || a.player.name.localeCompare(b.player.name));

  return <main>
    <section className="page-hero"><div className="container">
      <span className="eyebrow"><span /> HISTÓRICO COMPLETO</span>
      <h1>Estatísticas</h1>
      <p>{games.length} jogos de {seasons.length} {seasons.length === 1 ? "temporada" : "temporadas"} reunidos num único ranking.</p>
    </div></section>
    <section className="container content-section standings-section">
      <div className="section-heading">
        <div><span className="section-kicker"><BarChart3 size={15} /> TODAS AS TEMPORADAS</span><h2>Ranking histórico de jogadores</h2></div>
        <p>Vitória <b>+1 pt</b> · Empate <b>0 pt</b> · Derrota <b>−1 pt</b></p>
      </div>
      <StandingsTable standings={standings} />
      <div className="team-standings-heading">
        <span className="section-kicker"><BarChart3 size={15} /> TIMES</span>
        <h2>Classificação de times</h2>
      </div>
      <TeamStandingsTable standings={teamStandings} />
      {topScorers.length > 0 && <>
        <div className="team-standings-heading">
          <span className="section-kicker"><BarChart3 size={15} /> GOLOS</span>
          <h2>Melhores marcadores</h2>
        </div>
        <TopScorersTable scorers={topScorers} />
      </>}
    </section>
  </main>;
}
