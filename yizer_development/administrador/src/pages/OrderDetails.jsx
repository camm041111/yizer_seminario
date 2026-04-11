import React from 'react';
import { Box, Typography, Paper, Chip, Button, Divider, Avatar } from '@mui/material';
import {
  ChevronRight as ChevronRightIcon,
  Edit as EditIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  Timeline as TimelineIcon,
  Note as NoteIcon,
} from '@mui/icons-material';

const OrderDetails = () => {
  const order = {
    id: '12345',
    status: 'Pending',
    date: 'April 8, 2026 at 3:42 PM',
    customer: {
      name: 'Julian Casablancas',
      email: 'julian@yizer.com',
      phone: '+1 (555) 123-4567',
      address: '123 Fashion Street, NYC 10001',
    },
    items: [
      {
        id: 1,
        name: 'Yizer Premium Hoodie',
        variant: 'Midnight Navy / XL',
        customization: 'Embroidery: "YC" on chest',
        qty: 2,
        price: 245.00,
      },
      {
        id: 2,
        name: 'Tech-Shell Cargo Pants',
        variant: 'Olive Green / 32',
        customization: 'None',
        qty: 1,
        price: 189.00,
      },
    ],
    payment: {
      subtotal: 679.00,
      shipping: 15.00,
      tax: 2.61,
      total: 696.61,
    },
  };

  return (
    <Box sx={{ maxWidth: 1024, mx: 'auto' }}>
      {/* Breadcrumbs */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
        <Typography
          component="a"
          href="/orders"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: '#554343',
            textDecoration: 'none',
            '&:hover': { color: '#dc2626' },
          }}
        >
          Orders
        </Typography>
        <ChevronRightIcon sx={{ fontSize: 14, color: '#554343' }} />
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#2e1313' }}>
          Order #{order.id}
        </Typography>
      </Box>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 6 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.25rem' },
                fontWeight: 800,
                color: '#2e1313',
                letterSpacing: '-0.025em',
              }}
            >
              Order #{order.id}
            </Typography>
            <Chip
              label={order.status}
              sx={{
                bgcolor: '#fff2f2',
                color: '#a80000',
                fontWeight: 600,
                fontSize: '0.75rem',
                px: 1.5,
              }}
            />
          </Box>
          <Typography sx={{ color: '#554343', fontSize: '0.875rem' }}>
            Placed on {order.date}
          </Typography>
        </Box>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#dc2626',
            fontWeight: 600,
            '&:hover': { bgcolor: '#dc2626', opacity: 0.9 },
          }}
        >
          <EditIcon sx={{ mr: 1, fontSize: 18 }} />
          Change Status
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4 }}>
        {/* Left Column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Customer Information */}
          <Paper sx={{ p: 4, borderRadius: '0.75rem', border: '1px solid rgba(215, 195, 195, 0.3)' }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#2e1313',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <ShippingIcon sx={{ color: '#dc2626' }} />
              Customer Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#554343', mb: 1 }}>
                  Contact Info
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#2e1313', mb: 0.5 }}>
                  {order.customer.name}
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#554343' }}>
                  {order.customer.email}
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#554343' }}>
                  {order.customer.phone}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#554343', mb: 1 }}>
                  Shipping Address
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#554343', lineHeight: 1.6 }}>
                  {order.customer.address}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#554343', mb: 1 }}>
                  Payment Method
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CreditCardIcon sx={{ fontSize: 16, color: '#554343' }} />
                  <Typography sx={{ fontSize: '0.875rem', color: '#2e1313' }}>
                    Visa ending in 4242
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#554343', mb: 1 }}>
                  Shipping Method
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#2e1313' }}>
                  Express (2-3 business days)
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Order Items */}
          <Paper sx={{ p: 4, borderRadius: '0.75rem', border: '1px solid rgba(215, 195, 195, 0.3)' }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#2e1313',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <TimelineIcon sx={{ color: '#dc2626' }} />
              Order Items
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {order.items.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    gap: 3,
                    p: 3,
                    bgcolor: '#fff2f2',
                    borderRadius: '0.5rem',
                  }}
                >
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: '#ffe2e2',
                      color: '#dc2626',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    IMG
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#2e1313', mb: 0.5 }}>
                      {item.name}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#554343', mb: 0.5 }}>
                      Variant: {item.variant}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#554343', mb: 1 }}>
                      Customization: {item.customization}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#554343' }}>
                        Qty: {item.qty}
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#2e1313' }}>
                        ${(item.price * item.qty).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Internal Note */}
          <Paper sx={{ p: 4, borderRadius: '0.75rem', border: '1px solid rgba(215, 195, 195, 0.3)' }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#2e1313',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <NoteIcon sx={{ color: '#dc2626' }} />
              Internal Note
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#554343', lineHeight: 1.6 }}>
              Customer requested expedited processing. VIP member since 2024.
            </Typography>
          </Paper>
        </Box>

        {/* Right Column - Payment Summary */}
        <Box>
          <Paper sx={{ p: 4, borderRadius: '0.75rem', border: '1px solid rgba(215, 195, 195, 0.3)' }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#2e1313',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <PaymentIcon sx={{ color: '#dc2626' }} />
              Payment Summary
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.875rem', color: '#554343' }}>Subtotal</Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#2e1313' }}>
                  ${order.payment.subtotal.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.875rem', color: '#554343' }}>Shipping</Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#2e1313' }}>
                  ${order.payment.shipping.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.875rem', color: '#554343' }}>Tax</Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#2e1313' }}>
                  ${order.payment.tax.toFixed(2)}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#2e1313' }}>Total</Typography>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#dc2626' }}>
                  ${order.payment.total.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default OrderDetails;
