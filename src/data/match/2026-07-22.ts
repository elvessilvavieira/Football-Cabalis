import type { Game } from "../types";

export const match20260722: Game = {
  id: "2026-07-22-a-b",
  date: "2026-07-22T18:00:00",
  venue: "Campo Tech Park",
  teamA: {
    name: "A",
    color: "verde",
    score: 9,
    players: ["vady", "adilson", "rody", "lenilson", "gil"].map((playerId) => ({ playerId, goals: 0 })),
  },
  teamB: {
    name: "B",
    color: "azul",
    score: 6,
    players: ["elves", "helder", "angelo", "anderson", "dunha"].map((playerId) => ({ playerId, goals: 0 })),
  },
};
