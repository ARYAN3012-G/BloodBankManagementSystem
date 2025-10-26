import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  Divider,
  Stack,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Schedule,
  CalendarToday,
  LocationOn,
  Info,
  Warning,
  EventRepeat,
  Close,
  Verified,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Request {
  _id: string;
  bloodGroup: string;
  unitsRequested: number;
  urgency: string;
  status: 'pending' | 'approved' | 'collected' | 'verified' | 'no-show' | 'rejected' | 'cancelled' | 'reschedule-requested';
  createdAt: string;
  approvedOn?: string;
  rejectedOn?: string;
  rejectionReason?: string;
  collectionDate?: string;
  collectionLocation?: string;
  collectionInstructions?: string;
  collectedAt?: string;
  verifiedByAdmin?: boolean;
  verifiedAt?: string;
  rescheduleRequested?: boolean;
  rescheduleReason?: string;
  newRequestedDate?: string;
  noShowReason?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

const MyRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Dialog states
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  // Form states
  const [newDate, setNewDate] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/requests');
      setRequests(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCollection = async () => {
    if (!selectedRequest) return;

    try {
      setSubmitting(true);
      await axios.post(`/api/requests/${selectedRequest._id}/confirm-collection`);
      setSuccess('Collection confirmed successfully! Thank you!');
      setConfirmOpen(false);
      await fetchRequests();
    } catch (err: any) {
      console.error('Confirm collection error:', err);
      setError(err.response?.data?.error || 'Failed to confirm collection');
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestReschedule = async () => {
    if (!selectedRequest || !newDate) return;

    try {
      setSubmitting(true);
      await axios.post(`/api/requests/${selectedRequest._id}/request-reschedule`, {
        newDate,
        reason: rescheduleReason
      });
      setSuccess('Reschedule request submitted. Waiting for admin approval.');
      setRescheduleOpen(false);
      setNewDate('');
      setRescheduleReason('');
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to request reschedule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!selectedRequest || !cancelReason) return;

    try {
      setSubmitting(true);
      await axios.post(`/api/requests/${selectedRequest._id}/cancel`, {
        reason: cancelReason
      });
      setSuccess('Request cancelled successfully.');
      setCancelOpen(false);
      setCancelReason('');
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'collected': return 'info';
      case 'verified': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'default';
      case 'no-show': return 'warning';
      case 'reschedule-requested': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle fontSize="small" />;
      case 'collected': return <CheckCircle fontSize="small" />;
      case 'verified': return <Verified fontSize="small" />;
      case 'rejected': return <Cancel fontSize="small" />;
      case 'no-show': return <Warning fontSize="small" />;
      case 'reschedule-requested': return <EventRepeat fontSize="small" />;
      default: return <Schedule fontSize="small" />;
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'bloodGroup',
      headerName: 'Blood Group',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.row.bloodGroup}
          color="error"
          size="small"
          sx={{ fontWeight: 'bold' }}
        />
      ),
    },
    {
      field: 'unitsRequested',
      headerName: 'Units',
      width: 80,
    },
    {
      field: 'urgency',
      headerName: 'Urgency',
      width: 110,
      renderCell: (params) => {
        const color = params.row.urgency === 'Critical' ? 'error' : 
                      params.row.urgency === 'High' ? 'warning' : 'info';
        return (
          <Chip
            label={params.row.urgency}
            color={color}
            size="small"
          />
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.row.status.toUpperCase().replace('-', ' ')}
          color={getStatusColor(params.row.status)}
          size="small"
          icon={getStatusIcon(params.row.status)}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Requested On',
      width: 130,
      valueGetter: (params) => new Date(params.row.createdAt).toLocaleDateString(),
    },
    {
      field: 'collectionDate',
      headerName: 'Collection Date',
      width: 130,
      valueGetter: (params) => params.row.collectionDate 
        ? new Date(params.row.collectionDate).toLocaleDateString()
        : 'N/A',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 350,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {params.row.status === 'approved' && (
            <>
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => {
                  setSelectedRequest(params.row);
                  setConfirmOpen(true);
                }}
              >
                I Collected
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                startIcon={<EventRepeat />}
                onClick={() => {
                  setSelectedRequest(params.row);
                  setRescheduleOpen(true);
                }}
              >
                Reschedule
              </Button>
              <Button
                size="small"
                variant="text"
                color="error"
                startIcon={<Close />}
                onClick={() => {
                  setSelectedRequest(params.row);
                  setCancelOpen(true);
                }}
              >
                Cancel
              </Button>
            </>
          )}
          {params.row.status === 'collected' && !params.row.verifiedByAdmin && (
            <Chip
              label="Pending Verification"
              color="warning"
              size="small"
              icon={<Schedule />}
            />
          )}
          {params.row.status === 'verified' && (
            <Chip
              label="Verified ✓"
              color="success"
              size="small"
              icon={<Verified />}
            />
          )}
        </Box>
      ),
    },
  ];

  // Calculate summary statistics
  const summary = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending' || r.status === 'reschedule-requested').length,
    approved: requests.filter(r => r.status === 'approved' || r.status === 'collected' || r.status === 'verified').length,
    rejected: requests.filter(r => r.status === 'rejected' || r.status === 'cancelled' || r.status === 'no-show').length,
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading your requests...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        My Blood Requests
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        View and track all your blood requests
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', bgcolor: '#f50057', color: 'white' }}>
              <Typography variant="h3" fontWeight="bold">{summary.total}</Typography>
              <Typography variant="body2">Total Requests</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', bgcolor: '#ff9800', color: 'white' }}>
              <Typography variant="h3" fontWeight="bold">{summary.pending}</Typography>
              <Typography variant="body2">Pending</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', bgcolor: '#4caf50', color: 'white' }}>
              <Typography variant="h3" fontWeight="bold">{summary.approved}</Typography>
              <Typography variant="body2">Approved</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', bgcolor: '#f44336', color: 'white' }}>
              <Typography variant="h3" fontWeight="bold">{summary.rejected}</Typography>
              <Typography variant="body2">Rejected</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed status cards for approved/rejected/verified requests */}
      {requests.filter(r => r.status === 'approved' || r.status === 'rejected' || r.status === 'reschedule-requested' || r.status === 'verified' || r.status === 'collected').slice(0, 3).map((request) => {
        const borderColor = 
          request.status === 'approved' || request.status === 'verified' || request.status === 'collected' ? '#4caf50' :
          request.status === 'rejected' ? '#f44336' :
          '#ff9800';
        
        return (
        <Card key={request._id} sx={{ mb: 2, border: `2px solid ${borderColor}` }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="bold">
                {request.bloodGroup} Blood - {request.unitsRequested} Unit(s)
              </Typography>
              <Chip
                label={request.status.toUpperCase().replace('-', ' ')}
                color={getStatusColor(request.status)}
                icon={getStatusIcon(request.status)}
              />
            </Stack>
            <Divider sx={{ my: 2 }} />

            {request.status === 'approved' && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      <strong>Collection Date:</strong> {request.collectionDate ? new Date(request.collectionDate).toLocaleDateString() : 'Not set'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ mr: 1, color: 'error.main' }} />
                    <Typography variant="body1">
                      <strong>Location:</strong> {request.collectionLocation || 'Not specified'}
                    </Typography>
                  </Box>
                  {request.collectionInstructions && (
                    <Box sx={{ display: 'flex', alignItems: 'start', mt: 2 }}>
                      <Info sx={{ mr: 1, color: 'info.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Instructions:</strong>
                        </Typography>
                        <Typography variant="body2">
                          {request.collectionInstructions}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  {(!request.collectionDate || !request.collectionLocation) ? (
                    <Alert severity="warning" icon={<Warning />}>
                      <Typography variant="body2" fontWeight="bold">
                        Collection details are missing!
                      </Typography>
                      <Typography variant="body2">
                        Please contact admin to set the collection date and location.
                      </Typography>
                    </Alert>
                  ) : (
                    <Alert severity="success" icon={<CheckCircle />}>
                      <Typography variant="body2" fontWeight="bold">
                        Your request has been approved!
                      </Typography>
                      <Typography variant="body2">
                        Please collect blood on the scheduled date.
                      </Typography>
                    </Alert>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => {
                        setSelectedRequest(request);
                        setConfirmOpen(true);
                      }}
                      disabled={!request.collectionDate || !request.collectionLocation}
                    >
                      I Collected the Blood
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<EventRepeat />}
                      onClick={() => {
                        setSelectedRequest(request);
                        setRescheduleOpen(true);
                      }}
                    >
                      Request Reschedule
                    </Button>
                    <Button
                      variant="text"
                      color="error"
                      startIcon={<Close />}
                      onClick={() => {
                        setSelectedRequest(request);
                        setCancelOpen(true);
                      }}
                    >
                      Cancel Request
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            )}

            {request.status === 'rejected' && (
              <Box>
                <Alert severity="error" icon={<Cancel />} sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="bold">
                    Your request was rejected
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Reason:</strong> {request.rejectionReason}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Rejected on: {new Date(request.rejectedOn!).toLocaleDateString()}
                  </Typography>
                </Alert>
                <Button variant="outlined" color="primary">
                  Request Again
                </Button>
              </Box>
            )}

            {request.status === 'reschedule-requested' && (
              <Alert severity="warning" icon={<EventRepeat />}>
                <Typography variant="body2" fontWeight="bold">
                  Reschedule Request Pending
                </Typography>
                <Typography variant="body2">
                  Original Date: {new Date(request.collectionDate!).toLocaleDateString()} → 
                  New Date: {new Date(request.newRequestedDate!).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Reason: {request.rescheduleReason}
                </Typography>
              </Alert>
            )}

            {request.status === 'collected' && (
              <Box>
                <Alert severity="info" icon={<CheckCircle />}>
                  <Typography variant="body2" fontWeight="bold">
                    Collection Confirmed! ✓
                  </Typography>
                  <Typography variant="body2">
                    You confirmed collection on {new Date(request.collectedAt!).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Status:</strong> Pending admin verification
                  </Typography>
                </Alert>
              </Box>
            )}

            {request.status === 'verified' && (
              <Box>
                <Alert severity="success" icon={<Verified />}>
                  <Typography variant="body2" fontWeight="bold">
                    Collection Verified! 🎉
                  </Typography>
                  <Typography variant="body2">
                    Admin verified your collection on {new Date(request.verifiedAt!).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Collection Date:</strong> {request.collectionDate ? new Date(request.collectionDate).toLocaleDateString() : 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Location:</strong> {request.collectionLocation || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="success.main" fontWeight="bold" sx={{ mt: 2 }}>
                    ✅ Request Complete - Thank you for using our service!
                  </Typography>
                </Alert>
              </Box>
            )}
          </CardContent>
        </Card>
      );
      })}

      {/* Data Grid */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <DataGrid
            rows={requests}
            columns={columns}
            getRowId={(row) => row._id}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Confirm Collection Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Collection</DialogTitle>
        <DialogContent>
          <Typography>
            Did you collect the blood from <strong>{selectedRequest?.collectionLocation}</strong>?
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            By confirming, you acknowledge that you have collected the blood. This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmCollection}
            disabled={submitting}
          >
            {submitting ? 'Confirming...' : 'Yes, I Collected'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Reschedule</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Current collection date: <strong>{selectedRequest?.collectionDate ? new Date(selectedRequest.collectionDate).toLocaleDateString() : 'N/A'}</strong>
          </Typography>
          <TextField
            label="New Collection Date"
            type="date"
            fullWidth
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: new Date().toISOString().split('T')[0] }}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            label="Reason (Optional)"
            multiline
            rows={3}
            fullWidth
            value={rescheduleReason}
            onChange={(e) => setRescheduleReason(e.target.value)}
            placeholder="e.g., Patient not available on scheduled date"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRescheduleOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRequestReschedule}
            disabled={!newDate || submitting}
          >
            {submitting ? 'Submitting...' : 'Request Reschedule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to cancel this blood request?
          </Typography>
          <TextField
            label="Cancellation Reason *"
            multiline
            rows={3}
            fullWidth
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g., Patient condition improved, Arranged from elsewhere"
            required
          />
          <Alert severity="warning" sx={{ mt: 2 }}>
            The allocated inventory will be restored for other patients.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)}>Go Back</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelRequest}
            disabled={!cancelReason || submitting}
          >
            {submitting ? 'Cancelling...' : 'Cancel Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyRequests;
