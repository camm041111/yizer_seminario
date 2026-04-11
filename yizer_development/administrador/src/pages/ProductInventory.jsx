import React, { useState } from 'react';
import { Box, Typography, Paper, Chip, Button, Avatar, IconButton, InputBase } from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

const ProductInventory = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const products = [
    {
      id: 'PRD-001',
      name: 'Yizer Premium Hoodie',
      description: 'Premium cotton blend with signature embroidery',
      price: 245.00,
      status: 'Active',
      image: null,
    },
    {
      id: 'PRD-002',
      name: 'Minimalist Cotton T-Shirt',
      description: '100% organic cotton, relaxed fit',
      price: 89.00,
      status: 'Active',
      image: null,
    },
    {
      id: 'PRD-003',
      name: 'Tech-Shell Cargo Pants',
      description: 'Water-resistant technical fabric',
      price: 189.00,
      status: 'Low Stock',
      image: null,
    },
    {
      id: 'PRD-004',
      name: 'Urban Explorer Jacket',
      description: 'Lightweight windbreaker with reflective details',
      price: 325.00,
      status: 'Out of Stock',
      image: null,
    },
  ];

  const stats = [
    { label: 'Total Products', value: '1,284', color: '#2e1313' },
    { label: 'Active SKUs', value: '1,140', color: '#2e1313' },
    { label: 'Out of Stock', value: '14', color: '#ba1a1a' },
    { label: 'Low Inventory', value: '32', color: '#bc4800' },
  ];

  const getStatusChip = (status) => {
    const colors = {
      Active: { bg: '#fff2f2', text: '#a80000' },
      'Low Stock': { bg: '#ffdbcd', text: '#943700' },
      'Out of Stock': { bg: '#fddada', text: '#ba1a1a' },
    };
    const { bg, text } = colors[status] || colors.Active;
    return (
      <Chip
        label={status}
        sx={{ bgcolor: bg, color: text, fontWeight: 600, fontSize: '0.75rem' }}
      />
    );
  };

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      {/* Breadcrumbs */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
        <Typography
          component="a"
          href="/products"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: '#534341',
            textDecoration: 'none',
            '&:hover': { color: '#dc2626' },
          }}
        >
          Inventory
        </Typography>
        <ChevronRightIcon sx={{ fontSize: 14, color: '#534341' }} />
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#201a19' }}>
          Products
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 6 }}>
        {stats.map((stat) => (
          <Paper
            key={stat.label}
            sx={{
              p: 3,
              borderRadius: '0.75rem',
              border: '1px solid rgba(216, 194, 191, 0.3)',
            }}
          >
            <Typography sx={{ fontSize: '0.75rem', color: '#534341', mb: 1 }}>
              {stat.label}
            </Typography>
            <Typography
              sx={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: stat.color,
                letterSpacing: '-0.025em',
              }}
            >
              {stat.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Main Content Card */}
      <Paper sx={{ borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid rgba(216, 194, 191, 0.3)' }}>
        {/* Filter Bar */}
        <Box
          sx={{
            p: 3,
            borderBottom: '1px solid rgba(216, 194, 191, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Paper
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#fff0f0',
              borderRadius: '0.5rem',
              px: 2,
              py: 0.5,
              flex: 1,
              maxWidth: 384,
            }}
          >
            <SearchIcon sx={{ color: '#857371', mr: 1 }} />
            <InputBase
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1, fontSize: '0.875rem' }}
            />
          </Paper>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              sx={{
                borderColor: '#d8c2bf',
                color: '#534341',
                '&:hover': { borderColor: '#d8c2bf', bgcolor: 'rgba(245, 221, 219, 0.3)' },
              }}
            >
              <FilterIcon sx={{ mr: 1, fontSize: 18 }} />
              Status: All
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#dc2626',
                fontWeight: 600,
                '&:hover': { bgcolor: '#dc2626', opacity: 0.9 },
              }}
            >
              Add Product
            </Button>
          </Box>
        </Box>

        {/* Table */}
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(216, 194, 191, 0.3)' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#534341', textTransform: 'uppercase' }}>
                  ID
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#534341', textTransform: 'uppercase' }}>
                  Product
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#534341', textTransform: 'uppercase' }}>
                  Price
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#534341', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#534341', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  style={{ borderBottom: '1px solid rgba(216, 194, 191, 0.2)' }}
                >
                  <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: '#534341', fontWeight: 600 }}>
                    {product.id}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        variant="rounded"
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: '#fceae8',
                          color: '#dc2626',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        IMG
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#201a19', mb: 0.25 }}>
                          {product.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#534341' }}>
                          {product.description}
                        </Typography>
                      </Box>
                    </Box>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '0.875rem', fontWeight: 600, color: '#201a19' }}>
                    ${product.price.toFixed(2)}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {getStatusChip(product.status)}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <IconButton size="small" sx={{ color: '#534341', mr: 1 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ color: '#534341' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        {/* Pagination */}
        <Box
          sx={{
            p: 3,
            borderTop: '1px solid rgba(216, 194, 191, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontSize: '0.875rem', color: '#534341' }}>
            Showing 1-4 of 1,284 products
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" sx={{ color: '#534341' }}>
              <ChevronLeftIcon />
            </IconButton>
            {[1, 2, 3, '...', 128].map((page, index) => (
              <Button
                key={index}
                size="small"
                sx={{
                  minWidth: 32,
                  height: 32,
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: page === 1 ? 700 : 500,
                  color: page === 1 ? '#dc2626' : '#534341',
                  bgcolor: page === 1 ? 'rgba(220, 38, 38, 0.05)' : 'transparent',
                  '&:hover': { bgcolor: page === 1 ? 'rgba(220, 38, 38, 0.05)' : 'rgba(245, 221, 219, 0.3)' },
                }}
              >
                {page}
              </Button>
            ))}
            <IconButton size="small" sx={{ color: '#534341' }}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProductInventory;
