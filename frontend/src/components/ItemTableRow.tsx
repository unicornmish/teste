import React from "react";
import {
  TableRow,
  TableCell,
  Checkbox,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Item } from "../types/types";

interface ItemTableRowProps {
  item: Item;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}

const ItemTableRow: React.FC<ItemTableRowProps> = ({
  item,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) => {
  return (
    <TableRow key={item.id} hover>
      <TableCell padding="checkbox">
        <Checkbox
          checked={isSelected}
          onChange={() => onSelect(item.id)}
        />
      </TableCell>
      <TableCell>{item.name}</TableCell>
      <TableCell>
        <Chip
          label={item.isActive ? "Ativo" : "Inativo"}
          color={item.isActive ? "success" : "default"}
          size="small"
        />
      </TableCell>
      <TableCell align="right">
        <Tooltip title="Editar">
          <IconButton onClick={() => onEdit(item)}>
            <EditIcon color="primary" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir">
          <IconButton onClick={() => onDelete(item.id)}>
            <DeleteIcon color="error" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default ItemTableRow;