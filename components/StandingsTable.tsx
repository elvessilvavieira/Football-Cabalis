"use client";

import { Medal } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Standing } from "@/lib/data";
import { PlayerAvatar } from "./PlayerAvatar";
import { SortableHeader, type SortDirection } from "./SortableHeader";

type SortKey = "player" | "games" | "wins" | "draws" | "losses" | "points" | "goalsScored" | "goalsFor" | "goalsAgainst" | "goalDifference";

const columns: { key: SortKey; label: string }[] = [
  { key: "player", label: "Jogador" },
  { key: "games", label: "J" },
  { key: "wins", label: "V" },
  { key: "draws", label: "E" },
  { key: "losses", label: "D" },
  { key: "points", label: "Pontos" },
  { key: "goalsScored", label: "Golos marcados" },
  { key: "goalsFor", label: "Golos a favor" },
  { key: "goalsAgainst", label: "Golos sofridos" },
  { key: "goalDifference", label: "Saldo" },
];

export function StandingsTable({ standings }: { standings: Standing[] }) {
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection } | null>(null);
  const officialPositions = useMemo(() => new Map(standings.map((row, index) => [row.player.id, index + 1])), [standings]);
  const sortedStandings = useMemo(() => {
    if (!sort) return standings;

    return [...standings].sort((a, b) => {
      const comparison = sort.key === "player"
        ? a.player.name.localeCompare(b.player.name, "pt", { sensitivity: "base" })
        : a[sort.key] - b[sort.key];
      return (sort.direction === "asc" ? comparison : -comparison)
        || officialPositions.get(a.player.id)! - officialPositions.get(b.player.id)!;
    });
  }, [officialPositions, sort, standings]);

  function changeSort(key: SortKey) {
    setSort((current) => current?.key === key
      ? { key, direction: current.direction === "desc" ? "asc" : "desc" }
      : { key, direction: key === "player" ? "asc" : "desc" });
  }

  return (
    <div className="table-card">
      <div className="table-scroll">
        <table>
          <thead><tr>
            <SortableHeader active={!sort} direction="asc" onClick={() => setSort(null)} title="Restaurar ranking oficial">#</SortableHeader>
            {columns.map((column) => <SortableHeader key={column.key} active={sort?.key === column.key} direction={sort?.key === column.key ? sort.direction : undefined} onClick={() => changeSort(column.key)}>{column.label}</SortableHeader>)}
          </tr></thead>
          <tbody>
            {sortedStandings.map((row) => {
              const position = officialPositions.get(row.player.id)!;
              return (
              <tr key={row.player.id}>
                <td><span className={`position position-${position}`}>{position <= 3 ? <Medal size={16} /> : position}</span></td>
                <td><Link className="player-cell player-link" href={`/jogador/${row.player.id}`}><PlayerAvatar player={row.player} /><strong>{row.player.name}</strong></Link></td>
                <td>{row.games}</td><td>{row.wins}</td><td>{row.draws}</td><td>{row.losses}</td>
                <td><span className={`points ${row.points > 0 ? "positive" : row.points < 0 ? "negative" : ""}`}>{row.points}</span></td>
                <td>{row.goalsScored}</td><td>{row.goalsFor}</td><td>{row.goalsAgainst}</td><td>{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="table-note">J = jogos · V = vitórias · E = empates · D = derrotas · Desempate: saldo de golos e golos marcados</p>
    </div>
  );
}
