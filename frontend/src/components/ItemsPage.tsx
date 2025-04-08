import React from 'react';
import { Container } from '@mui/material';
import ItemList from '../components/ItemList';

const ItemsPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <ItemList />
    </Container>
  );
};

export default ItemsPage;