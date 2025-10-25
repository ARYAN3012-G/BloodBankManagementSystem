import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle,
  Cancel,
  Schedule,
  Bloodtype,
  Visibility,
  FilterList,
  PlayArrow,
  Home,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Notification {
  _id: string;
  type: string;
  priority: string;
  status: string;
  title: string;
  message: string;
  recipientId: {
    _id: string;
    userId: {
      name: string;
      email: string;
    };
    bloodGroup: string;
  };
  appointmentId?: {
    _id: string;
    scheduledDate: string;
    scheduledTime: string;
    location: string;
  };
  response?: {
    action: string;
    message?: string;
    respondedAt: string;
  };
  createdAt: string;
  sentAt?: string;
  readAt?: string;
  respondedAt?: string;
}

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications/admin/all');
      setNotifications(response.data.notifications || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'sent':
        return 'info';
      case 'read':
        return 'primary';
      case 'responded':
        return 'success';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment_confirmation':
        return <Schedule color="primary" />;
      case 'donation_request':
        return <Bloodtype color="error" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getResponseIcon = (action: string) => {
    switch (action) {
      case 'accept':
        return <CheckCircle color="success" />;
      case 'decline':
        return <Cancel color="error" />;
      default:
        return <Schedule color="warning" />;
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesStatus = filterStatus === 'all' || notification.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      notification.recipientId?.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.recipientId?.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  const stats = {
    total: notifications.length,
    pending: notifications.filter((n) => n.status === 'pending').length,
    sent: notifications.filter((n) => n.status === 'sent').length,
    responded: notifications.filter((n) => n.status === 'responded').length,
    accepted: notifications.filter((n) => n.response?.action === 'accept').length,
    declined: notifications.filter((n) => n.response?.action === 'decline').length,
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsIcon /> Sent Notifications
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          View and track all notifications sent to donors
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary">
                  {stats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Sent
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="warning.main">
                  {stats.pending}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Pending
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="info.main">
                  {stats.sent}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sent
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="success.main">
                  {stats.responded}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Responded
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="success.main">
                  {stats.accepted}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Accepted
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="error.main">
                  {stats.declined}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Declined
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FilterList />
          <TextField
            size="small"
            label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by donor name or email..."
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="Type">
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="appointment_confirmation">Appointment Confirmation</MenuItem>
              <MenuItem value="donation_request">Donation Request</MenuItem>
              <MenuItem value="appointment_reminder">Reminder</MenuItem>
              <MenuItem value="donation_thanks">Thank You</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="sent">Sent</MenuItem>
              <MenuItem value="read">Read</MenuItem>
              <MenuItem value="responded">Responded</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Notifications Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell>Type</TableCell>
                <TableCell>Donor</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Response</TableCell>
                <TableCell>Sent Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredNotifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      No notifications found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredNotifications.map((notification) => (
                  <TableRow key={notification._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTypeIcon(notification.type)}
                        <Typography variant="caption">
                          {notification.type.replace('_', ' ').toUpperCase()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {notification.recipientId?.userId?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.recipientId?.userId?.email || 'No email'}
                        </Typography>
                        <br />
                        <Chip
                          label={notification.recipientId?.bloodGroup || 'N/A'}
                          size="small"
                          color="error"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {notification.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={notification.status.toUpperCase()}
                        size="small"
                        color={getStatusColor(notification.status) as any}
                      />
                    </TableCell>
                    <TableCell>
                      {notification.response?.action ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getResponseIcon(notification.response.action)}
                          <Typography variant="caption" sx={{ fontWeight: 500 }}>
                            {notification.response.action.toUpperCase()}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No response
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {notification.sentAt
                          ? new Date(notification.sentAt).toLocaleString()
                          : new Date(notification.createdAt).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small"
                            onClick={() => {
                              setSelectedNotification(notification);
                              setDetailsDialog(true);
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {notification.type === 'appointment_confirmation' && 
                         notification.response?.action === 'accept' && (
                          <Tooltip title="Complete Donation">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => {
                                navigate('/admin/record-donation', {
                                  state: {
                                    donorId: notification.recipientId._id,
                                    appointmentId: notification.appointmentId?._id,
                                    fromNotification: true
                                  }
                                });
                              }}
                            >
                              <PlayArrow fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Notification Details Dialog */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedNotification && getTypeIcon(selectedNotification.type)}
            Notification Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Box>
              <Grid container spacing={2}>
                {/* Donor Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Donor Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2">
                    <strong>Name:</strong> {selectedNotification.recipientId?.userId?.name || 'Unknown'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {selectedNotification.recipientId?.userId?.email || 'No email'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Blood Group:</strong>{' '}
                    <Chip
                      label={selectedNotification.recipientId?.bloodGroup || 'N/A'}
                      size="small"
                      color="error"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Grid>

                {/* Notification Details */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Notification Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" gutterBottom>
                    <strong>Title:</strong> {selectedNotification.title}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Message:</strong> {selectedNotification.message}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Type:</strong>{' '}
                    <Chip
                      label={selectedNotification.type.replace('_', ' ').toUpperCase()}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Priority:</strong>{' '}
                    <Chip
                      label={selectedNotification.priority.toUpperCase()}
                      size="small"
                      color={selectedNotification.priority === 'high' ? 'error' : 'default'}
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Status:</strong>{' '}
                    <Chip
                      label={selectedNotification.status.toUpperCase()}
                      size="small"
                      color={getStatusColor(selectedNotification.status) as any}
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Grid>

                {/* Appointment Information */}
                {selectedNotification.appointmentId && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Appointment Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2">
                      <strong>Date:</strong>{' '}
                      {new Date(selectedNotification.appointmentId.scheduledDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Time:</strong> {selectedNotification.appointmentId.scheduledTime}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Location:</strong> {selectedNotification.appointmentId.location}
                    </Typography>
                  </Grid>
                )}

                {/* Response Information */}
                {selectedNotification.response && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Donor Response
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {getResponseIcon(selectedNotification.response.action)}
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {selectedNotification.response.action.toUpperCase()}
                      </Typography>
                    </Box>
                    {selectedNotification.response.message && (
                      <Typography variant="body2">
                        <strong>Message:</strong> {selectedNotification.response.message}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      <strong>Responded At:</strong>{' '}
                      {new Date(selectedNotification.response.respondedAt).toLocaleString()}
                    </Typography>
                  </Grid>
                )}

                {/* Timestamps */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Timestamps
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2">
                    <strong>Created:</strong> {new Date(selectedNotification.createdAt).toLocaleString()}
                  </Typography>
                  {selectedNotification.sentAt && (
                    <Typography variant="body2">
                      <strong>Sent:</strong> {new Date(selectedNotification.sentAt).toLocaleString()}
                    </Typography>
                  )}
                  {selectedNotification.readAt && (
                    <Typography variant="body2">
                      <strong>Read:</strong> {new Date(selectedNotification.readAt).toLocaleString()}
                    </Typography>
                  )}
                  {selectedNotification.respondedAt && (
                    <Typography variant="body2">
                      <strong>Responded:</strong> {new Date(selectedNotification.respondedAt).toLocaleString()}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedNotification && 
           selectedNotification.type === 'appointment_confirmation' && 
           selectedNotification.response?.action === 'accept' && (
            <Button
              variant="contained"
              color="success"
              startIcon={<PlayArrow />}
              onClick={() => {
                // Navigate to RecordDonation page with appointment details
                navigate('/admin/record-donation', {
                  state: {
                    donorId: selectedNotification.recipientId._id,
                    appointmentId: selectedNotification.appointmentId?._id,
                    fromNotification: true
                  }
                });
              }}
            >
              Complete Donation
            </Button>
          )}
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NotificationsPage;
