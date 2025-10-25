import React, { useEffect, useState } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  CircularProgress,
  Chip,
  Container,
} from '@mui/material';
import {
  PersonAdd,
  Bloodtype,
  AdminPanelSettings,
  Assignment,
  CheckCircle,
  AccountCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donorProfile, setDonorProfile] = useState<any>(null);
  const [checkingProfile, setCheckingProfile] = useState(false);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  useEffect(() => {
    if (user?.role === 'donor') {
      checkDonorProfile();
    }
  }, [user]);

  const checkDonorProfile = async () => {
    try {
      setCheckingProfile(true);
      const response = await axios.get('/api/donor/me');
      setDonorProfile(response.data);
    } catch (error: any) {
      // Not registered yet or error
      if (error.response?.status === 404) {
        setDonorProfile(null);
      }
    } finally {
      setCheckingProfile(false);
    }
  };

  const getDashboardCards = () => {
    if (!user) return [];

    switch (user.role) {
      case 'donor':
        // If donor profile exists, show profile card
        if (donorProfile) {
          return [
            {
              title: 'Your Donor Profile',
              description: `Blood Group: ${donorProfile.bloodGroup} | Total Donations: ${donorProfile.donationHistory?.length || 0}`,
              icon: <CheckCircle sx={{ fontSize: 40 }} />,
              action: 'View Profile',
              onClick: () => navigate('/donor-profile'),
              color: 'success',
              badge: 'Registered',
            },
          ];
        }
        // If not registered, show registration card
        return [
          {
            title: 'Register as Donor',
            description: 'Complete your donor profile to start saving lives',
            icon: <PersonAdd sx={{ fontSize: 40 }} />,
            action: 'Register Now',
            onClick: () => navigate('/donor-register'),
            color: 'primary',
            badge: 'Action Required',
          },
        ];
      
      case 'hospital':
      case 'external':
        return [
          {
            title: 'Request Blood',
            description: 'Submit a blood request',
            icon: <Bloodtype sx={{ fontSize: 40 }} />,
            action: 'Request',
            onClick: () => navigate('/blood-request'),
            color: 'secondary',
          },
          {
            title: 'View Requests',
            description: 'Check your request status',
            icon: <Assignment sx={{ fontSize: 40 }} />,
            action: 'View',
            onClick: () => navigate('/my-requests'),
            color: 'primary',
          },
        ];
      
      case 'admin':
        return [
          {
            title: 'Admin Panel',
            description: 'Manage the system',
            icon: <AdminPanelSettings sx={{ fontSize: 40 }} />,
            action: 'Admin',
            onClick: () => navigate('/admin'),
            color: 'primary',
          },
          {
            title: 'Inventory',
            description: 'Manage blood inventory',
            icon: <Bloodtype sx={{ fontSize: 40 }} />,
            action: 'Inventory',
            onClick: () => navigate('/admin/inventory'),
            color: 'secondary',
          },
          {
            title: 'Requests',
            description: 'Review blood requests',
            icon: <Assignment sx={{ fontSize: 40 }} />,
            action: 'Requests',
            onClick: () => navigate('/admin/requests'),
            color: 'primary',
          },
        ];
      
      default:
        return [];
    }
  };

  const cards = getDashboardCards();

  return (
    <Container maxWidth="lg">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ py: { xs: 2, md: 3 } }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ 
              userSelect: 'none',
              fontSize: { xs: '1.75rem', md: '2.125rem' },
              fontWeight: 700,
              background: 'linear-gradient(90deg, #e11d48 0%, #0ea5a4 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Welcome back, {user?.name}!
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary" 
            paragraph
            sx={{ 
              userSelect: 'none',
              fontSize: { xs: '0.875rem', md: '1rem' },
              fontWeight: 500
            }}
          >
            Role: {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown'}
          </Typography>
        </Box>
      </motion.div>

      {checkingProfile && user?.role === 'donor' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!checkingProfile && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: 2 }}>
            {cards.map((card, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div variants={fadeIn}>
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
                    borderColor: card.color === 'primary' ? '#e11d48' : card.color === 'secondary' ? '#0ea5a4' : '#16a34a',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  {(card as any).badge && (
                    <Box sx={{ mb: 1 }}>
                      <Chip 
                        label={(card as any).badge} 
                        color={(card as any).badge === 'Registered' ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                  )}
                  <Box sx={{ mb: 2, color: `${card.color}.main`, display: 'flex', justifyContent: 'center' }}>
                    {card.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, userSelect: 'none' }}>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ userSelect: 'none' }}>
                    {card.description}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    color={card.color as any}
                    onClick={card.onClick}
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
                    {card.action}
                  </Button>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </motion.div>
  )}
</Container>
  );
};

export default Dashboard;
