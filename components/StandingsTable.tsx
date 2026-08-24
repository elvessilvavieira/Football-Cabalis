import { Medal } from "lucide-react";
import type { Standing } from "@/lib/data";
import { PlayerAvatar } from "./PlayerAvatar";

export function StandingsTable({ standings }: { standings: Standing[] }) {
  return (
    <div className="table-card">
      <div className="table-scroll">
        <table>
          <thead><tr><th>#</th><th>Jogador</th><th>J</th><th>V</th><th>E</th><th>D</th><th>Pontos</th><th>Golos marcados</th><th>Golos a favor</th><th>Golos sofridos</th><th>Saldo</th></tr></thead>
          <tbody>
            {standings.map((row, index) => (
              <tr key={row.player.id}>
                <td><span className={`position position-${index + 1}`}>{index < 3 ? <Medal size={16} /> : index + 1}</span></td>
                <td><div className="player-cell"><PlayerAvatar player={row.player} /><strong>{row.player.name}</strong></div></td>
                <td>{row.games}</td><td>{row.wins}</td><td>{row.draws}</td><td>{row.losses}</td>
                <td><span className={`points ${row.points > 0 ? "positive" : row.points < 0 ? "negative" : ""}`}>{row.points}</span></td>
                <td>{row.goalsScored}</td><td>{row.goalsFor}</td><td>{row.goalsAgainst}</td><td>{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="table-note">J = jogos · V = vitórias · E = empates · D = derrotas · Desempate: saldo de golos e golos marcados</p>
    </div>
  );
}
