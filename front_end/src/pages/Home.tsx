import React, { useEffect, useState } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Paper,
  Container,
  Chip,
} from '@mui/material';
import {
  Bloodtype,
  PersonAdd,
  RequestPage,
  AdminPanelSettings,
  LocalCafe,
  CurrencyRupee,
  Favorite,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedBloodType, setSelectedBloodType] = useState<string>('A+');

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const bloodTypes = ['A+', 'O+', 'B+', 'AB+', 'A-', 'O-', 'B-', 'AB-'];
  
  const bloodCompatibility: Record<string, { canTakeFrom: string[]; canGiveTo: string[] }> = {
    'A+': { canTakeFrom: ['O-', 'A-'], canGiveTo: ['A+', 'A-', 'AB+', 'AB-'] },
    'O+': { canTakeFrom: ['O-', 'A-'], canGiveTo: ['A+', 'A-', 'AB+', 'AB-'] },
    'B+': { canTakeFrom: ['O-', 'B-'], canGiveTo: ['B+', 'B-', 'AB+', 'AB-'] },
    'AB+': { canTakeFrom: ['O-', 'A-', 'B-', 'AB-'], canGiveTo: ['AB+', 'AB-'] },
    'A-': { canTakeFrom: ['O-', 'A-'], canGiveTo: ['A+', 'A-', 'AB+', 'AB-'] },
    'O-': { canTakeFrom: ['O-', 'A-'], canGiveTo: ['A+', 'A-', 'AB+', 'AB-'] },
    'B-': { canTakeFrom: ['O-', 'B-'], canGiveTo: ['B+', 'B-', 'AB+', 'AB-'] },
    'AB-': { canTakeFrom: ['O-', 'A-', 'B-', 'AB-'], canGiveTo: ['AB+', 'AB-'] },
  };

  const benefits = [
    {
      icon: <LocalCafe sx={{ fontSize: 48, color: '#8b7355' }} />,
      title: 'You will get free refreshments after donation',
      description: 'Donation of blood is safe and healthy',
    },
    {
      icon: <CurrencyRupee sx={{ fontSize: 48, color: '#8b7355' }} />,
      title: 'It costs nothing',
      description: 'Give blood and stay healthy',
    },
    {
      icon: <Favorite sx={{ fontSize: 48, color: '#8b7355' }} />,
      title: 'There is nothing better than saving a life',
      description: 'Every blood donor is a hero',
    },
  ];

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
      {/* Hero Section with Side-by-Side Layout */}
      <Box 
        sx={{ 
          mb: { xs: 6, md: 10 }, 
          mt: { xs: 2, md: 4 },
          background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
          borderRadius: 4,
          overflow: 'hidden',
          py: { xs: 4, md: 6 },
          px: { xs: 2, md: 4 }
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ pr: { md: 2 } }}>
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
                  fontSize: { xs: '2rem', md: '3rem' },
                  mb: 2
                }}
              >
                Arts Blood Foundation
              </Typography>
              <Typography 
                variant="h5" 
                color="text.secondary" 
                paragraph 
                sx={{ 
                  mb: 4,
                  fontSize: { xs: '1.1rem', md: '1.5rem' },
                  lineHeight: 1.6
                }}
              >
                Connecting donors with those in need. Every drop counts.
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                paragraph 
                sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8 }}
              >
                Join our mission to save lives through blood donation. Your contribution can make a difference for someone in need.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 14px 0 rgba(225, 29, 72, 0.39)',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(225, 29, 72, 0.5)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  Become a Donor
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      bgcolor: 'rgba(225, 29, 72, 0.04)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  Login
                </Button>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <img
                src="https://media.istockphoto.com/id/2154964150/photo/the-concept-of-donation-blood-transfusion.jpg?s=612x612&w=0&k=20&c=EPcXA2NNoTk6vRYRDIwAgXf9UFMKu1K2nlnCzoRtD64="
                alt="Blood Donation - Saving Lives"
                style={{
                  width: '100%',
                  maxWidth: '500px',
                  height: 'auto',
                  objectFit: 'cover',
                  borderRadius: '20px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Learn About Donation Section */}
      <Box
        sx={{
          mb: 8,
          mt: 6,
          py: 4,
          px: { xs: 2, md: 4 },
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #fca5a5 100%)',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Typography
          variant="h4"
          textAlign="center"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: '#7f1d1d',
            mb: 2.5,
          }}
        >
          Learn About Donation
        </Typography>

        <Typography variant="subtitle1" textAlign="center" sx={{ mb: 2.5, color: '#991b1b', fontWeight: 600 }}>
          Select your Blood Type
        </Typography>

        {/* Blood Type Selector */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            justifyContent: 'center',
            flexWrap: 'wrap',
            mb: 3,
          }}
        >
          {bloodTypes.map((type) => (
            <Chip
              key={type}
              label={type}
              onClick={() => setSelectedBloodType(type)}
              sx={{
                fontSize: '0.95rem',
                fontWeight: 600,
                px: 1.5,
                py: 2.5,
                cursor: 'pointer',
                border: '2px solid',
                borderColor: selectedBloodType === type ? '#dc2626' : '#f3f4f6',
                bgcolor: selectedBloodType === type ? '#dc2626' : 'white',
                color: selectedBloodType === type ? 'white' : '#374151',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: selectedBloodType === type ? '#b91c1c' : '#fee2e2',
                  borderColor: '#dc2626',
                  transform: 'translateY(-2px)',
                },
              }}
            />
          ))}
        </Box>

        {/* Compatibility Info */}
        <Grid container spacing={2.5} sx={{ maxWidth: '800px', mx: 'auto' }}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 0.4,
                background: 'linear-gradient(135deg, #e11d48 0%, #fb7185 50%, #f472b6 100%)',
                borderRadius: 3,
                height: '100%',
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  bgcolor: 'white',
                  borderRadius: 2.5,
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 55,
                      height: 55,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(225, 29, 72, 0.4)',
                      flexShrink: 0,
                    }}
                  >
                    <Bloodtype sx={{ fontSize: 30, color: 'white' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#9f1239', mb: 0.5, fontSize: '0.95rem' }}>
                      You can take from
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#e11d48' }}>
                      {bloodCompatibility[selectedBloodType].canTakeFrom.map((type, idx) => (
                        <span key={idx}>
                          {type}
                          {idx < bloodCompatibility[selectedBloodType].canTakeFrom.length - 1 && <span style={{ display: 'inline-block', width: '10px' }}> </span>}
                        </span>
                      ))}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 0.4,
                background: 'linear-gradient(135deg, #0ea5a4 0%, #06b6d4 50%, #22d3ee 100%)',
                borderRadius: 3,
                height: '100%',
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  bgcolor: 'white',
                  borderRadius: 2.5,
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 55,
                      height: 55,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0ea5a4 0%, #06b6d4 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(14, 165, 164, 0.4)',
                      flexShrink: 0,
                    }}
                  >
                    <Bloodtype sx={{ fontSize: 30, color: 'white' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0e7490', mb: 0.5, fontSize: '0.95rem' }}>
                      You can give to
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0891b2' }}>
                      {bloodCompatibility[selectedBloodType].canGiveTo.map((type, idx) => (
                        <span key={idx}>
                          {type}
                          {idx < bloodCompatibility[selectedBloodType].canGiveTo.length - 1 && <span style={{ display: 'inline-block', width: '10px' }}> </span>}
                        </span>
                      ))}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <img
            src="https://media.istockphoto.com/id/960659738/photo/world-blood-donor-day-june-14-doctor-hands-holding-red-heart-with-donor-sign-healthcare-and.jpg?s=612x612&w=0&k=20&c=jdzERTMRTlhhGjQeYid3Bo25XFTkuQrQwc1W54FWET4="
            alt="World Blood Donor Day - Doctor Hands Holding Red Heart"
            style={{ 
              width: '100%',
              maxWidth: '450px',
              borderRadius: '16px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
            }}
          />
        </Box>
        <Typography
          variant="h5"
          textAlign="center"
          sx={{ mt: 4, fontWeight: 700, color: '#991b1b' }}
        >
          One Blood Donation can save upto <strong>Three Lives</strong>
        </Typography>
      </Box>

      {/* Benefits Section */}
      <Box sx={{ mb: 8, py: 6, bgcolor: '#5c4033', borderRadius: 3 }}>
        <Grid container spacing={3} sx={{ px: { xs: 2, md: 4 } }}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  bgcolor: 'white',
                  borderRadius: 3,
                  p: 3,
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <Box sx={{ mb: 2 }}>{benefit.icon}</Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 1, color: '#1f2937' }}
                >
                  {benefit.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {benefit.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 8, px: { xs: 1, sm: 0 } }}>
        {[
          { label: 'Lives Saved', value: '1,250+', color: '#e11d48' },
          { label: 'Active Donors', value: '500+', color: '#0ea5a4' },
          { label: 'Partner Hospitals', value: '50+', color: '#f59e0b' },
        ].map((s, i) => (
          <Grid item xs={12} sm={4} key={i}>
            <Paper
              elevation={2}
              sx={{
                p: { xs: 3, md: 4 },
                textAlign: 'center',
                background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                border: '1px solid #e5e7eb',
                borderRadius: 3,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                },
              }}
            >
              <Typography 
                variant="h2" 
                fontWeight={800} 
                sx={{ 
                  color: s.color,
                  mb: 1
                }}
              >
                {s.value}
              </Typography>
              <Typography variant="h6" color="text.secondary" fontWeight={600}>
                {s.label}
              </Typography>
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

      {/* About Section with Image Grid */}
      <Box
        sx={{
          mt: 10,
          mb: 10,
          py: 8,
          px: { xs: 2, md: 4 },
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          borderRadius: 4,
        }}
      >
        <Typography
          variant="h3"
          textAlign="center"
          gutterBottom
          sx={{ fontWeight: 700, mb: 2, color: '#065f46' }}
        >
          About Our Project
        </Typography>
        <Typography
          variant="h6"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}
        >
          Making blood donation accessible, efficient, and life-saving
        </Typography>
        
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ pr: { md: 2 } }}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{ fontWeight: 700, color: '#065f46', mb: 3 }}
              >
                Our Mission
              </Typography>
              <Typography
                variant="body1"
                paragraph
                sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#374151', mb: 3, textAlign: 'left' }}
              >
                The <strong>Arts Blood Foundation</strong> is a comprehensive Blood Bank Management System
                designed to bridge the gap between blood donors and those in urgent need. Our platform
                streamlines the entire blood donation process, from donor registration to request
                fulfillment, making it easier than ever to save lives.
              </Typography>
              <Typography
                variant="body1"
                paragraph
                sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#374151', mb: 3, textAlign: 'left' }}
              >
                This system was developed as part of our academic project at{' '}
                <strong>Indian Institute of Information Technology, Kurnool (IIIT Kurnool)</strong>.
                Our mission is to create a seamless, efficient, and life-saving platform that connects
                donors with recipients, manages blood inventory, and ensures timely availability of
                blood for medical emergencies.
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#374151', textAlign: 'left' }}
              >
                With features like real-time inventory tracking, donor management, blood request
                processing, and proactive donor recruitment, we aim to revolutionize blood donation
                and make healthcare more accessible to everyone.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <img
                  src="https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=600&h=400&fit=crop"
                  alt="Blood Donation Center"
                  style={{
                    width: '100%',
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                  }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&h=400&fit=crop';
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <img
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=300&h=300&fit=crop"
                  alt="Healthcare Professional"
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                  }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1581594549595-35f6edc7b762?w=300&h=300&fit=crop';
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <img
                  src="https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=300&h=300&fit=crop"
                  alt="Blood Bags"
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                  }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=300&h=300&fit=crop';
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* Call to Action */}
      <Box
        textAlign="center"
        sx={{
          mt: { xs: 6, md: 8 },
          mb: { xs: 6, md: 8 },
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
