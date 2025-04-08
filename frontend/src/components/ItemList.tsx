import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  TextField,
  IconButton,
  Tooltip,
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  debounce,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  VisibilityOff as VisibilityOffIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import ItemForm from './ItemForm';
import { itemService } from '../service/api';
import { Item } from '../types/types';

type SnackbarState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
};

const PAGE_SIZE = 20;

const ItemList: React.FC = () => {
  // State management
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);
  console.log("🚀 ~ selected:", selected)
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [includeInactive, setIncludeInactive] = useState<boolean>(true);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    action: 'activate' | 'deactivate' | null;
  }>({
    open: false,
    title: '',
    action: null,
  });
  const [hasMore, setHasMore] = useState<boolean>(true);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Data fetching
  const fetchItems = useCallback(async (reset = false) => {
    try {
      const currentLoading = reset ? setLoading : setLoadingMore;
      currentLoading(true);

      const response = await itemService.findMany({
        skip: reset ? 0 : items.length,
        take: PAGE_SIZE,
        search: searchTerm
      });

      // 🔍 Filtrar os itens inativos no frontend
      const filteredData = includeInactive
        ? response.data
        : response.data.filter((item: Item) => item.isActive);

      setItems(prev => reset ? filteredData : [...prev, ...filteredData]);
      setHasMore(response.data.length === PAGE_SIZE);
    } catch (error) {
      showSnackbar('Erro ao carregar itens', 'error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [items.length, includeInactive, searchTerm]);


  // Initial load and when filters change
  useEffect(() => {
    fetchItems(true);
  }, [includeInactive, searchTerm]);

  // Infinite scroll handler
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (
        !loadingMore &&
        hasMore &&
        container.scrollHeight - container.scrollTop <= container.clientHeight + 100
      ) {
        fetchItems();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [fetchItems, hasMore, loadingMore]);

  // Helper functions
  const showSnackbar = (message: string, severity: SnackbarState['severity']) => {
    setSnackbar({ open: true, message, severity });
  };

  // Selection handlers
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(event.target.checked ? items.map(item => item.id) : []);
  };

  const handleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };


  const handleToggleInactive = () => {
    setIncludeInactive(prev => !prev);
  };

  // CRUD operations
  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setOpenForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await itemService.delete(id);
      showSnackbar('Item deletado com sucesso', 'success');
      fetchItems(true); // Reset list
    } catch (error) {
      showSnackbar('Erro ao deletar item', 'error');
    }
  };

  const handleBulkStatusChange = (activate: boolean) => {
    setConfirmDialog({
      open: true,
      title: activate ? 'Confirmar ativação' : 'Confirmar desativação',
      action: activate ? 'activate' : 'deactivate',
    });
  };

  const executeBulkAction = async () => {
    if (!confirmDialog.action || selected.length === 0) return;

    try {
      if (confirmDialog.action === 'activate') {
        await itemService.bulkActivate(selected);
        showSnackbar('Itens ativados com sucesso', 'success');
      } else {
        await itemService.bulkDeactivate(selected);
        showSnackbar('Itens desativados com sucesso', 'success');
      }
      setSelected([]);
      fetchItems(true);
    } catch (error) {
      showSnackbar('Erro ao alterar status dos itens', 'error');
    } finally {
      setConfirmDialog({ open: false, title: '', action: null });
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
        showSnackbar('Item atualizado com sucesso', 'success');
      } else {
        await itemService.create(values.name);
        showSnackbar('Item criado com sucesso', 'success');
      }
      setOpenForm(false);
      setEditingItem(null);
      fetchItems(true); // Reset list
    } catch (error) {
      showSnackbar(
        error instanceof Error ? error.message : 'Erro ao salvar item',
        'error'
      );
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // UI components
  const renderTableHeader = () => (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={selected.length > 0 && selected.length < items.length}
            checked={items.length > 0 && selected.length === items.length}
            onChange={handleSelectAll}
          />
        </TableCell>
        <TableCell>Nome</TableCell>
        <TableCell>Status</TableCell>
        <TableCell align="right">Ações</TableCell>
      </TableRow>
    </TableHead>
  );

  const renderTableRow = (item: Item, index: number) => (
    <TableRow key={`${item.id}-${index}`} hover>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selected.includes(item.id)}
          onChange={() => handleSelect(item.id)}
        />
      </TableCell>
      <TableCell>{item.name}</TableCell>
      <TableCell>
        <Chip
          label={item.isActive ? 'Ativo' : 'Inativo'}
          color={item.isActive ? 'success' : 'default'}
          size="small"
        />
      </TableCell>
      <TableCell align="right">
        <Tooltip title="Editar">
          <IconButton onClick={() => handleEdit(item)}>
            <EditIcon color="primary" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir">
          <IconButton onClick={() => handleDelete(item.id)}>
            <DeleteIcon color="error" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );

  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={4} align="center">
        Nenhum item encontrado
      </TableCell>
    </TableRow>
  );

  const renderLoadingState = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2, mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Gerenciamento de Itens
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
          sx={{ minWidth: 150 }}
        >
          Novo Item
        </Button>
      </Box>

      {/* Search & Filters */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2, mb: 2 }}>
        <TextField
          label="Buscar itens"
          variant="outlined"
          size="small"
          onChange={handleSearchInput}
          fullWidth
          sx={{ maxWidth: 350 }}
        />
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={includeInactive ? <VisibilityIcon /> : <VisibilityOffIcon />}
            onClick={handleToggleInactive}
          >
            {includeInactive ? 'Ocultar Inativos' : 'Mostrar Inativos'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchItems(true)}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Recarregar'}
          </Button>
        </Box>
      </Box>

      {/* Ações em massa */}
      {selected.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleBulkStatusChange(false)}
            disabled={loading}
          >
            Desativar
          </Button>
          <Button
            variant="outlined"
            color="success"
            onClick={() => handleBulkStatusChange(true)}
            disabled={loading}
          >
            Ativar
          </Button>
          <Typography variant="body2">
            {selected.length} selecionado(s)
          </Typography>
        </Box>
      )}

      {/* Tabela */}
      <TableContainer
        component={Paper}
        ref={tableContainerRef}
        sx={{
          maxHeight: '70vh',
          overflowY: 'auto',
          position: 'relative'
        }}
      >
        <Table stickyHeader>
          {renderTableHeader()}
          <TableBody>
            {loading ? renderLoadingState() : (
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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, title: '', action: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            {confirmDialog.action === 'activate'
              ? `Você está prestes a ativar ${selected.length} item(s):`
              : `Você está prestes a desativar ${selected.length} item(s):`}
          </Typography>

          <Box
            sx={{
              maxHeight: 300,
              overflow: 'auto',
              border: '1px solid #eee',
              borderRadius: 1,
              p: 2,
              backgroundColor: '#f9f9f9'
            }}
          >
            {items
              .filter(item => selected.includes(item.id))
              .map(item => (
                <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip
                    label={item.isActive ? 'Ativo' : 'Inativo'}
                    color={item.isActive ? 'success' : 'default'}
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
          <Button
            onClick={() => setConfirmDialog({ open: false, title: '', action: null })}
            color="primary"
          >
            Cancelar
          </Button>
          <Button
            onClick={executeBulkAction}
            color="primary"
            variant="contained"
            autoFocus
          >
            {confirmDialog.action === 'activate' ? 'Confirmar Ativação' : 'Confirmar Desativação'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

};

export default ItemList;