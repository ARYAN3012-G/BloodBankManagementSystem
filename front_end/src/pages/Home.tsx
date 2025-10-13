import React, { useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Paper,
} from '@mui/material';
import {
  Bloodtype,
  PersonAdd,
  RequestPage,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      title: 'Register as Donor',
      description: 'Join our community of blood donors and save lives',
      icon: <PersonAdd sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: 'Register',
      onClick: () => navigate('/register'),
    },
    {
      title: 'Request Blood',
      description: 'Need blood for medical purposes? Request here',
      icon: <Bloodtype sx={{ fontSize: 40, color: 'secondary.main' }} />,
      action: 'Request',
      onClick: () => navigate('/blood-request'),
    },
    {
      title: 'View Requests',
      description: 'See current blood requests and help fulfill them',
      icon: <RequestPage sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: 'View',
      onClick: () => navigate('/dashboard'),
    },
    {
      title: 'Admin Panel',
      description: 'Manage inventory and approve requests',
      icon: <AdminPanelSettings sx={{ fontSize: 40, color: 'secondary.main' }} />,
      action: 'Admin',
      onClick: () => navigate('/admin'),
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box textAlign="center" sx={{ mb: { xs: 6, md: 8 }, mt: 2, px: { xs: 2, sm: 0 } }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(90deg, #e11d48 0%, #0ea5a4 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            userSelect: 'none',
          }}
        >
          Arts Blood Foundation
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph sx={{ userSelect: 'none' }}>
          Connecting donors with those in need. Every drop counts.
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', px: { xs: 2, sm: 0 } }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              px: { xs: 3, md: 4 },
              py: 1.5,
              fontSize: { xs: '1rem', md: '1.1rem' },
              boxShadow: '0 4px 14px 0 rgba(225, 29, 72, 0.39)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(225, 29, 72, 0.5)',
              }
            }}
          >
            Become a Donor
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/login')}
            sx={{
              px: { xs: 3, md: 4 },
              py: 1.5,
              fontSize: { xs: '1rem', md: '1.1rem' },
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                bgcolor: 'rgba(225, 29, 72, 0.04)',
              }
            }}
          >
            Login
          </Button>
        </Box>
      </Box>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 6, px: { xs: 1, sm: 0 } }}>
        {[
          { label: 'Lives Saved', value: '1,250+' },
          { label: 'Active Donors', value: '500+' },
          { label: 'Partner Hospitals', value: '50+' },
        ].map((s, i) => (
          <Grid item xs={12} sm={4} key={i}>
            <Paper
              sx={{
                p: { xs: 2, md: 3 },
                textAlign: 'center',
                backgroundColor: 'rgba(255,255,255,0.7)',
                backdropFilter: 'saturate(180%) blur(8px)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Typography variant="h3" color="primary" fontWeight={800} sx={{ userSelect: 'none' }}>
                {s.value}
              </Typography>
              <Typography variant="h6" sx={{ userSelect: 'none' }}>{s.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Features Section */}
      <Typography 
        variant="h4" 
        component="h2" 
        textAlign="center" 
        gutterBottom
        sx={{ fontWeight: 700, userSelect: 'none', mb: 4, px: { xs: 2, sm: 0 } }}
      >
        What We Offer
      </Typography>
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mt: 2, px: { xs: 1, sm: 0 } }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #e2e8f0',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(2,6,23,0.08)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, userSelect: 'none' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ userSelect: 'none' }}>
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button 
                  size="medium" 
                  onClick={feature.onClick}
                  sx={{ fontWeight: 600 }}
                >
                  {feature.action}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Call to Action */}
      <Box
        textAlign="center"
        sx={{
          mt: { xs: 6, md: 8 },
          p: { xs: 3, md: 4 },
          mx: { xs: 1, sm: 0 },
          borderRadius: 2,
          color: 'white',
          background: 'linear-gradient(90deg, #e11d48 0%, #fb7185 50%, #0ea5a4 100%)',
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, userSelect: 'none' }}>
          Ready to Make a Difference?
        </Typography>
        <Typography variant="h6" paragraph sx={{ userSelect: 'none' }}>
          Join thousands of donors who are saving lives every day
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{ 
            bgcolor: 'white', 
            color: 'primary.main', 
            px: { xs: 3, md: 4 },
            py: 1.5,
            fontSize: { xs: '1rem', md: '1.1rem' },
            fontWeight: 600,
            '&:hover': { 
              bgcolor: 'grey.100',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
            } 
          }}
          onClick={() => navigate('/register')}
        >
          Start Donating Today
        </Button>
      </Box>
    </Box>
  );
};

export default Home;
