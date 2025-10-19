import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home } from '@mui/icons-material';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 200px)',
          textAlign: 'center',
          py: 8,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '4rem', md: '6rem' },
            fontWeight: 800,
            background: 'linear-gradient(90deg, #e11d48 0%, #0ea5a4 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            mb: 2,
          }}
        >
          404
        </Typography>
        
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}
        >
          Page Not Found
        </Typography>
        
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: '500px' }}
        >
          The page you are looking for doesn't exist or has been moved.
          Please check the URL or return to the homepage.
        </Typography>
        
        <Button
          variant="contained"
          size="large"
          startIcon={<Home />}
          onClick={() => navigate('/')}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            boxShadow: '0 4px 14px 0 rgba(225, 29, 72, 0.39)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(225, 29, 72, 0.5)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s',
          }}
        >
          Go to Homepage
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
