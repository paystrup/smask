/* eslint-disable react/prop-types */

import { ArrowUpDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import { TableHead } from "~/components/ui/table";

export function SortableTableHeader({
  label,
  sortKey,
  currentSort,
  onSort,
  className,
}) {
  return (
    <TableHead className={className}>
      <Button
        variant="link"
        onClick={() => onSort(sortKey)}
        className="w-full justify-start"
      >
        {label}
        <ArrowUpDown
          className={`ml-2 h-4 w-4 ${currentSort.key === sortKey ? "opacity-100" : "opacity-50"}`}
        />
      </Button>
    </TableHead>
  );
}
