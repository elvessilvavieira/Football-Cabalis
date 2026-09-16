import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, ArrowLeft, Award, CalendarDays, Crown, Flame, Medal, Shield, Target, TrendingUp, Trophy, Users } from "lucide-react";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { getTeamProfile, teamColors } from "@/lib/data";

export function generateStaticParams() {
  return Object.keys(teamColors).map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const profile = await getTeamProfile((await params).id);
  if (!profile) return {};
  return {
    title: `Time ${profile.team.label} | Cabalis Futebol`,
    description: `Perfil, estatísticas, conquistas e histórico do Time ${profile.team.label} no Cabalis Futebol.`,
  };
}

function formatDate(date: string, long = false) {
  return new Intl.DateTimeFormat("pt-PT", long
    ? { day: "numeric", month: "long", year: "numeric" }
    : { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));
}

function honorIcon(title: string) {
  if (title === "Time campeão") return <Trophy size={20} />;
  if (title.startsWith("Ouro")) return <Crown size={20} />;
  return <Medal size={20} />;
}

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getTeamProfile((await params).id);
  if (!profile) notFound();

  const { team, standing } = profile;
  const recentForm = profile.appearances.slice(0, 5);
  const firstGame = profile.appearances.at(-1);
  const resultLabel = { win: "Vitória", draw: "Empate", loss: "Derrota" } as const;

  return <main>
    <section className="player-profile-hero team-profile-hero" style={{ background: `radial-gradient(circle at 80% 18%, ${team.hex} 0, transparent 31%), linear-gradient(125deg, #061f18, #0d4936)` }}>
      <div className="container">
        <Link className="back-link" href="/estatisticas"><ArrowLeft size={16} /> Voltar às estatísticas</Link>
        <div className="player-hero-grid">
          <div className="profile-photo-wrap">
            <span className="profile-photo team-profile-mark" style={{ backgroundColor: team.hex }}><Shield size={82} strokeWidth={1.5} /></span>
            <span
              className="profile-rank"
              data-tooltip={profile.currentSeason ? `Posição na temporada atual: ${profile.currentSeason.label}` : "Sem jogos na temporada atual"}
              tabIndex={0}
            ><Trophy size={16} /> {profile.currentSeason ? `#${profile.currentSeason.position}` : "—"}</span>
          </div>
          <div className="player-hero-copy">
            <span className="eyebrow"><span /> PERFIL DO TIME</span>
            <h1>Time {team.label}</h1>
            <p>{standing.games > 0
              ? `${standing.games} ${standing.games === 1 ? "jogo disputado" : "jogos disputados"}${firstGame ? ` desde ${formatDate(firstGame.game.date, true)}` : ""}.`
              : "Ainda sem jogos registados."}</p>
            <div className="profile-badges">
              {profile.statisticsPosition && <span><TrendingUp size={15} /> #{profile.statisticsPosition} na estatística geral</span>}
              <span><i style={{ backgroundColor: team.hex }} /> Identidade {team.label}</span>
            </div>
            {recentForm.length > 0 && <div className="profile-form"><small>Últimos jogos</small><div>{recentForm.map((appearance) => <span className={`form-dot form-${appearance.result}`} title={resultLabel[appearance.result]} key={appearance.game.id}>{appearance.result === "win" ? "V" : appearance.result === "draw" ? "E" : "D"}</span>)}</div></div>}
          </div>
        </div>
      </div>
    </section>

    <section className="container player-profile-content">
      <div className="profile-stat-grid">
        <article><span><Activity size={18} /></span><small>Jogos</small><strong>{standing.games}</strong></article>
        <article><span><Trophy size={18} /></span><small>Vitórias</small><strong>{standing.wins}</strong><em>{profile.winRate.toFixed(0)}% aproveitamento</em></article>
        <article><span><Target size={18} /></span><small>Golos marcados</small><strong>{standing.goalsFor}</strong><em>{profile.goalsPerGame.toFixed(2)} por jogo</em></article>
        <article><span><TrendingUp size={18} /></span><small>Pontos</small><strong>{standing.points}</strong></article>
        <article><span><Shield size={18} /></span><small>Saldo</small><strong>{standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference}</strong><em>{standing.goalsFor}–{standing.goalsAgainst} em golos</em></article>
        <article><span><Flame size={18} /></span><small>Maior sequência</small><strong>{profile.longestWinStreak}</strong><em>{profile.longestWinStreak === 1 ? "vitória seguida" : "vitórias seguidas"}</em></article>
      </div>

      <div className="profile-section-heading"><div><span className="section-kicker"><Award size={15} /> PALMARÉS</span><h2>Conquistas</h2></div><p>{profile.honors.length} {profile.honors.length === 1 ? "distinção" : "distinções"}</p></div>
      {profile.honors.length > 0 ? <div className="honors-grid">{profile.honors.map((honor) => <Link className="honor-card" href={honor.href} key={`${honor.seasonId}-${honor.title}`}>
        {honor.ongoing && <em className="honor-ongoing">em andamento</em>}
        <span className="honor-icon">{honorIcon(honor.title)}</span><span><small>{honor.seasonLabel}</small><strong>{honor.title}</strong></span>
      </Link>)}</div> : <div className="profile-empty"><Award size={25} /><span><strong>À procura da primeira conquista</strong><small>Os títulos e pódios futuros aparecerão aqui.</small></span></div>}

      <div className="profile-section-heading"><div><span className="section-kicker"><CalendarDays size={15} /> EVOLUÇÃO</span><h2>Estatísticas por temporada</h2></div></div>
      {profile.seasons.length > 0 ? <div className="season-performance-grid">{profile.seasons.map((season) => <Link className="season-performance-card" href={`/temporadas/${season.id}`} key={season.id}>
        <div className="season-performance-head"><span><small>Temporada</small><strong>{season.label}</strong></span><b className={`season-position season-position-${season.position}`}>#{season.position}</b></div>
        <div className="season-performance-stats"><span><b>{season.games}</b><small>Jogos</small></span><span><b>{season.wins}</b><small>Vitórias</small></span><span><b>{season.points}</b><small>Pontos</small></span><span><b>{season.goalsFor}</b><small>Golos</small></span><span><b>{season.goalDifference > 0 ? `+${season.goalDifference}` : season.goalDifference}</b><small>Saldo</small></span></div>
        {season.champion && <div className="season-honor-tags"><em><Trophy /> Time campeão</em></div>}
      </Link>)}</div> : <div className="profile-empty"><CalendarDays size={25} /><span><strong>Sem temporadas disputadas</strong><small>As estatísticas surgirão depois do primeiro jogo.</small></span></div>}

      {profile.captaincies.length > 0 && <section className="team-captains-section">
        <div className="profile-section-heading"><div><span className="section-kicker"><Shield size={15} /> LIDERANÇA</span><h2>Capitães do time</h2></div></div>
        <div className="team-captains-grid">{profile.captaincies.map((captaincy) => <Link className="team-captain-card" href={`/jogador/${captaincy.player.id}`} key={captaincy.player.id}>
          <span className="team-captain-identity"><span className={`captain-badge captain-badge-${captaincy.rank}`}>C</span><PlayerAvatar player={captaincy.player} size="lg" /><span><small>{captaincy.title}</small><strong>{captaincy.player.name}</strong></span></span>
          <span className="team-captain-stats">
            <span><small>Jogos</small><strong>{captaincy.games}</strong></span>
            <span><small>Primeiro jogo</small><strong>{formatDate(captaincy.firstAppearance)}</strong></span>
            <span><small>Vitórias</small><strong>{captaincy.wins}</strong><em>{captaincy.games ? ((captaincy.wins / captaincy.games) * 100).toFixed(0) : 0}%</em></span>
            <span><small>Golos</small><strong>{captaincy.goals}</strong><em>{captaincy.games ? (captaincy.goals / captaincy.games).toFixed(2) : "0.00"} por jogo</em></span>
          </span>
          <ArrowLeft className="team-row-arrow" size={18} />
        </Link>)}</div>
      </section>}

      <div className="profile-lower-grid">
        <section>
          <div className="profile-section-heading compact"><div><span className="section-kicker"><Target size={15} /> MAIOR VITÓRIA</span><h2>Melhor resultado</h2></div></div>
          {profile.bestGame ? <Link className="best-game-card" href={`/temporadas/${profile.bestGame.game.date.slice(0, 7)}`}>
            <span className="best-game-player-team"><i style={{ backgroundColor: team.hex }} />Time {team.label}</span>
            <div><span className="team-standing-swatch" style={{ backgroundColor: team.hex }} /><small>Time {team.label}</small><strong>{profile.bestGame.scoreFor}–{profile.bestGame.scoreAgainst}</strong><small>Time {profile.bestGame.opponentLabel}</small><span className="team-standing-swatch" style={{ backgroundColor: profile.bestGame.opponentHex }} /></div>
            <p><b>{profile.bestGame.scoreFor - profile.bestGame.scoreAgainst > 0 ? `+${profile.bestGame.scoreFor - profile.bestGame.scoreAgainst}` : profile.bestGame.scoreFor - profile.bestGame.scoreAgainst}</b><span>saldo da partida<small>{formatDate(profile.bestGame.game.date, true)}</small></span></p>
          </Link> : <div className="profile-empty small"><Target size={22} /><span><strong>Sem resultados registados</strong></span></div>}
        </section>
        <section>
          <div className="profile-section-heading compact"><div><span className="section-kicker"><Activity size={15} /> HISTÓRICO</span><h2>Jogos recentes</h2></div></div>
          {profile.appearances.length > 0 ? <div className="recent-games-list team-recent-games">{profile.appearances.slice(0, 6).map((appearance) => <Link href={`/temporadas/${appearance.game.date.slice(0, 7)}`} key={appearance.game.id}>
            <span className="recent-game-meta"><span className={`recent-result form-${appearance.result}`}>{appearance.result === "win" ? "V" : appearance.result === "draw" ? "E" : "D"}</span><span><b>{resultLabel[appearance.result]}</b><span className="recent-date">{formatDate(appearance.game.date)}</span></span></span>
            <span className="recent-matchup"><span className="recent-player-team"><small>Time</small><span style={{ color: team.hex, backgroundColor: `color-mix(in srgb, ${team.hex} 12%, white)` }}><i style={{ backgroundColor: team.hex }} />{team.label}</span></span><strong>{appearance.scoreFor}<i>–</i>{appearance.scoreAgainst}</strong><span className="recent-opponent"><small>contra</small><span>Time {appearance.opponentLabel}<i style={{ backgroundColor: appearance.opponentHex }} /></span></span></span>
            <em><Users size={13} /><b>{appearance.players.length}</b> jogadores</em>
          </Link>)}</div> : <div className="profile-empty small"><Activity size={22} /><span><strong>Sem jogos registados</strong></span></div>}
        </section>
      </div>

      <section className="best-friends-section">
        <div className="profile-section-heading"><div><span className="section-kicker"><Users size={15} /> QUEM MAIS VESTIU A COR</span><h2>Jogadores do time</h2></div></div>
        {profile.mostFrequentPlayers.length > 0 ? <div className="best-friends-grid">{profile.mostFrequentPlayers.map((record, index) => <Link className="best-friend-card" href={`/jogador/${record.player.id}`} key={record.player.id}>
          <span className="best-friend-position">{index + 1}</span><PlayerAvatar player={record.player} size="lg" /><span className="best-friend-copy"><strong>{record.player.name}</strong><small>{record.games} {record.games === 1 ? "jogo" : "jogos"} · {record.goals} {record.goals === 1 ? "golo" : "golos"}</small></span><ArrowLeft className="best-friend-arrow" size={17} />
        </Link>)}</div> : <div className="profile-empty"><Users size={25} /><span><strong>Ainda sem jogadores registados</strong></span></div>}
      </section>

      <section className="team-scorers-section">
        <div className="profile-section-heading"><div><span className="section-kicker"><Target size={15} /> GOLOS PELO TIME</span><h2>Melhores marcadores</h2></div><p>Top 5 histórico</p></div>
        {profile.topScorers.length > 0 ? <div className="best-friends-grid">{profile.topScorers.map((record, index) => <Link className="best-friend-card team-scorer-card" href={`/jogador/${record.player.id}`} key={record.player.id}>
          <span className="best-friend-position">{index + 1}</span><PlayerAvatar player={record.player} size="lg" /><span className="best-friend-copy"><strong>{record.player.name}</strong><small>{record.games} {record.games === 1 ? "jogo" : "jogos"}</small><em><Target size={12} /> {record.goals} {record.goals === 1 ? "golo" : "golos"}</em></span><ArrowLeft className="best-friend-arrow" size={17} />
        </Link>)}</div> : <div className="profile-empty"><Target size={25} /><span><strong>Ainda sem marcadores registados</strong></span></div>}
      </section>

      <section className="rivals-section">
        <div className="profile-section-heading"><div><span className="section-kicker"><Shield size={15} /> FRENTE A FRENTE</span><h2>Confrontos</h2></div><p>{profile.rivals.length} {profile.rivals.length === 1 ? "adversário" : "adversários"}</p></div>
        {profile.rivals.length > 0 ? <div className="team-rivals-grid">{profile.rivals.map((rival) => <Link className="team-rival-card" href={`/time/${rival.color}`} key={rival.color}>
          <span className="team-rival-identity"><span className="team-rival-mark" style={{ backgroundColor: rival.hex }}><Shield size={34} /></span><span><small>Adversário</small><strong>Time {rival.label}</strong></span></span>
          <span className="team-rival-stats">
            <span><small>Jogos</small><strong>{rival.games}</strong></span>
            <span><small>Campanha</small><strong>{rival.wins}V · {rival.draws}E · {rival.losses}D</strong></span>
            <span><small>Golos</small><strong>{rival.goalsFor}–{rival.goalsAgainst}</strong></span>
            <span><small>Saldo</small><strong>{rival.goalDifference > 0 ? `+${rival.goalDifference}` : rival.goalDifference}</strong></span>
            <span><small>Aproveitamento</small><strong>{rival.winRate.toFixed(0)}%</strong></span>
            <span><small>Último jogo</small><strong>{formatDate(rival.lastMeeting)}</strong></span>
          </span>
          <ArrowLeft className="team-row-arrow" size={18} />
        </Link>)}</div> : <div className="profile-empty"><Shield size={25} /><span><strong>Ainda sem rivais registados</strong></span></div>}
      </section>
    </section>
  </main>;
}
