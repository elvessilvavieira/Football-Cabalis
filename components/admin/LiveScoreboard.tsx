"use client";

import { useOptimistic, useTransition } from "react";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import type { Game, Player, TeamColor } from "@/lib/data";
import { adjustGoalAction } from "@/app/admin/jogos/[id]/ao-vivo/actions";

type Delta = { team: "A" | "B"; playerId: string; delta: number };

export function LiveScoreboard({ game, players, teamColors }: {
  game: Game;
  players: Player[];
  teamColors: Record<TeamColor, { label: string; hex: string }>;
}) {
  const [optimisticGame, applyDelta] = useOptimistic(game, (state, { team, playerId, delta }: Delta) => {
    const key = team === "A" ? "teamA" : "teamB";
    const current = state[key];
    const nextPlayers = current.players.map((p) =>
      p.playerId === playerId ? { ...p, goals: Math.max(0, p.goals + delta) } : p,
    );
    return { ...state, [key]: { ...current, players: nextPlayers, score: nextPlayers.reduce((s, p) => s + p.goals, 0) } };
  });
  const [, startTransition] = useTransition();

  function findPlayer(id: string) {
    return players.find((p) => p.id === id) ?? { id, name: id };
  }

  function tap(team: "A" | "B", playerId: string, delta: number) {
    startTransition(async () => {
      applyDelta({ team, playerId, delta });
      await adjustGoalAction(game.id, team, playerId, delta);
    });
  }

  const teams: { key: "A" | "B"; team: typeof optimisticGame.teamA }[] = [
    { key: "A", team: optimisticGame.teamA },
    { key: "B", team: optimisticGame.teamB },
  ];

  return (
    <div className="live-board">
      <div className="live-score">
        <span className="live-team-name" style={{ color: teamColors[optimisticGame.teamA.color].hex }}>
          {teamColors[optimisticGame.teamA.color].label}
        </span>
        <span className="live-score-numbers">{optimisticGame.teamA.score} – {optimisticGame.teamB.score}</span>
        <span className="live-team-name" style={{ color: teamColors[optimisticGame.teamB.color].hex }}>
          {teamColors[optimisticGame.teamB.color].label}
        </span>
      </div>

      <div className="live-teams">
        {teams.map(({ key, team }) => (
          <div className="live-team" key={key}>
            <h2 style={{ color: teamColors[team.color].hex }}>Time {teamColors[team.color].label}</h2>
            <div className="live-players">
              {team.players.map((p) => {
                const player = findPlayer(p.playerId);
                return (
                  <div className="live-player" key={p.playerId}>
                    <div className="live-player-info">
                      <PlayerAvatar player={player} size="md" />
                      <span className="live-player-name">{player.name}</span>
                    </div>
                    <div className="live-player-actions">
                      <button
                        type="button"
                        className="live-icon-btn live-minus"
                        onClick={() => tap(key, p.playerId, -1)}
                        aria-label={`Remover golo de ${player.name}`}
                      >
                        −
                      </button>
                      <span className="live-player-goals">{p.goals}</span>
                      <button
                        type="button"
                        className="live-icon-btn live-plus"
                        style={{ background: teamColors[team.color].hex }}
                        onClick={() => tap(key, p.playerId, 1)}
                        aria-label={`Adicionar golo a ${player.name}`}
                      >
                        ⚽
                      </button>
                    </div>
                  </div>
                );
              })}
              {team.players.length === 0 && <p className="admin-empty">Sem jogadores nesta equipa.</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
