import { games } from "@/src/data/match";
import { players } from "@/src/data/team/players";
import { teamColors } from "@/src/data/types";
import type { Game, GameTeam } from "@/src/data/types";

export { games, players, teamColors };
export type { Game, GamePlayer, GameTeam, Player, TeamColor, TeamName } from "@/src/data/types";

export type Standing = ReturnType<typeof getStandings>[number];
export type TeamStanding = ReturnType<typeof getTeamStandings>[number];

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
        row.games += 1;
        if (result === 1) row.wins += 1;
        if (result === 0) row.draws += 1;
        if (result === -1) row.losses += 1;
      });
    });
  });

  return [...table.values()].sort((a, b) =>
    b.points - a.points
    || b.goalsScored - a.goalsScored
    || b.goalsFor - a.goalsFor
    || a.goalsAgainst - b.goalsAgainst
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
