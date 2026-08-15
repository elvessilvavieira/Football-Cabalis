import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { StandingsTable } from "@/components/StandingsTable";
import { games, getSeasons, getStatisticsStandings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Estatísticas | Cabalis Futebol",
  description: "Classificação histórica de todos os jogos e temporadas do Cabalis Futebol.",
};

export default function StatisticsPage() {
  const standings = getStatisticsStandings();
  const seasons = getSeasons();

  return <main>
    <section className="page-hero"><div className="container">
      <span className="eyebrow"><span /> HISTÓRICO COMPLETO</span>
      <h1>Estatísticas</h1>
      <p>{games.length} jogos de {seasons.length} {seasons.length === 1 ? "temporada" : "temporadas"} reunidos numa única classificação.</p>
    </div></section>
    <section className="container content-section standings-section">
      <div className="section-heading">
        <div><span className="section-kicker"><BarChart3 size={15} /> TODAS AS TEMPORADAS</span><h2>Classificação histórica</h2></div>
        <p>Vitória <b>+1 pt</b> · Empate <b>0 pt</b> · Derrota <b>−1 pt</b></p>
      </div>
      <StandingsTable standings={standings} />
    </section>
  </main>;
}
