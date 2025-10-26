import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Checkbox,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  PersonSearch,
  Send,
  CheckCircle,
  Info,
  Phone,
  Email,
  Bloodtype,
  CalendarToday,
} from '@mui/icons-material';
import axios from '../../config/axios';

interface DonorInfo {
  _id: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup: string;
  status: string;
  lastDonationDate?: string;
  nextEligibleDate?: string;
  totalDonations: number;
  donorType: string;
}

const ProactiveDonorRecruitment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { bloodGroup, unitsNeeded } = location.state || {};
  
  const [eligibleDonors, setEligibleDonors] = useState<DonorInfo[]>([]);
  const [selectedDonors, setSelectedDonors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingNotifications, setSendingNotifications] = useState(false);
  const [message, setMessage] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });

  useEffect(() => {
    if (bloodGroup) {
      fetchEligibleDonors();
      setMessage(`We urgently need ${bloodGroup} blood donations. Your contribution can save lives. Are you available to donate?`);
    }
  }, [bloodGroup]);

  const fetchEligibleDonors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/donors/eligible/${bloodGroup}`);
      setEligibleDonors(response.data.donors || []);
    } catch (error: any) {
      console.error('Failed to fetch eligible donors:', error);
      setSnackbar({ open: true, message: 'Failed to fetch eligible donors', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleDonorSelection = (donorId: string) => {
    setSelectedDonors(prev =>
      prev.includes(donorId)
        ? prev.filter(id => id !== donorId)
        : [...prev, donorId]
    );
  };

  const selectAll = () => {
    if (selectedDonors.length === eligibleDonors.length) {
      setSelectedDonors([]);
    } else {
      setSelectedDonors(eligibleDonors.map(d => d._id));
    }
  };

  const handleSendNotifications = async () => {
    if (selectedDonors.length === 0) {
      setSnackbar({ open: true, message: 'Please select at least one donor', severity: 'warning' });
      return;
    }

    try {
      setSendingNotifications(true);
      
      // Create a proactive inventory request
      const requestResponse = await axios.post('/api/requests/proactive', {
        bloodGroup,
        unitsRequested: unitsNeeded || 5,
        urgency: 'High',
        notes: `Proactive inventory replenishment for ${bloodGroup}`,
        type: 'proactive_inventory'
      });

      const requestId = requestResponse.data._id;

      // Send notifications to selected donors
      await axios.post('/api/notifications/send-donation-request', {
        requestId,
        donorIds: selectedDonors,
        message,
        priority: 'urgent',
        expiresInHours: 48
      });

      setConfirmDialog(false);
      setSnackbar({ 
        open: true, 
        message: `Notifications sent to ${selectedDonors.length} donors successfully! Reloading...`, 
        severity: 'success' 
      });

      // Stay on the same page and show tracking dashboard
      setTimeout(() => {
        window.location.href = `/admin/proactive-tracking/${requestId}`;
      }, 1500);

    } catch (error: any) {
      console.error('Failed to send notifications:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.error || 'Failed to send notifications', 
        severity: 'error' 
      });
    } finally {
      setSendingNotifications(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!bloodGroup) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Invalid access. Please select a blood group from the Inventory Status page.
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/inventory-status')}
          sx={{ mt: 2 }}
        >
          Back to Inventory
        </Button>
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
            Proactive Donor Recruitment
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Find and recruit donors for critical stock replenishment
          </Typography>
        </Box>
      </Box>

      {/* Summary Card */}
      <Card sx={{ mb: 3, bgcolor: 'error.50', borderLeft: 4, borderColor: 'error.main' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Bloodtype color="error" />
                <Typography variant="h5">
                  Blood Group: <strong>{bloodGroup}</strong>
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body1">
                Units Needed: <strong>{unitsNeeded || 5} units</strong>
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Chip 
                label="CRITICAL STOCK ALERT"
                color="error"
                icon={<Info />}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>How it works:</strong>
        </Typography>
        <Typography variant="body2" component="ul" sx={{ mt: 1, ml: 2 }}>
          <li>Select eligible donors from the list below</li>
          <li>Customize the notification message</li>
          <li>Send urgent notifications to selected donors</li>
          <li>You'll be redirected to a dedicated tracking dashboard</li>
          <li>Track responses → Schedule appointments → Complete donations</li>
          <li>Inventory will be automatically updated after each completed donation</li>
        </Typography>
      </Alert>

      {/* Donor Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Eligible Donors ({eligibleDonors.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                onClick={selectAll}
                variant="outlined"
              >
                {selectedDonors.length === eligibleDonors.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Chip 
                label={`${selectedDonors.length} Selected`}
                color="primary"
                variant={selectedDonors.length > 0 ? 'filled' : 'outlined'}
              />
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2 }}>Loading eligible donors...</Typography>
            </Box>
          ) : eligibleDonors.length === 0 ? (
            <Alert severity="warning">
              No eligible donors found for {bloodGroup} blood group. 
              All donors may be currently ineligible or unavailable.
            </Alert>
          ) : (
            <List>
              {eligibleDonors.map((donor, index) => (
                <React.Fragment key={donor._id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    button
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        checked={selectedDonors.includes(donor._id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleDonorSelection(donor._id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    }
                    sx={{ 
                      '&:hover': { bgcolor: 'action.hover' },
                      cursor: 'pointer'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDonorSelection(donor._id);
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {donor.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Typography variant="subtitle1">{donor.name}</Typography>
                          <Chip 
                            label={donor.bloodGroup}
                            size="small"
                            color="error"
                            variant="outlined"
                          />
                          <Chip 
                            label={donor.donorType}
                            size="small"
                            color="info"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" component="span">
                            <Phone sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                            {donor.phone} | 
                            <Email sx={{ fontSize: 14, mx: 0.5, verticalAlign: 'middle' }} />
                            {donor.email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Donations: {donor.totalDonations} | 
                            {donor.lastDonationDate && ` Last: ${formatDate(donor.lastDonationDate)}`}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Message Customization */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notification Message
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Customize the message to send to donors..."
            helperText="This message will be sent to all selected donors"
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/inventory-status')}
        >
          Back to Inventory
        </Button>
        <Button
          variant="contained"
          color="error"
          size="large"
          startIcon={<Send />}
          onClick={() => setConfirmDialog(true)}
          disabled={selectedDonors.length === 0 || !message.trim()}
        >
          Send Notifications to {selectedDonors.length} Donors
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Confirm Notification Send
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            You are about to send urgent notifications to <strong>{selectedDonors.length} donors</strong> for <strong>{bloodGroup}</strong> blood group.
          </Alert>
          <Typography variant="body2" paragraph>
            <strong>Message:</strong>
          </Typography>
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, fontStyle: 'italic' }}>
            {message}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} disabled={sendingNotifications}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleSendNotifications}
            disabled={sendingNotifications}
            startIcon={sendingNotifications ? <CircularProgress size={20} /> : <Send />}
          >
            {sendingNotifications ? 'Sending...' : 'Confirm & Send'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar would go here - simplified for now */}
      {snackbar.open && (
        <Alert severity={snackbar.severity} sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
          {snackbar.message}
        </Alert>
      )}
    </Container>
  );
};

export default ProactiveDonorRecruitment;
