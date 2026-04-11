import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Switch, FormControlLabel, InputAdornment, Avatar } from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Info as InfoIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

const AddNewProduct = () => {
  const [active, setActive] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <Box sx={{ maxWidth: 1024, mx: 'auto' }}>
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
          New Product
        </Typography>
      </Box>

      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: '1.875rem', md: '2.25rem' },
            fontWeight: 900,
            letterSpacing: '-0.025em',
            color: '#131b2e',
            lineHeight: 1,
          }}
        >
          Add New Product
        </Typography>
        <Typography sx={{ mt: 2, color: '#534341' }}>
          Create a new product entry for the Yizer catalog.
        </Typography>
      </Box>

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit}>
        {/* Main Form Card */}
        <Paper
          sx={{
            p: { xs: 6, md: 8 },
            borderRadius: '0.75rem',
            border: '1px solid rgba(216, 194, 191, 0.3)',
            mb: 4,
          }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 5 }}>
            {/* Left Column */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Product Name */}
              <Box>
                <Typography
                  component="label"
                  htmlFor="name"
                  sx={{
                    display: 'block',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#534341',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 1,
                  }}
                >
                  Product Name
                </Typography>
                <TextField
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Yizer Premium Hoodie"
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#fff8f6',
                      borderRadius: '0.5rem',
                      border: '2px solid transparent',
                      py: 1.5,
                      px: 2,
                      '&:hover': { bgcolor: '#fff8f6' },
                      '&.Mui-focused': {
                        bgcolor: '#ffffff',
                        borderColor: '#dc2626',
                      },
                      '& fieldset': { border: 'none' },
                    },
                    '& .MuiInputBase-input': {
                      color: '#131b2e',
                    },
                  }}
                />
              </Box>

              {/* Description */}
              <Box>
                <Typography
                  component="label"
                  htmlFor="description"
                  sx={{
                    display: 'block',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#534341',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 1,
                  }}
                >
                  Description
                </Typography>
                <TextField
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the product features, materials, and fit..."
                  fullWidth
                  multiline
                  rows={5}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#fff8f6',
                      borderRadius: '0.5rem',
                      border: '2px solid transparent',
                      py: 1.5,
                      px: 2,
                      '&:hover': { bgcolor: '#fff8f6' },
                      '&.Mui-focused': {
                        bgcolor: '#ffffff',
                        borderColor: '#dc2626',
                      },
                      '& fieldset': { border: 'none' },
                    },
                    '& .MuiInputBase-input': {
                      color: '#131b2e',
                    },
                  }}
                />
              </Box>

              {/* Price */}
              <Box>
                <Typography
                  component="label"
                  htmlFor="price"
                  sx={{
                    display: 'block',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#534341',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 1,
                  }}
                >
                  Price (USD)
                </Typography>
                <TextField
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ color: '#534341', fontWeight: 600 }}>
                        $
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#fff8f6',
                      borderRadius: '0.5rem',
                      border: '2px solid transparent',
                      py: 1.5,
                      px: 2,
                      '&:hover': { bgcolor: '#fff8f6' },
                      '&.Mui-focused': {
                        bgcolor: '#ffffff',
                        borderColor: '#dc2626',
                      },
                      '& fieldset': { border: 'none' },
                    },
                    '& .MuiInputBase-input': {
                      color: '#131b2e',
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Right Column */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Active Toggle */}
              <Paper
                sx={{
                  p: 3,
                  bgcolor: '#fff8f6',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#131b2e', mb: 0.5 }}>
                    Product Status
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#534341' }}>
                    Make this product visible to customers
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#dc2626',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          bgcolor: '#dc2626',
                        },
                      }}
                    />
                  }
                  label={active ? 'Active' : 'Inactive'}
                  sx={{ ml: 0 }}
                />
              </Paper>

              {/* Product Media */}
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#534341',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 2,
                  }}
                >
                  Product Media
                </Typography>
                <Paper
                  sx={{
                    p: 4,
                    border: '2px dashed rgba(216, 194, 191, 0.5)',
                    borderRadius: '0.5rem',
                    textAlign: 'center',
                    bgcolor: '#fff8f6',
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 48, color: '#857371', mb: 2 }} />
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#131b2e', mb: 1 }}>
                    Click to upload or drag and drop
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#534341', mb: 2 }}>
                    SVG, PNG, JPG or GIF (max. 800x400px)
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    sx={{
                      borderColor: '#d8c2bf',
                      color: '#534341',
                      '&:hover': { borderColor: '#d8c2bf', bgcolor: 'rgba(245, 221, 219, 0.3)' },
                    }}
                  >
                    Browse Files
                    <input type="file" hidden />
                  </Button>
                </Paper>

                {/* Image Preview Placeholder */}
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: '#fceae8',
                      borderRadius: '0.5rem',
                    }}
                  >
                    IMG
                  </Avatar>
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: '#fceae8',
                      borderRadius: '0.5rem',
                    }}
                  >
                    IMG
                  </Avatar>
                </Box>
              </Box>

              {/* Tip */}
              <Paper
                sx={{
                  p: 3,
                  bgcolor: 'rgba(220, 38, 38, 0.05)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  gap: 2,
                }}
              >
                <InfoIcon sx={{ color: '#dc2626', flexShrink: 0 }} />
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#131b2e', mb: 0.5 }}>
                    Pro Tip
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#534341', lineHeight: 1.6 }}>
                    Use high-quality images showing the product from multiple angles. Include fabric composition and care instructions in the description.
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Paper>

        {/* Footer Actions */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            type="button"
            sx={{
              px: 4,
              py: 1.75,
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#534341',
              '&:hover': { bgcolor: '#fceae8' },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              px: 6,
              py: 1.75,
              fontSize: '0.875rem',
              fontWeight: 700,
              bgcolor: '#dc2626',
              boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.2)',
              '&:hover': { bgcolor: '#dc2626', opacity: 0.9 },
              '&:active': { transform: 'scale(0.95)' },
            }}
          >
            Save Product
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddNewProduct;
