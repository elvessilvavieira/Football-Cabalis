import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

export type SortDirection = "asc" | "desc";

type SortableHeaderProps = {
  active: boolean;
  children: React.ReactNode;
  direction?: SortDirection;
  onClick: () => void;
  title?: string;
};

export function SortableHeader({ active, children, direction, onClick, title }: SortableHeaderProps) {
  const Icon = active ? (direction === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown;

  return (
    <th aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}>
      <button className="sort-button" type="button" onClick={onClick} title={title}>
        {children}
        <Icon aria-hidden="true" size={13} />
      </button>
    </th>
  );
}
