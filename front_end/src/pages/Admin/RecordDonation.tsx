import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Grid,
  Autocomplete,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material';
import { CheckCircle, Warning, Bloodtype, Person, CalendarToday, AccessTime, LocationOn } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

interface Donor {
  _id: string;
  userId: { name: string; email: string };
  bloodGroup: string;
  isActive: boolean;
  isAvailable: boolean;
  isEligible: boolean;
  daysUntilEligible: number;
  lastDonationDate?: string;
  nextEligibleDate?: string;
}

const RecordDonation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  
  // Appointment fields
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentLocation, setAppointmentLocation] = useState('');
  
  // Donation fields
  const [units, setUnits] = useState(1);
  const [storageLocation, setStorageLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [verifiedBy, setVerifiedBy] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [loadingDonors, setLoadingDonors] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [appointmentCreated, setAppointmentCreated] = useState(false);
  const [createdAppointmentId, setCreatedAppointmentId] = useState('');

  useEffect(() => {
    fetchDonors();
  }, []);

  // Handle navigation from notifications page
  useEffect(() => {
    const state = location.state as any;
    if (state?.fromNotification && state?.donorId && state?.appointmentId && donors.length > 0) {
      const donor = donors.find(d => d._id === state.donorId);
      if (donor) {
        setSelectedDonor(donor);
        setAppointmentCreated(true);
        setCreatedAppointmentId(state.appointmentId);
        setSuccess('✅ Donor confirmed! Please fill out the donation completion details below.');
        
        // Scroll to donation completion section
        setTimeout(() => {
          const completionSection = document.getElementById('complete-donation-section');
          if (completionSection) {
            completionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500);
      }
    }
  }, [location.state, donors]);

  const fetchDonors = async () => {
    try {
      setLoadingDonors(true);
      const response = await axios.get('/api/donors');
      // Ensure we get an array
      const donorsData = Array.isArray(response.data) ? response.data : response.data.donors || [];
      setDonors(donorsData);
    } catch (err: any) {
      setError('Failed to load donors');
      setDonors([]); // Set empty array on error
    } finally {
      setLoadingDonors(false);
    }
  };

  const handleScheduleAppointment = async () => {
    if (!selectedDonor || !appointmentDate || !appointmentTime || !appointmentLocation) {
      setError('Please fill all appointment fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Create appointment
      const response = await axios.post('/api/appointments', {
        donorId: selectedDonor._id,
        requestId: null, // No specific request
        appointmentDate: `${appointmentDate}T${appointmentTime}`,
        location: appointmentLocation,
        notes: notes || 'Proactive inventory collection',
        status: 'scheduled'
      });

      setAppointmentCreated(true);
      setCreatedAppointmentId(response.data.appointment._id);
      setSuccess('Appointment scheduled successfully! Donor has been notified to confirm.');
      setLoading(false);
      
      // Redirect to notifications page after 2 seconds
      setTimeout(() => {
        navigate('/admin/notifications');
      }, 2000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to schedule appointment';
      const errorDetails = err.response?.data?.details;
      setError(errorDetails ? `${errorMsg}: ${errorDetails}` : errorMsg);
      setLoading(false);
    }
  };

  const handleCompleteNow = async () => {
    if (!selectedDonor || !storageLocation) {
      setError('Please fill storage location');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (appointmentCreated && createdAppointmentId) {
        // Complete the appointment
        await axios.post(`/api/appointments/${createdAppointmentId}/complete`, {
          unitsCollected: units,
          location: storageLocation,
          adminNotes: notes,
        });
        setSuccess('Donation completed! Inventory updated successfully.');
      } else {
        // Direct donation without appointment
        await axios.post('/api/donations/record', {
          donorId: selectedDonor._id,
          collectionDate: appointmentDate || new Date().toISOString().split('T')[0],
          units,
          location: storageLocation,
          notes,
          verifiedBy,
        });
        setSuccess('Donation recorded successfully! Inventory updated.');
      }

      // Reset form after 2 seconds
      setTimeout(() => {
        resetForm();
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete donation');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDonor(null);
    setAppointmentDate('');
    setAppointmentTime('');
    setAppointmentLocation('');
    setUnits(1);
    setStorageLocation('');
    setNotes('');
    setVerifiedBy('');
    setAppointmentCreated(false);
    setCreatedAppointmentId('');
    setError('');
    setSuccess('');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🩸 Proactive Blood Collection
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Schedule appointments and collect blood from available donors for effective inventory management
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Box>
          <Grid container spacing={3}>
            {/* Donor Selection */}
            <Grid item xs={12}>
              <Autocomplete
                options={donors.filter(d => d.isAvailable && d.isActive)}
                loading={loadingDonors}
                value={selectedDonor}
                onChange={(_, newValue) => setSelectedDonor(newValue)}
                getOptionLabel={(option) => {
                  const name = option.userId?.name || 'Unknown Donor';
                  const email = option.userId?.email || 'No email';
                  return `${name} (${option.bloodGroup}) - ${email}`;
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Donor"
                    required
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingDonors ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                    sx={{
                      '& .MuiInputBase-root': {
                        overflow: 'hidden'
                      },
                      '& .MuiInputBase-input': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
                      <Person sx={{ mr: 1, flexShrink: 0 }} />
                      <Box sx={{ flexGrow: 1, minWidth: 0, mr: 1 }}>
                        <Typography variant="body1" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {option.userId?.name || 'Unknown Donor'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                          {option.userId?.email || 'No email'}
                        </Typography>
                      </Box>
                      <Chip label={option.bloodGroup} color="error" size="small" sx={{ mr: 1, flexShrink: 0 }} />
                      {option.isEligible ? (
                        <Chip label="Eligible" color="success" size="small" sx={{ flexShrink: 0 }} />
                      ) : (
                        <Chip label={`${option.daysUntilEligible}d`} color="warning" size="small" sx={{ flexShrink: 0 }} />
                      )}
                    </Box>
                  </li>
                )}
              />
            </Grid>

            {/* Selected Donor Details */}
            {selectedDonor && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Donor Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Bloodtype sx={{ mr: 1, color: 'error.main' }} />
                          <Typography variant="body2">
                            <strong>Blood Group:</strong> {selectedDonor.bloodGroup}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Last Donation:</strong>{' '}
                          {selectedDonor.lastDonationDate
                            ? new Date(selectedDonor.lastDonationDate).toLocaleDateString()
                            : 'Never'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {selectedDonor.isEligible ? (
                            <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                          ) : (
                            <Warning sx={{ color: 'warning.main', mr: 1 }} />
                          )}
                          <Typography variant="body2">
                            <strong>Status:</strong>{' '}
                            {selectedDonor.isEligible
                              ? 'Eligible'
                              : `Not eligible for ${selectedDonor.daysUntilEligible} days`}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" component="div">
                          <strong>Active:</strong>{' '}
                          <Chip
                            label={selectedDonor.isActive ? 'Yes' : 'No'}
                            color={selectedDonor.isActive ? 'success' : 'error'}
                            size="small"
                          />
                        </Typography>
                      </Grid>
                    </Grid>

                    {!selectedDonor.isEligible && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        <Typography variant="body2" component="div">
                          <strong>Warning:</strong> This donor is not eligible yet. Next eligible date:{' '}
                          {selectedDonor.nextEligibleDate
                            ? new Date(selectedDonor.nextEligibleDate).toLocaleDateString()
                            : 'Unknown'}
                        </Typography>
                        <Typography variant="caption" component="div">
                          You can still record this donation, but please ensure medical clearance.
                        </Typography>
                      </Alert>
                    )}

                    {!selectedDonor.isActive && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Error:</strong> This donor is inactive and should not donate.
                        </Typography>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Appointment Scheduling Section */}
            {selectedDonor && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday /> Schedule Appointment
                  </Typography>
                  <Divider sx={{ mt: 1, mb: 2 }} />
                  {appointmentCreated && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Appointment already scheduled for this donor. Complete the donation below or reset to schedule a new appointment.
                    </Alert>
                  )}
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Appointment Date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                    disabled={appointmentCreated}
                    InputProps={{
                      startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Appointment Time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                    disabled={appointmentCreated}
                    InputProps={{
                      startAdornment: <AccessTime sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Appointment Location"
                    value={appointmentLocation}
                    onChange={(e) => setAppointmentLocation(e.target.value)}
                    placeholder="Blood Bank Location"
                    required
                    disabled={appointmentCreated}
                    InputProps={{
                      startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleScheduleAppointment}
                    disabled={loading || appointmentCreated || !appointmentDate || !appointmentTime || !appointmentLocation}
                    startIcon={loading ? <CircularProgress size={20} /> : <CalendarToday />}
                  >
                    {appointmentCreated ? 'Appointment Already Scheduled' : 'Schedule Appointment'}
                  </Button>
                </Grid>
              </>
            )}

            {/* Donation Collection Section (after appointment or direct) */}
            {selectedDonor && (appointmentCreated || appointmentDate) && (
              <>
                <Grid item xs={12} id="complete-donation-section">
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                    <Bloodtype /> Complete Donation
                  </Typography>
                  <Divider sx={{ mt: 1, mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Units Collected"
                    value={units}
                    onChange={(e) => setUnits(parseInt(e.target.value) || 1)}
                    inputProps={{ min: 1, max: 2 }}
                    helperText="Maximum 2 units per donation session (1 unit = ~450ml). Standard donation = 1 unit."
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Verified By (Staff Name)"
                    value={verifiedBy}
                    onChange={(e) => setVerifiedBy(e.target.value)}
                    placeholder="Enter staff member name"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Storage Location"
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    placeholder="e.g., Storage Unit 1, Hyderabad, Kurnool"
                    required
                    helperText="Specify where the blood will be stored"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notes (Optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes about the donation..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    onClick={handleCompleteNow}
                    disabled={loading || !storageLocation}
                    startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                    size="large"
                  >
                    {appointmentCreated ? 'Complete Appointment & Update Inventory' : 'Record Donation & Update Inventory'}
                  </Button>
                </Grid>
              </>
            )}

            {/* Reset Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={resetForm}
                >
                  Reset All
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2" component="div">
            <strong>Proactive Collection Process:</strong>
          </Typography>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li><strong>Step 1:</strong> Select an available donor</li>
            <li><strong>Step 2:</strong> Schedule appointment (date, time, location)</li>
            <li><strong>Step 3:</strong> Complete donation details and update inventory</li>
            <li><strong>Purpose:</strong> Build inventory proactively from available donors, independent of hospital requests</li>
          </ul>
        </Alert>
      </Paper>
    </Container>
  );
};

export default RecordDonation;
