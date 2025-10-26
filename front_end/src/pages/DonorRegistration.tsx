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
  FormControlLabel,
  Checkbox,
  Grid,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { Person, Email, Phone, LocationOn, Favorite } from '@mui/icons-material';

interface DonorForm {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  address?: string;
  emergencyContact?: string;
  donorType: 'regular' | 'emergency' | 'flexible';
  availability: {
    weekdays: boolean;
    weekends: boolean;
    evenings: boolean;
    mornings: boolean;
  };
  preferredLocations: string[];
  maxDistanceKm: number;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    phone: boolean;
  };
  weight?: number;
  height?: number;
  medicalConditions?: string[];
  medications?: string[];
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
        navigate('/donor-dashboard');
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
    control,
    formState: { errors },
    watch,
  } = useForm<DonorForm>({
    defaultValues: {
      donorType: 'regular',
      availability: {
        weekdays: true,
        weekends: false,
        evenings: true,
        mornings: false,
      },
      preferredLocations: [],
      maxDistanceKm: 10,
      notificationPreferences: {
        email: true,
        sms: true,
        phone: false,
      },
    },
  });

  const onSubmit = async (data: DonorForm) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await axios.post('/api/donor/register', {
        bloodGroup: data.bloodGroup,
        dob: data.dateOfBirth,
        // Additional fields for enhanced registration
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        emergencyContact: data.emergencyContact,
        donorType: data.donorType,
        availability: data.availability,
        notificationPreferences: data.notificationPreferences,
        weight: data.weight,
        height: data.height,
        maxDistanceKm: data.maxDistanceKm
      });

      setSuccess('Donor registration successful! Redirecting...');

      // Redirect to donor dashboard after 2 seconds
      setTimeout(() => {
        navigate('/donor-dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
      setLoading(false);
    }
  };

  if (checkingExisting) {
    return (
      <Container component="main" maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md">
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
            Join our donor community and help save lives
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
            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1 }} />
                  Personal Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  {...register('name', { required: 'Name is required' })}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\+?[\d\s\-\(\)]+$/,
                      message: 'Invalid phone number'
                    }
                  })}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register('dateOfBirth', { required: 'Date of birth is required' })}
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address (Optional)"
                  multiline
                  rows={2}
                  {...register('address')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact (Optional)"
                  {...register('emergencyContact')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Blood Group</InputLabel>
                  <Controller
                    name="bloodGroup"
                    control={control}
                    rules={{ required: 'Blood group is required' }}
                    render={({ field }) => (
                      <Select {...field} label="Blood Group" error={!!errors.bloodGroup}>
                        <MenuItem value="A+">A+</MenuItem>
                        <MenuItem value="A-">A-</MenuItem>
                        <MenuItem value="B+">B+</MenuItem>
                        <MenuItem value="B-">B-</MenuItem>
                        <MenuItem value="AB+">AB+</MenuItem>
                        <MenuItem value="AB-">AB-</MenuItem>
                        <MenuItem value="O+">O+</MenuItem>
                        <MenuItem value="O-">O-</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>

              {/* Donor Type */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Favorite sx={{ mr: 1 }} />
                  Donor Type
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Donor Type</InputLabel>
                  <Controller
                    name="donorType"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Donor Type">
                        <MenuItem value="regular">
                          Regular Donor - I donate every 3 months as scheduled
                        </MenuItem>
                        <MenuItem value="emergency">
                          Emergency Donor - Call me only for urgent needs
                        </MenuItem>
                        <MenuItem value="flexible">
                          Flexible Donor - Both scheduled and emergency donations
                        </MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>

              {/* Availability */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Availability Preferences
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="availability.weekdays"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Available on Weekdays"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="availability.weekends"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Available on Weekends"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="availability.mornings"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Available in Mornings"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="availability.evenings"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Available in Evenings"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Max Distance (km)"
                  type="number"
                  {...register('maxDistanceKm', {
                    required: 'Max distance is required',
                    min: { value: 1, message: 'Minimum 1km' },
                    max: { value: 100, message: 'Maximum 100km' }
                  })}
                  error={!!errors.maxDistanceKm}
                  helperText={errors.maxDistanceKm?.message}
                />
              </Grid>

              {/* Medical Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Medical Information (Optional)
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  type="number"
                  {...register('weight', {
                    min: { value: 45, message: 'Minimum weight 45kg' },
                    max: { value: 150, message: 'Maximum weight 150kg' }
                  })}
                  error={!!errors.weight}
                  helperText={errors.weight?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Height (cm)"
                  type="number"
                  {...register('height', {
                    min: { value: 140, message: 'Minimum height 140cm' },
                    max: { value: 220, message: 'Maximum height 220cm' }
                  })}
                  error={!!errors.height}
                  helperText={errors.height?.message}
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Register as Donor'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default DonorRegistration;
