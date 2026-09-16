import type { Captaincy } from "@/lib/data";

export function captainciesForPlayer(captaincies: Captaincy[], playerId: string) {
  return captaincies
    .filter((captaincy) => captaincy.playerId === playerId)
    .sort((a, b) => a.rank - b.rank || a.teamLabel.localeCompare(b.teamLabel));
}

export function CaptainBadges({ captaincies }: { captaincies: Captaincy[] }) {
  if (captaincies.length === 0) return null;

  return <span className="captain-badges" aria-label={captaincies.map(({ title, teamLabel }) => `${title} do Time ${teamLabel}`).join(", ")}>
    {captaincies.map((captaincy) => <span
      className={`captain-badge captain-badge-${captaincy.rank}`}
      title={`${captaincy.title} do Time ${captaincy.teamLabel}`}
      key={captaincy.teamColor}
    >C</span>)}
  </span>;
}
