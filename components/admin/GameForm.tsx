"use client";

import { useState } from "react";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import type { Game, GameTeam, Player, TeamColor } from "@/lib/data";

type Assignment = { team: "A" | "B"; goals: number };

function initAssignments(game?: Game): Record<string, Assignment> {
  const map: Record<string, Assignment> = {};
  game?.teamA.players.forEach(({ playerId, goals }) => { map[playerId] = { team: "A", goals }; });
  game?.teamB.players.forEach(({ playerId, goals }) => { map[playerId] = { team: "B", goals }; });
  return map;
}

function toDateInputValue(date?: string) {
  return date ? date.slice(0, 16) : "";
}

export function GameForm({ players, teamColors, action, liveAction, submitLabel, initial }: {
  players: Player[];
  teamColors: Record<TeamColor, { label: string; hex: string }>;
  action: (formData: FormData) => void;
  liveAction?: (formData: FormData) => void;
  submitLabel: string;
  initial?: Game;
}) {
  const [assignments, setAssignments] = useState<Record<string, Assignment>>(() => initAssignments(initial));
  const [colorA, setColorA] = useState<TeamColor>(initial?.teamA.color ?? "verde");
  const [colorB, setColorB] = useState<TeamColor>(initial?.teamB.color ?? "azul");
  const [extraA, setExtraA] = useState(() => Math.max(0, (initial?.teamA.score ?? 0) - (initial?.teamA.players.reduce((s, p) => s + p.goals, 0) ?? 0)));
  const [extraB, setExtraB] = useState(() => Math.max(0, (initial?.teamB.score ?? 0) - (initial?.teamB.players.reduce((s, p) => s + p.goals, 0) ?? 0)));
  const colorOptions = Object.entries(teamColors) as [TeamColor, { label: string; hex: string }][];

  function toggleAssignment(playerId: string, team: "A" | "B") {
    setAssignments((prev) => {
      const current = prev[playerId];
      const next = { ...prev };
      if (current?.team === team) delete next[playerId];
      else next[playerId] = { team, goals: current?.goals ?? 0 };
      return next;
    });
  }

  function setGoals(playerId: string, goals: number) {
    setAssignments((prev) => (prev[playerId] ? { ...prev, [playerId]: { ...prev[playerId], goals: Math.max(0, goals) } } : prev));
  }

  const teamAEntries = Object.entries(assignments).filter(([, a]) => a.team === "A");
  const teamBEntries = Object.entries(assignments).filter(([, a]) => a.team === "B");
  const goalsA = teamAEntries.reduce((sum, [, a]) => sum + a.goals, 0);
  const goalsB = teamBEntries.reduce((sum, [, a]) => sum + a.goals, 0);
  const scoreA = goalsA + extraA;
  const scoreB = goalsB + extraB;

  const teamA: GameTeam = { name: "A", color: colorA, score: scoreA, players: teamAEntries.map(([playerId, a]) => ({ playerId, goals: a.goals })) };
  const teamB: GameTeam = { name: "B", color: colorB, score: scoreB, players: teamBEntries.map(([playerId, a]) => ({ playerId, goals: a.goals })) };

  return (
    <form action={action} className="admin-game-form">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <div className="admin-form-row">
        <label>
          Data e hora
          <input type="datetime-local" name="date" defaultValue={toDateInputValue(initial?.date)} />
        </label>
        <label>
          Local
          <input type="text" name="venue" defaultValue={initial?.venue ?? ""} placeholder="Campo Tech Park" />
        </label>
      </div>

      <div className="admin-teams-summary">
        <div className="admin-team-summary" style={{ borderColor: teamColors[colorA].hex }}>
          <label>
            Cor Time A
            <select value={colorA} onChange={(e) => setColorA(e.target.value as TeamColor)}>
              {colorOptions.map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}
            </select>
          </label>
          <label>
            Golos sem marcador
            <input type="number" min={0} value={extraA} onChange={(e) => setExtraA(Math.max(0, Number(e.target.value)))} />
          </label>
          <div className="admin-score-preview" style={{ color: teamColors[colorA].hex }}>{scoreA} golos</div>
        </div>
        <div className="admin-team-summary" style={{ borderColor: teamColors[colorB].hex }}>
          <label>
            Cor Time B
            <select value={colorB} onChange={(e) => setColorB(e.target.value as TeamColor)}>
              {colorOptions.map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}
            </select>
          </label>
          <label>
            Golos sem marcador
            <input type="number" min={0} value={extraB} onChange={(e) => setExtraB(Math.max(0, Number(e.target.value)))} />
          </label>
          <div className="admin-score-preview" style={{ color: teamColors[colorB].hex }}>{scoreB} golos</div>
        </div>
      </div>

      <fieldset className="admin-roster">
        <legend>Escalação — toca em A ou B para colocar o jogador numa equipa</legend>
        <div className="admin-roster-list">
          {players.map((player) => {
            const a = assignments[player.id];
            return (
              <div className={`admin-roster-row${a ? ` is-assigned team-${a.team}` : ""}`} key={player.id}>
                <div className="admin-roster-identity">
                  <PlayerAvatar player={player} size="sm" />
                  <span className="admin-roster-name">{player.name}</span>
                </div>
                <div className="admin-roster-controls">
                  <div className="admin-roster-teams">
                    <button
                      type="button"
                      className={`admin-team-toggle${a?.team === "A" ? " active" : ""}`}
                      style={a?.team === "A" ? { background: teamColors[colorA].hex, borderColor: teamColors[colorA].hex } : undefined}
                      onClick={() => toggleAssignment(player.id, "A")}
                    >
                      A
                    </button>
                    <button
                      type="button"
                      className={`admin-team-toggle${a?.team === "B" ? " active" : ""}`}
                      style={a?.team === "B" ? { background: teamColors[colorB].hex, borderColor: teamColors[colorB].hex } : undefined}
                      onClick={() => toggleAssignment(player.id, "B")}
                    >
                      B
                    </button>
                  </div>
                  {a ? (
                    <div className="admin-goal-stepper">
                      <button type="button" onClick={() => setGoals(player.id, a.goals - 1)} aria-label={`Remover golo de ${player.name}`}>−</button>
                      <span>{a.goals}</span>
                      <button type="button" onClick={() => setGoals(player.id, a.goals + 1)} aria-label={`Adicionar golo a ${player.name}`}>+</button>
                    </div>
                  ) : (
                    <span className="admin-goal-stepper is-empty" aria-hidden />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </fieldset>

      <input type="hidden" name="teamA" value={JSON.stringify(teamA)} />
      <input type="hidden" name="teamB" value={JSON.stringify(teamB)} />

      <div className="admin-form-actions">
        <button type="submit" className="admin-submit">{submitLabel}</button>
        {liveAction && (
          <button type="submit" formAction={liveAction} className="admin-submit admin-submit-live">
            Começar jogo ao vivo
          </button>
        )}
      </div>
    </form>
  );
}
