import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Chip,
  Button,
} from "@mui/material";

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  action: "activate" | "deactivate" | null;
  selectedItems: { id: string; name: string; isActive: boolean }[];
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  action,
  selectedItems,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph>
          {action === "activate"
            ? `Você está prestes a ativar ${selectedItems.length} item(s):`
            : `Você está prestes a desativar ${selectedItems.length} item(s):`}
        </Typography>

        <Box
          sx={{
            maxHeight: 300,
            overflow: "auto",
            border: "1px solid #eee",
            borderRadius: 1,
            p: 2,
            backgroundColor: "#f9f9f9",
          }}
        >
          {selectedItems.map((item) => (
            <Box key={item.id} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Chip
                label={item.isActive ? "Ativo" : "Inativo"}
                color={item.isActive ? "success" : "default"}
                size="small"
                sx={{ mr: 1, width: 70 }}
              />
              <Typography variant="body2">{item.name}</Typography>
            </Box>
          ))}
        </Box>

        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          Esta ação não pode ser desfeita.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancelar
        </Button>
        <Button onClick={onConfirm} color="primary" variant="contained" autoFocus>
          {action === "activate" ? "Confirmar Ativação" : "Confirmar Desativação"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;