import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, InputAdornment, IconButton } from '@mui/material';
import {
  Badge as BadgeIcon,
  Mail as MailIcon,
  Call as CallIcon,
  AdminPanelSettings as ShieldPersonIcon,
  Visibility as VisibilityIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  VerifiedUser as VerifiedUserIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

const NewAdministrator = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
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
        <Typography
          component="a"
          href="/administrators"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: '#534341',
            textDecoration: 'none',
            '&:hover': { color: '#dc2626' },
          }}
        >
          Administrators
        </Typography>
        <ChevronRightIcon sx={{ fontSize: 14, color: '#534341' }} />
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#201a19' }}>
          New Administrator
        </Typography>
      </Box>

      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: '2rem', md: '2.75rem' },
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: '#201a19',
            lineHeight: 1,
          }}
        >
          New Administrator
        </Typography>
        <Typography sx={{ mt: 2, color: '#534341', fontSize: '1.125rem', maxWidth: 672 }}>
          Grant elevated access to the Yizer ecosystem.
        </Typography>
      </Box>

      {/* Form Card */}
      <Paper
        sx={{
          borderRadius: '0.75rem',
          p: { xs: 6, md: 10 },
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          border: '1px solid rgba(216, 194, 191, 0.1)',
          bgcolor: '#ffffff',
        }}
      >
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 5 }}>
            {/* Full Name */}
            <Box>
              <Typography
                component="label"
                htmlFor="fullName"
                sx={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#534341',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  mb: 1,
                }}
              >
                Full Name
              </Typography>
              <TextField
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Julian Casablancas"
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <BadgeIcon sx={{ color: 'rgba(133, 115, 113, 0.3)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fff1f1',
                    borderRadius: '0.5rem',
                    border: '2px solid transparent',
                    py: 1.5,
                    px: 2,
                    '&:hover': { bgcolor: '#fff1f1' },
                    '&.Mui-focused': {
                      bgcolor: '#ffffff',
                      borderColor: '#dc2626',
                    },
                    '& fieldset': { border: 'none' },
                  },
                  '& .MuiInputBase-input': {
                    color: '#201a19',
                    fontSize: '0.875rem',
                  },
                }}
              />
            </Box>

            {/* Email */}
            <Box>
              <Typography
                component="label"
                htmlFor="email"
                sx={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#534341',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  mb: 1,
                }}
              >
                Email <span style={{ color: '#dc2626', fontWeight: 900 }}>*</span>
              </Typography>
              <TextField
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                required
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <MailIcon sx={{ color: 'rgba(133, 115, 113, 0.3)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fff1f1',
                    borderRadius: '0.5rem',
                    border: '2px solid transparent',
                    py: 1.5,
                    px: 2,
                    '&:hover': { bgcolor: '#fff1f1' },
                    '&.Mui-focused': {
                      bgcolor: '#ffffff',
                      borderColor: '#dc2626',
                    },
                    '& fieldset': { border: 'none' },
                  },
                  '& .MuiInputBase-input': {
                    color: '#201a19',
                    fontSize: '0.875rem',
                  },
                }}
              />
              <Typography
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.65rem',
                  color: '#534341',
                  mt: 1,
                }}
              >
                <InfoIcon sx={{ fontSize: 12, mr: 0.5 }} />
                Required for identity verification and login.
              </Typography>
            </Box>

            {/* Phone */}
            <Box>
              <Typography
                component="label"
                htmlFor="phone"
                sx={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#534341',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  mb: 1,
                }}
              >
                Phone Number
              </Typography>
              <TextField
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <CallIcon sx={{ color: 'rgba(133, 115, 113, 0.3)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fff1f1',
                    borderRadius: '0.5rem',
                    border: '2px solid transparent',
                    py: 1.5,
                    px: 2,
                    '&:hover': { bgcolor: '#fff1f1' },
                    '&.Mui-focused': {
                      bgcolor: '#ffffff',
                      borderColor: '#dc2626',
                    },
                    '& fieldset': { border: 'none' },
                  },
                  '& .MuiInputBase-input': {
                    color: '#201a19',
                    fontSize: '0.875rem',
                  },
                }}
              />
            </Box>

            {/* Role Assignment Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, pt: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: 'rgba(220, 38, 38, 0.1)',
                  borderRadius: '50%',
                }}
              >
                <ShieldPersonIcon sx={{ color: '#dc2626' }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#201a19' }}>
                  Role Assignment
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#534341' }}>
                  Defaults to standard 'Admin' level access.
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Security Credentials Section */}
          <Box sx={{ pt: 6, mt: 6, borderTop: '1px solid rgba(216, 194, 191, 0.1)' }}>
            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: 900,
                color: '#534341',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                mb: 4,
              }}
            >
              Security Credentials
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 5 }}>
              {/* Password */}
              <Box>
                <Typography
                  component="label"
                  htmlFor="password"
                  sx={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#534341',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 1,
                  }}
                >
                  Password <span style={{ color: '#dc2626', fontWeight: 900 }}>*</span>
                </Typography>
                <TextField
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: 'rgba(133, 115, 113, 0.3)', '&:hover': { color: '#dc2626' } }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#fff1f1',
                      borderRadius: '0.5rem',
                      border: '2px solid transparent',
                      py: 1.5,
                      px: 2,
                      '&:hover': { bgcolor: '#fff1f1' },
                      '&.Mui-focused': {
                        bgcolor: '#ffffff',
                        borderColor: '#dc2626',
                      },
                      '& fieldset': { border: 'none' },
                    },
                    '& .MuiInputBase-input': {
                      color: '#201a19',
                      fontSize: '0.875rem',
                    },
                  }}
                />
                {/* Password Strength Indicator */}
                <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                  <Box sx={{ flex: 1, height: 4, bgcolor: '#fceae8', borderRadius: 9999, overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: '33%', bgcolor: '#ba1a1a' }} />
                  </Box>
                  <Box sx={{ flex: 1, height: 4, bgcolor: '#fceae8', borderRadius: 9999 }} />
                  <Box sx={{ flex: 1, height: 4, bgcolor: '#fceae8', borderRadius: 9999 }} />
                </Box>
                <Typography
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.65rem',
                    color: '#ba1a1a',
                    fontWeight: 500,
                    mt: 1,
                  }}
                >
                  <ErrorIcon sx={{ fontSize: 12, mr: 0.5 }} />
                  Password is too weak.
                </Typography>
              </Box>

              {/* Confirm Password */}
              <Box>
                <Typography
                  component="label"
                  htmlFor="confirmPassword"
                  sx={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#534341',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 1,
                  }}
                >
                  Confirm Password <span style={{ color: '#dc2626', fontWeight: 900 }}>*</span>
                </Typography>
                <TextField
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          sx={{ color: 'rgba(133, 115, 113, 0.3)' }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#fff1f1',
                      borderRadius: '0.5rem',
                      border: '2px solid transparent',
                      py: 1.5,
                      px: 2,
                      '&:hover': { bgcolor: '#fff1f1' },
                      '&.Mui-focused': {
                        bgcolor: '#ffffff',
                        borderColor: '#dc2626',
                      },
                      '& fieldset': { border: 'none' },
                    },
                    '& .MuiInputBase-input': {
                      color: '#201a19',
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Footer Actions */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 3,
              mt: 6,
              pt: 6,
              borderTop: '1px solid rgba(216, 194, 191, 0.2)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, color: '#534341' }}>
              <VerifiedUserIcon sx={{ color: '#dc2626', fontSize: 20 }} />
              <Typography sx={{ fontSize: '0.75rem', lineHeight: 1.75, maxWidth: 320 }}>
                By clicking Save, an invitation will be sent to the administrator's email.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
              <Button
                type="button"
                sx={{
                  flex: { xs: 1, sm: 'none' },
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
                  flex: { xs: 1, sm: 'none' },
                  px: 6,
                  py: 1.75,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  bgcolor: '#dc2626',
                  boxShadow: '0 20px 25px -5px rgba(220, 38, 38, 0.3)',
                  '&:hover': { bgcolor: '#dc2626', opacity: 0.9 },
                  '&:active': { transform: 'scale(0.95)' },
                }}
              >
                Save Administrator
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default NewAdministrator;
