import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Alert, Paper, InputAdornment, IconButton } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Visibility, VisibilityOff, ArrowForward, AdminPanelSettings, VerifiedUser } from '@mui/icons-material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      navigate('/products');
    } else {
      setError(result.error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff8f7',
        position: 'relative',
        overflow: 'hidden',
        p: 3,
      }}
    >
      {/* Decorative Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '40%',
          height: '40%',
          borderRadius: '50%',
          background: 'rgba(255, 218, 214, 0.3)',
          filter: 'blur(120px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '40%',
          height: '40%',
          borderRadius: '50%',
          background: 'rgba(255, 218, 214, 0.2)',
          filter: 'blur(120px)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 10 }}>
        {/* Login Card */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: '0.75rem',
            boxShadow: '0 20px 40px -10px rgba(32,26,25,0.08)',
            overflow: 'hidden',
            background: '#ffffff',
          }}
        >
          <Box sx={{ p: { xs: 4, md: 6 } }}>
            {/* Brand Header */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 5 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.2)',
                }}
              >
                <AdminPanelSettings sx={{ color: '#ffffff', fontSize: 32 }} />
              </Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-0.025em',
                  color: '#dc2626',
                  lineHeight: 1,
                }}
              >
                Yizer
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#534341',
                  fontWeight: 500,
                  mt: 1,
                  fontSize: '0.875rem',
                }}
              >
                Admin Console
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Email Field */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    color: '#534341',
                    textTransform: 'uppercase',
                    mb: 1,
                    px: 0.5,
                    fontSize: '0.75rem',
                  }}
                >
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail sx={{ color: '#857371', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fff1f0',
                      borderRadius: '0.5rem',
                      border: 'none',
                      padding: '0.875rem',
                      paddingLeft: '0.75rem',
                      '& fieldset': { border: 'none' },
                      '&:hover fieldset': { border: 'none' },
                      '&.Mui-focused fieldset': { border: 'none' },
                    },
                    '& .MuiInputBase-input': {
                      color: '#201a19',
                      '&::placeholder': {
                        color: '#857371',
                      },
                    },
                  }}
                />
              </Box>

              {/* Password Field */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, px: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      color: '#534341',
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                    }}
                  >
                    Password
                  </Typography>
                  <Button
                    size="small"
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#dc2626',
                      textTransform: 'none',
                      minWidth: 'auto',
                      p: 0,
                      '&:hover': {
                        backgroundColor: 'transparent',
                        color: '#dc2626',
                      },
                    }}
                  >
                    Forgot password?
                  </Button>
                </Box>
                <TextField
                  fullWidth
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#857371', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{
                            color: '#857371',
                            padding: 0,
                            '&:hover': {
                              backgroundColor: 'transparent',
                              color: '#534341',
                            },
                          }}
                        >
                          {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fff1f0',
                      borderRadius: '0.5rem',
                      border: 'none',
                      padding: '0.875rem',
                      paddingLeft: '0.75rem',
                      '& fieldset': { border: 'none' },
                      '&:hover fieldset': { border: 'none' },
                      '&.Mui-focused fieldset': { border: 'none' },
                    },
                    '& .MuiInputBase-input': {
                      color: '#201a19',
                      '&::placeholder': {
                        color: '#857371',
                      },
                    },
                  }}
                />
              </Box>

              {error && <Alert severity="error">{error}</Alert>}

              {/* Login Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  py: 2,
                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                  borderRadius: '0.5rem',
                  fontWeight: 700,
                  fontSize: '1rem',
                  boxShadow: '0 20px 25px -5px rgba(220, 38, 38, 0.2)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                    opacity: 0.9,
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <span>Login</span>
                <ArrowForward sx={{ fontSize: 20 }} />
              </Button>
            </Box>

            {/* Footer Section */}
            <Box
              sx={{
                mt: 5,
                pt: 4,
                borderTop: '1px solid rgba(216, 194, 191, 0.15)',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  color: '#534341',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                <VerifiedUser sx={{ color: '#dc2626', fontSize: 18 }} />
                Secure Administrator Access
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Footer Links */}
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            justifyContent: 'center',
            gap: 3,
            alignItems: 'center',
          }}
        >
          <Button
            sx={{
              color: '#534341',
              fontWeight: 500,
              fontSize: '0.875rem',
              textTransform: 'none',
              minWidth: 'auto',
              p: 0,
              '&:hover': {
                backgroundColor: 'transparent',
                color: '#dc2626',
              },
            }}
          >
            Privacy Policy
          </Button>
          <Typography sx={{ color: '#d8c2bf' }}>•</Typography>
          <Button
            sx={{
              color: '#534341',
              fontWeight: 500,
              fontSize: '0.875rem',
              textTransform: 'none',
              minWidth: 'auto',
              p: 0,
              '&:hover': {
                backgroundColor: 'transparent',
                color: '#dc2626',
              },
            }}
          >
            Security Audit
          </Button>
          <Typography sx={{ color: '#d8c2bf' }}>•</Typography>
          <Button
            sx={{
              color: '#534341',
              fontWeight: 500,
              fontSize: '0.875rem',
              textTransform: 'none',
              minWidth: 'auto',
              p: 0,
              '&:hover': {
                backgroundColor: 'transparent',
                color: '#dc2626',
              },
            }}
          >
            Support
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;