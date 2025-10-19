import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  LinearProgress,
  Paper,
  Tab,
  Tabs,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Schedule,
  Cancel,
  Refresh,
  CalendarToday,
  Person,
  Bloodtype,
  TrendingUp,
} from '@mui/icons-material';
import axios from 'axios';

interface NotificationResponse {
  _id: string;
  donorId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    bloodGroup: string;
  };
  response: 'accepted' | 'declined' | 'pending';
  respondedAt?: string;
  availabilityNotes?: string;
}

interface Appointment {
  _id: string;
  donorId: {
    _id: string;
    name: string;
    bloodGroup: string;
  };
  scheduledDate: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  unitsCollected?: number;
}

interface RequestInfo {
  _id: string;
  bloodGroup: string;
  unitsRequested: number;
  unitsCollected: number;
  status: string;
  donorsNotified: number;
  donorsResponded: number;
  appointmentsScheduled: number;
  type: string;
}

const ProactiveTracking: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<RequestInfo | null>(null);
  const [responses, setResponses] = useState<NotificationResponse[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  
  // Schedule appointment dialog
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  
  // Complete donation dialog
  const [completeDialog, setCompleteDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [unitsCollected, setUnitsCollected] = useState(1);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (requestId) {
      fetchData();
    }
  }, [requestId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestRes, responsesRes, appointmentsRes] = await Promise.all([
        axios.get(`/api/requests/${requestId}`),
        axios.get(`/api/requests/${requestId}/notification-responses`),
        axios.get(`/api/appointments?requestId=${requestId}`)
      ]);

      console.log('Request:', requestRes.data);
      console.log('Responses:', responsesRes.data);
      console.log('Appointments:', appointmentsRes.data);

      setRequest(requestRes.data);
      
      // Transform notifications to responses format
      const notifications = responsesRes.data.notifications || [];
      const transformedResponses = notifications.map((notif: any) => ({
        _id: notif._id,
        donorId: notif.recipientId,
        response: notif.response?.action === 'accept' ? 'accepted' : 
                  notif.response?.action === 'decline' ? 'declined' : 'pending',
        respondedAt: notif.respondedAt,
        availabilityNotes: notif.response?.notes || notif.response?.availabilityNotes
      }));
      setResponses(transformedResponses);
      
      // Handle appointments data - ensure it's always an array
      let appointmentsData = [];
      if (Array.isArray(appointmentsRes.data)) {
        appointmentsData = appointmentsRes.data;
      } else if (appointmentsRes.data?.appointments && Array.isArray(appointmentsRes.data.appointments)) {
        appointmentsData = appointmentsRes.data.appointments;
      }
      setAppointments(appointmentsData);
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setRequest(null);
      setResponses([]);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleAppointment = async () => {
    if (!selectedDonor || !appointmentDate || !appointmentTime) {
      alert('Please fill in all fields');
      return;
    }

    try {
      console.log('Scheduling appointment:', {
        appointmentDate,
        appointmentTime,
        donor: selectedDonor
      });
      
      await axios.post('/api/appointments/from-notification', {
        notificationId: selectedDonor.notificationId,
        scheduledDate: appointmentDate, // Send date as string "YYYY-MM-DD"
        scheduledTime: appointmentTime, // Send time as string "HH:MM"
        location: 'Arts Blood Foundation - Main Center',
        donorNotes: 'Proactive inventory replenishment'
      });

      setScheduleDialog(false);
      setSelectedDonor(null);
      setAppointmentDate('');
      setAppointmentTime('');
      
      await fetchData(); // Refresh to show new appointment
      
      alert('✅ Appointment scheduled successfully!');
    } catch (error: any) {
      console.error('Schedule appointment error:', error);
      console.error('Error response:', error.response?.data);
      alert('❌ ' + (error.response?.data?.error || 'Failed to schedule appointment'));
    }
  };

  const handleCompleteDonation = async () => {
    if (!selectedAppointment || !unitsCollected) {
      alert('Please provide units collected');
      return;
    }

    try {
      const response = await axios.post(`/api/appointments/${selectedAppointment._id}/complete`, {
        unitsCollected,
        adminNotes,
        location: 'Arts Blood Foundation - Main Center'
      });

      console.log('Donation completed:', response.data);

      setCompleteDialog(false);
      setSelectedAppointment(null);
      setUnitsCollected(1);
      setAdminNotes('');
      
      // Refresh data to show updated progress
      await fetchData();
      
      alert(`✅ Success!\n\n• Donation recorded: ${unitsCollected} unit(s)\n• Inventory updated\n• Donor eligibility reset\n• Progress: ${request?.unitsCollected || 0 + unitsCollected}/${request?.unitsRequested} units`);
    } catch (error: any) {
      console.error('Complete donation error:', error);
      alert('❌ Error: ' + (error.response?.data?.error || 'Failed to complete donation'));
    }
  };

  const getProgress = () => {
    if (!request) return 0;
    return Math.min((request.unitsCollected / request.unitsRequested) * 100, 100);
  };

  const acceptedResponses = responses.filter(r => r.response === 'accepted');
  const pendingResponses = responses.filter(r => r.response === 'pending');
  const scheduledAppointments = appointments.filter(a => a.status === 'scheduled');
  const completedAppointments = appointments.filter(a => a.status === 'completed');
  
  // Filter out responses that already have appointments
  const responsesWithoutAppointments = acceptedResponses.filter(response => {
    return !appointments.some(apt => apt.donorId?._id === response.donorId?._id);
  });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!request) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Request not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/admin/inventory-status')}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" component="h1">
            Proactive Inventory Replenishment
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Track donor responses and manage donations
          </Typography>
        </Box>
        <Button startIcon={<Refresh />} onClick={fetchData} variant="outlined">
          Refresh
        </Button>
      </Box>

      {/* Progress Card */}
      <Card sx={{ mb: 3, bgcolor: 'primary.50', borderLeft: 4, borderColor: 'primary.main' }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Bloodtype color="error" />
                <Typography variant="h5">
                  <strong>{request.bloodGroup}</strong> Blood
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" gutterBottom>
                Collection Progress: {request.unitsCollected} / {request.unitsRequested} units
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={getProgress()} 
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                {getProgress().toFixed(0)}% Complete
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              {request.unitsCollected >= request.unitsRequested ? (
                <Chip 
                  label="TARGET REACHED ✓"
                  color="success"
                  icon={<CheckCircle />}
                  sx={{ fontSize: '1rem', py: 2 }}
                />
              ) : (
                <Chip 
                  label={`${request.unitsRequested - request.unitsCollected} MORE NEEDED`}
                  color="warning"
                  icon={<TrendingUp />}
                />
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{request.donorsNotified}</Typography>
            <Typography variant="body2" color="text.secondary">Notified</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">{acceptedResponses.length}</Typography>
            <Typography variant="body2" color="text.secondary">Accepted</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary.main">{scheduledAppointments.length}</Typography>
            <Typography variant="body2" color="text.secondary">Scheduled</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="error.main">{completedAppointments.length}</Typography>
            <Typography variant="body2" color="text.secondary">Completed</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
          <Tab label={`Responses (${responsesWithoutAppointments.length})`} />
          <Tab label={`Appointments (${scheduledAppointments.length})`} />
          <Tab label={`Completed (${completedAppointments.length})`} />
        </Tabs>

        <CardContent>
          {/* Tab 0: Accepted Responses - Schedule Appointments */}
          {currentTab === 0 && (
            <>
              {responsesWithoutAppointments.length === 0 ? (
                <Alert severity="info">
                  {acceptedResponses.length > 0 
                    ? 'All responded donors have appointments scheduled!' 
                    : 'No accepted responses yet. Waiting for donors to respond...'}
                </Alert>
              ) : (
                <List>
                  {responsesWithoutAppointments.map((response, index) => (
                    <React.Fragment key={response._id}>
                      {index > 0 && <Divider />}
                      <ListItem
                        secondaryAction={
                          <Button
                            variant="contained"
                            startIcon={<Schedule />}
                            onClick={() => {
                              setSelectedDonor({
                                ...response.donorId,
                                notificationId: response._id
                              });
                              setScheduleDialog(true);
                            }}
                          >
                            Schedule Appointment
                          </Button>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.main' }}>
                            {response.donorId.name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={response.donorId.name}
                          secondary={
                            <>
                              {response.donorId.phone} | {response.donorId.email}
                              <br />
                              {response.availabilityNotes && `Notes: ${response.availabilityNotes}`}
                            </>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              )}
            </>
          )}

          {/* Tab 1: Scheduled Appointments - Complete Donations */}
          {currentTab === 1 && (
            <>
              {scheduledAppointments.length === 0 ? (
                <Alert severity="info">No scheduled appointments yet.</Alert>
              ) : (
                <List>
                  {scheduledAppointments.map((apt, index) => (
                    <React.Fragment key={apt._id}>
                      {index > 0 && <Divider />}
                      <ListItem
                        secondaryAction={
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setCompleteDialog(true);
                            }}
                          >
                            Complete Donation
                          </Button>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <CalendarToday />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={apt.donorId.name}
                          secondary={
                            <>
                              Scheduled: {new Date(apt.scheduledDate).toLocaleString()}
                              <br />
                              Blood Group: {apt.donorId.bloodGroup}
                            </>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              )}
            </>
          )}

          {/* Tab 2: Completed Donations */}
          {currentTab === 2 && (
            <>
              {completedAppointments.length === 0 ? (
                <Alert severity="info">No completed donations yet.</Alert>
              ) : (
                <List>
                  {completedAppointments.map((apt, index) => (
                    <React.Fragment key={apt._id}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.main' }}>
                            <CheckCircle />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={apt.donorId.name}
                          secondary={
                            <>
                              Completed: {new Date(apt.scheduledDate).toLocaleDateString()}
                              <br />
                              Units Collected: {apt.unitsCollected || 1}
                            </>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Schedule Appointment Dialog */}
      <Dialog open={scheduleDialog} onClose={() => setScheduleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Appointment</DialogTitle>
        <DialogContent>
          {selectedDonor && (
            <>
              <Typography variant="body1" gutterBottom>
                <strong>Donor:</strong> {selectedDonor.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedDonor.phone} | {selectedDonor.email}
              </Typography>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 2 }}
              />
              <TextField
                label="Time"
                type="time"
                fullWidth
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleScheduleAppointment}>
            Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complete Donation Dialog */}
      <Dialog open={completeDialog} onClose={() => setCompleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Donation</DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <>
              <Typography variant="body1" gutterBottom>
                <strong>Donor:</strong> {selectedAppointment.donorId.name}
              </Typography>
              <TextField
                label="Units Collected"
                type="number"
                fullWidth
                value={unitsCollected}
                onChange={(e) => setUnitsCollected(Number(e.target.value))}
                inputProps={{ min: 1, max: 2 }}
                helperText="Maximum 2 units per donation session (1 unit = ~450ml). Standard donation = 1 unit."
                sx={{ mt: 2 }}
              />
              <TextField
                label="Admin Notes (Optional)"
                fullWidth
                multiline
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                sx={{ mt: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleCompleteDonation}>
            Complete & Update Inventory
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProactiveTracking;
