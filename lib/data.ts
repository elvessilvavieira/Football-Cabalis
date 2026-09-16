import { getGameById, getGames, getPlayers } from "@/lib/db";
import { teamColors } from "@/src/data/types";
import type { Game, GameTeam, Player } from "@/src/data/types";

export { getGameById, getGames, getPlayers, teamColors };
export type { Game, GameAccess, GamePlayer, GameTeam, Player, TeamColor, TeamName } from "@/src/data/types";

export type Standing = ReturnType<typeof getStandings>[number];
export type TeamStanding = ReturnType<typeof getTeamStandings>[number];
export type PlayerProfile = Awaited<ReturnType<typeof getPlayerProfile>>;
export type TeamProfile = Awaited<ReturnType<typeof getTeamProfile>>;
export type CaptainRank = 1 | 2 | 3;
export type Captaincy = {
  playerId: string;
  teamColor: keyof typeof teamColors;
  teamLabel: string;
  teamHex: string;
  rank: CaptainRank;
  title: "Primeiro capitão" | "Segundo capitão" | "Terceiro capitão";
  games: number;
  firstAppearance: string;
  wins: number;
  goals: number;
};

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

const captainTitles: Record<CaptainRank, Captaincy["title"]> = {
  1: "Primeiro capitão",
  2: "Segundo capitão",
  3: "Terceiro capitão",
};

export function calculateCaptaincies(games: Game[], players: Player[]): Captaincy[] {
  type CaptainStats = Omit<Captaincy, "rank" | "title">;
  const playerNames = new Map(players.map((player) => [player.id, player.name]));
  const byTeam = new Map<keyof typeof teamColors, Map<string, CaptainStats>>();

  games.forEach((game) => {
    const sides = [
      { team: game.teamA, opponent: game.teamB },
      { team: game.teamB, opponent: game.teamA },
    ];

    sides.forEach(({ team, opponent }) => {
      const teamPlayers = byTeam.get(team.color) ?? new Map<string, CaptainStats>();
      team.players.forEach(({ playerId, goals }) => {
        const current = teamPlayers.get(playerId) ?? {
          playerId,
          teamColor: team.color,
          teamLabel: teamColors[team.color].label,
          teamHex: teamColors[team.color].hex,
          games: 0,
          firstAppearance: game.date,
          wins: 0,
          goals: 0,
        };
        current.games += 1;
        current.firstAppearance = current.firstAppearance.localeCompare(game.date) <= 0 ? current.firstAppearance : game.date;
        current.wins += Number(team.score > opponent.score);
        current.goals += goals;
        teamPlayers.set(playerId, current);
      });
      byTeam.set(team.color, teamPlayers);
    });
  });

  return [...byTeam.values()].flatMap((teamPlayers) => [...teamPlayers.values()]
    .sort((a, b) => b.games - a.games
      || a.firstAppearance.localeCompare(b.firstAppearance)
      || b.wins - a.wins
      || b.goals - a.goals
      || (playerNames.get(a.playerId) ?? a.playerId).localeCompare(playerNames.get(b.playerId) ?? b.playerId, "pt", { sensitivity: "base" }))
    .slice(0, 3)
    .map((captain, index) => {
      const rank = (index + 1) as CaptainRank;
      return { ...captain, rank, title: captainTitles[rank] };
    }));
}

export async function getCaptaincies() {
  const [games, players] = await Promise.all([getGames(), getPlayers()]);
  return calculateCaptaincies(games, players);
}

export function captainciesForPlayer(captaincies: Captaincy[], playerId: string) {
  return captaincies
    .filter((captaincy) => captaincy.playerId === playerId)
    .sort((a, b) => a.rank - b.rank || a.teamLabel.localeCompare(b.teamLabel));
}

export async function playerById(id: string) {
  const players = await getPlayers();
  return players.find((player) => player.id === id)!;
}

export async function sortedGames() {
  const games = await getGames();
  return [...games].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getStandings(
  seasonGames: Game[],
  allPlayers: Player[],
  pointsRule: PointsRule = officialPointsRule,
  inactivePlayersLast = false,
) {
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
    (inactivePlayersLast ? Number(a.games === 0) - Number(b.games === 0) : 0)
    || b.points - a.points
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
      standings: getStandings(seasonGames, players, officialPointsRule, true),
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

  const gamesTogether = new Map<string, number>();
  const gamesAgainst = new Map<string, number>();
  games.forEach((game) => {
    const sides = [game.teamA, game.teamB];
    const teamIndex = sides.findIndex((candidate) => candidate.players.some(({ playerId }) => playerId === id));
    if (teamIndex === -1) return;

    sides[teamIndex].players.forEach(({ playerId }) => {
      if (playerId !== id) gamesTogether.set(playerId, (gamesTogether.get(playerId) ?? 0) + 1);
    });
    sides[teamIndex === 0 ? 1 : 0].players.forEach(({ playerId }) => {
      gamesAgainst.set(playerId, (gamesAgainst.get(playerId) ?? 0) + 1);
    });
  });
  const bestFriends = players
    .flatMap((friend) => {
      const games = gamesTogether.get(friend.id) ?? 0;
      return games > 0 ? [{ player: friend, games }] : [];
    })
    .sort((a, b) => b.games - a.games || a.player.name.localeCompare(b.player.name))
    .slice(0, 5);
  const biggestRivals = players
    .flatMap((rival) => {
      const games = gamesAgainst.get(rival.id) ?? 0;
      return games > 0 ? [{ player: rival, games }] : [];
    })
    .sort((a, b) => b.games - a.games || a.player.name.localeCompare(b.player.name))
    .slice(0, 5);
  const rivalComparisons = players
    .filter((rival) => rival.id !== id)
    .map((rival) => {
      const meetings = gamesByDate.flatMap((game) => {
        const sides = [game.teamA, game.teamB];
        const playerTeamIndex = sides.findIndex((team) => team.players.some((gamePlayer) => gamePlayer.playerId === id));
        if (playerTeamIndex === -1) return [];

        const playerTeam = sides[playerTeamIndex];
        const rivalTeam = sides[playerTeamIndex === 0 ? 1 : 0];
        const rivalGamePlayer = rivalTeam.players.find((gamePlayer) => gamePlayer.playerId === rival.id);
        if (!rivalGamePlayer) return [];

        const playerGamePlayer = playerTeam.players.find((gamePlayer) => gamePlayer.playerId === id)!;
        const result: "win" | "draw" | "loss" = playerTeam.score > rivalTeam.score
          ? "win"
          : playerTeam.score < rivalTeam.score ? "loss" : "draw";

        return [{
          gameId: game.id,
          date: game.date,
          result,
          playerTeamLabel: teamColors[playerTeam.color].label,
          playerTeamHex: teamColors[playerTeam.color].hex,
          rivalTeamLabel: teamColors[rivalTeam.color].label,
          rivalTeamHex: teamColors[rivalTeam.color].hex,
          scoreFor: playerTeam.score,
          scoreAgainst: rivalTeam.score,
          playerGoals: playerGamePlayer.goals,
          rivalGoals: rivalGamePlayer.goals,
        }];
      });
      const playerWins = meetings.filter((meeting) => meeting.result === "win").length;
      const draws = meetings.filter((meeting) => meeting.result === "draw").length;
      const rivalWins = meetings.filter((meeting) => meeting.result === "loss").length;
      const playerGoals = meetings.reduce((total, meeting) => total + meeting.playerGoals, 0);
      const rivalGoals = meetings.reduce((total, meeting) => total + meeting.rivalGoals, 0);

      return {
        player: rival,
        recentMeetings: meetings.slice(0, 3),
        summary: {
          games: meetings.length,
          playerWins,
          draws,
          rivalWins,
          playerGoals,
          rivalGoals,
          goalDifference: playerGoals - rivalGoals,
        },
      };
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
    const teams = [...teamAppearances.entries()]
      .sort(([, gamesA], [, gamesB]) => gamesB - gamesA)
      .map(([color, games]) => ({
        color,
        label: teamColors[color].label,
        hex: teamColors[color].hex,
        games,
      }));
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
    return [{ id: season.id, label: season.label, position, topScorer, primaryTeam, teams, honors, ...row }];
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
  const captaincies = captainciesForPlayer(calculateCaptaincies(games, players), id);

  return {
    player,
    standing,
    statisticsPosition,
    appearances,
    bestFriends,
    biggestRivals,
    rivalComparisons,
    seasons,
    honors,
    currentSeason,
    captaincies,
    favoriteColor,
    bestScoringGame,
    longestWinStreak,
    winRate: standing.games ? (standing.wins / standing.games) * 100 : 0,
    goalsPerGame: standing.games ? standing.goalsScored / standing.games : 0,
  };
}

export async function getTeamProfile(id: string) {
  if (!(id in teamColors)) return undefined;

  const color = id as keyof typeof teamColors;
  const [games, players, allSeasons] = await Promise.all([getGames(), getPlayers(), getSeasons()]);
  const identity = { color, ...teamColors[color] };
  const emptyStanding = {
    ...identity,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    games: 0,
    wins: 0,
    draws: 0,
    losses: 0,
  };
  const standing = getTeamStandings(games).find((row) => row.color === color) ?? emptyStanding;
  const statisticsStandings = getTeamStandings(games, statisticsPointsRule);
  const statisticsIndex = statisticsStandings.findIndex((row) => row.color === color);
  const statisticsPosition = statisticsIndex === -1 ? undefined : statisticsIndex + 1;
  const playerMap = new Map(players.map((player) => [player.id, player]));
  const appearances = [...games]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .flatMap((game) => {
      const sides = [
        { team: game.teamA, opponent: game.teamB },
        { team: game.teamB, opponent: game.teamA },
      ];
      const side = sides.find(({ team }) => team.color === color);
      if (!side) return [];
      const result: "win" | "draw" | "loss" = side.team.score > side.opponent.score
        ? "win"
        : side.team.score < side.opponent.score ? "loss" : "draw";
      return [{
        game,
        scoreFor: side.team.score,
        scoreAgainst: side.opponent.score,
        opponentColor: side.opponent.color,
        opponentLabel: teamColors[side.opponent.color].label,
        opponentHex: teamColors[side.opponent.color].hex,
        players: side.team.players.flatMap((gamePlayer) => {
          const player = playerMap.get(gamePlayer.playerId);
          return player ? [{ player, goals: gamePlayer.goals }] : [];
        }),
        result,
      }];
    });

  let longestWinStreak = 0;
  let currentWinStreak = 0;
  [...appearances].reverse().forEach(({ result }) => {
    currentWinStreak = result === "win" ? currentWinStreak + 1 : 0;
    longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
  });

  const playerRecords = new Map<string, { games: number; wins: number; goals: number }>();
  appearances.forEach((appearance) => appearance.players.forEach(({ player, goals }) => {
    const record = playerRecords.get(player.id) ?? { games: 0, wins: 0, goals: 0 };
    record.games += 1;
    record.wins += Number(appearance.result === "win");
    record.goals += goals;
    playerRecords.set(player.id, record);
  }));
  const playerStatistics = players
    .flatMap((player) => {
      const record = playerRecords.get(player.id);
      return record ? [{ player, ...record }] : [];
    });
  const mostFrequentPlayers = [...playerStatistics]
    .sort((a, b) => b.games - a.games || b.wins - a.wins || b.goals - a.goals || a.player.name.localeCompare(b.player.name))
    .slice(0, 5);
  const topScorers = [...playerStatistics]
    .filter(({ goals }) => goals > 0)
    .sort((a, b) => b.goals - a.goals || b.games - a.games || a.player.name.localeCompare(b.player.name))
    .slice(0, 5);

  const rivalRecords = new Map<keyof typeof teamColors, { games: number; wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number; lastMeeting: string }>();
  appearances.forEach(({ game, opponentColor, result, scoreFor, scoreAgainst }) => {
    const record = rivalRecords.get(opponentColor) ?? { games: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, lastMeeting: game.date };
    record.games += 1;
    record.wins += Number(result === "win");
    record.draws += Number(result === "draw");
    record.losses += Number(result === "loss");
    record.goalsFor += scoreFor;
    record.goalsAgainst += scoreAgainst;
    rivalRecords.set(opponentColor, record);
  });
  const rivals = [...rivalRecords.entries()]
    .map(([rivalColor, record]) => ({
      color: rivalColor,
      ...teamColors[rivalColor],
      ...record,
      goalDifference: record.goalsFor - record.goalsAgainst,
      winRate: record.games ? (record.wins / record.games) * 100 : 0,
    }))
    .sort((a, b) => b.games - a.games || b.wins - a.wins || b.goalDifference - a.goalDifference || a.label.localeCompare(b.label));

  const seasons = allSeasons.flatMap((season) => {
    const row = season.teamStandings.find((candidate) => candidate.color === color);
    if (!row) return [];
    const position = season.teamStandings.findIndex((candidate) => candidate.color === color) + 1;
    return [{ ...row, id: season.id, label: season.label, position, champion: position === 1 }];
  });
  const currentSeasonId = allSeasons[0]?.id;
  const currentSeason = seasons.find((season) => season.id === currentSeasonId);
  const statisticsHonor = statisticsPosition && statisticsPosition <= 3 ? [{
    seasonId: "general",
    seasonLabel: "Geral",
    title: statisticsPosition === 1 ? "Ouro das Estatísticas" : statisticsPosition === 2 ? "Prata das Estatísticas" : "Bronze das Estatísticas",
    href: "/estatisticas",
    ongoing: false,
  }] : [];
  const honors = [...statisticsHonor, ...seasons.flatMap((season) => season.champion ? [{
    seasonId: season.id,
    seasonLabel: season.label,
    title: "Time campeão",
    href: `/temporadas/${season.id}`,
    ongoing: season.id === currentSeasonId,
  }] : [])];
  const captaincies = calculateCaptaincies(games, players)
    .filter((captaincy) => captaincy.teamColor === color)
    .map((captaincy) => ({ ...captaincy, player: playerMap.get(captaincy.playerId)! }))
    .filter((captaincy) => Boolean(captaincy.player));
  const bestGame = [...appearances].sort((a, b) =>
    (b.scoreFor - b.scoreAgainst) - (a.scoreFor - a.scoreAgainst)
    || b.scoreFor - a.scoreFor
    || +new Date(b.game.date) - +new Date(a.game.date),
  )[0];

  return {
    team: identity,
    standing,
    statisticsPosition,
    appearances,
    seasons,
    honors,
    currentSeason,
    captaincies,
    mostFrequentPlayers,
    topScorers,
    rivals,
    bestGame,
    longestWinStreak,
    winRate: standing.games ? (standing.wins / standing.games) * 100 : 0,
    goalsPerGame: standing.games ? standing.goalsFor / standing.games : 0,
  };
}
