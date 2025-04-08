import React from "react";
import { Box, TextField, Button, CircularProgress } from "@mui/material";
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon, Refresh as RefreshIcon } from "@mui/icons-material";

interface SearchAndFiltersProps {
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleInactive: () => void;
  onRefresh: () => void;
  includeInactive: boolean;
  loading: boolean;
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  onSearchChange,
  onToggleInactive,
  onRefresh,
  includeInactive,
  loading,
}) => {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 2, mb: 2 }}>
      <TextField
        label="Buscar itens"
        variant="outlined"
        size="small"
        onChange={onSearchChange}
        fullWidth
        sx={{ maxWidth: 350 }}
      />
      <Box display="flex" gap={1}>
        <Button
          variant="outlined"
          startIcon={includeInactive ? <VisibilityIcon /> : <VisibilityOffIcon />}
          onClick={onToggleInactive}
        >
          {includeInactive ? "Ocultar Inativos" : "Mostrar Inativos"}
        </Button>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRefresh} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : "Recarregar"}
        </Button>
      </Box>
    </Box>
  );
};

export default SearchAndFilters;