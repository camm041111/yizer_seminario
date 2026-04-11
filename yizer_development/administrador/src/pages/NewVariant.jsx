import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, InputAdornment, MenuItem } from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

const NewVariant = () => {
  const [formData, setFormData] = useState({
    product: '',
    color: '',
    textura: '',
    size: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Box sx={{ maxWidth: 1024, mx: 'auto' }}>
      {/* Breadcrumbs */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
        {['Products', 'Variants', 'New Variant'].map((item, index) => (
          <React.Fragment key={item}>
            {index > 0 && <ChevronRightIcon sx={{ fontSize: 16, color: '#d8c2be' }} />}
            {index < 2 ? (
              <Typography
                component="a"
                href={`/${item.toLowerCase()}`}
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#534341',
                  textDecoration: 'none',
                  '&:hover': { color: '#dc2626' },
                }}
              >
                {item}
              </Typography>
            ) : (
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#131b2e' }}>
                {item}
              </Typography>
            )}
          </React.Fragment>
        ))}
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
            mb: 1.5,
          }}
        >
          Add New Variant
        </Typography>
        <Typography sx={{ color: '#534341' }}>
          Define a new SKU variant for your product catalog.
        </Typography>
      </Box>

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 672 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Product Selection */}
          <Box>
            <Typography
              component="label"
              htmlFor="product"
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
              Product Selection
            </Typography>
            <Paper
              sx={{
                position: 'relative',
                bgcolor: '#ffffff',
                border: '2px solid transparent',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                borderRadius: '0.5rem',
              }}
            >
              <TextField
                id="product"
                name="product"
                select
                value={formData.product}
                onChange={handleChange}
                placeholder="Select a base product..."
                fullWidth
                SelectProps={{
                  displayEmpty: true,
                  IconComponent: () => null,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    py: 1.5,
                    px: 2,
                    '& fieldset': { border: 'none' },
                  },
                  '& .MuiInputBase-input': {
                    color: '#131b2e',
                  },
                }}
              >
                <MenuItem value="" disabled>
                  Select a base product...
                </MenuItem>
                <MenuItem value="1">Yizer Premium Hoodie</MenuItem>
                <MenuItem value="2">Minimalist Cotton T-Shirt</MenuItem>
                <MenuItem value="3">Tech-Shell Cargo Pants</MenuItem>
              </TextField>
              <ExpandMoreIcon
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#857371',
                  pointerEvents: 'none',
                }}
              />
            </Paper>
          </Box>

          {/* Color and Textura */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography
                component="label"
                htmlFor="color"
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
                Color
              </Typography>
              <TextField
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="e.g. Midnight Navy"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#ffffff',
                    borderRadius: '0.5rem',
                    border: '2px solid transparent',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                    py: 1.5,
                    px: 2,
                    '&:hover': { bgcolor: '#ffffff' },
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

            <Box>
              <Typography
                component="label"
                htmlFor="textura"
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
                Textura
              </Typography>
              <TextField
                id="textura"
                name="textura"
                value={formData.textura}
                onChange={handleChange}
                placeholder="e.g. Smooth Cotton"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#ffffff',
                    borderRadius: '0.5rem',
                    border: '2px solid transparent',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                    py: 1.5,
                    px: 2,
                    '&:hover': { bgcolor: '#ffffff' },
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

          {/* Size */}
          <Box>
            <Typography
              component="label"
              htmlFor="size"
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
              Talla/Size
            </Typography>
            <TextField
              id="size"
              name="size"
              value={formData.size}
              onChange={handleChange}
              placeholder="e.g. XL or 42"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#ffffff',
                  borderRadius: '0.5rem',
                  border: '2px solid transparent',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                  py: 1.5,
                  px: 2,
                  '&:hover': { bgcolor: '#ffffff' },
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

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            sx={{
              px: 4,
              py: 2,
              fontSize: '0.875rem',
              fontWeight: 700,
              bgcolor: '#dc2626',
              color: '#ffffff',
              boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.2)',
              '&:hover': { bgcolor: '#dc2626', opacity: 0.9 },
              '&:active': { transform: 'scale(0.95)' },
            }}
          >
            Save Variant
          </Button>
          <Button
            type="button"
            sx={{
              px: 4,
              py: 2,
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#534341',
              '&:hover': { bgcolor: '#fceae8' },
              '&:active': { transform: 'scale(0.95)' },
            }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default NewVariant;
