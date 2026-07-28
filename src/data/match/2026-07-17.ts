import type { Game } from "../types";

export const match20260717: Game = {
  id: "2026-07-17-a-b",
  date: "2026-07-17T18:00:00",
  venue: "Campo Tech Park",
  teamA: {
    name: "A",
    color: "verde",
    score: 9,
    players: ["vady", "adilson", "lenilson"].map((playerId) => ({ playerId, goals: 0 })),
  },
  teamB: {
    name: "B",
    color: "azul",
    score: 6,
    players: ["helder", "paulo", "angelo"].map((playerId) => ({ playerId, goals: 0 })),
  },
};
