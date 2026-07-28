import type { Game } from "../types";

export const match20260715: Game = {
  id: "2026-07-15-a-b",
  date: "2026-07-15T18:00:00",
  venue: "Campo Tech Park",
  teamA: {
    name: "A",
    color: "verde",
    score: 12,
    players: ["helder", "paulo", "anderson", "elves", "angelo"].map((playerId) => ({ playerId, goals: 0 })),
  },
  teamB: {
    name: "B",
    color: "azul",
    score: 8,
    players: ["vady", "adilson", "lenilson", "rody", "gil", "wagner"].map((playerId) => ({ playerId, goals: 0 })),
  },
};
