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
  Refresh
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
  donorsNotified: number;
  donorsResponded: number;
  appointmentsScheduled: number;
  unitsCollected: number;
  createdAt: string;
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
  id: string;
  donor: {
    name: string;
    email: string;
    phone: string;
  };
  status: string;
  response?: {
    action: 'accept' | 'decline' | 'maybe';
    message?: string;
    preferredSlots?: string[];
  };
  sentAt?: string;
  respondedAt?: string;
}

const DonationFlowDashboard: React.FC = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
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

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/requests?status=pending');
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
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
      await fetchNotificationResponses(selectedRequest._id);
      await fetchRequests(); // Refresh to show updated counts
    } catch (error) {
      console.error('Failed to send notifications:', error);
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
                  <Typography variant="h6">{requests.length}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pending Requests
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
                    {requests.reduce((sum, r) => sum + r.donorsNotified, 0)}
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
                    {requests.reduce((sum, r) => sum + r.donorsResponded, 0)}
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
                    {requests.reduce((sum, r) => sum + r.appointmentsScheduled, 0)}
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
              Blood Requests
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Blood Group</TableCell>
                    <TableCell>Units</TableCell>
                    <TableCell>Urgency</TableCell>
                    <TableCell>Hospital</TableCell>
                    <TableCell>Notified</TableCell>
                    <TableCell>Responded</TableCell>
                    <TableCell>Scheduled</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request._id}>
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
                      <TableCell>{request.hospitalName || 'N/A'}</TableCell>
                      <TableCell>{request.donorsNotified}</TableCell>
                      <TableCell>{request.donorsResponded}</TableCell>
                      <TableCell>{request.appointmentsScheduled}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleRequestClick(request)}
                        >
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
                        primary={donor.name}
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
                        primary={donor.name}
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
                        primary={donor.name}
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
                Notification Responses
              </Typography>
              <List>
                {responses.map((response) => (
                  <ListItem key={response.id} divider>
                    <ListItemText
                      primary={response.donor.name}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            Status: <Chip 
                              label={response.status} 
                              size="small" 
                              color={response.status === 'responded' ? 'success' : 'default'}
                            />
                          </Typography>
                          {response.response && (
                            <Typography variant="body2" color="textSecondary">
                              Response: {response.response.action}
                              {response.response.message && ` - "${response.response.message}"`}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
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
    </Container>
  );
};

export default DonationFlowDashboard;
