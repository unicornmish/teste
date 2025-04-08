import React from "react";
import { Box, Button, Typography } from "@mui/material";

interface BulkActionsProps {
  selectedCount: number;
  onActivate: () => void;
  onDeactivate: () => void;
  loading: boolean;
}

const BulkActions: React.FC<BulkActionsProps> = ({ selectedCount, onActivate, onDeactivate, loading }) => {
  if (selectedCount === 0) return null;

  return (
    <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
      <Button variant="outlined" color="error" onClick={onDeactivate} disabled={loading}>
        Desativar
      </Button>
      <Button variant="outlined" color="success" onClick={onActivate} disabled={loading}>
        Ativar
      </Button>
      <Typography variant="body2">{selectedCount} selecionado(s)</Typography>
    </Box>
  );
};

export default BulkActions;