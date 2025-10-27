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
  Tab,
  Snackbar
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
  Add,
  Inventory2,
  ArrowForward
} from '@mui/icons-material';
import axios from '../../config/axios';
import { useNavigate, useLocation } from 'react-router-dom';

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
  approvedOn?: string;
  updatedAt?: string;
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [completeDialog, setCompleteDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [completeForm, setCompleteForm] = useState({ unitsCollected: 1, adminNotes: '', location: '' });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchRequestsAndInventory();
    fetchAppointments();

    // Handle inventory replenishment navigation
    const state = location.state as any;
    if (state?.inventoryReplenishment && state?.bloodGroup) {
      handleInventoryReplenishment(state.bloodGroup, state.unitsNeeded || 10);
    }
  }, []);

  const handleInventoryReplenishment = (bloodGroup: string, unitsNeeded: number) => {
    // Create a pseudo-request for inventory replenishment
    const pseudoRequest: BloodRequest = {
      _id: `inventory-${bloodGroup}-${Date.now()}`,
      bloodGroup,
      unitsRequested: unitsNeeded,
      urgency: 'high',
      status: 'approved',
      hospitalName: 'Inventory Replenishment',
      createdAt: new Date().toISOString(),
      patientName: 'N/A - Stock Replenishment'
    };

    setSelectedRequest(pseudoRequest);
    setDialogOpen(true);
    setTabValue(0); // Start with Find Donors tab
    fetchSuitableDonors(pseudoRequest._id, bloodGroup);

    setSnackbar({
      open: true,
      message: `🩸 Initiating donor search for ${bloodGroup} inventory replenishment (${unitsNeeded} units needed)`,
      severity: 'info'
    });
  };

  const fetchRequestsAndInventory = async () => {
    try {
      setLoading(true);
      
      // Fetch both requests and inventory in parallel
      const [requestsResponse, inventoryResponse] = await Promise.all([
        axios.get('/api/requests'),
        axios.get('/api/inventory')
      ]);
      
      // Handle requests data
      let requestsData = [];
      if (Array.isArray(requestsResponse.data)) {
        requestsData = requestsResponse.data;
      } else if (requestsResponse.data.requests) {
        requestsData = requestsResponse.data.requests;
      } else {
        requestsData = [];
      }
      
      // Filter out proactive inventory requests (they have their own dashboard)
      requestsData = requestsData.filter((req: any) => req.type !== 'proactive_inventory');
      
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
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setRequests([]);
      setInventory([]);
      setRequestsWithInventoryIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkInventorySatisfied = async (request: BloodRequest) => {
    try {
      // Close dialog and navigate to Request Management page with this request highlighted
      setDialogOpen(false);
      
      // Navigate to requests page with state to open approval dialog for this request
      navigate('/admin/requests', { 
        state: { 
          openApprovalDialog: true, 
          requestId: request._id,
          fromDonationFlow: true 
        } 
      });
      
    } catch (error: any) {
      console.error('❌ Navigation error:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to navigate to request review', 
        severity: 'error' 
      });
    }
  };

  const filterRequestsWithInventoryIssues = (requests: BloodRequest[], inventory: any[]) => {
    return requests.filter(request => {
      // Only show pending or approved requests (not fulfilled, collected, or verified)
      // Exclude fulfilled/collected/verified as they should be in Blood Request Management
      if (!['pending', 'approved'].includes(request.status)) {
        return false;
      }
      
      // Calculate total inventory for this blood group (sum all lots)
      const availableUnits = inventory
        .filter(item => item.bloodGroup === request.bloodGroup)
        .reduce((total, item) => total + (item.units || 0), 0);
      
      // Check if requested units exceed available units
      // OR if approved but still collecting blood (unitsCollected < unitsRequested)
      const needsMoreBlood = request.unitsRequested > (request.unitsCollected || 0);
      const insufficientInventory = request.unitsRequested > availableUnits;
      
      return needsMoreBlood && insufficientInventory;
    });
  };

  const fetchSuitableDonors = async (requestId: string, bloodGroup?: string) => {
    try {
      // If bloodGroup is provided (inventory replenishment), use a different API
      if (bloodGroup) {
        // Fetch eligible donors for this blood group directly
        const response = await axios.get(`/api/donors/eligible?bloodGroup=${bloodGroup}`);
        const eligibleDonors = response.data.donors || [];
        
        // Categorize by eligibility
        const recommendations = {
          highPriority: eligibleDonors.filter((d: any) => d.isCurrentlyEligible),
          mediumPriority: eligibleDonors.filter((d: any) => !d.isCurrentlyEligible && d.daysUntilEligible <= 30),
          lowPriority: eligibleDonors.filter((d: any) => !d.isCurrentlyEligible && d.daysUntilEligible > 30)
        };
        setDonors(recommendations);
      } else {
        // Normal request flow
        const response = await axios.get(`/api/requests/${requestId}/suitable-donors`);
        const recommendations = response.data.donorRecommendations || { highPriority: [], mediumPriority: [], lowPriority: [] };
        setDonors(recommendations);
      }
    } catch (error) {
      console.error('Failed to fetch suitable donors:', error);
      // Reset to empty state on error
      setDonors({ highPriority: [], mediumPriority: [], lowPriority: [] });
    }
  };

  const fetchNotificationResponses = async (requestId: string) => {
    try {
      const response = await axios.get(`/api/requests/${requestId}/notification-responses`);
      setResponses(response.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notification responses:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/appointments?status=scheduled,confirmed,in_progress');
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  const fetchRequestAppointments = async (requestId: string) => {
    try {
      // Fetch appointments filtered by requestId on backend - include completed appointments
      const response = await axios.get(`/api/appointments?requestId=${requestId}&status=scheduled,confirmed,in_progress,completed`);
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Failed to fetch request appointments:', error);
    }
  };

  const handleConfirmArrival = async (appointmentId: string) => {
    try {
      await axios.patch(`/api/appointments/${appointmentId}/status`, { status: 'confirmed' });
      setSnackbar({ open: true, message: '✅ Donor arrival confirmed!', severity: 'success' });
      if (selectedRequest) {
        await fetchRequestAppointments(selectedRequest._id);
      }
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.error || 'Failed to confirm arrival', severity: 'error' });
    }
  };

  const handleStartDonation = async (appointmentId: string) => {
    try {
      await axios.patch(`/api/appointments/${appointmentId}/status`, { status: 'in_progress' });
      setSnackbar({ open: true, message: '🩸 Donation started!', severity: 'info' });
      if (selectedRequest) {
        await fetchRequestAppointments(selectedRequest._id);
      }
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.error || 'Failed to start donation', severity: 'error' });
    }
  };

  const handleCompleteAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setCompleteForm({
      unitsCollected: 1,
      adminNotes: '',
      location: appointment.location
    });
    setCompleteDialog(true);
  };

  const submitCompleteAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      await axios.post(`/api/appointments/${selectedAppointment._id}/complete`, completeForm);
      
      setCompleteDialog(false);
      setSelectedAppointment(null);
      setCompleteForm({ unitsCollected: 1, adminNotes: '', location: '' });
      
      // Refresh data
      await fetchAppointments();
      await fetchRequestsAndInventory();
      if (selectedRequest) {
        await fetchNotificationResponses(selectedRequest._id);
        await fetchRequestAppointments(selectedRequest._id);
      }
      
      // Check if request has collected enough units
      const hasEnoughUnits = selectedRequest && 
        selectedRequest.unitsRequested <= (selectedRequest.unitsCollected || 0) + completeForm.unitsCollected;
      
      if (hasEnoughUnits) {
        setSnackbar({ 
          open: true, 
          message: `✅ Donation completed! Enough blood collected. Use "Review & Approve" button to finalize the request.`, 
          severity: 'success' 
        });
      } else {
        setSnackbar({ 
          open: true, 
          message: '✅ Donation completed! Blood recorded in inventory. More donations needed to fulfill request.', 
          severity: 'success' 
        });
      }
    } catch (error: any) {
      console.error('Failed to complete appointment:', error);
      setSnackbar({ open: true, message: error.response?.data?.error || 'Failed to complete appointment', severity: 'error' });
    }
  };

  const handleRequestClick = async (request: BloodRequest) => {
    setSelectedRequest(request);
    setDialogOpen(true);
    setTabValue(0); // Reset to first tab
    await fetchSuitableDonors(request._id);
    await fetchNotificationResponses(request._id);
    await fetchRequestAppointments(request._id);
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
      
      // Refresh to show updated counts
      await fetchNotificationResponses(selectedRequest._id);
      await fetchRequestsAndInventory(); // Refresh to show updated counts
      
      setSnackbar({ open: true, message: `Notifications sent successfully to ${selectedDonors.length} donors!`, severity: 'success' });
    } catch (error) {
      console.error('Failed to send notifications:', error);
      setSnackbar({ open: true, message: 'Failed to send notifications. Please try again.', severity: 'error' });
    }
  };

  const handleScheduleAppointment = (notification: NotificationResponse) => {
    // Check if notification has valid donor data
    if (!notification.recipientId || !notification.recipientId._id) {
      setSnackbar({ open: true, message: 'Cannot schedule appointment: Donor information is missing', severity: 'error' });
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
      const response = await axios.post('/api/appointments/from-notification', {
        notificationId: selectedNotification._id,
        scheduledDate: appointmentForm.scheduledDate,
        scheduledTime: appointmentForm.scheduledTime,
        location: appointmentForm.location,
        donorNotes: appointmentForm.donorNotes
      });

      setAppointmentDialog(false);
      setSelectedNotification(null);
      setAppointmentForm({ scheduledDate: '', scheduledTime: '', location: '', donorNotes: '' });
      
      // Refresh data to update UI
      await fetchNotificationResponses(selectedRequest!._id);
      await fetchRequestAppointments(selectedRequest!._id);
      await fetchRequestsAndInventory();
      
      // Switch to appointments tab to show the scheduled appointment
      setTabValue(2);
      
      setSnackbar({ open: true, message: 'Appointment scheduled successfully!', severity: 'success' });
    } catch (error: any) {
      console.error('Failed to create appointment:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.details 
        ? `${error.response.data.error}: ${error.response.data.details}`
        : error.response?.data?.error || 'Failed to create appointment';
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
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

  const getAppointmentStatus = (appointmentId: string) => {
    const appointment = appointments.find(apt => apt._id === appointmentId);
    return appointment?.status || null;
  };

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'warning';
      case 'confirmed': return 'info';
      case 'in_progress': return 'secondary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'no-show': return 'error';
      default: return 'default';
    }
  };

  const getAppointmentStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return '📅 Scheduled';
      case 'confirmed': return '✅ Confirmed (Arrived)';
      case 'in_progress': return '🩸 In Progress';
      case 'completed': return '✔️ Completed';
      case 'cancelled': return '❌ Cancelled';
      case 'no-show': return '⚠️ No Show';
      default: return status;
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            🩸 Donation Flow Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            Manage blood requests with insufficient inventory by finding donors and scheduling collections
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<CheckCircle />}
          onClick={() => window.open('/admin/process-guide', '_blank')}
          sx={{ height: 'fit-content' }}
        >
          View Complete Process
        </Button>
      </Box>

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
            
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                📋 Donation Flow Process:
              </Typography>
              <Typography variant="body2" component="div">
                • <strong>Insufficient Inventory?</strong> Click <strong>"Manage"</strong> → Find donors → Send notifications → Schedule appointments → Collect donations
                <br />
                • <strong>Inventory Satisfied?</strong> Click <strong>"Review & Approve"</strong> → Redirects to request review page to schedule hospital collection
                <br />
                • <strong>Tip:</strong> Once donations are collected and inventory is replenished, the green "Review & Approve" button will appear automatically
              </Typography>
            </Alert>
            
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
                      // Calculate total inventory for this blood group (sum all lots)
                      const availableUnits = inventory
                        .filter(item => item.bloodGroup === request.bloodGroup)
                        .reduce((total, item) => total + (item.units || 0), 0);
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
                            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                              {availableUnits >= request.unitsRequested ? (
                                <>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    onClick={() => handleMarkInventorySatisfied(request)}
                                    startIcon={<CheckCircle />}
                                    fullWidth
                                  >
                                    Review & Approve
                                  </Button>
                                  <Typography variant="caption" color="success.main" sx={{ textAlign: 'center' }}>
                                    ✅ {availableUnits} units available
                                  </Typography>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleRequestClick(request)}
                                    startIcon={<Schedule />}
                                    fullWidth
                                  >
                                    Manage
                                  </Button>
                                  <Typography variant="caption" color="error.main" sx={{ textAlign: 'center' }}>
                                    ⚠️ Need {shortage} more units
                                  </Typography>
                                </>
                              )}
                            </Box>
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
            <Tabs value={tabValue} onChange={(_, newValue) => {
              setTabValue(newValue);
              // Refresh appointments data when switching to Responses or Appointments tab
              if ((newValue === 1 || newValue === 2) && selectedRequest) {
                fetchRequestAppointments(selectedRequest._id);
              }
            }}>
              <Tab label="1. Find Donors" icon={<Person />} iconPosition="start" />
              <Tab label="2. Responses" icon={<Notifications />} iconPosition="start" />
              <Tab label="3. Appointments" icon={<Schedule />} iconPosition="start" />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <Grid container spacing={2}>
              {/* High Priority Donors */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" color="success.main" gutterBottom>
                  🎯 High Priority ({donors?.highPriority?.length || 0})
                </Typography>
                <List dense>
                  {(donors?.highPriority || []).map((donor) => (
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
                  ⭐ Medium Priority ({donors?.mediumPriority?.length || 0})
                </Typography>
                <List dense>
                  {(donors?.mediumPriority || []).map((donor) => (
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
                  📋 Low Priority ({donors?.lowPriority?.length || 0})
                </Typography>
                <List dense>
                  {(donors?.lowPriority || []).map((donor) => (
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
                                      Preferred: {response.response.preferredSlots.map((slot: any) => {
                                        const date = new Date(slot);
                                        return date.toLocaleString('en-IN', { 
                                          dateStyle: 'short', 
                                          timeStyle: 'short',
                                          hour12: true
                                        });
                                      }).join(', ')}
                                    </Typography>
                                  )}
                                  {response.appointmentId && (
                                    <Box sx={{ mt: 1 }}>
                                      <Chip 
                                        label={getAppointmentStatusLabel(getAppointmentStatus(response.appointmentId) || 'scheduled')} 
                                        size="small" 
                                        color={getAppointmentStatusColor(getAppointmentStatus(response.appointmentId) || 'scheduled') as any}
                                      />
                                    </Box>
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
                                <Chip 
                                  label={getAppointmentStatus(response.appointmentId) || 'Scheduled'} 
                                  color={getAppointmentStatusColor(getAppointmentStatus(response.appointmentId) || 'scheduled') as any}
                                  size="small" 
                                />
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

          {tabValue === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Scheduled Appointments ({appointments.length})
                </Typography>
                <Button
                  size="small"
                  startIcon={<Refresh />}
                  onClick={() => selectedRequest && fetchRequestAppointments(selectedRequest._id)}
                >
                  Refresh
                </Button>
              </Box>

              {appointments.length === 0 ? (
                <Alert severity="info">
                  <Typography variant="body1">
                    <strong>No appointments scheduled yet.</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    📋 <strong>Process:</strong>
                    <ol style={{ marginTop: '8px', marginBottom: 0 }}>
                      <li>Go to "1. Find Donors" tab → Select and notify suitable donors</li>
                      <li>Wait for donors to accept in "2. Responses" tab</li>
                      <li>Click "Schedule" button next to accepted responses</li>
                      <li>Once scheduled, appointments will appear here</li>
                      <li>Click "Complete" to record the donation and update inventory</li>
                    </ol>
                  </Typography>
                </Alert>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Donor</TableCell>
                        <TableCell>Blood Group</TableCell>
                        <TableCell>Contact</TableCell>
                        <TableCell>Date & Time</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {appointments.map((appointment) => (
                        <TableRow key={appointment._id}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {appointment.donorId?.name || 'Unknown'}
                              </Typography>
                              {appointment.donorNotes && (
                                <Typography variant="caption" color="textSecondary">
                                  Note: {appointment.donorNotes}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={appointment.bloodGroup} color="primary" size="small" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {appointment.donorId?.phone || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(appointment.scheduledDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {appointment.scheduledTime}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 200 }}>
                              {appointment.location}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={appointment.status} 
                              color={
                                appointment.status === 'scheduled' ? 'warning' :
                                appointment.status === 'confirmed' ? 'info' :
                                appointment.status === 'in_progress' ? 'secondary' : 'default'
                              } 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                              {appointment.status === 'scheduled' && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  onClick={() => handleConfirmArrival(appointment._id)}
                                  fullWidth
                                >
                                  ✅ Confirm Arrival
                                </Button>
                              )}
                              {appointment.status === 'confirmed' && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="secondary"
                                  onClick={() => handleStartDonation(appointment._id)}
                                  fullWidth
                                >
                                  🩸 Start Donation
                                </Button>
                              )}
                              {(appointment.status === 'in_progress' || appointment.status === 'confirmed') && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleCompleteAppointment(appointment)}
                                  startIcon={<CheckCircle />}
                                  fullWidth
                                >
                                  Complete
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
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
                    <strong>Donor's Preferred Times:</strong> {selectedNotification.response.preferredSlots.map((slot: any) => {
                      const date = new Date(slot);
                      // Display in local timezone with full date and time
                      return date.toLocaleString('en-IN', { 
                        dateStyle: 'medium', 
                        timeStyle: 'short',
                        hour12: true
                      });
                    }).join(' | ')}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                    Times shown in your local timezone (IST)
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

      {/* Complete Appointment Dialog */}
      <Dialog open={completeDialog} onClose={() => setCompleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
            Complete Appointment
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box sx={{ pt: 1 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Donor:</strong> {selectedAppointment.donorId?.name || 'Unknown'}<br />
                  <strong>Blood Group:</strong> {selectedAppointment.bloodGroup}<br />
                  <strong>Date:</strong> {new Date(selectedAppointment.scheduledDate).toLocaleDateString()} at {selectedAppointment.scheduledTime}
                </Typography>
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Units Collected"
                    value={completeForm.unitsCollected}
                    onChange={(e) => setCompleteForm(prev => ({ ...prev, unitsCollected: parseInt(e.target.value) || 1 }))}
                    inputProps={{ min: 1, max: 5 }}
                    required
                    helperText="Typically 1 unit (450ml) per donation"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Collection Location"
                    value={completeForm.location}
                    onChange={(e) => setCompleteForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Arts Blood Foundation - Main Center"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Admin Notes (Optional)"
                    value={completeForm.adminNotes}
                    onChange={(e) => setCompleteForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                    placeholder="Any observations or notes about the donation..."
                  />
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>🔄 What happens after clicking "Complete Donation":</strong>
                </Typography>
              </Alert>
              <Box sx={{ pl: 2, mt: 1 }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  ✅ <strong>Step 1:</strong> Donation recorded in system
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  📦 <strong>Step 2:</strong> Inventory updated (+{completeForm.unitsCollected} unit, expires in 35 days)
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  👤 <strong>Step 3:</strong> Donor history updated (ineligible for 90 days)
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  🏥 <strong>Step 4:</strong> Request status checked
                </Typography>
                {selectedAppointment && selectedAppointment.requestId && (() => {
                  const request = selectedAppointment.requestId;
                  const currentCollected = request.unitsCollected || 0;
                  const willBeFulfilled = (currentCollected + completeForm.unitsCollected) >= request.unitsRequested;
                  
                  return (
                    <>
                      <Typography variant="body2" sx={{ pl: 3, fontSize: '0.85rem', color: 'text.secondary' }}>
                        • Current: {currentCollected}/{request.unitsRequested} units collected
                      </Typography>
                      <Typography variant="body2" sx={{ pl: 3, fontSize: '0.85rem', color: 'text.secondary', mb: 0.5 }}>
                        • After this donation: {currentCollected + completeForm.unitsCollected}/{request.unitsRequested} units
                      </Typography>
                      {willBeFulfilled ? (
                        <>
                          <Alert severity="success" icon={false} sx={{ mt: 1, mb: 1, py: 0.5 }}>
                            <Typography variant="body2">
                              🎉 <strong>Request will be FULFILLED!</strong><br />
                              • Moved to Blood Request Management<br />
                              • Removed from Donation Flow Dashboard<br />
                              • Hospital can collect blood
                            </Typography>
                          </Alert>
                        </>
                      ) : (
                        <Alert severity="warning" icon={false} sx={{ mt: 1, mb: 1, py: 0.5 }}>
                          <Typography variant="body2">
                            ⚠️ More donations needed ({request.unitsRequested - (currentCollected + completeForm.unitsCollected)} units remaining)
                          </Typography>
                        </Alert>
                      )}
                    </>
                  );
                })()}
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  📍 <strong>Step 5:</strong> Appointment marked as completed
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  🗑️ <strong>Step 6:</strong> Removed from active appointments list
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={submitCompleteAppointment} 
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            disabled={!completeForm.unitsCollected || completeForm.unitsCollected <= 0}
          >
            Complete Donation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DonationFlowDashboard;
