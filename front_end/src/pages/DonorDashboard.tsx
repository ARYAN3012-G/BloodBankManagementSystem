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
      // Fetch all notifications (not just pending ones)
      const response = await axios.get('/api/notifications/donor');
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
      const response = await axios.post(`/api/notifications/${selectedNotification._id}/respond`, {
        action: responseAction,
        message: responseMessage,
        preferredSlots: responseAction === 'accept' ? preferredSlots.filter(slot => slot) : undefined
      });

      console.log('Response submitted successfully:', response.data);

      setResponseDialog(false);
      setSelectedNotification(null);
      setResponseMessage('');
      setPreferredSlots(['']);
      
      // Refresh notifications and appointments
      await fetchNotifications();
      await fetchAppointments();
      
      alert(`Response submitted successfully: ${responseAction}`);
    } catch (err: any) {
      console.error('Failed to respond to notification:', err);
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

      {/* Tabs for different sections */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person />
                Profile
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Notifications />
                Notifications
                {notifications.length > 0 && (
                  <Chip 
                    label={notifications.length} 
                    size="small" 
                    color="error" 
                    sx={{ minWidth: 20, height: 20 }}
                  />
                )}
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule />
                Appointments
                {appointments.length > 0 && (
                  <Chip 
                    label={appointments.length} 
                    size="small" 
                    color="primary" 
                    sx={{ minWidth: 20, height: 20 }}
                  />
                )}
              </Box>
            } 
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabValue === 0 && (
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
      )}

      {/* Notifications Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Blood Donation Requests
                </Typography>
                
                {notifications.length === 0 ? (
                  <Alert severity="info">
                    No pending donation requests at the moment. You'll be notified when your blood type is needed.
                  </Alert>
                ) : (
                  <List>
                    {notifications.map((notification) => (
                      <ListItem key={notification._id} divider>
                        <ListItemIcon>
                          <Bloodtype color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary={notification.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {notification.message}
                              </Typography>
                              {notification.requestId && (
                                <Box sx={{ mt: 1 }}>
                                  <Chip 
                                    label={`${notification.requestId.bloodGroup} - ${notification.requestId.unitsRequested} units`} 
                                    size="small" 
                                    color="primary" 
                                  />
                                  <Chip 
                                    label={notification.requestId.urgency} 
                                    size="small" 
                                    color={notification.requestId.urgency === 'Critical' ? 'error' : 'warning'} 
                                    sx={{ ml: 1 }}
                                  />
                                </Box>
                              )}
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {notification.response ? (
                            <Chip 
                              label={`Responded: ${notification.response.action}`}
                              color={notification.response.action === 'accept' ? 'success' : 'error'}
                              size="small"
                            />
                          ) : (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => {
                                  setSelectedNotification(notification);
                                  setResponseAction('accept');
                                  setResponseDialog(true);
                                }}
                              >
                                Accept
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => {
                                  setSelectedNotification(notification);
                                  setResponseAction('decline');
                                  setResponseDialog(true);
                                }}
                              >
                                Decline
                              </Button>
                            </>
                          )}
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Appointments Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Your Appointments
                </Typography>
                
                {appointments.length === 0 ? (
                  <Alert severity="info">
                    No scheduled appointments yet. Accept a donation request to schedule an appointment.
                  </Alert>
                ) : (
                  <List>
                    {appointments.map((appointment) => (
                      <ListItem key={appointment._id} divider>
                        <ListItemIcon>
                          <Event color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`Blood Donation Appointment`}
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                <strong>Date:</strong> {new Date(appointment.scheduledDate).toLocaleDateString()}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Time:</strong> {appointment.scheduledTime}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Location:</strong> {appointment.location}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Blood Group:</strong> {appointment.bloodGroup}
                              </Typography>
                              {appointment.requestId?.hospitalName && (
                                <Typography variant="body2">
                                  <strong>Hospital:</strong> {appointment.requestId.hospitalName}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <Chip 
                          label={appointment.status} 
                          color={
                            appointment.status === 'scheduled' ? 'primary' :
                            appointment.status === 'confirmed' ? 'success' :
                            appointment.status === 'completed' ? 'success' :
                            'default'
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Response Dialog */}
      <Dialog open={responseDialog} onClose={() => setResponseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Respond to Donation Request
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel 
              sx={{ 
                color: 'text.primary', 
                '&.Mui-focused': { color: 'primary.main' },
                '&.MuiInputLabel-shrink': { color: 'primary.main' },
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Response
            </InputLabel>
            <Select
              value={responseAction}
              onChange={(e) => setResponseAction(e.target.value as 'accept' | 'decline' | 'maybe')}
              label="Response"
              sx={{ 
                '& .MuiSelect-select': { 
                  padding: '12px 14px',
                  fontSize: '14px'
                }
              }}
            >
              <MenuItem value="accept">Accept</MenuItem>
              <MenuItem value="decline">Decline</MenuItem>
              <MenuItem value="maybe">Maybe</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Message (Optional)"
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
            placeholder="Add any additional information..."
            sx={{ mb: 2 }}
          />
          
          {responseAction === 'accept' && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Preferred Time Slots (Optional)
              </Typography>
              {preferredSlots.map((slot, index) => (
                <TextField
                  key={index}
                  fullWidth
                  type="datetime-local"
                  value={slot}
                  onChange={(e) => {
                    const newSlots = [...preferredSlots];
                    newSlots[index] = e.target.value;
                    setPreferredSlots(newSlots);
                  }}
                  sx={{ mb: 1 }}
                />
              ))}
              <Button
                size="small"
                onClick={() => setPreferredSlots([...preferredSlots, ''])}
              >
                Add Another Slot
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialog(false)}>Cancel</Button>
          <Button onClick={handleNotificationResponse} variant="contained">
            Submit Response
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DonorDashboard;
