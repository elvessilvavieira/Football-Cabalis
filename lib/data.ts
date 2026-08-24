import { games } from "@/src/data/match";
import { players } from "@/src/data/team/players";
import { teamColors } from "@/src/data/types";
import type { Game, GameTeam } from "@/src/data/types";

export { games, players, teamColors };
export type { Game, GamePlayer, GameTeam, Player, TeamColor, TeamName } from "@/src/data/types";

export type Standing = ReturnType<typeof getStandings>[number];
export type TeamStanding = ReturnType<typeof getTeamStandings>[number];
export type PlayerProfile = ReturnType<typeof getPlayerProfile>;

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

export function playerById(id: string) {
  return players.find((player) => player.id === id)!;
}

export function sortedGames() {
  return [...games].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getStandings(seasonGames: Game[] = games, pointsRule: PointsRule = officialPointsRule) {
  const table = new Map(players.map((player) => [player.id, {
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

export function getStatisticsStandings() {
  return getStandings(games, { win: 1, draw: 0, loss: -1 });
}

export function getStatisticsTeamStandings() {
  return getTeamStandings(games, { win: 1, draw: 0, loss: -1 });
}

export function getTeamStandings(seasonGames: Game[] = games, pointsRule: PointsRule = officialPointsRule) {
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

export function getSeasons(): Season[] {
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
      standings: getStandings(seasonGames),
      teamStandings: getTeamStandings(seasonGames),
    }));
}

export function getSeason(id: string) {
  return getSeasons().find((season) => season.id === id);
}

export function getCurrentSeason() {
  return getSeasons()[0];
}

export function getPlayerProfile(id: string) {
  const player = players.find((candidate) => candidate.id === id);
  if (!player) return undefined;

  const allStandings = getStandings(games);
  const standing = allStandings.find((row) => row.player.id === id)!;
  const overallPosition = allStandings.findIndex((row) => row.player.id === id) + 1;
  const appearances = sortedGames().flatMap((game) => {
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

  const seasons = getSeasons().flatMap((season) => {
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

  const honors = seasons.flatMap((season) => season.honors.map((title) => ({
    seasonId: season.id,
    seasonLabel: season.label,
    title,
  })));
  const bestScoringGame = [...appearances].sort((a, b) => b.goals - a.goals || +new Date(b.game.date) - +new Date(a.game.date))[0];
  const currentSeasonId = getCurrentSeason()?.id;
  const currentSeason = seasons.find((season) => season.id === currentSeasonId);

  return {
    player,
    standing,
    overallPosition,
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
