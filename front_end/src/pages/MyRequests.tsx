import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  Card,
  Chip,
  Grid,
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Request {
  _id: string;
  bloodGroup: string;
  units: number;
  urgency: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  approvedBy?: {
    name: string;
  };
  approvedAt?: string;
}

const MyRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    if (!urgency) return 'default';
    switch (urgency.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const columns: GridColDef[] = [
    { 
      field: 'bloodGroup', 
      headerName: 'Blood Group', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color="error" 
          size="small"
          sx={{ fontWeight: 'bold' }}
        />
      )
    },
    { field: 'units', headerName: 'Units', width: 80 },
    { 
      field: 'urgency', 
      headerName: 'Urgency', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getUrgencyColor(params.value)}
          size="small"
        />
      )
    },
    { field: 'reason', headerName: 'Reason', width: 200 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value.toUpperCase()} 
          color={getStatusColor(params.value)}
          size="small"
        />
      )
    },
    { 
      field: 'createdAt', 
      headerName: 'Requested On', 
      width: 150,
      valueGetter: (params) => new Date(params.row.createdAt).toLocaleDateString()
    },
    { 
      field: 'approvedAt', 
      headerName: 'Approved On', 
      width: 150,
      valueGetter: (params) => params.row.approvedAt 
        ? new Date(params.row.approvedAt).toLocaleDateString() 
        : 'N/A'
    },
  ];

  // Calculate summary statistics
  const summary = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading your requests...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Blood Requests
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        View and track all your blood requests
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4">{summary.total}</Typography>
              <Typography variant="body2">Total Requests</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4">{summary.pending}</Typography>
              <Typography variant="body2">Pending</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4">{summary.approved}</Typography>
              <Typography variant="body2">Approved</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.light', color: 'white' }}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4">{summary.rejected}</Typography>
              <Typography variant="body2">Rejected</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Requests Table */}
      <Card sx={{ height: 500 }}>
        <DataGrid
          rows={requests}
          columns={columns}
          loading={loading}
          getRowId={(row) => row._id}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: {
              sortModel: [{ field: 'createdAt', sort: 'desc' }],
            },
          }}
        />
      </Card>

      {requests.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No requests found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You haven't submitted any blood requests yet.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default MyRequests;
