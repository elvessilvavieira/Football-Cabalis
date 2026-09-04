"use client";

import { useState } from "react";
import type { Game, GameTeam, Player, TeamColor } from "@/lib/data";

type PlayerRow = { playerId: string; goals: number };
type TeamState = { color: TeamColor; score: number; players: PlayerRow[] };

function toTeamState(team: GameTeam | undefined, fallbackColor: TeamColor): TeamState {
  if (!team) return { color: fallbackColor, score: 0, players: [] };
  return { color: team.color, score: team.score, players: team.players.map(({ playerId, goals }) => ({ playerId, goals })) };
}

function toDateInputValue(date?: string) {
  return date ? date.slice(0, 16) : "";
}

function TeamFields({ label, team, onChange, players, colorOptions }: {
  label: string;
  team: TeamState;
  onChange: (team: TeamState) => void;
  players: Player[];
  colorOptions: [TeamColor, { label: string; hex: string }][];
}) {
  function updateRow(index: number, row: Partial<PlayerRow>) {
    onChange({ ...team, players: team.players.map((p, i) => (i === index ? { ...p, ...row } : p)) });
  }
  function addRow() {
    const used = new Set(team.players.map((p) => p.playerId));
    const next = players.find((p) => !used.has(p.id));
    if (!next) return;
    onChange({ ...team, players: [...team.players, { playerId: next.id, goals: 0 }] });
  }
  function removeRow(index: number) {
    onChange({ ...team, players: team.players.filter((_, i) => i !== index) });
  }

  return (
    <fieldset className="admin-team">
      <legend>{label}</legend>
      <label>
        Cor
        <select value={team.color} onChange={(e) => onChange({ ...team, color: e.target.value as TeamColor })}>
          {colorOptions.map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}
        </select>
      </label>
      <label>
        Golos (resultado)
        <input type="number" min={0} value={team.score} onChange={(e) => onChange({ ...team, score: Number(e.target.value) })} />
      </label>
      <div className="admin-player-rows">
        {team.players.map((row, index) => (
          <div className="admin-player-row" key={index}>
            <select value={row.playerId} onChange={(e) => updateRow(index, { playerId: e.target.value })}>
              {players.map((player) => <option key={player.id} value={player.id}>{player.name}</option>)}
            </select>
            <input type="number" min={0} value={row.goals} onChange={(e) => updateRow(index, { goals: Number(e.target.value) })} aria-label="Golos" />
            <button type="button" onClick={() => removeRow(index)}>Remover</button>
          </div>
        ))}
      </div>
      <button type="button" className="admin-add-row" onClick={addRow}>+ Adicionar jogador</button>
    </fieldset>
  );
}

export function GameForm({ players, teamColors, action, submitLabel, initial }: {
  players: Player[];
  teamColors: Record<TeamColor, { label: string; hex: string }>;
  action: (formData: FormData) => void;
  submitLabel: string;
  initial?: Game;
}) {
  const [teamA, setTeamA] = useState<TeamState>(() => toTeamState(initial?.teamA, "verde"));
  const [teamB, setTeamB] = useState<TeamState>(() => toTeamState(initial?.teamB, "azul"));
  const colorOptions = Object.entries(teamColors) as [TeamColor, { label: string; hex: string }][];

  return (
    <form action={action} className="admin-game-form">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <div className="admin-form-row">
        <label>
          Data e hora
          <input type="datetime-local" name="date" defaultValue={toDateInputValue(initial?.date)} required />
        </label>
        <label>
          Local
          <input type="text" name="venue" defaultValue={initial?.venue ?? ""} placeholder="Campo Tech Park" />
        </label>
      </div>
      <div className="admin-teams">
        <TeamFields label="Time A" team={teamA} onChange={setTeamA} players={players} colorOptions={colorOptions} />
        <TeamFields label="Time B" team={teamB} onChange={setTeamB} players={players} colorOptions={colorOptions} />
      </div>
      <input type="hidden" name="teamA" value={JSON.stringify(teamA)} />
      <input type="hidden" name="teamB" value={JSON.stringify(teamB)} />
      <button type="submit" className="admin-submit">{submitLabel}</button>
    </form>
  );
}
