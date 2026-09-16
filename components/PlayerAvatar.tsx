import type { Captaincy, Player } from "@/lib/data";
import { CaptainBadges } from "./CaptainBadges";

export function PlayerAvatar({ player, size = "md", captaincies = [] }: { player: Player; size?: "sm" | "md" | "lg"; captaincies?: Captaincy[] }) {
  const initials = player.name.split(" ").slice(0, 2).map((part) => part[0]).join("");
  const avatar = player.photo
    ? <img className={`avatar avatar-${size}`} src={player.photo} alt={player.name} />
    : <span className={`avatar avatar-${size} avatar-fallback`} aria-hidden="true">{initials}</span>;
  if (captaincies.length === 0) return avatar;
  return <span className={`avatar-wrap avatar-wrap-${size}`}>{avatar}<CaptainBadges captaincies={captaincies} /></span>;
}
