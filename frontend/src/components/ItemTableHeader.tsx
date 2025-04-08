import React from "react";
import { TableHead, TableRow, TableCell, Checkbox } from "@mui/material";

interface ItemTableHeaderProps {
  selectedCount: number;
  totalItems: number;
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ItemTableHeader: React.FC<ItemTableHeaderProps> = ({
  selectedCount,
  totalItems,
  onSelectAll,
}) => {
  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={selectedCount > 0 && selectedCount < totalItems}
            checked={totalItems > 0 && selectedCount === totalItems}
            onChange={onSelectAll}
          />
        </TableCell>
        <TableCell>Nome</TableCell>
        <TableCell>Status</TableCell>
        <TableCell align="right">Ações</TableCell>
      </TableRow>
    </TableHead>
  );
};

export default ItemTableHeader;