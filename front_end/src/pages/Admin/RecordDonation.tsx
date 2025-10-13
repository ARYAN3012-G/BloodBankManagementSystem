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
import { CheckCircle, Warning, Bloodtype, Person } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  const [donors, setDonors] = useState<Donor[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [units, setUnits] = useState(1);
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [verifiedBy, setVerifiedBy] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDonors, setLoadingDonors] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      setLoadingDonors(true);
      const response = await axios.get('/api/donors');
      setDonors(response.data);
    } catch (err: any) {
      setError('Failed to load donors');
    } finally {
      setLoadingDonors(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDonor) {
      setError('Please select a donor');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await axios.post('/api/donations/record', {
        donorId: selectedDonor._id,
        collectionDate,
        units,
        location,
        notes,
        verifiedBy,
      });

      setSuccess(response.data.message);
      
      // Redirect to Donor Management after 1 second
      setTimeout(() => {
        navigate('/admin/donors');
      }, 1000);

    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to record donation');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🩸 Record Blood Donation
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Record when blood is physically collected from a donor
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

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Donor Selection */}
            <Grid item xs={12}>
              <Autocomplete
                options={donors}
                loading={loadingDonors}
                value={selectedDonor}
                onChange={(_, newValue) => setSelectedDonor(newValue)}
                getOptionLabel={(option) => `${option.userId.name} (${option.bloodGroup}) - ${option.userId.email}`}
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
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Person sx={{ mr: 1 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1">{option.userId.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.userId.email}
                        </Typography>
                      </Box>
                      <Chip label={option.bloodGroup} color="error" size="small" sx={{ mr: 1 }} />
                      {option.isEligible ? (
                        <Chip label="Eligible" color="success" size="small" />
                      ) : (
                        <Chip label={`${option.daysUntilEligible}d`} color="warning" size="small" />
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
                        <Typography variant="body2">
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
                        <Typography variant="body2">
                          <strong>Warning:</strong> This donor is not eligible yet. Next eligible date:{' '}
                          {selectedDonor.nextEligibleDate
                            ? new Date(selectedDonor.nextEligibleDate).toLocaleDateString()
                            : 'Unknown'}
                        </Typography>
                        <Typography variant="caption">
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

            {/* Collection Details */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Collection Date"
                value={collectionDate}
                onChange={(e) => setCollectionDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Units Collected"
                value={units}
                onChange={(e) => setUnits(parseInt(e.target.value) || 1)}
                inputProps={{ min: 1, max: 3 }}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Storage Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Storage Unit 1, Hyderabad, Kurnool"
                required
                helperText="Specify where the blood will be stored"
              />
            </Grid>

            <Grid item xs={12}>
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
                multiline
                rows={3}
                label="Notes (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about the donation..."
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSelectedDonor(null);
                    setUnits(1);
                    setNotes('');
                    setVerifiedBy('');
                    setError('');
                    setSuccess('');
                  }}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !selectedDonor || !selectedDonor.isActive}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Recording...' : 'Record Donation'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Important:</strong> Recording a donation will:
          </Typography>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>Update the donor's last donation date</li>
            <li>Make them ineligible for the next 90 days</li>
            <li>Add {units} unit(s) to the {selectedDonor?.bloodGroup || 'selected'} blood inventory at {location || 'specified location'}</li>
            <li>Record this in the donation history</li>
          </ul>
        </Alert>
      </Paper>
    </Container>
  );
};

export default RecordDonation;
