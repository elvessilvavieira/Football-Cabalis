import { getGameById, getGames, getPlayers } from "@/lib/db";
import { teamColors } from "@/src/data/types";
import type { Game, GameTeam, Player } from "@/src/data/types";

export { getGameById, getGames, getPlayers, teamColors };
export type { Game, GamePlayer, GameTeam, Player, TeamColor, TeamName } from "@/src/data/types";

export type Standing = ReturnType<typeof getStandings>[number];
export type TeamStanding = ReturnType<typeof getTeamStandings>[number];
export type PlayerProfile = Awaited<ReturnType<typeof getPlayerProfile>>;

export type Season = {
  id: string;
  label: string;
  games: Game[];
  standings: ReturnType<typeof getStandings>;
  teamStandings: ReturnType<typeof getTeamStandings>;
};

type PointsRule = {
  win: number;
  draw: number;
  loss: number;
};

const officialPointsRule: PointsRule = { win: 3, draw: 1, loss: 0 };
const statisticsPointsRule: PointsRule = { win: 1, draw: 0, loss: -1 };

export async function playerById(id: string) {
  const players = await getPlayers();
  return players.find((player) => player.id === id)!;
}

export async function sortedGames() {
  const games = await getGames();
  return [...games].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getStandings(seasonGames: Game[], allPlayers: Player[], pointsRule: PointsRule = officialPointsRule) {
  const table = new Map(allPlayers.map((player) => [player.id, {
    player,
    points: 0,
    goalsScored: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    games: 0,
    wins: 0,
    draws: 0,
    losses: 0,
  }]));

  seasonGames.forEach((game) => {
    const aResult = game.teamA.score > game.teamB.score ? 1 : game.teamA.score < game.teamB.score ? -1 : 0;
    const bResult = -aResult;

    [
      [game.teamA, game.teamB.score, aResult],
      [game.teamB, game.teamA.score, bResult],
    ].forEach(([teamValue, concededValue, resultValue]) => {
      const team = teamValue as GameTeam;
      const conceded = concededValue as number;
      const result = resultValue as number;

      team.players.forEach(({ playerId, goals }) => {
        const row = table.get(playerId)!;
        row.points += result === 1 ? pointsRule.win : result === 0 ? pointsRule.draw : pointsRule.loss;
        row.goalsScored += goals;
        row.goalsFor += team.score;
        row.goalsAgainst += conceded;
        row.goalDifference = row.goalsFor - row.goalsAgainst;
        row.games += 1;
        if (result === 1) row.wins += 1;
        if (result === 0) row.draws += 1;
        if (result === -1) row.losses += 1;
      });
    });
  });

  return [...table.values()].sort((a, b) =>
    b.points - a.points
    || b.goalDifference - a.goalDifference
    || b.goalsScored - a.goalsScored
    || a.player.name.localeCompare(b.player.name),
  );
}

export async function getStatisticsStandings() {
  const [games, players] = await Promise.all([getGames(), getPlayers()]);
  return getStandings(games, players, statisticsPointsRule);
}

export async function getStatisticsTeamStandings() {
  const games = await getGames();
  return getTeamStandings(games, statisticsPointsRule);
}

export function getTeamStandings(seasonGames: Game[], pointsRule: PointsRule = officialPointsRule) {
  const table = new Map<keyof typeof teamColors, {
    color: keyof typeof teamColors;
    label: string;
    hex: string;
    points: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    games: number;
    wins: number;
    draws: number;
    losses: number;
  }>();

  seasonGames.forEach((game) => {
    const aResult = game.teamA.score > game.teamB.score ? 1 : game.teamA.score < game.teamB.score ? -1 : 0;

    [
      [game.teamA, game.teamB.score, aResult],
      [game.teamB, game.teamA.score, -aResult],
    ].forEach(([teamValue, concededValue, resultValue]) => {
      const team = teamValue as GameTeam;
      const conceded = concededValue as number;
      const result = resultValue as number;
      const color = teamColors[team.color];
      const row = table.get(team.color) ?? {
        color: team.color,
        label: color.label,
        hex: color.hex,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        games: 0,
        wins: 0,
        draws: 0,
        losses: 0,
      };

      row.points += result === 1 ? pointsRule.win : result === 0 ? pointsRule.draw : pointsRule.loss;
      row.goalsFor += team.score;
      row.goalsAgainst += conceded;
      row.goalDifference = row.goalsFor - row.goalsAgainst;
      row.games += 1;
      if (result === 1) row.wins += 1;
      if (result === 0) row.draws += 1;
      if (result === -1) row.losses += 1;
      table.set(team.color, row);
    });
  });

  return [...table.values()].sort((a, b) =>
    b.points - a.points
    || b.goalDifference - a.goalDifference
    || b.goalsFor - a.goalsFor
    || a.label.localeCompare(b.label),
  );
}

function seasonId(date: string) {
  return date.slice(0, 7);
}

export async function getSeasons(): Promise<Season[]> {
  const [games, players] = await Promise.all([getGames(), getPlayers()]);
  const grouped = games.reduce<Record<string, Game[]>>((seasons, game) => {
    (seasons[seasonId(game.date)] ??= []).push(game);
    return seasons;
  }, {});

  return Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([id, seasonGames]) => ({
      id,
      label: new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric", timeZone: "UTC" })
        .format(new Date(`${id}-01T12:00:00Z`)),
      games: [...seasonGames].sort((a, b) => +new Date(b.date) - +new Date(a.date)),
      standings: getStandings(seasonGames, players),
      teamStandings: getTeamStandings(seasonGames),
    }));
}

export async function getSeason(id: string) {
  const seasons = await getSeasons();
  return seasons.find((season) => season.id === id);
}

export async function getCurrentSeason() {
  const seasons = await getSeasons();
  return seasons[0];
}

export async function getPlayerProfile(id: string) {
  const [games, players] = await Promise.all([getGames(), getPlayers()]);
  const player = players.find((candidate) => candidate.id === id);
  if (!player) return undefined;

  const allStandings = getStandings(games, players);
  const statisticsStandings = getStandings(games, players, statisticsPointsRule);
  const standing = allStandings.find((row) => row.player.id === id)!;
  const statisticsPosition = statisticsStandings.findIndex((row) => row.player.id === id) + 1;
  const gamesByDate = [...games].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const appearances = gamesByDate.flatMap((game) => {
    const sides = [
      { team: game.teamA, opponent: game.teamB },
      { team: game.teamB, opponent: game.teamA },
    ];
    const side = sides.find(({ team }) => team.players.some(({ playerId }) => playerId === id));
    if (!side) return [];
    const gamePlayer = side.team.players.find(({ playerId }) => playerId === id)!;
    const result: "win" | "draw" | "loss" = side.team.score > side.opponent.score ? "win" : side.team.score < side.opponent.score ? "loss" : "draw";
    return [{
      game,
      color: side.team.color,
      colorLabel: teamColors[side.team.color].label,
      colorHex: teamColors[side.team.color].hex,
      opponentColor: side.opponent.color,
      opponentLabel: teamColors[side.opponent.color].label,
      opponentHex: teamColors[side.opponent.color].hex,
      scoreFor: side.team.score,
      scoreAgainst: side.opponent.score,
      goals: gamePlayer.goals,
      result,
    }];
  });

  let longestWinStreak = 0;
  let currentWinStreak = 0;
  [...appearances].reverse().forEach(({ result }) => {
    currentWinStreak = result === "win" ? currentWinStreak + 1 : 0;
    longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
  });

  const colorCounts = new Map<keyof typeof teamColors, number>();
  appearances.forEach(({ color }) => colorCounts.set(color, (colorCounts.get(color) ?? 0) + 1));
  const favoriteColorEntry = [...colorCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const favoriteColor = favoriteColorEntry ? {
    color: favoriteColorEntry[0],
    label: teamColors[favoriteColorEntry[0]].label,
    hex: teamColors[favoriteColorEntry[0]].hex,
    games: favoriteColorEntry[1],
  } : undefined;

  const allSeasons = await getSeasons();
  const seasons = allSeasons.flatMap((season) => {
    const row = season.standings.find((candidate) => candidate.player.id === id)!;
    if (row.games === 0) return [];
    const position = season.standings.findIndex((candidate) => candidate.player.id === id) + 1;
    const bestGoals = Math.max(...season.standings.map((candidate) => candidate.goalsScored));
    const topScorer = row.goalsScored > 0 && row.goalsScored === bestGoals;
    const seasonAppearances = appearances.filter(({ game }) => seasonId(game.date) === season.id);
    const teamAppearances = seasonAppearances.reduce((counts, appearance) => {
      counts.set(appearance.color, (counts.get(appearance.color) ?? 0) + 1);
      return counts;
    }, new Map<keyof typeof teamColors, number>());
    const primaryTeamEntry = [...teamAppearances.entries()].sort(([colorA, gamesA], [colorB, gamesB]) => {
      if (gamesA !== gamesB) return gamesB - gamesA;
      const positionA = season.teamStandings.findIndex((team) => team.color === colorA);
      const positionB = season.teamStandings.findIndex((team) => team.color === colorB);
      return positionA - positionB;
    })[0];
    const primaryTeamStanding = primaryTeamEntry
      ? season.teamStandings.find((team) => team.color === primaryTeamEntry[0])
      : undefined;
    const primaryTeam = primaryTeamEntry && primaryTeamStanding ? {
      color: primaryTeamEntry[0],
      label: teamColors[primaryTeamEntry[0]].label,
      hex: teamColors[primaryTeamEntry[0]].hex,
      games: primaryTeamEntry[1],
      position: season.teamStandings.findIndex((team) => team.color === primaryTeamEntry[0]) + 1,
      champion: season.teamStandings[0]?.color === primaryTeamEntry[0],
    } : undefined;
    const honors = [
      position === 1 ? "Melhor jogador" : position === 2 ? "Segundo melhor jogador" : position === 3 ? "Terceiro melhor jogador" : undefined,
      topScorer ? "Melhor marcador" : undefined,
      primaryTeam?.champion ? `Campeão pelo Time ${primaryTeam.label}` : undefined,
    ].filter((honor): honor is string => Boolean(honor));
    return [{ id: season.id, label: season.label, position, topScorer, primaryTeam, honors, ...row }];
  });

  const currentSeasonId = allSeasons[0]?.id;
  const statisticsHonor = statisticsPosition <= 3 ? [{
    seasonId: "general",
    seasonLabel: "Geral",
    title: statisticsPosition === 1
      ? "Ouro das Estatísticas"
      : statisticsPosition === 2
        ? "Prata das Estatísticas"
        : "Bronze das Estatísticas",
    href: "/estatisticas",
    ongoing: false,
  }] : [];
  const honors = [...statisticsHonor, ...seasons.flatMap((season) => season.honors.map((title) => ({
    seasonId: season.id,
    seasonLabel: season.label,
    title,
    href: `/temporadas/${season.id}`,
    ongoing: season.id === currentSeasonId,
  })))];
  const bestScoringGame = [...appearances].sort((a, b) => b.goals - a.goals || +new Date(b.game.date) - +new Date(a.game.date))[0];
  const currentSeason = seasons.find((season) => season.id === currentSeasonId);

  return {
    player,
    standing,
    statisticsPosition,
    appearances,
    seasons,
    honors,
    currentSeason,
    favoriteColor,
    bestScoringGame,
    longestWinStreak,
    winRate: standing.games ? (standing.wins / standing.games) * 100 : 0,
    goalsPerGame: standing.games ? standing.goalsScored / standing.games : 0,
  };
}
