import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  // Table,
  // TableBody,
  TableCell,
  // TableContainer,
  // TableHead,
  TableRow,
  // Paper,
  // Checkbox,
  // TextField,
  // IconButton,
  // Tooltip,
  Box,
  // Typography,
  // Button,
  // Snackbar,
  // Alert,
  CircularProgress,
  // Chip,
  debounce,
  // Dialog,
  // DialogTitle,
  // DialogContent,
  // DialogActions,
} from "@mui/material";
// import {
//   // Edit as EditIcon,
//   // Delete as DeleteIcon,
//   // Add as AddIcon,
//   // Refresh as RefreshIcon,
//   // VisibilityOff as VisibilityOffIcon,
//   // Visibility as VisibilityIcon,
// } from "@mui/icons-material";
import ItemForm from "./ItemForm";
import { itemService } from "../service/api";
import { Item } from "../types/types";
import Header from "./Header";
import SearchAndFilters from "./SearchAndFilters";
import BulkActions from "./BulkActions";
import ItemTable from "./ItemTable";
import CustomSnackbar from "./CustomSnackbar";
import ConfirmationDialog from "./ConfirmationDialog";
import ItemTableRow from "./ItemTableRow";
import ItemTableHeader from "./ItemTableHeader";

type SnackbarState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
};

const PAGE_SIZE = 20;

const ItemList: React.FC = () => {
  // State management
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);
  console.log("🚀 ~ selected:", selected);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [includeInactive, setIncludeInactive] = useState<boolean>(true);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    action: "activate" | "deactivate" | null;
  }>({
    open: false,
    title: "",
    action: null,
  });
  const [hasMore, setHasMore] = useState<boolean>(true);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Data fetching
  const fetchItems = useCallback(
    async (reset = false) => {
      try {
        const currentLoading = reset ? setLoading : setLoadingMore;
        currentLoading(true);

        const response = await itemService.findMany({
          skip: reset ? 0 : items.length,
          take: PAGE_SIZE,
          search: searchTerm,
        });

        // 🔍 Filtrar os itens inativos no frontend
        const filteredData = includeInactive ? response.data : response.data.filter((item: Item) => item.isActive);

        setItems((prev) => (reset ? filteredData : [...prev, ...filteredData]));
        setHasMore(response.data.length === PAGE_SIZE);
      } catch (error) {
        showSnackbar("Erro ao carregar itens", "error");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [items.length, includeInactive, searchTerm]
  );

  // Initial load and when filters change
  useEffect(() => {
    fetchItems(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeInactive, searchTerm]);

  // Infinite scroll handler
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!loadingMore && hasMore && container.scrollHeight - container.scrollTop <= container.clientHeight + 100) {
        fetchItems();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [fetchItems, hasMore, loadingMore]);

  // Helper functions
  const showSnackbar = (message: string, severity: SnackbarState["severity"]) => {
    setSnackbar({ open: true, message, severity });
  };

  // Selection handlers
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(event.target.checked ? items.map((item) => item.id) : []);
  };

  const handleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]));
  };

  const handleToggleInactive = () => {
    setIncludeInactive((prev) => !prev);
  };

  // CRUD operations
  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setOpenForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await itemService.delete(id);
      showSnackbar("Item deletado com sucesso", "success");
      fetchItems(true); // Reset list
    } catch (error) {
      showSnackbar("Erro ao deletar item", "error");
    }
  };

  const handleBulkStatusChange = (activate: boolean) => {
    setConfirmDialog({
      open: true,
      title: activate ? "Confirmar ativação" : "Confirmar desativação",
      action: activate ? "activate" : "deactivate",
    });
  };

  const executeBulkAction = async () => {
    if (!confirmDialog.action || selected.length === 0) return;

    try {
      if (confirmDialog.action === "activate") {
        await itemService.bulkActivate(selected);
        showSnackbar("Itens ativados com sucesso", "success");
      } else {
        await itemService.bulkDeactivate(selected);
        showSnackbar("Itens desativados com sucesso", "success");
      }
      setSelected([]);
      fetchItems(true);
    } catch (error) {
      showSnackbar("Erro ao alterar status dos itens", "error");
    } finally {
      setConfirmDialog({ open: false, title: "", action: null });
    }
  };

  const debouncedSearch = useRef(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 500)
  ).current;

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(event.target.value);
  };

  const handleFormSubmit = async (values: { name: string }) => {
    try {
      if (editingItem) {
        await itemService.updateName(editingItem.id, values.name);
        showSnackbar("Item atualizado com sucesso", "success");
      } else {
        await itemService.create(values.name);
        showSnackbar("Item criado com sucesso", "success");
      }
      setOpenForm(false);
      setEditingItem(null);
      fetchItems(true); // Reset list
    } catch (error) {
      showSnackbar(error instanceof Error ? error.message : "Erro ao salvar item", "error");
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // UI components
  // const renderTableHeader = () => (
  //   <TableHead>
  //     <TableRow>
  //       <TableCell padding="checkbox">
  //         <Checkbox
  //           indeterminate={selected.length > 0 && selected.length < items.length}
  //           checked={items.length > 0 && selected.length === items.length}
  //           onChange={handleSelectAll}
  //         />
  //       </TableCell>
  //       <TableCell>Nome</TableCell>
  //       <TableCell>Status</TableCell>
  //       <TableCell align="right">Ações</TableCell>
  //     </TableRow>
  //   </TableHead>
  // );

  const renderTableHeader = () => (
    <ItemTableHeader
      selectedCount={selected.length}
      totalItems={items.length}
      onSelectAll={handleSelectAll}
    />
  );

  // const renderTableRow = (item: Item, index: number) => (
  //   <TableRow key={`${item.id}-${index}`} hover>
  //     <TableCell padding="checkbox">
  //       <Checkbox checked={selected.includes(item.id)} onChange={() => handleSelect(item.id)} />
  //     </TableCell>
  //     <TableCell>{item.name}</TableCell>
  //     <TableCell>
  //       <Chip label={item.isActive ? "Ativo" : "Inativo"} color={item.isActive ? "success" : "default"} size="small" />
  //     </TableCell>
  //     <TableCell align="right">
  //       <Tooltip title="Editar">
  //         <IconButton onClick={() => handleEdit(item)}>
  //           <EditIcon color="primary" />
  //         </IconButton>
  //       </Tooltip>
  //       <Tooltip title="Excluir">
  //         <IconButton onClick={() => handleDelete(item.id)}>
  //           <DeleteIcon color="error" />
  //         </IconButton>
  //       </Tooltip>
  //     </TableCell>
  //   </TableRow>
  // );

  const renderTableRow = (item: Item, index: number) => (
    <ItemTableRow
      key={`${item.id}-${index}`}
      item={item}
      isSelected={selected.includes(item.id)}
      onSelect={handleSelect}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );

  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={4} align="center">
        Nenhum item encontrado
      </TableCell>
    </TableRow>
  );

  const renderLoadingState = () => (
    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>

    <Header
      title="Gerenciamento de Itens"
      onButtonClick={() => setOpenForm(true)}
      buttonLabel="Novo Item"
    />



    <SearchAndFilters
      onSearchChange={handleSearchInput}
      onToggleInactive={handleToggleInactive}
      onRefresh={() => fetchItems(true)}
      includeInactive={includeInactive}
      loading={loading}
    />



    <BulkActions
      selectedCount={selected.length}
      onActivate={() => handleBulkStatusChange(true)}
      onDeactivate={() => handleBulkStatusChange(false)}
      loading={loading}
    />


<ItemTable
      renderTableHeader={renderTableHeader}
      renderTableRow={renderTableRow}
      renderEmptyState={renderEmptyState}
      renderLoadingState={renderLoadingState}
      items={items}
      loading={loading}
      loadingMore={loadingMore}
      hasMore={hasMore}
      tableContainerRef={tableContainerRef as React.RefObject<HTMLDivElement>}
    />

      {/* Formulário */}
      <ItemForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditingItem(null);
        }}
        onSubmit={handleFormSubmit}
        item={editingItem}
      />


    <CustomSnackbar
      open={snackbar.open}
      message={snackbar.message}
      severity={snackbar.severity}
      onClose={handleCloseSnackbar}
    />

    <ConfirmationDialog
      open={confirmDialog.open}
      title={confirmDialog.title}
      action={confirmDialog.action}
      selectedItems={items.filter((item) => selected.includes(item.id))}
      onClose={() => setConfirmDialog({ open: false, title: "", action: null })}
      onConfirm={executeBulkAction}
    />
    </Box>
  );
};

export default ItemList;
