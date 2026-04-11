import React, { useState } from 'react';
import { Box, Typography, Paper, Chip, Button, Avatar, IconButton, MenuItem, TextField } from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

const Variants = () => {
  const [filters, setFilters] = useState({
    product: '',
    size: '',
    color: '',
  });

  const variants = [
    {
      id: 'VAR-001',
      product: 'Yizer Premium Hoodie',
      color: 'Midnight Navy',
      colorCode: '#1a1a2e',
      size: 'XL',
      stock: 45,
    },
    {
      id: 'VAR-002',
      product: 'Yizer Premium Hoodie',
      color: 'Charcoal Grey',
      colorCode: '#36454f',
      size: 'L',
      stock: 32,
    },
    {
      id: 'VAR-003',
      product: 'Minimalist Cotton T-Shirt',
      color: 'Pure White',
      colorCode: '#ffffff',
      size: 'M',
      stock: 0,
    },
    {
      id: 'VAR-004',
      product: 'Tech-Shell Cargo Pants',
      color: 'Olive Green',
      colorCode: '#556b2f',
      size: '32',
      stock: 18,
    },
  ];

  const stats = [
    { label: 'Total Variants', value: '1,482', color: '#131b2e' },
    { label: 'Color Options', value: '24', color: '#131b2e' },
    { label: 'Out of Stock', value: '18', color: '#ba1a1a' },
  ];

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
          Products
        </Typography>
        <ChevronRightIcon sx={{ fontSize: 14, color: '#534341' }} />
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#131b2e' }}>
          Variants
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3, mb: 6 }}>
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
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', md: 'center' },
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, flex: 1, flexWrap: 'wrap' }}>
            <TextField
              select
              size="small"
              value={filters.product}
              onChange={(e) => setFilters({ ...filters, product: e.target.value })}
              sx={{
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#f8fafc',
                  borderRadius: '0.5rem',
                },
              }}
            >
              <MenuItem value="">All Products</MenuItem>
              <MenuItem value="1">Yizer Premium Hoodie</MenuItem>
              <MenuItem value="2">Minimalist Cotton T-Shirt</MenuItem>
              <MenuItem value="3">Tech-Shell Cargo Pants</MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              value={filters.size}
              onChange={(e) => setFilters({ ...filters, size: e.target.value })}
              sx={{
                minWidth: 120,
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#f8fafc',
                  borderRadius: '0.5rem',
                },
              }}
            >
              <MenuItem value="">All Sizes</MenuItem>
              <MenuItem value="XS">XS</MenuItem>
              <MenuItem value="S">S</MenuItem>
              <MenuItem value="M">M</MenuItem>
              <MenuItem value="L">L</MenuItem>
              <MenuItem value="XL">XL</MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              value={filters.color}
              onChange={(e) => setFilters({ ...filters, color: e.target.value })}
              sx={{
                minWidth: 140,
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#f8fafc',
                  borderRadius: '0.5rem',
                },
              }}
            >
              <MenuItem value="">All Colors</MenuItem>
              <MenuItem value="navy">Midnight Navy</MenuItem>
              <MenuItem value="grey">Charcoal Grey</MenuItem>
              <MenuItem value="white">Pure White</MenuItem>
              <MenuItem value="olive">Olive Green</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              sx={{
                borderColor: '#d8c2be',
                color: '#534341',
                '&:hover': { borderColor: '#d8c2be', bgcolor: 'rgba(241, 225, 223, 0.3)' },
              }}
            >
              <FilterIcon sx={{ mr: 1, fontSize: 18 }} />
              More Filters
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                bgcolor: '#dc2626',
                fontWeight: 600,
                '&:hover': { bgcolor: '#dc2626', opacity: 0.9 },
              }}
            >
              Add Variant
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
                  Color
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#534341', textTransform: 'uppercase' }}>
                  Size
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#534341', textTransform: 'uppercase' }}>
                  Stock
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#534341', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr
                  key={variant.id}
                  style={{ borderBottom: '1px solid rgba(216, 194, 191, 0.2)' }}
                >
                  <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: '#534341', fontWeight: 600 }}>
                    {variant.id}
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
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#131b2e' }}>
                        {variant.product}
                      </Typography>
                    </Box>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          bgcolor: variant.colorCode,
                          border: variant.colorCode === '#ffffff' ? '1px solid #d8c2be' : 'none',
                        }}
                      />
                      <Typography sx={{ fontSize: '0.875rem', color: '#131b2e' }}>
                        {variant.color}
                      </Typography>
                    </Box>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <Chip
                      label={variant.size}
                      sx={{
                        bgcolor: '#fee2e2',
                        color: '#991b1b',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    />
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: variant.stock === 0 ? '#ba1a1a' : '#131b2e',
                      }}
                    >
                      {variant.stock === 0 ? 'Out of Stock' : `${variant.stock} units`}
                    </Typography>
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
            Showing 1-4 of 1,482 variants
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" sx={{ color: '#534341' }}>
              <ChevronLeftIcon />
            </IconButton>
            {[1, 2, 3, '...', 14].map((page, index) => (
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
                  '&:hover': { bgcolor: page === 1 ? 'rgba(220, 38, 38, 0.05)' : 'rgba(241, 225, 223, 0.3)' },
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

      {/* Mobile FAB */}
      <Button
        variant="contained"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          minWidth: 'auto',
          borderRadius: '50%',
          bgcolor: '#dc2626',
          boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.3)',
          display: { xs: 'flex', md: 'none' },
          '&:hover': { bgcolor: '#dc2626', opacity: 0.9 },
        }}
      >
        <AddIcon />
      </Button>
    </Box>
  );
};

export default Variants;
