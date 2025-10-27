import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { motion } from 'framer-motion';

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      setError('');
      await login(data.email, data.password);
      showSnackbar('Login successful! Welcome back.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Login failed';
      setError(errorMsg);
      showSnackbar(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper 
        elevation={0} 
        sx={{ 
          padding: 4, 
          maxWidth: 480, 
          width: '100%',
          border: '1px solid #e2e8f0',
          borderRadius: 3,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography 
            component="h1" 
            variant="h4" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(90deg, #e11d48 0%, #0ea5a4 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            🩸 Login
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back to Arts Blood Foundation
          </Typography>
        </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }} aria-label="Login form">
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              autoComplete="email"
              autoFocus
              inputProps={{
                'aria-label': 'Email address',
                'aria-required': 'true',
                'aria-invalid': !!errors.email
              }}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address',
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              inputProps={{
                'aria-label': 'Password',
                'aria-required': 'true',
                'aria-invalid': !!errors.password
              }}
              sx={{
                '& input::-ms-reveal': { display: 'none' },
                '& input::-ms-clear': { display: 'none' },
                '& input::-webkit-credentials-auto-fill-button': { display: 'none' },
                '& input::-webkit-contacts-auto-fill-button': { display: 'none' }
              }}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              mt: 3, 
              mb: 2,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: '0 4px 14px 0 rgba(225, 29, 72, 0.39)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(225, 29, 72, 0.5)',
              }
            }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
          <Box textAlign="center">
            <Link 
              component={RouterLink} 
              to="/register" 
              variant="body2"
              sx={{ 
                fontWeight: 500,
                '&:hover': {
                  color: 'primary.dark',
                }
              }}
            >
              Don't have an account? Sign Up
            </Link>
          </Box>
        </Box>
      </Paper>
      </motion.div>
    </Box>
  );
};

export default Login;
