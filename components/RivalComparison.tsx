"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, Search, Shield, Users, X } from "lucide-react";
import type { PlayerProfile } from "@/lib/data";

type Profile = NonNullable<PlayerProfile>;
type Comparison = Profile["rivalComparisons"][number];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("");
}

function signed(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

export function RivalComparison({
  player,
  comparisons,
  initialRivalId,
}: {
  player: Profile["player"];
  comparisons: Comparison[];
  initialRivalId: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedRivalId, setSelectedRivalId] = useState(initialRivalId);
  const [query, setQuery] = useState("");
  const comparison = comparisons.find(({ player: rival }) => rival.id === selectedRivalId) ?? comparisons[0];
  const filteredComparisons = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt");
    if (!normalizedQuery) return comparisons;
    return comparisons.filter(({ player: rival }) => rival.name.toLocaleLowerCase("pt").includes(normalizedQuery));
  }, [comparisons, query]);

  if (!comparison) return null;
  const { recentMeetings, summary, player: rival } = comparison;
  const resultLabel = { win: "Vitória", draw: "Empate", loss: "Derrota" } as const;

  function selectRival(rivalId: string) {
    setSelectedRivalId(rivalId);
    setQuery("");
    dialogRef.current?.close();
  }

  return <div className="rival-meetings">
    <div className="rival-meetings-heading">
      <div>
        <span><Shield size={15} /> COMPARAÇÃO DIRETA</span>
        <h3>{player.name} <i>×</i> {rival.name}</h3>
      </div>
      <button className="compare-player-button" type="button" onClick={() => dialogRef.current?.showModal()}>
        <Users size={15} /> Comparar com outro jogador
      </button>
    </div>

    {recentMeetings.length > 0 ? <>
      <h4 className="rival-meetings-subtitle">Últimas {recentMeetings.length === 1 ? "disputa" : `${recentMeetings.length} disputas`}</h4>
      <div className="rival-meetings-list">
        {recentMeetings.map((meeting) => <Link href={`/temporadas/${meeting.date.slice(0, 7)}`} key={meeting.gameId}>
          <span className={`recent-result form-${meeting.result}`}>{meeting.result === "win" ? "V" : meeting.result === "draw" ? "E" : "D"}</span>
          <span className="rival-meeting-date"><small>{resultLabel[meeting.result]}</small><b>{formatDate(meeting.date)}</b></span>
          <span className="rival-meeting-matchup">
            <span className="rival-meeting-team"><small>{player.name}</small><b><i style={{ backgroundColor: meeting.playerTeamHex }} />Time {meeting.playerTeamLabel}</b></span>
            <strong>{meeting.scoreFor}<i>–</i>{meeting.scoreAgainst}</strong>
            <span className="rival-meeting-team rival-meeting-team-away"><small>{rival.name}</small><b>Time {meeting.rivalTeamLabel}<i style={{ backgroundColor: meeting.rivalTeamHex }} /></b></span>
          </span>
          <span className="rival-meeting-goals">
            <small className="rival-meeting-goals-label">Golos individuais</small>
            <span><b>{meeting.playerGoals}</b><small>{meeting.playerGoals === 1 ? "golo" : "golos"} de {player.name}</small></span>
            <span><b>{meeting.rivalGoals}</b><small>{meeting.rivalGoals === 1 ? "golo" : "golos"} de {rival.name}</small></span>
          </span>
          <ArrowLeft className="rival-meeting-arrow" size={17} />
        </Link>)}
      </div>
    </> : <div className="rival-no-meetings"><Shield size={21} /><span><strong>Ainda não se enfrentaram</strong><small>Não existem jogos em equipas adversárias entre estes jogadores.</small></span></div>}

    <div className="rival-summary">
      <div className="rival-summary-heading"><span>Disputa geral</span><small>Somente jogos em que estiveram em equipas adversárias</small></div>
      <div className="rival-summary-grid">
        <span><small>Jogos</small><b>{summary.games}</b></span>
        <span><small>Vitórias de {player.name}</small><b>{summary.playerWins}</b></span>
        <span><small>Empates</small><b>{summary.draws}</b></span>
        <span><small>Vitórias de {rival.name}</small><b>{summary.rivalWins}</b></span>
        <span><small>Golos de {player.name}</small><b>{summary.playerGoals}</b></span>
        <span><small>Golos de {rival.name}</small><b>{summary.rivalGoals}</b></span>
        <span><small>Saldo de golos de {player.name}</small><b>{signed(summary.goalDifference)}</b></span>
      </div>
    </div>

    <dialog className="compare-player-dialog" ref={dialogRef} aria-labelledby="compare-player-title" onClick={(event) => {
      if (event.target === event.currentTarget) event.currentTarget.close();
    }}>
      <div className="compare-player-modal">
        <div className="compare-player-modal-head">
          <span><small>Comparação direta</small><strong id="compare-player-title">Escolha outro jogador</strong></span>
          <button type="button" aria-label="Fechar" onClick={() => dialogRef.current?.close()}><X size={18} /></button>
        </div>
        <label className="compare-player-search">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar jogador..." autoFocus />
        </label>
        <div className="compare-player-list">
          {filteredComparisons.map(({ player: candidate, summary: candidateSummary }) => <button
            className={candidate.id === rival.id ? "selected" : undefined}
            type="button"
            key={candidate.id}
            onClick={() => selectRival(candidate.id)}
          >
            {candidate.photo
              ? <img src={candidate.photo} alt="" />
              : <span className="compare-player-avatar" aria-hidden="true">{initials(candidate.name)}</span>}
            <span><strong>{candidate.name}</strong><small>{candidateSummary.games} {candidateSummary.games === 1 ? "jogo contra" : "jogos contra"}</small></span>
            {candidate.id === rival.id && <em>Atual</em>}
          </button>)}
          {filteredComparisons.length === 0 && <p>Nenhum jogador encontrado.</p>}
        </div>
      </div>
    </dialog>
  </div>;
}
