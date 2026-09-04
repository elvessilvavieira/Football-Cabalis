import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, ArrowLeft, Award, CalendarDays, Crown, Flame, Medal, Shield, Target, TrendingUp, Trophy } from "lucide-react";
import { getPlayerProfile, getPlayers } from "@/lib/data";

export async function generateStaticParams() {
  const players = await getPlayers();
  return players.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const profile = await getPlayerProfile((await params).id);
  if (!profile) return {};
  return {
    title: `${profile.player.name} | Cabalis Futebol`,
    description: `Perfil, estatísticas, conquistas e histórico de ${profile.player.name} no Cabalis Futebol.`,
  };
}

function formatDate(date: string, long = false) {
  return new Intl.DateTimeFormat("pt-PT", long
    ? { day: "numeric", month: "long", year: "numeric" }
    : { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));
}

function honorIcon(title: string) {
  if (title === "Melhor jogador") return <Crown size={20} />;
  if (title === "Melhor marcador") return <Target size={20} />;
  if (title.startsWith("Campeão pelo Time")) return <Trophy size={20} />;
  return <Medal size={20} />;
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getPlayerProfile((await params).id);
  if (!profile) notFound();

  const { player, standing } = profile;
  const recentForm = profile.appearances.slice(0, 5);
  const firstGame = profile.appearances.at(-1);
  const resultLabel = { win: "Vitória", draw: "Empate", loss: "Derrota" } as const;

  return <main>
    <section className="player-profile-hero">
      <div className="container">
        <Link className="back-link" href="/estatisticas"><ArrowLeft size={16} /> Voltar às estatísticas</Link>
        <div className="player-hero-grid">
          <div className="profile-photo-wrap">
            {player.photo
              ? <img className="profile-photo" src={player.photo} alt={player.name} />
              : <span className="profile-photo profile-photo-fallback">{player.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>}
            <span
              className="profile-rank"
              data-tooltip={profile.currentSeason ? `Posição na temporada atual: ${profile.currentSeason.label}` : "Sem jogos na temporada atual"}
              tabIndex={0}
            ><Trophy size={16} /> {profile.currentSeason ? `#${profile.currentSeason.position}` : "—"}</span>
          </div>
          <div className="player-hero-copy">
            <span className="eyebrow"><span /> PERFIL DO JOGADOR</span>
            <h1>{player.name}</h1>
            <p>{standing.games > 0
              ? `${standing.games} ${standing.games === 1 ? "jogo disputado" : "jogos disputados"}${firstGame ? ` desde ${formatDate(firstGame.game.date, true)}` : ""}.`
              : "Ainda sem jogos registados."}</p>
            <div className="profile-badges">
              <span><TrendingUp size={15} /> #{profile.statisticsPosition} na estatística geral</span>
              {profile.favoriteColor && <span><i style={{ backgroundColor: profile.favoriteColor.hex }} /> Mais vezes no Time {profile.favoriteColor.label}</span>}
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
        <article><span><Target size={18} /></span><small>Golos</small><strong>{standing.goalsScored}</strong><em>{profile.goalsPerGame.toFixed(2)} por jogo</em></article>
        <article><span><TrendingUp size={18} /></span><small>Pontos</small><strong>{standing.points}</strong></article>
        <article><span><Shield size={18} /></span><small>Saldo</small><strong>{standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference}</strong><em>{standing.goalsFor}–{standing.goalsAgainst} em campo</em></article>
        <article><span><Flame size={18} /></span><small>Maior sequência</small><strong>{profile.longestWinStreak}</strong><em>{profile.longestWinStreak === 1 ? "vitória seguida" : "vitórias seguidas"}</em></article>
      </div>

      <div className="profile-section-heading"><div><span className="section-kicker"><Award size={15} /> PALMARÉS</span><h2>Conquistas</h2></div><p>{profile.honors.length} {profile.honors.length === 1 ? "distinção" : "distinções"}</p></div>
      {profile.honors.length > 0 ? <div className="honors-grid">{profile.honors.map((honor) => <Link className={`honor-card honor-${honor.title.toLowerCase().replaceAll(" ", "-").normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`} href={honor.href} key={`${honor.seasonId}-${honor.title}`}>
        {honor.ongoing && <em className="honor-ongoing">em andamento</em>}
        <span className="honor-icon">{honorIcon(honor.title)}</span><span><small>{honor.seasonLabel}</small><strong>{honor.title}</strong></span>
      </Link>)}</div> : <div className="profile-empty"><Award size={25} /><span><strong>À procura da primeira conquista</strong><small>Os pódios e prémios futuros aparecerão aqui.</small></span></div>}

      <div className="profile-section-heading"><div><span className="section-kicker"><CalendarDays size={15} /> EVOLUÇÃO</span><h2>Estatísticas por temporada</h2></div></div>
      {profile.seasons.length > 0 ? <div className="season-performance-grid">{profile.seasons.map((season) => <Link className="season-performance-card" href={`/temporadas/${season.id}`} key={season.id}>
        <div className="season-performance-head"><span><small>Temporada</small><strong>{season.label}</strong>{season.primaryTeam && <em className="season-primary-team"><i style={{ backgroundColor: season.primaryTeam.hex }} />Time {season.primaryTeam.label} <b>|</b> {season.primaryTeam.position}.º lugar</em>}</span><b className={`season-position season-position-${season.position}`}>#{season.position}</b></div>
        <div className="season-performance-stats"><span><b>{season.games}</b><small>Jogos</small></span><span><b>{season.wins}</b><small>Vitórias</small></span><span><b>{season.points}</b><small>Pontos</small></span><span><b>{season.goalsScored}</b><small>Golos</small></span><span><b>{season.goalDifference > 0 ? `+${season.goalDifference}` : season.goalDifference}</b><small>Saldo</small></span></div>
        {season.honors.length > 0 && <div className="season-honor-tags">{season.honors.map((honor) => <em key={honor}>{honorIcon(honor)} {honor}</em>)}</div>}
      </Link>)}</div> : <div className="profile-empty"><CalendarDays size={25} /><span><strong>Sem temporadas disputadas</strong><small>As estatísticas surgirão depois do primeiro jogo.</small></span></div>}

      <div className="profile-lower-grid">
        <section>
          <div className="profile-section-heading compact"><div><span className="section-kicker"><Target size={15} /> MAIS GOLOS NUM JOGO</span><h2>Melhor atuação</h2></div></div>
          {profile.bestScoringGame ? <Link className="best-game-card" href={`/temporadas/${profile.bestScoringGame.game.date.slice(0, 7)}`}>
            <div><span className="team-standing-swatch" style={{ backgroundColor: profile.bestScoringGame.colorHex }} /><small>Time {profile.bestScoringGame.colorLabel}</small><strong>{profile.bestScoringGame.scoreFor}–{profile.bestScoringGame.scoreAgainst}</strong><small>Time {profile.bestScoringGame.opponentLabel}</small><span className="team-standing-swatch" style={{ backgroundColor: profile.bestScoringGame.opponentHex }} /></div>
            <p><b>{profile.bestScoringGame.goals}</b><span>{profile.bestScoringGame.goals === 1 ? "golo marcado" : "golos marcados"}<small>{formatDate(profile.bestScoringGame.game.date, true)}</small></span></p>
          </Link> : <div className="profile-empty small"><Target size={22} /><span><strong>Sem atuações registadas</strong></span></div>}
        </section>
        <section>
          <div className="profile-section-heading compact"><div><span className="section-kicker"><Activity size={15} /> HISTÓRICO</span><h2>Jogos recentes</h2></div></div>
          {profile.appearances.length > 0 ? <div className="recent-games-list">{profile.appearances.slice(0, 6).map((appearance) => <Link href={`/temporadas/${appearance.game.date.slice(0, 7)}`} key={appearance.game.id}>
            <span className={`recent-result form-${appearance.result}`}>{appearance.result === "win" ? "V" : appearance.result === "draw" ? "E" : "D"}</span>
            <span className="recent-date">{formatDate(appearance.game.date)}</span>
            <span className="recent-colors"><i style={{ backgroundColor: appearance.colorHex }} /> {appearance.colorLabel}</span>
            <strong>{appearance.scoreFor}–{appearance.scoreAgainst}</strong>
            <span className="recent-colors opponent">{appearance.opponentLabel} <i style={{ backgroundColor: appearance.opponentHex }} /></span>
            {appearance.goals > 0 && <em>{appearance.goals} {appearance.goals === 1 ? "golo" : "golos"}</em>}
          </Link>)}</div> : <div className="profile-empty small"><Activity size={22} /><span><strong>Sem jogos registados</strong></span></div>}
        </section>
      </div>
    </section>
  </main>;
}
