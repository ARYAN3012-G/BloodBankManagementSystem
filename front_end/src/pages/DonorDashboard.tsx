import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Alert,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Favorite,
  Schedule,
  Notifications,
  Verified,
  NotificationsActive,
  CheckCircle,
  Cancel,
  AccessTime,
  Event,
  Pending,
  Bloodtype,
  CalendarToday
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface DonorProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bloodGroup: string;
  address?: string;
  emergencyContact?: string;
  donorType: 'regular' | 'emergency' | 'flexible';
  status: 'active' | 'inactive' | 'suspended';
  totalDonations: number;
  lastDonationDate?: string;
  nextEligibleDate?: string;
  availability: {
    weekdays: boolean;
    weekends: boolean;
    evenings: boolean;
    mornings: boolean;
  };
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    phone: boolean;
  };
  // Legacy fields for backward compatibility
  isAvailable?: boolean;
  isActive?: boolean;
  eligibilityNotes?: string;
  donationHistory?: Array<{
    date: string;
    units: number;
    bloodBankLocation?: string;
    notes?: string;
  }>;
  maxDistanceKm?: number;
}

interface DonorNotification {
  _id: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  status: string;
  requestId?: {
    bloodGroup: string;
    unitsRequested: number;
    urgency: string;
    hospitalName?: string;
    requiredBy?: string;
  };
  response?: {
    action: 'accept' | 'decline' | 'maybe';
    message?: string;
    preferredSlots?: string[];
  };
  expiresAt?: string;
  createdAt: string;
}

interface DonorAppointment {
  _id: string;
  scheduledDate: string;
  scheduledTime: string;
  location: string;
  bloodGroup: string;
  status: string;
  requestId?: {
    hospitalName?: string;
    urgency: string;
  };
}

const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [notifications, setNotifications] = useState<DonorNotification[]>([]);
  const [appointments, setAppointments] = useState<DonorAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [responseDialog, setResponseDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<DonorNotification | null>(null);
  const [responseAction, setResponseAction] = useState<'accept' | 'decline' | 'maybe'>('accept');
  const [responseMessage, setResponseMessage] = useState('');
  const [preferredSlots, setPreferredSlots] = useState<string[]>(['']);

  useEffect(() => {
    fetchProfile();
    fetchNotifications();
    fetchAppointments();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/donor/me');
      setProfile(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications/donor?status=pending');
      setNotifications(response.data.notifications || []);
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/appointments/donor?limit=5');
      setAppointments(response.data.appointments || []);
    } catch (err: any) {
      console.error('Failed to fetch appointments:', err);
    }
  };

  const handleNotificationResponse = async () => {
    if (!selectedNotification) return;

    try {
      await axios.post(`/api/notifications/${selectedNotification._id}/respond`, {
        action: responseAction,
        message: responseMessage,
        preferredSlots: responseAction === 'accept' ? preferredSlots.filter(slot => slot) : undefined
      });

      setResponseDialog(false);
      setSelectedNotification(null);
      setResponseMessage('');
      setPreferredSlots(['']);
      await fetchNotifications();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to respond to notification');
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`);
      await fetchNotifications();
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const toggleAvailability = async () => {
    if (!profile || profile.isAvailable === undefined) return;

    try {
      setUpdating(true);
      await axios.patch('/api/donor/availability', {
        isAvailable: !profile.isAvailable
      });

      setProfile(prev => prev ? { ...prev, isAvailable: !prev.isAvailable } : null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update availability');
    } finally {
      setUpdating(false);
    }
  };

  const calculateDaysUntilEligible = () => {
    if (!profile?.nextEligibleDate) return 0;

    const today = new Date();
    const eligibleDate = new Date(profile.nextEligibleDate);
    const diffTime = eligibleDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  };

  const getEligibilityStatus = () => {
    if (!profile) return { status: 'unknown', color: 'default' as const };

    const daysUntilEligible = calculateDaysUntilEligible();

    if (daysUntilEligible === 0) {
      return { status: 'Eligible', color: 'success' as const, icon: <CheckCircle /> };
    } else if (daysUntilEligible <= 7) {
      return { status: `${daysUntilEligible} days left`, color: 'warning' as const, icon: <Schedule /> };
    } else {
      return { status: 'Not eligible', color: 'error' as const, icon: <Pending /> };
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 4 }}>
          Donor profile not found. Please register as a donor first.
        </Alert>
      </Container>
    );
  }

  const eligibility = getEligibilityStatus();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <Favorite sx={{ mr: 2, color: 'primary.main' }} />
        Donor Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                Profile Overview
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {profile.name}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Blood Group
                </Typography>
                <Chip
                  label={profile.bloodGroup}
                  color="primary"
                  icon={<Bloodtype />}
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Donor Type
                </Typography>
                <Chip
                  label={profile.donorType ? profile.donorType.charAt(0).toUpperCase() + profile.donorType.slice(1) : 'Regular'}
                  color="secondary"
                  variant="outlined"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={profile.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1) : 'Active'}
                  color={profile.status === 'active' ? 'success' : 'default'}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Donations
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {profile.totalDonations}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Eligibility Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                Donation Eligibility
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {eligibility.icon}
                  <Chip
                    label={eligibility.status}
                    color={eligibility.color}
                    sx={{ ml: 1 }}
                  />
                </Box>
              </Box>

              {profile.lastDonationDate && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Last Donation
                  </Typography>
                  <Typography variant="body1">
                    {new Date(profile.lastDonationDate).toLocaleDateString()}
                  </Typography>
                </Box>
              )}

              {profile.nextEligibleDate && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Next Eligible Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(profile.nextEligibleDate).toLocaleDateString()}
                  </Typography>
                </Box>
              )}

              <Button
                variant="outlined"
                fullWidth
                onClick={toggleAvailability}
                disabled={updating || profile.isAvailable === undefined}
                startIcon={<Notifications />}
              >
                {updating ? 'Updating...' : `${profile.isAvailable ? 'Disable' : 'Enable'} Notifications`}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Availability Settings */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
                Availability Preferences
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday color={profile.availability?.weekdays ? 'primary' : 'disabled'} />
                  </ListItemIcon>
                  <ListItemText primary="Weekdays" />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <CalendarToday color={profile.availability?.weekends ? 'primary' : 'disabled'} />
                  </ListItemIcon>
                  <ListItemText primary="Weekends" />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <AccessTime color={profile.availability?.mornings ? 'primary' : 'disabled'} />
                  </ListItemIcon>
                  <ListItemText primary="Mornings" />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <AccessTime color={profile.availability?.evenings ? 'primary' : 'disabled'} />
                  </ListItemIcon>
                  <ListItemText primary="Evenings" />
                </ListItem>
              </List>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Max Distance: {profile.maxDistanceKm || 10} km
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>

              {profile.donationHistory && profile.donationHistory.length > 0 ? (
                <List>
                  {profile.donationHistory.slice(-3).map((donation, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`Donated ${donation.units} unit${donation.units > 1 ? 's' : ''}`}
                          secondary={`${new Date(donation.date).toLocaleDateString()} ${donation.bloodBankLocation ? `at ${donation.bloodBankLocation}` : ''}`}
                        />
                      </ListItem>
                      {index < profile.donationHistory!.slice(-3).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No donation history yet. Your first donation will help save lives!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Email sx={{ mr: 1, verticalAlign: 'middle' }} />
                Contact Information
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{profile.email}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">{profile.phone}</Typography>
              </Box>

              {profile.address && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Address
                  </Typography>
                  <Typography variant="body1">{profile.address}</Typography>
                </Box>
              )}

              {profile.emergencyContact && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Emergency Contact
                  </Typography>
                  <Typography variant="body1">{profile.emergencyContact}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Impact Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Favorite sx={{ mr: 1, verticalAlign: 'middle', color: 'error.main' }} />
                Your Impact
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h4" color="primary.main" align="center">
                    {profile.totalDonations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Total Donations
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="h4" color="success.main" align="center">
                    {profile.totalDonations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Lives Potentially Saved
                  </Typography>
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Thank you for being a blood donor!</strong><br />
                  Your generosity helps save lives in your community.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DonorDashboard;
