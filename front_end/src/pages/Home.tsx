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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Divider,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Bloodtype,
  PersonAdd,
  RequestPage,
  AdminPanelSettings,
  LocalCafe,
  CurrencyRupee,
  Favorite,
  ArrowForward,
  Schedule,
  CheckCircle,
  ExpandMore,
  LocalHospital,
  Security,
  Speed,
  Timeline,
  EmojiEvents,
  MonitorHeart,
  Scale,
  CalendarMonth,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedBloodType, setSelectedBloodType] = useState<string>('A+');
  const [expandedFaq, setExpandedFaq] = useState<string | false>(false);

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const bloodTypes = ['A+', 'O+', 'B+', 'AB+', 'A-', 'O-', 'B-', 'AB-'];

  // Eligibility Criteria Data
  const eligibilityCriteria = [
    { icon: <CalendarMonth sx={{ fontSize: 40 }} />, title: 'Age', value: '18-65 years', color: '#e11d48' },
    { icon: <Scale sx={{ fontSize: 40 }} />, title: 'Weight', value: 'Above 50kg', color: '#0ea5a4' },
    { icon: <MonitorHeart sx={{ fontSize: 40 }} />, title: 'Health', value: 'Good condition', color: '#f59e0b' },
    { icon: <Schedule sx={{ fontSize: 40 }} />, title: 'Frequency', value: 'Every 56 days', color: '#8b5cf6' },
  ];

  // Donation Process Steps
  const donationSteps = [
    'Registration & Documentation',
    'Health Screening',
    'Blood Donation (8-10 mins)',
    'Rest & Refreshments',
    'Certificate & Thank You',
  ];

  // Testimonials Data
  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Regular Donor',
      image: 'PS',
      text: 'Donating blood through Arts Blood Foundation has been an incredibly rewarding experience. The process is smooth and the staff is very caring. I\'ve donated 5 times so far!',
      rating: 5,
    },
    {
      name: 'Rajesh Kumar',
      role: 'Life Saved',
      image: 'RK',
      text: 'My father needed urgent B+ blood during his surgery. Thanks to this platform, we found a donor within 2 hours. Forever grateful to this initiative!',
      rating: 5,
    },
    {
      name: 'Dr. Anjali Reddy',
      role: 'Hospital Partner',
      image: 'AR',
      text: 'As a hospital administrator, this system has revolutionized how we manage blood requests. Real-time tracking and quick donor matching save precious time.',
      rating: 5,
    },
  ];

  // Trust Indicators / Partners
  const partners = [
    { name: 'IIITDM Kurnool', icon: <LocalHospital /> },
    { name: 'Health Ministry Verified', icon: <Security /> },
    { name: 'Fast Response', icon: <Speed /> },
    { name: 'ISO Certified', icon: <EmojiEvents /> },
  ];

  // FAQ Data
  const faqs = [
    {
      question: 'Does blood donation hurt?',
      answer: 'You may feel a slight pinch when the needle is inserted, but the process is generally painless. Most donors report minimal discomfort, similar to a routine blood test.',
    },
    {
      question: 'How long does the donation process take?',
      answer: 'The entire process takes about 45-60 minutes, including registration, screening, and rest time. The actual blood donation only takes 8-10 minutes.',
    },
    {
      question: 'Can I donate if I have a tattoo or piercing?',
      answer: 'Yes, you can donate blood if your tattoo or piercing was done at least 6 months ago at a licensed facility using sterile equipment.',
    },
    {
      question: 'Will I feel weak after donating blood?',
      answer: 'Most people feel fine after donating. We provide refreshments and recommend resting for 10-15 minutes. Your body replenishes the donated blood within 24-48 hours.',
    },
    {
      question: 'How often can I donate blood?',
      answer: 'You can donate whole blood every 56 days (8 weeks). This allows your body sufficient time to replenish red blood cells.',
    },
    {
      question: 'What should I do before donating blood?',
      answer: 'Eat a healthy meal, drink plenty of water, get adequate sleep, and avoid fatty foods 24 hours before donation. Bring a valid ID for registration.',
    },
  ];

  const handleFaqChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

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

  // Unified Animation System - Consistent throughout the page
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 }
  };

  const scaleIn = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  return (
    <Box sx={{ 
      mx: { xs: -2, sm: -2, md: 'calc(-50vw + 50%)' }, 
      width: { xs: 'calc(100% + 32px)', sm: 'calc(100% + 32px)', md: '100vw' }, 
      mb: 0,
      overflowX: 'hidden'
    }}>
      {/* Hero Section with Side-by-Side Layout */}
      <Box 
        sx={{ 
          mb: 0,
          background: 'linear-gradient(135deg, #e11d48 0%, #fb7185 40%, #0ea5a4 100%)',
          overflow: 'hidden',
          py: { xs: 4, sm: 6, md: 10 },
          px: { xs: 2, sm: 3, md: 4 },
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.9) 0%, rgba(251, 113, 133, 0.8) 40%, rgba(14, 165, 164, 0.9) 100%)',
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={{ xs: 3, sm: 3.5, md: 4 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInLeft}
                transition={{ duration: 0.6 }}
              >
              <Box sx={{ pr: { md: 2 }, userSelect: 'none' }}>
                <Typography
                  variant="h2"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: 'white',
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
                    mb: { xs: 1.5, md: 2 },
                    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                    userSelect: 'none',
                    cursor: 'default'
                  }}
                >
                  Arts Blood Foundation
                </Typography>
                <Typography 
                  variant="h5" 
                  paragraph 
                  sx={{ 
                    mb: { xs: 2.5, md: 4 },
                    fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.3rem', lg: '1.5rem' },
                    lineHeight: 1.6,
                    color: 'rgba(255,255,255,0.95)',
                    fontWeight: 500,
                    userSelect: 'none'
                  }}
                >
                  Connecting donors with those in need. Every drop counts.
                </Typography>
                <Typography 
                  variant="body1" 
                  paragraph 
                  sx={{ 
                    mb: { xs: 3, md: 4 }, 
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }, 
                    lineHeight: 1.8,
                    color: 'rgba(255,255,255,0.9)',
                    display: { xs: 'none', sm: 'block' },
                    userSelect: 'none'
                  }}
                >
                  Join our mission to save lives through blood donation. Your contribution can make a difference for someone in need.
                </Typography>
                <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2 }, flexWrap: 'wrap' }}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForward sx={{ display: { xs: 'none', sm: 'block' } }} />}
                      onClick={() => navigate('/register')}
                      sx={{
                        px: { xs: 2.5, sm: 3.5, md: 4 },
                        py: { xs: 1.2, sm: 1.4, md: 1.5 },
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                        bgcolor: 'white',
                        color: '#e11d48',
                        boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.25)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.9)',
                          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
                        },
                        transition: 'all 0.3s'
                      }}
                    >
                      Become a Donor
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/login')}
                      sx={{
                        px: { xs: 2.5, sm: 3.5, md: 4 },
                        py: { xs: 1.2, sm: 1.4, md: 1.5 },
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                        borderWidth: 2,
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': {
                          borderWidth: 2,
                          borderColor: 'white',
                          bgcolor: 'rgba(255,255,255,0.1)',
                        },
                        transition: 'all 0.3s'
                      }}
                    >
                      Login
                    </Button>
                  </motion.div>
                </Box>
              </Box>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInRight}
              transition={{ duration: 0.6 }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <motion.img
                  src="https://media.istockphoto.com/id/2154964150/photo/the-concept-of-donation-blood-transfusion.jpg?s=612x612&w=0&k=20&c=EPcXA2NNoTk6vRYRDIwAgXf9UFMKu1K2nlnCzoRtD64="
                  alt="Blood Donation - Saving Lives"
                  style={{
                    width: '100%',
                    maxWidth: '500px',
                    height: 'auto',
                    objectFit: 'cover',
                    borderRadius: '20px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
                  }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                />
              </Box>
            </motion.div>
          </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Impact & Mission Section - White Background Separator */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ bgcolor: 'white', py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <Grid container spacing={6} alignItems="center">
              {/* Left Side - Mission Statement */}
              <Grid item xs={12} md={6}>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInLeft}
                  transition={{ duration: 0.6 }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      mb: 3,
                      background: 'linear-gradient(90deg, #e11d48 0%, #0ea5a4 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      fontSize: { xs: '1.75rem', md: '2.5rem' }
                    }}
                  >
                    Every Drop Counts, Every Donor Matters
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '1rem', md: '1.15rem' },
                      lineHeight: 1.8,
                      color: '#475569',
                      mb: 3
                    }}
                  >
                    Blood donation is a simple act that can save up to three lives. Join thousands of donors who have already made a difference in their communities. Your contribution helps patients undergoing surgeries, cancer treatments, and emergency medical care.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#e11d48' }}>
                        24/7
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Available Service
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#0ea5a4' }}>
                        Safe
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        & Sterile Process
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#f59e0b' }}>
                        Free
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Health Checkup
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              </Grid>

              {/* Right Side - Quick Facts */}
              <Grid item xs={12} md={6}>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInRight}
                  transition={{ duration: 0.6 }}
                >
                  <Grid container spacing={3}>
                    {[
                      {
                        number: '1',
                        unit: 'Donation',
                        text: 'Can save up to 3 lives',
                        color: '#e11d48',
                        bgColor: '#fee2e2'
                      },
                      {
                        number: '120',
                        unit: 'Million',
                        text: 'Blood donations worldwide annually',
                        color: '#0ea5a4',
                        bgColor: '#ccfbf1'
                      },
                      {
                        number: '56',
                        unit: 'Days',
                        text: 'Minimum gap between donations',
                        color: '#f59e0b',
                        bgColor: '#fef3c7'
                      },
                      {
                        number: '30',
                        unit: 'Minutes',
                        text: 'Average donation time',
                        color: '#8b5cf6',
                        bgColor: '#ede9fe'
                      }
                    ].map((fact, index) => (
                      <Grid item xs={6} key={index}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            textAlign: 'center',
                            bgcolor: fact.bgColor,
                            borderRadius: 3,
                            border: '2px solid',
                            borderColor: fact.color + '40',
                            transition: 'all 0.3s',
                            '&:hover': {
                              transform: 'translateY(-8px)',
                              boxShadow: `0 12px 24px ${fact.color}30`
                            }
                          }}
                        >
                          <Typography
                            variant="h3"
                            sx={{
                              fontWeight: 900,
                              color: fact.color,
                              fontSize: { xs: '1.75rem', md: '2.5rem' }
                            }}
                          >
                            {fact.number}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              color: fact.color,
                              mb: 1
                            }}
                          >
                            {fact.unit}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#64748b',
                              fontSize: '0.85rem',
                              display: 'block'
                            }}
                          >
                            {fact.text}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </motion.div>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </motion.div>

      {/* 2. Eligibility Quick Check */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f9fafb' }}>
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h4"
              textAlign="center"
              gutterBottom
              sx={{
                fontWeight: 800,
                mb: 2,
                background: 'linear-gradient(90deg, #e11d48 0%, #0ea5a4 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                fontSize: { xs: '1.75rem', md: '2.5rem' }
              }}
            >
              Am I Eligible to Donate?
            </Typography>
            <Typography
              variant="body1"
              textAlign="center"
              sx={{ mb: 6, color: '#64748b', fontSize: { xs: '1rem', md: '1.1rem' } }}
            >
              Check if you meet the basic requirements for blood donation
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {eligibilityCriteria.map((criteria, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={scaleIn}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      bgcolor: 'white',
                      borderRadius: 3,
                      border: '2px solid #e5e7eb',
                      height: '100%',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 12px 32px ${criteria.color}30`,
                        borderColor: criteria.color,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: `${criteria.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        color: criteria.color,
                      }}
                    >
                      {criteria.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: criteria.color, mb: 1 }}>
                      {criteria.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#475569', fontWeight: 600 }}>
                      {criteria.value}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 3. Donation Process Timeline */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
        <Container maxWidth="md">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h4"
              textAlign="center"
              gutterBottom
              sx={{
                fontWeight: 800,
                mb: 2,
                background: 'linear-gradient(90deg, #e11d48 0%, #0ea5a4 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                fontSize: { xs: '1.75rem', md: '2.5rem' }
              }}
            >
              The Donation Process
            </Typography>
            <Typography
              variant="body1"
              textAlign="center"
              sx={{ mb: 6, color: '#64748b', fontSize: { xs: '1rem', md: '1.1rem' } }}
            >
              Simple, safe, and takes less than an hour
            </Typography>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Stepper orientation="vertical" sx={{ bgcolor: 'transparent' }}>
              {donationSteps.map((step, index) => (
                <Step key={index} active={true} completed={false}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        color: '#e11d48',
                        '&.Mui-active': { color: '#e11d48' },
                        '&.Mui-completed': { color: '#0ea5a4' },
                        fontSize: '2rem',
                      },
                    }}
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontSize: { xs: '1rem', md: '1.15rem' },
                        fontWeight: 600,
                        color: '#1f2937',
                      },
                    }}
                  >
                    {step}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Box sx={{ mt: 6, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/register')}
                sx={{
                  bgcolor: '#e11d48',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#b91c1c' },
                }}
              >
                Start Your Journey
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Learn About Donation Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        transition={{ duration: 0.6 }}
      >
        <Box
          sx={{
            py: { xs: 6, md: 8 },
            px: { xs: 2, md: 4 },
            background: 'linear-gradient(180deg, #0ea5a4 0%, #14b8a6 30%, #fb7185 70%, #e11d48 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Container maxWidth="lg">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
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
            </motion.div>

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
              {bloodTypes.map((type, index) => (
                <motion.div
                  key={type}
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Chip
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
                      },
                    }}
                  />
                </motion.div>
              ))}
            </Box>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <motion.img
                src="https://media.istockphoto.com/id/960659738/photo/world-blood-donor-day-june-14-doctor-hands-holding-red-heart-with-donor-sign-healthcare-and.jpg?s=612x612&w=0&k=20&c=jdzERTMRTlhhGjQeYid3Bo25XFTkuQrQwc1W54FWET4="
                alt="World Blood Donor Day - Doctor Hands Holding Red Heart"
                style={{
                  width: '100%',
                  maxWidth: '450px',
                  borderRadius: '16px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.03 }}
              />
            </Box>
            <Typography
              variant="h5"
              textAlign="center"
              sx={{ mt: 4, fontWeight: 700, color: '#991b1b' }}
            >
              One Blood Donation can save upto <strong>Three Lives</strong>
            </Typography>
          </Container>
        </Box>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ py: { xs: 4, sm: 6, md: 8 }, bgcolor: '#f9fafb' }}>
          <Container maxWidth="lg">
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              {[
                { label: 'Lives Saved', value: '1,250+', color: '#e11d48' },
                { label: 'Active Donors', value: '500+', color: '#0ea5a4' },
                { label: 'Partner Hospitals', value: '50+', color: '#f59e0b' },
              ].map((s, i) => (
                <Grid item xs={12} sm={4} key={i}>
                  <motion.div variants={scaleIn}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: { xs: 2.5, sm: 3, md: 4 },
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                        border: '1px solid #e5e7eb',
                        borderRadius: { xs: 2, md: 3 },
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
                          mb: 1,
                          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                        }}
                      >
                        {s.value}
                      </Typography>
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' } }}
                      >
                        {s.label}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </motion.div>

      {/* Features Section */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h4"
              component="h2"
              textAlign="center"
              gutterBottom
              sx={{ fontWeight: 700, userSelect: 'none', mb: 4 }}
            >
              What We Offer
            </Typography>
          </motion.div>
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mt: 2 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={scaleIn}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
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
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Inspirational Moving Boxes Section - Full Width with Continuous Scrolling */}
      <Box 
        sx={{ 
          bgcolor: 'white', 
          py: { xs: 8, md: 12 }, 
          overflow: 'hidden',
          mx: { xs: -2, sm: -2, md: 'calc(-50vw + 50%)' },
          width: { xs: 'calc(100% + 32px)', sm: 'calc(100% + 32px)', md: '100vw' }
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{
            fontWeight: 800,
            mb: 6,
            background: 'linear-gradient(90deg, #e11d48 0%, #0ea5a4 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            fontSize: { xs: '1.75rem', md: '2.5rem' }
          }}
        >
          Why Donate Blood?
        </Typography>

        {/* Horizontal Scrolling Container */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 3%, rgba(255,255,255,0) 97%, rgba(255,255,255,1) 100%)',
              zIndex: 1,
              pointerEvents: 'none'
            }
          }}
        >
          <motion.div
            animate={{
              x: ['0%', '-50%'],
            }}
            transition={{
              x: {
                duration: 30,
                repeat: Infinity,
                ease: "linear"
              }
            }}
            style={{
              display: 'flex',
              gap: '2rem',
              width: 'max-content',
              padding: '1rem 0'
            }}
          >
              {/* Box 1 - Hero Message */}
              <motion.div
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{ flex: '0 0 auto', width: '300px' }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    p: { xs: 3, md: 4 },
                    textAlign: 'center',
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)',
                    border: '2px solid #fecdd3',
                    transition: 'all 0.3s',
                    height: '100%',
                    minHeight: '280px'
                  }}
                >
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      bgcolor: '#fee2e2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <Favorite sx={{ fontSize: 40, color: '#e11d48' }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 1.5,
                      color: '#1f2937',
                      fontSize: { xs: '1.1rem', md: '1.25rem' }
                    }}
                  >
                    There is nothing better than saving a life
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#64748b',
                      fontWeight: 500,
                      fontSize: { xs: '0.9rem', md: '1rem' }
                    }}
                  >
                    Every blood donor is a hero
                  </Typography>
                </Paper>
              </motion.div>

              {/* Box 2 - Time Message */}
              <motion.div
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{ flex: '0 0 auto', width: '300px' }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    p: { xs: 3, md: 4 },
                    textAlign: 'center',
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)',
                    border: '2px solid #99f6e4',
                    transition: 'all 0.3s',
                    height: '100%',
                    minHeight: '280px'
                  }}
                >
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      bgcolor: '#ccfbf1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <Schedule sx={{ fontSize: 40, color: '#0ea5a4' }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 1.5,
                      color: '#1f2937',
                      fontSize: { xs: '1.1rem', md: '1.25rem' }
                    }}
                  >
                    It takes only an hour
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#64748b',
                      fontWeight: 500,
                      fontSize: { xs: '0.9rem', md: '1rem' }
                    }}
                  >
                    Donate blood save lives!
                  </Typography>
                </Paper>
              </motion.div>

              {/* Box 3 - Free Refreshments */}
              <motion.div
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{ flex: '0 0 auto', width: '300px' }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    p: { xs: 3, md: 4 },
                    textAlign: 'center',
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)',
                    border: '2px solid #fed7aa',
                    transition: 'all 0.3s',
                    height: '100%',
                    minHeight: '280px'
                  }}
                >
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      bgcolor: '#fef3c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <LocalCafe sx={{ fontSize: 40, color: '#8b7355' }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 1.5,
                      color: '#1f2937',
                      fontSize: { xs: '1.1rem', md: '1.25rem' }
                    }}
                  >
                    You will get free refreshments after donation
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#64748b',
                      fontWeight: 500,
                      fontSize: { xs: '0.9rem', md: '1rem' }
                    }}
                  >
                    Donation of blood is safe and healthy
                  </Typography>
                </Paper>
              </motion.div>

              {/* Box 4 - It Costs Nothing */}
              <motion.div
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{ flex: '0 0 auto', width: '300px' }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    p: { xs: 3, md: 4 },
                    textAlign: 'center',
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)',
                    border: '2px solid #a7f3d0',
                    transition: 'all 0.3s',
                    height: '100%',
                    minHeight: '280px'
                  }}
                >
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      bgcolor: '#d1fae5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <CurrencyRupee sx={{ fontSize: 40, color: '#8b7355' }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 1.5,
                      color: '#1f2937',
                      fontSize: { xs: '1.1rem', md: '1.25rem' }
                    }}
                  >
                    It costs nothing
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#64748b',
                      fontWeight: 500,
                      fontSize: { xs: '0.9rem', md: '1rem' }
                    }}
                  >
                    Give blood and stay healthy
                  </Typography>
                </Paper>
              </motion.div>

              {/* Box 5 - Save Lives */}
              <motion.div
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{ flex: '0 0 auto', width: '300px' }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    p: { xs: 3, md: 4 },
                    textAlign: 'center',
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #fef3f4 0%, #ffffff 100%)',
                    border: '2px solid #fca5a5',
                    transition: 'all 0.3s',
                    height: '100%',
                    minHeight: '280px'
                  }}
                >
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      bgcolor: '#fecaca',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <Favorite sx={{ fontSize: 40, color: '#dc2626' }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 1.5,
                      color: '#1f2937',
                      fontSize: { xs: '1.1rem', md: '1.25rem' }
                    }}
                  >
                    Save up to 3 lives
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#64748b',
                      fontWeight: 500,
                      fontSize: { xs: '0.9rem', md: '1rem' }
                    }}
                  >
                    One donation, multiple impacts
                  </Typography>
                </Paper>
              </motion.div>

              {/* Duplicate set for seamless loop - All 5 boxes repeated */}
              <motion.div whileHover={{ scale: 1.05, y: -10 }} transition={{ duration: 0.3 }} style={{ flex: '0 0 auto', width: '300px' }}>
                <Paper elevation={8} sx={{ p: { xs: 3, md: 4 }, textAlign: 'center', borderRadius: 4, background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)', border: '2px solid #fecdd3', transition: 'all 0.3s', height: '100%', minHeight: '280px' }}>
                  <Box sx={{ width: 70, height: 70, borderRadius: '50%', bgcolor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                    <Favorite sx={{ fontSize: 40, color: '#e11d48' }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, color: '#1f2937', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>There is nothing better than saving a life</Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500, fontSize: { xs: '0.9rem', md: '1rem' } }}>Every blood donor is a hero</Typography>
                </Paper>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05, y: -10 }} transition={{ duration: 0.3 }} style={{ flex: '0 0 auto', width: '300px' }}>
                <Paper elevation={8} sx={{ p: { xs: 3, md: 4 }, textAlign: 'center', borderRadius: 4, background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)', border: '2px solid #99f6e4', transition: 'all 0.3s', height: '100%', minHeight: '280px' }}>
                  <Box sx={{ width: 70, height: 70, borderRadius: '50%', bgcolor: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                    <Schedule sx={{ fontSize: 40, color: '#0ea5a4' }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, color: '#1f2937', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>It takes only an hour</Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500, fontSize: { xs: '0.9rem', md: '1rem' } }}>Donate blood save lives!</Typography>
                </Paper>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05, y: -10 }} transition={{ duration: 0.3 }} style={{ flex: '0 0 auto', width: '300px' }}>
                <Paper elevation={8} sx={{ p: { xs: 3, md: 4 }, textAlign: 'center', borderRadius: 4, background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)', border: '2px solid #fed7aa', transition: 'all 0.3s', height: '100%', minHeight: '280px' }}>
                  <Box sx={{ width: 70, height: 70, borderRadius: '50%', bgcolor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                    <LocalCafe sx={{ fontSize: 40, color: '#8b7355' }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, color: '#1f2937', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>You will get free refreshments after donation</Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500, fontSize: { xs: '0.9rem', md: '1rem' } }}>Donation of blood is safe and healthy</Typography>
                </Paper>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05, y: -10 }} transition={{ duration: 0.3 }} style={{ flex: '0 0 auto', width: '300px' }}>
                <Paper elevation={8} sx={{ p: { xs: 3, md: 4 }, textAlign: 'center', borderRadius: 4, background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)', border: '2px solid #a7f3d0', transition: 'all 0.3s', height: '100%', minHeight: '280px' }}>
                  <Box sx={{ width: 70, height: 70, borderRadius: '50%', bgcolor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                    <CurrencyRupee sx={{ fontSize: 40, color: '#8b7355' }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, color: '#1f2937', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>It costs nothing</Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500, fontSize: { xs: '0.9rem', md: '1rem' } }}>Give blood and stay healthy</Typography>
                </Paper>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05, y: -10 }} transition={{ duration: 0.3 }} style={{ flex: '0 0 auto', width: '300px' }}>
                <Paper elevation={8} sx={{ p: { xs: 3, md: 4 }, textAlign: 'center', borderRadius: 4, background: 'linear-gradient(135deg, #fef3f4 0%, #ffffff 100%)', border: '2px solid #fca5a5', transition: 'all 0.3s', height: '100%', minHeight: '280px' }}>
                  <Box sx={{ width: 70, height: 70, borderRadius: '50%', bgcolor: '#fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                    <Favorite sx={{ fontSize: 40, color: '#dc2626' }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, color: '#1f2937', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>Save up to 3 lives</Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500, fontSize: { xs: '0.9rem', md: '1rem' } }}>One donation, multiple impacts</Typography>
                </Paper>
              </motion.div>
            </motion.div>
          </Box>
      </Box>

      {/* 4. Testimonials/Success Stories Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f9fafb' }}>
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h4"
              textAlign="center"
              gutterBottom
              sx={{
                fontWeight: 800,
                mb: 2,
                background: 'linear-gradient(90deg, #e11d48 0%, #0ea5a4 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                fontSize: { xs: '1.75rem', md: '2.5rem' }
              }}
            >
              Stories That Inspire
            </Typography>
            <Typography
              variant="body1"
              textAlign="center"
              sx={{ mb: 6, color: '#64748b', fontSize: { xs: '1rem', md: '1.1rem' } }}
            >
              Real experiences from our donors and recipients
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  style={{ height: '100%' }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      height: '100%',
                      minHeight: { xs: 'auto', md: 400 },
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: 'white',
                      borderRadius: 3,
                      border: '2px solid #e5e7eb',
                      position: 'relative',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 32px rgba(225, 29, 72, 0.15)',
                        borderColor: '#e11d48',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: '#e11d48',
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          mr: 2,
                        }}
                      >
                        {testimonial.image}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#0ea5a4', fontWeight: 600 }}>
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#475569',
                        lineHeight: 1.8,
                        fontSize: '0.95rem',
                        fontStyle: 'italic',
                        mb: 2,
                        flexGrow: 1,
                      }}
                    >
                      "{testimonial.text}"
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 'auto' }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Favorite key={i} sx={{ fontSize: 18, color: '#e11d48' }} />
                      ))}
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 5. Trust Indicators / Partners */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h5"
              textAlign="center"
              gutterBottom
              sx={{
                fontWeight: 700,
                mb: 4,
                color: '#64748b',
                fontSize: { xs: '1.25rem', md: '1.5rem' }
              }}
            >
              Trusted by Healthcare Institutions
            </Typography>
          </motion.div>

          <Grid container spacing={3} justifyContent="center" alignItems="center">
            {partners.map((partner, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={scaleIn}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      bgcolor: '#f9fafb',
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                        borderColor: '#e11d48',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        color: '#e11d48',
                        mb: 1,
                        '& svg': { fontSize: 40 }
                      }}
                    >
                      {partner.icon}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: '#475569',
                        fontSize: { xs: '0.8rem', md: '0.9rem' }
                      }}
                    >
                      {partner.name}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* About Section with Image Grid */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        transition={{ duration: 0.6 }}
      >
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            px: { xs: 2, md: 4 },
            background: 'linear-gradient(135deg, #e11d48 0%, #fb7185 30%, #f472b6 60%, #0ea5a4 100%)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255, 255, 255, 0.97)',
              zIndex: 0
            }
          }}
        >
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
            >
              <Typography
                variant="h3"
                textAlign="center"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  background: 'linear-gradient(90deg, #e11d48 0%, #0ea5a4 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}
              >
                About Our Project
              </Typography>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography
                variant="h6"
                textAlign="center"
                sx={{ 
                  mb: 6, 
                  maxWidth: '800px', 
                  mx: 'auto',
                  color: '#475569',
                  fontWeight: 500,
                  fontSize: { xs: '1rem', md: '1.25rem' }
                }}
              >
                Making blood donation accessible, efficient, and life-saving
              </Typography>
            </motion.div>
        
            <Grid container spacing={4} alignItems="flex-end">
              <Grid item xs={12} md={6}>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInLeft}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Box sx={{ pr: { md: 4 } }}>
                    <Box 
                      sx={{ 
                        display: 'inline-block',
                        background: 'linear-gradient(135deg, #e11d48 0%, #0ea5a4 100%)',
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        mb: 4,
                        boxShadow: '0 4px 20px rgba(225, 29, 72, 0.3)',
                        transform: 'translateZ(0)',
                        '&:hover': {
                          boxShadow: '0 6px 25px rgba(225, 29, 72, 0.4)',
                        }
                      }}
                    >
                      <Typography
                        variant="h4"
                        sx={{ 
                          fontWeight: 800, 
                          color: 'white',
                          letterSpacing: '0.5px',
                          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                        }}
                      >
                        Our Mission
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      paragraph
                      sx={{ 
                        fontSize: { xs: '1.05rem', md: '1.15rem' }, 
                        lineHeight: 2, 
                        color: '#1f2937', 
                        mb: 3.5, 
                        textAlign: 'left',
                        fontWeight: 400,
                        fontFamily: '"Inter", "Roboto", sans-serif'
                      }}
                    >
                      The <strong style={{ color: '#e11d48', fontWeight: 700, fontSize: '1.2em' }}>Arts Blood Foundation</strong> is a comprehensive Blood Bank Management System
                      designed to bridge the gap between blood donors and those in urgent need. Our platform
                      streamlines the entire blood donation process, from donor registration to request
                      fulfillment, making it easier than ever to save lives.
                    </Typography>
                    <Typography
                      variant="body1"
                      paragraph
                      sx={{ 
                        fontSize: { xs: '1.05rem', md: '1.15rem' }, 
                        lineHeight: 2, 
                        color: '#1f2937', 
                        mb: 3.5, 
                        textAlign: 'left',
                        fontWeight: 400,
                        fontFamily: '"Inter", "Roboto", sans-serif'
                      }}
                    >
                      This system was developed as part of our academic project at{' '}
                      <strong style={{ color: '#0ea5a4', fontWeight: 700 }}>Indian Institute of Information Technology, Design and Manufacturing, Kurnool (IIITDM Kurnool)</strong>.
                      Our mission is to create a seamless, efficient, and life-saving platform that connects
                      donors with recipients, manages blood inventory, and ensures timely availability of
                      blood for medical emergencies.
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ 
                        fontSize: { xs: '1.05rem', md: '1.15rem' }, 
                        lineHeight: 2, 
                        color: '#1f2937', 
                        textAlign: 'left',
                        fontWeight: 400,
                        fontFamily: '"Inter", "Roboto", sans-serif'
                      }}
                    >
                      With features like <strong style={{ color: '#0ea5a4' }}>real-time inventory tracking</strong>, <strong style={{ color: '#e11d48' }}>donor management</strong>,
                      blood request processing, and proactive donor recruitment, we aim to revolutionize blood donation
                      and make healthcare more accessible to everyone.
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
              <Grid item xs={12} md={6}>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInRight}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        style={{
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: '20px',
                          boxShadow: '0 15px 40px rgba(225, 29, 72, 0.25)',
                          paddingBottom: '66.67%', // 3:2 aspect ratio
                          height: 0
                        }}
                      >
                        <img
                          src="https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=600&h=400&fit=crop"
                          alt="Blood Donation Center"
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            transition: 'transform 0.4s ease'
                          }}
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&h=400&fit=crop';
                          }}
                        />
                      </motion.div>
                    </Grid>
                    <Grid item xs={6}>
                      <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        style={{
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: '16px',
                          boxShadow: '0 10px 30px rgba(14, 165, 164, 0.2)',
                          paddingBottom: '100%', // 1:1 aspect ratio (square)
                          height: 0
                        }}
                      >
                        <img
                          src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=400&fit=crop"
                          alt="Healthcare Professional"
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            transition: 'transform 0.4s ease'
                          }}
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1581594549595-35f6edc7b762?w=400&h=400&fit=crop';
                          }}
                        />
                      </motion.div>
                    </Grid>
                    <Grid item xs={6}>
                      <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        style={{
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: '16px',
                          boxShadow: '0 10px 30px rgba(225, 29, 72, 0.2)',
                          paddingBottom: '100%', // 1:1 aspect ratio (square)
                          height: 0
                        }}
                      >
                        <img
                          src="https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=400&h=400&fit=crop"
                          alt="Blood Bags"
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            transition: 'transform 0.4s ease'
                          }}
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=400&h=400&fit=crop';
                          }}
                        />
                      </motion.div>
                    </Grid>
                  </Grid>
                </motion.div>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </motion.div>

      {/* 6. FAQ Accordion Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
        <Container maxWidth="md">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h4"
              textAlign="center"
              gutterBottom
              sx={{
                fontWeight: 800,
                mb: 2,
                background: 'linear-gradient(90deg, #e11d48 0%, #0ea5a4 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                fontSize: { xs: '1.75rem', md: '2.5rem' }
              }}
            >
              Frequently Asked Questions
            </Typography>
            <Typography
              variant="body1"
              textAlign="center"
              sx={{ mb: 6, color: '#64748b', fontSize: { xs: '1rem', md: '1.1rem' } }}
            >
              Everything you need to know about blood donation
            </Typography>
          </motion.div>

          <Box>
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Accordion
                  expanded={expandedFaq === `panel${index}`}
                  onChange={handleFaqChange(`panel${index}`)}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    border: '1px solid #e5e7eb',
                    boxShadow: 'none',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': {
                      margin: '0 0 16px 0',
                      borderColor: '#e11d48',
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: '#e11d48' }} />}
                    sx={{
                      '& .MuiAccordionSummary-content': {
                        my: 2,
                      },
                      '&:hover': {
                        bgcolor: '#fef2f2',
                      },
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#1f2937',
                        fontSize: { xs: '1rem', md: '1.1rem' },
                      }}
                    >
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, pb: 3 }}>
                    <Typography
                      sx={{
                        color: '#64748b',
                        lineHeight: 1.8,
                        fontSize: { xs: '0.95rem', md: '1rem' },
                      }}
                    >
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </motion.div>
            ))}
          </Box>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Box sx={{ mt: 6, textAlign: 'center', p: 4, bgcolor: '#f9fafb', borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1f2937' }}>
                Still have questions?
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: '#64748b' }}>
                Our support team is here to help you with any queries
              </Typography>
              <Button
                variant="outlined"
                size="large"
                onClick={() => {
                  const footer = document.querySelector('footer');
                  if (footer) {
                    footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                sx={{
                  borderColor: '#e11d48',
                  color: '#e11d48',
                  fontWeight: 600,
                  px: 4,
                  '&:hover': {
                    borderColor: '#b91c1c',
                    bgcolor: '#fef2f2',
                  },
                }}
              >
                Contact Support
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Call to Action */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={scaleIn}
        transition={{ duration: 0.6 }}
      >
        <Box
          sx={{
            pt: { xs: 6, sm: 7, md: 10 },
            pb: 0,
            px: { xs: 2, sm: 3, md: 4 },
            color: 'white',
            background: 'linear-gradient(135deg, #e11d48 0%, #fb7185 40%, #0ea5a4 100%)',
            position: 'relative',
            overflow: 'hidden',
            mb: 0,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.95) 0%, rgba(251, 113, 133, 0.85) 40%, rgba(14, 165, 164, 0.95) 100%)',
              zIndex: 0
            }
          }}
        >
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center', pb: { xs: 6, sm: 7, md: 10 } }}>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                userSelect: 'none', 
                mb: 2,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.125rem' }
              }}
            >
              Ready to Make a Difference?
            </Typography>
            <Typography 
              variant="h6" 
              paragraph 
              sx={{ 
                userSelect: 'none', 
                mb: { xs: 3, md: 4 },
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
              }}
            >
              Join thousands of donors who are saving lives every day
            </Typography>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward sx={{ display: { xs: 'none', sm: 'block' } }} />}
                sx={{ 
                  bgcolor: 'white', 
                  color: '#e11d48', 
                  px: { xs: 2.5, sm: 3.5, md: 5 },
                  py: { xs: 1.5, sm: 1.75, md: 2 },
                  fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.95)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                  } 
                }}
                onClick={() => navigate('/register')}
              >
                Start Donating Today
              </Button>
            </motion.div>
          </Container>
        </Box>
      </motion.div>
    </Box>
  );
};

export default Home;
