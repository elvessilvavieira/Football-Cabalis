import { Medal } from "lucide-react";
import type { Standing } from "@/lib/data";
import { PlayerAvatar } from "./PlayerAvatar";

export function TopScorersTable({ scorers }: { scorers: Standing[] }) {
  return (
    <div className="table-card scorers-table">
      <div className="table-scroll">
        <table>
          <thead><tr><th>#</th><th>Jogador</th><th>Golos</th></tr></thead>
          <tbody>
            {scorers.map((row, index) => (
              <tr key={row.player.id}>
                <td><span className={`position position-${index + 1}`}>{index < 3 ? <Medal size={16} /> : index + 1}</span></td>
                <td><div className="player-cell"><PlayerAvatar player={row.player} /><strong>{row.player.name}</strong></div></td>
                <td><strong className="goals-total">{row.goalsScored}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
