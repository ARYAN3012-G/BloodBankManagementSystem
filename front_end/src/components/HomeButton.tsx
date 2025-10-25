import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface HomeButtonProps {
  position?: 'fixed' | 'absolute' | 'relative';
  top?: number | string;
  right?: number | string;
  size?: 'small' | 'medium' | 'large';
}

const HomeButton: React.FC<HomeButtonProps> = ({ 
  position = 'fixed', 
  top = 16, 
  right = 16,
  size = 'medium'
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleHomeClick = () => {
    // Always navigate to the front/landing page
    navigate('/');
  };

  return (
    <Tooltip title="Go to Home" placement="left">
      <IconButton
        onClick={handleHomeClick}
        size={size}
        sx={{
          position,
          top,
          right,
          zIndex: 1200,
          bgcolor: 'primary.main',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          '&:hover': {
            bgcolor: 'primary.dark',
            transform: 'scale(1.1)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <Home />
      </IconButton>
    </Tooltip>
  );
};

export default HomeButton;
