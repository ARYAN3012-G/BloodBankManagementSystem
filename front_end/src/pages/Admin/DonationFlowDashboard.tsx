import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  Notifications,
  Schedule,
  Person,
  LocalHospital,
  Send,
  CheckCircle,
  Cancel,
  Refresh,
  CalendarToday,
  AccessTime,
  LocationOn,
  Add
} from '@mui/icons-material';
import axios from 'axios';

interface BloodRequest {
  _id: string;
  bloodGroup: string;
  unitsRequested: number;
  urgency: string;
  requiredBy?: string;
  hospitalName?: string;
  status: string;
  donorsNotified?: number;
  donorsResponded?: number;
  appointmentsScheduled?: number;
  unitsCollected?: number;
  createdAt: string;
  // Additional fields that might be present
  patientName?: string;
  department?: string;
  requesterUserId?: {
    name: string;
    role: string;
  };
}

interface DonorRecommendation {
  _id: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup: string;
  donorType: string;
  score: number;
  daysUntilEligible: number;
  isCurrentlyEligible: boolean;
}

interface NotificationResponse {
  _id: string;
  recipientId?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    bloodGroup?: string;
  };
  status: string;
  response?: {
    action: 'accept' | 'decline' | 'maybe';
    message?: string;
    preferredSlots?: string[];
  };
  sentAt?: string;
  respondedAt?: string;
  appointmentId?: string;
}

const DonationFlowDashboard: React.FC = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [requestsWithInventoryIssues, setRequestsWithInventoryIssues] = useState<BloodRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [donors, setDonors] = useState<{
    highPriority: DonorRecommendation[];
    mediumPriority: DonorRecommendation[];
    lowPriority: DonorRecommendation[];
  }>({ highPriority: [], mediumPriority: [], lowPriority: [] });
  const [responses, setResponses] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notificationDialog, setNotificationDialog] = useState(false);
  const [selectedDonors, setSelectedDonors] = useState<string[]>([]);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [priority, setPriority] = useState('normal');
  const [tabValue, setTabValue] = useState(0);
  const [appointmentDialog, setAppointmentDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationResponse | null>(null);
  const [appointmentForm, setAppointmentForm] = useState({
    scheduledDate: '',
    scheduledTime: '',
    location: '',
    donorNotes: ''
  });

  useEffect(() => {
    fetchRequestsAndInventory();
  }, []);

  const fetchRequestsAndInventory = async () => {
    try {
      setLoading(true);
      console.log('Fetching requests and inventory for Donation Flow Dashboard...');
      
      // Fetch both requests and inventory in parallel
      const [requestsResponse, inventoryResponse] = await Promise.all([
        axios.get('/api/requests'),
        axios.get('/api/inventory')
      ]);
      
      console.log('Requests API Response:', requestsResponse.data);
      console.log('Inventory API Response:', inventoryResponse.data);
      
      // Handle requests data
      let requestsData = [];
      if (Array.isArray(requestsResponse.data)) {
        requestsData = requestsResponse.data;
      } else if (requestsResponse.data.requests) {
        requestsData = requestsResponse.data.requests;
      } else {
        requestsData = [];
      }
      
      // Handle inventory data
      let inventoryData = [];
      if (Array.isArray(inventoryResponse.data)) {
        inventoryData = inventoryResponse.data;
      } else if (inventoryResponse.data.stock) {
        inventoryData = inventoryResponse.data.stock;
      } else {
        inventoryData = [];
      }
      
      setRequests(requestsData);
      setInventory(inventoryData);
      
      // Filter requests with inventory issues
      const requestsWithIssues = filterRequestsWithInventoryIssues(requestsData, inventoryData);
      setRequestsWithInventoryIssues(requestsWithIssues);
      
      console.log('Processed requests:', requestsData);
      console.log('Processed inventory:', inventoryData);
      console.log('Requests with inventory issues:', requestsWithIssues);
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setRequests([]);
      setInventory([]);
      setRequestsWithInventoryIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const filterRequestsWithInventoryIssues = (requests: BloodRequest[], inventory: any[]) => {
    return requests.filter(request => {
      // Only show pending requests
      if (request.status !== 'pending') {
        return false;
      }
      
      // Find inventory for this blood group
      const bloodGroupInventory = inventory.find(item => item.bloodGroup === request.bloodGroup);
      const availableUnits = bloodGroupInventory ? bloodGroupInventory.units : 0;
      
      // Check if requested units exceed available units
      return request.unitsRequested > availableUnits;
    });
  };

  const fetchSuitableDonors = async (requestId: string) => {
    try {
      const response = await axios.get(`/api/requests/${requestId}/suitable-donors`);
      setDonors(response.data.donorRecommendations);
    } catch (error) {
      console.error('Failed to fetch suitable donors:', error);
    }
  };

  const fetchNotificationResponses = async (requestId: string) => {
    try {
      const response = await axios.get(`/api/requests/${requestId}/notification-responses`);
      console.log('Notification responses data:', response.data);
      setResponses(response.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notification responses:', error);
    }
  };

  const handleRequestClick = async (request: BloodRequest) => {
    setSelectedRequest(request);
    setDialogOpen(true);
    await fetchSuitableDonors(request._id);
    await fetchNotificationResponses(request._id);
  };

  const handleSendNotifications = async () => {
    if (!selectedRequest || selectedDonors.length === 0) return;

    try {
      await axios.post('/api/notifications/send-donation-request', {
        requestId: selectedRequest._id,
        donorIds: selectedDonors,
        message: notificationMessage,
        priority,
        expiresInHours: priority === 'urgent' ? 6 : 24
      });

      setNotificationDialog(false);
      setSelectedDonors([]);
      setNotificationMessage('');
      
      // Switch to Notification Responses tab to show sent notifications
      setTabValue(1);
      
      // Refresh data
      await fetchNotificationResponses(selectedRequest._id);
      await fetchRequestsAndInventory(); // Refresh to show updated counts
      
      alert(`Notifications sent successfully to ${selectedDonors.length} donors!`);
    } catch (error) {
      console.error('Failed to send notifications:', error);
      alert('Failed to send notifications. Please try again.');
    }
  };

  const handleScheduleAppointment = (notification: NotificationResponse) => {
    console.log('Scheduling appointment for notification:', notification);
    
    // Check if notification has valid donor data
    if (!notification.recipientId || !notification.recipientId._id) {
      alert('Cannot schedule appointment: Donor information is missing');
      return;
    }
    
    setSelectedNotification(notification);
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDate = tomorrow.toISOString().split('T')[0];
    
    // Set default time to 10:00 AM
    const defaultTime = '10:00';
    
    setAppointmentForm({
      scheduledDate: defaultDate,
      scheduledTime: defaultTime,
      location: 'Arts Blood Foundation - Main Center',
      donorNotes: notification.response?.message || ''
    });
    setAppointmentDialog(true);
  };

  const handleCreateAppointment = async () => {
    // Enhanced validation
    if (!selectedNotification) {
      alert('No notification selected');
      return;
    }
    
    if (!appointmentForm.scheduledDate) {
      alert('Please select an appointment date');
      return;
    }
    
    if (!appointmentForm.scheduledTime) {
      alert('Please select an appointment time');
      return;
    }
    
    if (!appointmentForm.location || appointmentForm.location.trim() === '') {
      alert('Please enter a valid location');
      return;
    }
    
    // Validate date is in the future
    const appointmentDateTime = new Date(`${appointmentForm.scheduledDate}T${appointmentForm.scheduledTime}`);
    if (appointmentDateTime <= new Date()) {
      alert('Appointment date and time must be in the future');
      return;
    }

    try {
      console.log('Creating appointment with data:', {
        notificationId: selectedNotification._id,
        scheduledDate: appointmentForm.scheduledDate,
        scheduledTime: appointmentForm.scheduledTime,
        location: appointmentForm.location,
        donorNotes: appointmentForm.donorNotes
      });

      const response = await axios.post('/api/appointments/from-notification', {
        notificationId: selectedNotification._id,
        scheduledDate: appointmentForm.scheduledDate,
        scheduledTime: appointmentForm.scheduledTime,
        location: appointmentForm.location,
        donorNotes: appointmentForm.donorNotes
      });

      console.log('Appointment created successfully:', response.data);

      setAppointmentDialog(false);
      setSelectedNotification(null);
      setAppointmentForm({ scheduledDate: '', scheduledTime: '', location: '', donorNotes: '' });
      
      // Refresh data
      await fetchNotificationResponses(selectedRequest!._id);
      await fetchRequestsAndInventory();
      
      alert('Appointment scheduled successfully!');
    } catch (error: any) {
      console.error('Failed to create appointment:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.error || 'Failed to create appointment');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return 'error';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'highPriority': return '#4caf50';
      case 'mediumPriority': return '#ff9800';
      case 'lowPriority': return '#9e9e9e';
      default: return '#2196f3';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        🩸 Donation Flow Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <LocalHospital color="primary" />
                <Box ml={2}>
                  <Typography variant="h6">{requestsWithInventoryIssues.length}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pending Requests with Inventory Issues
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Notifications color="warning" />
                <Box ml={2}>
                  <Typography variant="h6">
                    {requestsWithInventoryIssues.reduce((sum, r) => sum + (r.donorsNotified || 0), 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Donors Notified
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Person color="success" />
                <Box ml={2}>
                  <Typography variant="h6">
                    {requestsWithInventoryIssues.reduce((sum, r) => sum + (r.donorsResponded || 0), 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Responses Received
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Schedule color="info" />
                <Box ml={2}>
                  <Typography variant="h6">
                    {requestsWithInventoryIssues.reduce((sum, r) => sum + (r.appointmentsScheduled || 0), 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Appointments Scheduled
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Requests Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Pending Blood Requests with Inventory Issues
              <Button
                size="small"
                startIcon={<Refresh />}
                onClick={fetchRequestsAndInventory}
                sx={{ ml: 2 }}
              >
                Refresh
              </Button>
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Blood</TableCell>
                    <TableCell>Units</TableCell>
                    <TableCell>Urgency</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Contact/Dept</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>ApprovedOn</TableCell>
                    <TableCell>Requested</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requestsWithInventoryIssues.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} align="center">
                        <Typography variant="body2" color="textSecondary">
                          No pending blood requests with inventory issues found. All pending requests can be fulfilled from current stock.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    requestsWithInventoryIssues.map((request) => {
                      // Find inventory for this blood group
                      const bloodGroupInventory = inventory.find(item => item.bloodGroup === request.bloodGroup);
                      const availableUnits = bloodGroupInventory ? bloodGroupInventory.units : 0;
                      const shortage = request.unitsRequested - availableUnits;
                      
                      return (
                        <TableRow key={request._id}>
                          <TableCell>
                            <Chip 
                              label={request.requesterUserId?.role === 'hospital' ? 'Hospital' : 'External'} 
                              color={request.requesterUserId?.role === 'hospital' ? 'error' : 'warning'} 
                              size="small"
                              icon={request.requesterUserId?.role === 'hospital' ? <LocalHospital /> : <Person />}
                            />
                          </TableCell>
                          <TableCell>{request.patientName || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip label={request.bloodGroup} color="primary" size="small" />
                          </TableCell>
                          <TableCell>{request.unitsRequested}</TableCell>
                          <TableCell>
                            <Chip 
                              label={request.urgency} 
                              color={getUrgencyColor(request.urgency) as any}
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={request.status} 
                              color={request.status === 'pending' ? 'warning' : 'default'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>{request.department || request.hospitalName || 'N/A'}</TableCell>
                          <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>N/A</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={() => handleRequestClick(request)}
                              startIcon={<Schedule />}
                            >
                              Manage
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Request Management Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Manage Request: {selectedRequest?.bloodGroup} ({selectedRequest?.unitsRequested} units)
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
              <Tab label="Suitable Donors" />
              <Tab label="Notification Responses" />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <Grid container spacing={2}>
              {/* High Priority Donors */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" color="success.main" gutterBottom>
                  🎯 High Priority ({donors.highPriority.length})
                </Typography>
                <List dense>
                  {donors.highPriority.map((donor) => (
                    <ListItem key={donor._id} divider>
                      <ListItemText
                        primary={donor?.name || 'Unknown Donor'}
                        secondary={`${donor.donorType} • Score: ${donor.score} • ${donor.isCurrentlyEligible ? 'Eligible now' : `${donor.daysUntilEligible} days`}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => {
                            const newSelected = selectedDonors.includes(donor._id)
                              ? selectedDonors.filter(id => id !== donor._id)
                              : [...selectedDonors, donor._id];
                            setSelectedDonors(newSelected);
                          }}
                          color={selectedDonors.includes(donor._id) ? 'primary' : 'default'}
                        >
                          <CheckCircle />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Grid>

              {/* Medium Priority Donors */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" color="warning.main" gutterBottom>
                  ⭐ Medium Priority ({donors.mediumPriority.length})
                </Typography>
                <List dense>
                  {donors.mediumPriority.map((donor) => (
                    <ListItem key={donor._id} divider>
                      <ListItemText
                        primary={donor?.name || 'Unknown Donor'}
                        secondary={`${donor.donorType} • Score: ${donor.score}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => {
                            const newSelected = selectedDonors.includes(donor._id)
                              ? selectedDonors.filter(id => id !== donor._id)
                              : [...selectedDonors, donor._id];
                            setSelectedDonors(newSelected);
                          }}
                          color={selectedDonors.includes(donor._id) ? 'primary' : 'default'}
                        >
                          <CheckCircle />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Grid>

              {/* Low Priority Donors */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  📋 Low Priority ({donors.lowPriority.length})
                </Typography>
                <List dense>
                  {donors.lowPriority.map((donor) => (
                    <ListItem key={donor._id} divider>
                      <ListItemText
                        primary={donor?.name || 'Unknown Donor'}
                        secondary={`${donor.donorType} • Score: ${donor.score}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => {
                            const newSelected = selectedDonors.includes(donor._id)
                              ? selectedDonors.filter(id => id !== donor._id)
                              : [...selectedDonors, donor._id];
                            setSelectedDonors(newSelected);
                          }}
                          color={selectedDonors.includes(donor._id) ? 'primary' : 'default'}
                        >
                          <CheckCircle />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">
                    {selectedDonors.length} donors selected
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    disabled={selectedDonors.length === 0}
                    onClick={() => setNotificationDialog(true)}
                  >
                    Send Notifications
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}

          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Notification Responses ({responses.length})
              </Typography>
              
              {responses.length === 0 ? (
                <Alert severity="info">
                  No notification responses yet. Send notifications to donors first.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {/* Accepted Responses */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" color="success.main" gutterBottom>
                      ✅ Accepted ({responses.filter(r => r.response?.action === 'accept').length})
                    </Typography>
                    <List dense>
                      {responses
                        .filter(response => response.response?.action === 'accept')
                        .map((response) => (
                          <ListItem key={response._id} divider>
                            <ListItemText
                              primary={response.recipientId?.name || 'Unknown Donor'}
                              secondary={
                                <Box>
                                  <Typography variant="body2">
                                    {response.recipientId?.bloodGroup || 'N/A'} • {response.recipientId?.phone || 'N/A'}
                                  </Typography>
                                  {response.response?.message && (
                                    <Typography variant="body2" color="textSecondary">
                                      "{response.response.message}"
                                    </Typography>
                                  )}
                                  {response.response?.preferredSlots && response.response.preferredSlots.length > 0 && (
                                    <Typography variant="body2" color="textSecondary">
                                      Preferred: {response.response.preferredSlots.join(', ')}
                                    </Typography>
                                  )}
                                  {response.appointmentId && (
                                    <Chip label="Appointment Scheduled" size="small" color="success" />
                                  )}
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              {!response.appointmentId ? (
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<Schedule />}
                                  onClick={() => handleScheduleAppointment(response)}
                                >
                                  Schedule
                                </Button>
                              ) : (
                                <Chip label="Scheduled" color="success" size="small" />
                              )}
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                    </List>
                  </Grid>

                  {/* Declined/Maybe Responses */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" color="warning.main" gutterBottom>
                      📋 Other Responses ({responses.filter(r => r.response?.action !== 'accept').length})
                    </Typography>
                    <List dense>
                      {responses
                        .filter(response => response.response?.action !== 'accept')
                        .map((response) => (
                          <ListItem key={response._id} divider>
                            <ListItemText
                              primary={response.recipientId?.name || 'Unknown Donor'}
                              secondary={
                                <Box>
                                  <Typography variant="body2">
                                    {response.recipientId?.bloodGroup || 'N/A'} • {response.recipientId?.phone || 'N/A'}
                                  </Typography>
                                  <Chip 
                                    label={response.response?.action || 'No response'} 
                                    size="small" 
                                    color={response.response?.action === 'decline' ? 'error' : 'warning'}
                                  />
                                  {response.response?.message && (
                                    <Typography variant="body2" color="textSecondary">
                                      "{response.response.message}"
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                    </List>
                  </Grid>
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Send Notification Dialog */}
      <Dialog open={notificationDialog} onClose={() => setNotificationDialog(false)}>
        <DialogTitle>Send Donation Request Notifications</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                label="Priority"
              >
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Custom Message (Optional)"
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              placeholder="We need your help! A patient requires blood donation..."
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Sending to {selectedDonors.length} selected donors
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotificationDialog(false)}>Cancel</Button>
          <Button onClick={handleSendNotifications} variant="contained">
            Send Notifications
          </Button>
        </DialogActions>
      </Dialog>

      {/* Appointment Scheduling Dialog */}
      <Dialog open={appointmentDialog} onClose={() => setAppointmentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Schedule sx={{ mr: 1 }} />
            Schedule Appointment
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Box sx={{ pt: 1 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Donor:</strong> {selectedNotification?.recipientId?.name || 'Unknown Donor'}<br />
                  <strong>Blood Group:</strong> {selectedNotification?.recipientId?.bloodGroup || 'N/A'}<br />
                  <strong>Phone:</strong> {selectedNotification?.recipientId?.phone || 'N/A'}
                </Typography>
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Appointment Date"
                    type="date"
                    value={appointmentForm.scheduledDate}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Appointment Time"
                    type="time"
                    value={appointmentForm.scheduledTime}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={appointmentForm.location}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Arts Blood Foundation - Main Center"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Donor Notes (Optional)"
                    value={appointmentForm.donorNotes}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, donorNotes: e.target.value }))}
                    placeholder="Any special notes or preferences from the donor..."
                  />
                </Grid>
              </Grid>

              {selectedNotification.response?.preferredSlots && selectedNotification.response.preferredSlots.length > 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Donor's Preferred Times:</strong> {selectedNotification.response.preferredSlots.join(', ')}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAppointmentDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateAppointment} 
            variant="contained"
            startIcon={<CalendarToday />}
            disabled={!appointmentForm.scheduledDate || !appointmentForm.scheduledTime || !appointmentForm.location}
          >
            Schedule Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DonationFlowDashboard;
