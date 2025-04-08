import React, { JSX } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
} from "@mui/material";

interface ItemTableProps {
  renderTableHeader: () => JSX.Element;
  renderTableRow: (item: any, index: number) => JSX.Element;
  renderEmptyState: () => JSX.Element;
  renderLoadingState: () => JSX.Element;
  items: any[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  tableContainerRef: React.RefObject<HTMLDivElement>;
}

const ItemTable: React.FC<ItemTableProps> = ({
  renderTableHeader,
  renderTableRow,
  renderEmptyState,
  renderLoadingState,
  items,
  loading,
  loadingMore,
  hasMore,
  tableContainerRef,
}) => {
  return (
    <TableContainer
      component={Paper}
      ref={tableContainerRef}
      sx={{
        maxHeight: "70vh",
        overflowY: "auto",
        position: "relative",
      }}
    >
      <Table stickyHeader>
        {renderTableHeader()}
        <TableBody>
          {loading ? (
            renderLoadingState()
          ) : (
            <>
              {items.length === 0 ? renderEmptyState() : items.map(renderTableRow)}
              {loadingMore && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}
              {!hasMore && items.length > 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="textSecondary">
                      Todos os itens foram carregados
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ItemTable;