"use client";

import { useOptimistic, useTransition } from "react";
import { ChevronDown, Users } from "lucide-react";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import type { Game, Player, TeamColor } from "@/lib/data";
import { adjustGoalAction, assignPlayerAction } from "@/app/admin/jogos/[id]/ao-vivo/actions";

type Delta = { team: "A" | "B"; playerId: string; delta: number };
type RosterChange = { playerId: string; destination: "A" | "B" | null };
type OptimisticAction = { type: "goal"; payload: Delta } | { type: "roster"; payload: RosterChange };

function changeRoster(game: Game, { playerId, destination }: RosterChange): Game {
  const currentPlayer = [...game.teamA.players, ...game.teamB.players].find((player) => player.playerId === playerId);
  const goals = currentPlayer?.goals ?? 0;
  const extraA = Math.max(0, game.teamA.score - game.teamA.players.reduce((sum, player) => sum + player.goals, 0));
  const extraB = Math.max(0, game.teamB.score - game.teamB.players.reduce((sum, player) => sum + player.goals, 0));
  const playersA = game.teamA.players.filter((player) => player.playerId !== playerId);
  const playersB = game.teamB.players.filter((player) => player.playerId !== playerId);

  if (destination === "A") playersA.push({ playerId, goals });
  if (destination === "B") playersB.push({ playerId, goals });

  return {
    ...game,
    teamA: { ...game.teamA, players: playersA, score: extraA + playersA.reduce((sum, player) => sum + player.goals, 0) },
    teamB: { ...game.teamB, players: playersB, score: extraB + playersB.reduce((sum, player) => sum + player.goals, 0) },
  };
}

export function LiveScoreboard({ game, players, teamColors }: {
  game: Game;
  players: Player[];
  teamColors: Record<TeamColor, { label: string; hex: string }>;
}) {
  const [optimisticGame, updateOptimistically] = useOptimistic(game, (state, action: OptimisticAction) => {
    if (action.type === "roster") return changeRoster(state, action.payload);

    const { team, playerId, delta } = action.payload;
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
      updateOptimistically({ type: "goal", payload: { team, playerId, delta } });
      await adjustGoalAction(game.id, team, playerId, delta);
    });
  }

  function assign(playerId: string, destination: "A" | "B" | null) {
    startTransition(async () => {
      updateOptimistically({ type: "roster", payload: { playerId, destination } });
      await assignPlayerAction(game.id, playerId, destination);
    });
  }

  function assignedTeam(playerId: string): "A" | "B" | null {
    if (optimisticGame.teamA.players.some((player) => player.playerId === playerId)) return "A";
    if (optimisticGame.teamB.players.some((player) => player.playerId === playerId)) return "B";
    return null;
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

      <details className="live-roster-manager">
        <summary>
          <span className="live-roster-summary"><Users size={18} /> Gerir jogadores</span>
          <span className="live-roster-count">{optimisticGame.teamA.players.length + optimisticGame.teamB.players.length} em campo</span>
          <ChevronDown className="live-roster-chevron" size={18} aria-hidden="true" />
        </summary>
        <div className="live-roster-content">
          <p>Escolhe um time para adicionar ou trocar o jogador. Usa “Fora” para remover.</p>
          <div className="live-roster-list">
            {players.map((player) => {
              const assignment = assignedTeam(player.id);
              return (
                <div className="live-roster-row" key={player.id}>
                  <div className="live-player-info">
                    <PlayerAvatar player={player} size="sm" />
                    <span className="live-player-name">{player.name}</span>
                  </div>
                  <div className="live-roster-actions" aria-label={`Time de ${player.name}`}>
                    {(["A", "B"] as const).map((team) => {
                      const color = team === "A" ? optimisticGame.teamA.color : optimisticGame.teamB.color;
                      const active = assignment === team;
                      return (
                        <button
                          type="button"
                          className={`live-roster-team${active ? " active" : ""}`}
                          style={active ? { background: teamColors[color].hex, borderColor: teamColors[color].hex } : undefined}
                          onClick={() => assign(player.id, team)}
                          aria-pressed={active}
                        >
                          {team}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      className={`live-roster-out${assignment === null ? " active" : ""}`}
                      onClick={() => assign(player.id, null)}
                      aria-pressed={assignment === null}
                    >
                      Fora
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </details>
    </div>
  );
}
