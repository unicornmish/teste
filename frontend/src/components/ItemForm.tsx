import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Item } from '../types/types';

interface ItemFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { name: string }) => Promise<void>;
  item: Item | null;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required('O nome é obrigatório')
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(100, 'O nome não pode ter mais de 100 caracteres')
});

const ItemForm: React.FC<ItemFormProps> = ({ open, onClose, onSubmit, item }) => {
  const [submitting, setSubmitting] = useState<boolean>(false);

  const formik = useFormik({
    initialValues: {
      name: item?.name || ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setSubmitting(false);
      }
    },
    enableReinitialize: true
  });

  useEffect(() => {
    if (!open) {
      formik.resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{item ? 'Editar Item' : 'Novo Item'}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Nome do Item"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            disabled={submitting}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" color="primary" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ItemForm;