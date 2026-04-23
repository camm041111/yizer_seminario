import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Administrators from './pages/Administrators';
import NewAdministrator from './pages/NewAdministrator';
import EditAdministrator from './pages/EditAdministrator';
import NewVariant from './pages/NewVariant';
import OrderDetails from './pages/OrderDetails';
import ProductInventory from './pages/ProductInventory';
import AddNewProduct from './pages/AddNewProduct';
import Variants from './pages/Variants';

const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

const AppRoutes = () => {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/products" />} />
      <Route path="/" element={token ? <DashboardLayout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/products" />} />
        <Route path="products" element={<ProductInventory />} />
        <Route path="products/new" element={<AddNewProduct />} />
        <Route path="administrators" element={<Administrators />} />
        <Route path="administrators/new" element={<NewAdministrator />} />
        <Route path="administrators/:id/edit" element={<EditAdministrator />} />
        <Route path="customers" element={<ProductInventory />} />
        <Route path="orders" element={<ProductInventory />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="variants" element={<Variants />} />
        <Route path="variants/new" element={<NewVariant />} />
      </Route>
      <Route path="*" element={<Navigate to={token ? "/products" : "/login"} />} />
    </Routes>
  );
};

export default App;
