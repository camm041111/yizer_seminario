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
import Customers from './pages/Customers';
import NewAdministrator from './pages/NewAdministrator';
import EditAdministrator from './pages/EditAdministrator';
import NewVariant from './pages/NewVariant';
import Variants from './pages/Variants';
import EditVariant from './pages/EditVariant';
import OrderDetails from './pages/OrderDetails';
import Orders from './pages/Orders';
import ProductInventory from './pages/ProductInventory';
import AddNewProduct from './pages/AddNewProduct';
import EditProduct from './pages/EditProduct';
import ErrorBoundary from './components/ErrorBoundary';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#d71920',
      dark: '#a70f16',
      light: '#ff6b6f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2f1720',
      contrastText: '#ffffff',
    },
    error: {
      main: '#b91c1c',
    },
    background: {
      default: '#fff7f7',
      paper: '#ffffff',
    },
    text: {
      primary: '#241316',
      secondary: '#74565b',
    },
    divider: 'rgba(139, 30, 36, 0.14)',
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 800,
      letterSpacing: 0,
    },
    h4: {
      fontWeight: 800,
      letterSpacing: 0,
    },
    h5: {
      fontWeight: 800,
      letterSpacing: 0,
    },
    h6: {
      fontWeight: 700,
      letterSpacing: 0,
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#fff7f7',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(139, 30, 36, 0.12)',
          boxShadow: '0 18px 50px rgba(98, 18, 24, 0.08)',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 38,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #d71920 0%, #a70f16 100%)',
          boxShadow: '0 10px 24px rgba(215, 25, 32, 0.22)',
          '&:hover': {
            background: 'linear-gradient(135deg, #e11d25 0%, #b1121a 100%)',
            boxShadow: '0 12px 28px rgba(215, 25, 32, 0.28)',
          },
        },
        outlined: {
          borderColor: 'rgba(139, 30, 36, 0.28)',
          color: '#a70f16',
          backgroundColor: '#fffafa',
          '&:hover': {
            borderColor: '#d71920',
            backgroundColor: '#fff0f0',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#fffdfd',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(215, 25, 32, 0.55)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d71920',
            borderWidth: 2,
          },
        },
        notchedOutline: {
          borderColor: 'rgba(139, 30, 36, 0.18)',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: '#a70f16',
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          overflow: 'hidden',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff0f0',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: '#6f1d24',
          fontSize: '0.74rem',
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        },
        root: {
          borderBottomColor: 'rgba(139, 30, 36, 0.11)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#fff8f8',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: '#d71920',
            '& + .MuiSwitch-track': {
              backgroundColor: '#d71920',
            },
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#a70f16',
          '&.Mui-checked': {
            color: '#d71920',
          },
        },
      },
    },
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
        <Route path="customers" element={<Customers />} />
        <Route path="orders" element={<Orders />} />
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
