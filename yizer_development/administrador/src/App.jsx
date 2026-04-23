import axios from 'axios';

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:3036';
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
import Variants from './pages/Variants';
import EditVariant from './pages/EditVariant';
import OrderDetails from './pages/OrderDetails';
import ProductInventory from './pages/ProductInventory';
import AddNewProduct from './pages/AddNewProduct';
import EditProduct from './pages/EditProduct';
import ErrorBoundary from './components/ErrorBoundary';

const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
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
        <Route path="products/:id/edit" element={<EditProduct />} />
        <Route path="administrators" element={<Administrators />} />
        <Route path="administrators/new" element={<NewAdministrator />} />
        <Route path="administrators/:id/edit" element={<EditAdministrator />} />
        <Route path="customers" element={<ProductInventory />} />
        <Route path="orders" element={<ProductInventory />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="variants" element={<Variants />} />
        <Route path="variants/new" element={<NewVariant />} />
        <Route path="variants/:id/edit" element={<EditVariant />} />
      </Route>
      <Route path="*" element={<Navigate to={token ? "/products" : "/login"} />} />
    </Routes>
  );
};

export default App;
