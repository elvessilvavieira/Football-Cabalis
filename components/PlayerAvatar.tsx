import type { Player } from "@/lib/data";

export function PlayerAvatar({ player, size = "md" }: { player: Player; size?: "sm" | "md" | "lg" }) {
  const initials = player.name.split(" ").slice(0, 2).map((part) => part[0]).join("");
  if (player.photo) return <img className={`avatar avatar-${size}`} src={player.photo} alt={player.name} />;
  return <span className={`avatar avatar-${size} avatar-fallback`} aria-hidden="true">{initials}</span>;
}

