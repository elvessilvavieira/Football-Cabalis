export const teamColors = {
  verde: { label: "Verde", hex: "#15a34a" },
  amarelo: { label: "Amarelo", hex: "#eab308" },
  azul: { label: "Azul", hex: "#2563eb" },
  vermelho: { label: "Vermelho", hex: "#dc2626" },
  laranja: { label: "Laranja", hex: "#f97316" },
  rosa: { label: "Rosa", hex: "#ec4899" },
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
