export const teamColors = {
  verde: { label: "Verde", hex: "#15a34a" },
  azul: { label: "Azul", hex: "#2563eb" },
} as const;

export type TeamColor = keyof typeof teamColors;
export type TeamName = "A" | "B";

export type Player = {
  id: string;
  name: string;
  photo?: string;
};

export type GamePlayer = {
  playerId: string;
  goals: number;
};

export type GameTeam = {
  name: TeamName;
  color: TeamColor;
  score: number;
  players: GamePlayer[];
};

export type Game = {
  id: string;
  date: string;
  venue?: string;
  teamA: GameTeam;
  teamB: GameTeam;
};
