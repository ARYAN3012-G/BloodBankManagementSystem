import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Switch,
  FormControlLabel,
  LinearProgress,
} from '@mui/material';
import {
  Bloodtype,
  Cake,
  CalendarToday,
  CheckCircle,
  Favorite,
  Schedule,
} from '@mui/icons-material';
import axios from '../config/axios';
import { useAuth } from '../contexts/AuthContext';

const DonorProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchEligibility();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/donor/me');
      setProfile(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibility = async () => {
    try {
      const response = await axios.get('/api/donor/eligibility');
      setEligibility(response.data);
    } catch (err: any) {
      console.error('Failed to fetch eligibility:', err);
    }
  };

  const toggleAvailability = async () => {
    try {
      setUpdating(true);
      const newAvailability = !eligibility.isAvailable;
      await axios.patch('/api/donor/availability', { isAvailable: newAvailability });
      setEligibility({ ...eligibility, isAvailable: newAvailability });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update availability');
    } finally {
      setUpdating(false);
    }
  };

  const calculateAge = (dob?: string) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading profile...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            🩸 Donor Profile
          </Typography>
          <Chip 
            label="Active Donor" 
            color="success" 
            icon={<CheckCircle />}
            sx={{ mt: 1 }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Personal Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" fontWeight="bold" sx={{ mr: 1 }}>
                Name:
              </Typography>
              <Typography variant="body1">{user?.name}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" fontWeight="bold" sx={{ mr: 1 }}>
                Email:
              </Typography>
              <Typography variant="body1">{user?.email}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Bloodtype sx={{ mr: 1, color: 'error.main' }} />
              <Typography variant="body1" fontWeight="bold" sx={{ mr: 1 }}>
                Blood Group:
              </Typography>
              <Chip 
                label={profile?.bloodGroup} 
                color="error" 
                size="small"
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Cake sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body1" fontWeight="bold" sx={{ mr: 1 }}>
                Age:
              </Typography>
              <Typography variant="body1">
                {calculateAge(profile?.dob)} years
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Donation Statistics */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Donation Statistics
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card sx={{ textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
              <CardContent>
                <Favorite sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4">
                  {profile?.donationHistory?.length || 0}
                </Typography>
                <Typography variant="body2">Total Donations</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card sx={{ textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
              <CardContent>
                <CalendarToday sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">
                  {formatDate(profile?.lastDonationDate)}
                </Typography>
                <Typography variant="body2">Last Donation</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card sx={{ 
              textAlign: 'center', 
              bgcolor: eligibility?.isEligible ? 'success.main' : 'warning.main', 
              color: 'white' 
            }}>
              <CardContent>
                {eligibility?.isEligible ? (
                  <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
                ) : (
                  <Schedule sx={{ fontSize: 40, mb: 1 }} />
                )}
                <Typography variant="h6">
                  {eligibility?.isEligible ? 'Eligible' : `${eligibility?.daysUntilEligible || 0}d left`}
                </Typography>
                <Typography variant="body2">Donation Status</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Eligibility & Availability Section */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Donation Eligibility & Availability
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                {/* Eligibility Status */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {eligibility?.isEligible ? (
                      <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                    ) : (
                      <Schedule sx={{ color: 'warning.main', mr: 1 }} />
                    )}
                    <Typography variant="subtitle1" fontWeight="bold">
                      Eligibility Status: {eligibility?.isEligible ? 'Eligible to Donate' : 'Not Eligible Yet'}
                    </Typography>
                  </Box>

                  {!eligibility?.isEligible && eligibility?.daysUntilEligible > 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        You can donate again on {new Date(eligibility?.nextEligibleDate).toLocaleDateString()}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {eligibility?.daysUntilEligible} days remaining (90-day waiting period)
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={((90 - eligibility?.daysUntilEligible) / 90) * 100}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Alert>
                  )}

                  {eligibility?.lastDonationDate && (
                    <Typography variant="body2" color="text.secondary">
                      Last donation: {new Date(eligibility.lastDonationDate).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Availability Toggle */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Your Availability
                  </Typography>
                  
                  {!eligibility?.isActive ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Your account has been deactivated by an administrator.
                      </Typography>
                      {eligibility?.eligibilityNotes && (
                        <Typography variant="caption">
                          Reason: {eligibility.eligibilityNotes}
                        </Typography>
                      )}
                    </Alert>
                  ) : (
                    <>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={eligibility?.isAvailable || false}
                            onChange={toggleAvailability}
                            disabled={updating || !eligibility?.isActive || !eligibility?.isEligible}
                            color="success"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body1">
                              {eligibility?.isAvailable ? 'I am available to donate' : 'I am not available right now'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {eligibility?.isAvailable 
                                ? 'You may receive donation requests from blood banks'
                                : 'You will not receive donation requests while unavailable'
                              }
                            </Typography>
                          </Box>
                        }
                      />

                      {!eligibility?.isEligible && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            🔒 You cannot mark yourself as available until you become eligible.
                            Please wait {eligibility?.daysUntilEligible} more days.
                          </Typography>
                        </Alert>
                      )}

                      {eligibility?.canDonate && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                          <Typography variant="body2" fontWeight="bold">
                            ✅ You can donate now! Thank you for being available.
                          </Typography>
                        </Alert>
                      )}
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {profile?.eligibilityNotes && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  Notes
                </Typography>
                <Typography variant="body1">{profile.eligibilityNotes}</Typography>
              </Grid>
            </>
          )}
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Thank you for being a life saver! 🙏
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default DonorProfile;
