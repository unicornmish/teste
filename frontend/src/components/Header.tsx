import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

interface HeaderProps {
  title: string;
  onButtonClick: () => void;
  buttonLabel: string;
}

const Header: React.FC<HeaderProps> = ({ title, onButtonClick, buttonLabel }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        gap: 2,
        mb: 3,
      }}
    >
      <Typography variant="h5" fontWeight="bold">
        {title}
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onButtonClick}
        sx={{ minWidth: 150 }}
      >
        {buttonLabel}
      </Button>
    </Box>
  );
};

export default Header;