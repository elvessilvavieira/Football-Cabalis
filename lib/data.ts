import { games } from "@/src/data/match";
import { players } from "@/src/data/team/players";
import { teamColors } from "@/src/data/types";
import type { GameTeam } from "@/src/data/types";

export { games, players, teamColors };
export type { Game, GamePlayer, GameTeam, Player, TeamColor, TeamName } from "@/src/data/types";

export function playerById(id: string) {
  return players.find((player) => player.id === id)!;
}

export function sortedGames() {
  return [...games].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getStandings() {
  const table = new Map(players.map((player) => [player.id, {
    player,
    points: 0,
    goalsScored: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    games: 0,
    wins: 0,
    losses: 0,
  }]));

  games.forEach((game) => {
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
        row.points += result;
        row.goalsScored += goals;
        row.goalsFor += team.score;
        row.goalsAgainst += conceded;
        row.games += 1;
        if (result === 1) row.wins += 1;
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
