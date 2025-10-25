import React from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
} from '@mui/material';
import {
  Inventory,
  Assignment,
  PersonAdd,
  Assessment,
  Bloodtype,
  AdminPanelSettings,
  Notifications,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();

  const adminActions = [
    {
      title: 'Manage Inventory',
      description: 'Add and manage blood inventory',
      icon: <Inventory sx={{ fontSize: 40 }} />,
      action: 'Inventory',
      onClick: () => navigate('/admin/inventory'),
      color: 'primary',
    },
    {
      title: 'Review Requests',
      description: 'Approve or reject blood requests',
      icon: <Assignment sx={{ fontSize: 40 }} />,
      action: 'Requests',
      onClick: () => navigate('/admin/requests'),
      color: 'secondary',
    },
    {
      title: 'Donor Management',
      description: 'View and manage donor profiles',
      icon: <PersonAdd sx={{ fontSize: 40 }} />,
      action: 'Donors',
      onClick: () => navigate('/admin/donors'),
      color: 'primary',
    },
    {
      title: 'Record Donation',
      description: 'Record blood collection from donors',
      icon: <Bloodtype sx={{ fontSize: 40 }} />,
      action: 'Record',
      onClick: () => navigate('/admin/record-donation'),
      color: 'error',
    },
    {
      title: 'Notifications',
      description: 'View all sent notifications and donor responses',
      icon: <Notifications sx={{ fontSize: 40 }} />,
      action: 'View',
      onClick: () => navigate('/admin/notifications'),
      color: 'info',
    },
    {
      title: 'Admin Approval',
      description: 'Approve or reject new admin registrations',
      icon: <AdminPanelSettings sx={{ fontSize: 40 }} />,
      action: 'Approve',
      onClick: () => navigate('/admin/admin-approval'),
      color: 'warning',
    },
    {
      title: 'Reports',
      description: 'View system reports and analytics',
      icon: <Assessment sx={{ fontSize: 40 }} />,
      action: 'Reports',
      onClick: () => navigate('/admin/reports'),
      color: 'secondary',
    },
  ];

  return (
    <Box sx={{ py: 4, px: { xs: 2, sm: 3 }, maxWidth: '1400px', mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <AdminPanelSettings sx={{ fontSize: { xs: 32, md: 40 }, color: 'primary.main' }} />
      </Box>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ 
          userSelect: 'none',
          fontSize: { xs: '1.75rem', md: '2.125rem' }
        }}
      >
        Admin Panel
      </Typography>
      <Typography 
        variant="subtitle1" 
        color="text.secondary" 
        paragraph
        sx={{ 
          userSelect: 'none',
          fontSize: { xs: '0.875rem', md: '1rem' }
        }}
      >
        Manage the Arts Blood Foundation system
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: 2 }}>
        {adminActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
                border: '1px solid #e2e8f0',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(2,6,23,0.08)',
                  borderColor: action.color === 'primary' ? '#e11d48' : '#0ea5a4',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2, color: `${action.color}.main`, display: 'flex', justifyContent: 'center' }}>
                  {action.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, userSelect: 'none' }}>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ userSelect: 'none' }}>
                  {action.description}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  color={action.color as any}
                  onClick={action.onClick}
                  fullWidth
                  sx={{ 
                    py: 1.2,
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    }
                  }}
                >
                  {action.action}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminPanel;
