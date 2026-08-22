import { Medal } from "lucide-react";
import type { TeamStanding } from "@/lib/data";

export function TeamStandingsTable({ standings }: { standings: TeamStanding[] }) {
  return (
    <div className="table-card">
      <div className="table-scroll">
        <table>
          <thead><tr><th>#</th><th>Time</th><th>J</th><th>V</th><th>E</th><th>D</th><th>Pontos</th><th>Golos a favor</th><th>Golos sofridos</th><th>Saldo</th></tr></thead>
          <tbody>
            {standings.map((row, index) => (
              <tr key={row.color}>
                <td><span className={`position position-${index + 1}`}>{index < 3 ? <Medal size={16} /> : index + 1}</span></td>
                <td><div className="team-standing-cell"><span className="team-standing-swatch" style={{ backgroundColor: row.hex }} /><strong>Time {row.label}</strong></div></td>
                <td>{row.games}</td><td>{row.wins}</td><td>{row.draws}</td><td>{row.losses}</td>
                <td><span className={`points ${row.points > 0 ? "positive" : row.points < 0 ? "negative" : ""}`}>{row.points}</span></td>
                <td>{row.goalsFor}</td><td>{row.goalsAgainst}</td><td>{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="table-note">J = jogos · V = vitórias · E = empates · D = derrotas · Desempate: saldo de golos e golos a favor</p>
    </div>
  );
}
