"use client";

import { Medal } from "lucide-react";
import { useMemo, useState } from "react";
import type { Standing } from "@/lib/data";
import { PlayerAvatar } from "./PlayerAvatar";
import { SortableHeader, type SortDirection } from "./SortableHeader";

type SortKey = "player" | "goalsScored";

export function TopScorersTable({ scorers }: { scorers: Standing[] }) {
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection } | null>(null);
  const officialPositions = useMemo(() => new Map(scorers.map((row, index) => [row.player.id, index + 1])), [scorers]);
  const sortedScorers = useMemo(() => {
    if (!sort) return scorers;

    return [...scorers].sort((a, b) => {
      const comparison = sort.key === "player"
        ? a.player.name.localeCompare(b.player.name, "pt", { sensitivity: "base" })
        : a.goalsScored - b.goalsScored;
      return (sort.direction === "asc" ? comparison : -comparison)
        || officialPositions.get(a.player.id)! - officialPositions.get(b.player.id)!;
    });
  }, [officialPositions, scorers, sort]);

  function changeSort(key: SortKey) {
    setSort((current) => current?.key === key
      ? { key, direction: current.direction === "desc" ? "asc" : "desc" }
      : { key, direction: key === "player" ? "asc" : "desc" });
  }

  return (
    <div className="table-card scorers-table">
      <div className="table-scroll">
        <table>
          <thead><tr>
            <SortableHeader active={!sort} direction="asc" onClick={() => setSort(null)} title="Restaurar classificação oficial">#</SortableHeader>
            <SortableHeader active={sort?.key === "player"} direction={sort?.key === "player" ? sort.direction : undefined} onClick={() => changeSort("player")}>Jogador</SortableHeader>
            <SortableHeader active={sort?.key === "goalsScored"} direction={sort?.key === "goalsScored" ? sort.direction : undefined} onClick={() => changeSort("goalsScored")}>Golos</SortableHeader>
          </tr></thead>
          <tbody>
            {sortedScorers.map((row) => {
              const position = officialPositions.get(row.player.id)!;
              return (
              <tr key={row.player.id}>
                <td><span className={`position position-${position}`}>{position <= 3 ? <Medal size={16} /> : position}</span></td>
                <td><div className="player-cell"><PlayerAvatar player={row.player} /><strong>{row.player.name}</strong></div></td>
                <td><strong className="goals-total">{row.goalsScored}</strong></td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
