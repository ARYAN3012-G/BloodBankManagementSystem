import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface DonorForm {
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  dob: string;
}

const DonorRegistration: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    try {
      const response = await axios.get('/api/donor/me');
      if (response.data) {
        // Already registered, redirect to dashboard
        navigate('/dashboard');
      }
    } catch (error: any) {
      // Not registered yet, show form
      if (error.response?.status === 404) {
        setCheckingExisting(false);
      }
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DonorForm>();

  const onSubmit = async (data: DonorForm) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await axios.post('/api/donor/register', {
        userId: user?.id,
        bloodGroup: data.bloodGroup,
        dob: data.dob,
      });

      setSuccess('Donor registration successful! Redirecting...');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
      setLoading(false);
    }
  };

  if (checkingExisting) {
    return (
      <Container component="main" maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            🩸 Donor Registration
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" paragraph>
            Complete your donor profile to start saving lives
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="blood-group-label">Blood Group</InputLabel>
              <Select
                labelId="blood-group-label"
                id="bloodGroup"
                label="Blood Group"
                {...register('bloodGroup', { required: 'Blood group is required' })}
                error={!!errors.bloodGroup}
              >
                <MenuItem value="A+">A+</MenuItem>
                <MenuItem value="A-">A-</MenuItem>
                <MenuItem value="B+">B+</MenuItem>
                <MenuItem value="B-">B-</MenuItem>
                <MenuItem value="AB+">AB+</MenuItem>
                <MenuItem value="AB-">AB-</MenuItem>
                <MenuItem value="O+">O+</MenuItem>
                <MenuItem value="O-">O-</MenuItem>
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              required
              fullWidth
              id="dob"
              label="Date of Birth"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              {...register('dob', {
                required: 'Date of birth is required',
              })}
              error={!!errors.dob}
              helperText={errors.dob?.message}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register as Donor'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default DonorRegistration;
