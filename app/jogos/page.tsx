import { CalendarDays } from "lucide-react";
import { GameCard } from "@/components/GameCard";
import { Game, sortedGames } from "@/lib/data";

export default function JogosPage() {
  const grouped = sortedGames().reduce<Record<string, Game[]>>((months, game) => {
    const key = new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric" }).format(new Date(game.date));
    (months[key] ??= []).push(game);
    return months;
  }, {});

  return (
    <main className="games-page">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow"><span /> ARQUIVO DE PARTIDAS</span>
          <h1>Todos os jogos</h1>
          <p>Escolha um mês para rever resultados, equipas e goleadores.</p>
        </div>
      </section>
      <section className="container months-list">
        {Object.entries(grouped).map(([month, monthGames], index) => (
          <details className="month-group" key={month} open={index === 0}>
            <summary>
              <span className="month-icon"><CalendarDays size={20} /></span>
              <span><strong>{month}</strong><small>{monthGames.length} {monthGames.length === 1 ? "partida" : "partidas"}</small></span>
              <span className="summary-toggle">+</span>
            </summary>
            <div className="month-games">{monthGames.map((game) => <GameCard game={game} key={game.id} />)}</div>
          </details>
        ))}
      </section>
    </main>
  );
}

