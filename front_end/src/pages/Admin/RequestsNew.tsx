import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  Card,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Paper,
  Badge,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { 
  AttachFile, 
  Visibility, 
  Person, 
  LocalHospital,
  MoreVert,
  CheckCircle,
  Cancel,
  Download,
  Email,
  Phone,
  FilterList,
  FileDownload,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import axios from 'axios';

interface BloodRequest {
  _id: string;
  patientName?: string;
  bloodGroup: string;
  unitsRequested: number;
  urgency?: string;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  assignedUnits: number;
  medicalReportUrl?: string;
  createdAt: string;
  updatedAt?: string;
  approvedOn?: string;
  rejectedOn?: string;
  notes?: string;
  // External user fields
  contactNumber?: string;
  hospitalPreference?: string;
  // Hospital user fields
  department?: string;
  staffId?: string;
  doctorName?: string;
  requesterUserId?: {
    name: string;
    email: string;
    role: string;
  };
}

const RequestsNew: React.FC = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRequestForMenu, setSelectedRequestForMenu] = useState<BloodRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, currentTab, userTypeFilter, urgencyFilter, searchQuery]);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/requests');
      setRequests(response.data);
      setFilteredRequests(response.data);
    } catch (err) {
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    // Status filter (tabs)
    if (currentTab !== 'all') {
      filtered = filtered.filter(req => req.status === currentTab);
    }

    // User type filter
    if (userTypeFilter !== 'all') {
      filtered = filtered.filter(req => {
        const role = req.requesterUserId?.role;
        return role === userTypeFilter;
      });
    }

    // Urgency filter
    if (urgencyFilter.length > 0) {
      filtered = filtered.filter(req => urgencyFilter.includes(req.urgency || 'Medium'));
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(req => 
        req.patientName?.toLowerCase().includes(query) ||
        req.bloodGroup.toLowerCase().includes(query) ||
        req.contactNumber?.toLowerCase().includes(query) ||
        req.department?.toLowerCase().includes(query) ||
        req.staffId?.toLowerCase().includes(query) ||
        req.requesterUserId?.name.toLowerCase().includes(query)
      );
    }

    // Sort by urgency and date
    filtered.sort((a, b) => {
      const urgencyOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
      const urgencyA = urgencyOrder[a.urgency as keyof typeof urgencyOrder] ?? 2;
      const urgencyB = urgencyOrder[b.urgency as keyof typeof urgencyOrder] ?? 2;
      
      if (urgencyA !== urgencyB) return urgencyA - urgencyB;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredRequests(filtered);
  };

  const handleApprove = async (id: string) => {
    try {
      await axios.post(`/api/requests/${id}/approve`);
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to approve request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axios.post(`/api/requests/${id}/reject`);
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reject request');
    }
  };

  const handleViewReport = (url: string) => {
    window.open(`http://localhost:4000${url}`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'fulfilled': return 'info';
      default: return 'default';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return 'error';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const getUserTypeColor = (role: string) => {
    return role === 'external' ? 'warning' : 'primary';
  };

  const getRequestAge = (createdAt: string) => {
    const hours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    if (hours < 24) return 'new';
    if (hours > 48) return 'urgent';
    return 'normal';
  };

  const handleViewDetails = (request: BloodRequest) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedRequest(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, request: BloodRequest) => {
    setAnchorEl(event.currentTarget);
    setSelectedRequestForMenu(request);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRequestForMenu(null);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Patient Name', 'Blood Group', 'Units', 'Urgency', 'Status', 'User Type', 'Contact', 'Department', 'Date'],
      ...filteredRequests.map(req => [
        req.patientName || '',
        req.bloodGroup,
        req.unitsRequested,
        req.urgency || 'Medium',
        req.status,
        req.requesterUserId?.role || '',
        req.contactNumber || req.department || '',
        req.department || '',
        new Date(req.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blood-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusCount = (status: string) => {
    if (status === 'all') return requests.length;
    return requests.filter(req => req.status === status).length;
  };

  const columns: GridColDef[] = [
    {
      field: 'userType',
      headerName: 'Type',
      width: 140,
      renderCell: (params) => {
        const role = params.row.requesterUserId?.role;
        const isExternal = role === 'external';
        return (
          <Chip
            icon={isExternal ? <Person /> : <LocalHospital />}
            label={isExternal ? 'External' : 'Hospital'}
            color={getUserTypeColor(role) as any}
            size="small"
          />
        );
      },
    },
    { field: 'patientName', headerName: 'Patient', width: 120 },
    { field: 'bloodGroup', headerName: 'Blood', width: 80 },
    { field: 'unitsRequested', headerName: 'Units', width: 70 },
    { 
      field: 'urgency', 
      headerName: 'Urgency', 
      width: 170,
      renderCell: (params) => {
        const urgency = params.value || 'Medium';
        const age = getRequestAge(params.row.createdAt);
        const isPending = params.row.status === 'pending';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'nowrap' }}>
            <Chip 
              label={urgency === 'Critical' ? '🚨 ' + urgency : urgency}
              color={getUrgencyColor(urgency) as any}
              size="small"
              sx={{ fontWeight: urgency === 'Critical' ? 'bold' : 'normal' }}
            />
            {age === 'new' && isPending && <Chip label="New" color="success" size="small" variant="outlined" />}
            {age === 'urgent' && isPending && <Chip label="!" color="error" size="small" />}
          </Box>
        );
      }
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getStatusColor(params.value) as any}
          size="small"
        />
      )
    },
    {
      field: 'contactInfo',
      headerName: 'Contact/Dept',
      width: 140,
      renderCell: (params) => {
        const isExternal = params.row.requesterUserId?.role === 'external';
        return (
          <Typography variant="caption">
            {isExternal ? params.row.contactNumber || '-' : params.row.department || '-'}
          </Typography>
        );
      },
    },
    { 
      field: 'createdAt', 
      headerName: 'Date', 
      width: 100,
      valueGetter: (params) => new Date(params.row.createdAt).toLocaleDateString()
    },
    { 
      field: 'approvedOn', 
      headerName: 'Approved On', 
      width: 100,
      valueGetter: (params) => params.row.approvedOn 
        ? new Date(params.row.approvedOn).toLocaleDateString() 
        : 'N/A'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 280,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleViewDetails(params.row)}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            size="small"
            variant="contained"
            color="success"
            disabled={params.row.status !== 'pending'}
            onClick={() => handleApprove(params.row._id)}
            sx={{ minWidth: '84px', px: 1.5, borderRadius: 999, textTransform: 'none' }}
          >
            Approve
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            disabled={params.row.status !== 'pending'}
            onClick={() => handleReject(params.row._id)}
            sx={{ minWidth: '80px', px: 1.5, borderRadius: 999, textTransform: 'none' }}
          >
            Reject
          </Button>
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, params.row)}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with Statistics */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Blood Requests Management
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
              <Typography variant="h4">{getStatusCount('pending')}</Typography>
              <Typography variant="body2">Pending</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
              <Typography variant="h4">
                {requests.filter(r => r.urgency === 'Critical' && r.status === 'pending').length}
              </Typography>
              <Typography variant="body2">Critical</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light' }}>
              <Typography variant="h4">
                {requests.filter(r => r.requesterUserId?.role === 'external').length}
              </Typography>
              <Typography variant="body2">External</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light' }}>
              <Typography variant="h4">
                {requests.filter(r => r.requesterUserId?.role === 'hospital').length}
              </Typography>
              <Typography variant="body2">Hospital</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters and Search */}
      <Card sx={{ mb: 2, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, blood group, contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <FilterList sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>User Type</InputLabel>
              <Select
                value={userTypeFilter}
                label="User Type"
                onChange={(e) => setUserTypeFilter(e.target.value)}
              >
                <MenuItem value="all">All Users</MenuItem>
                <MenuItem value="external">External Users</MenuItem>
                <MenuItem value="hospital">Hospital Staff</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Urgency</InputLabel>
              <Select
                multiple
                value={urgencyFilter}
                label="Urgency"
                onChange={(e) => setUrgencyFilter(e.target.value as string[])}
                renderValue={(selected) => selected.join(', ')}
              >
                <MenuItem value="Critical">Critical</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Status Tabs */}
      <Card sx={{ mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="fullWidth"
        >
          <Tab 
            label={<Badge badgeContent={getStatusCount('all')} color="primary">All</Badge>} 
            value="all" 
          />
          <Tab 
            label={<Badge badgeContent={getStatusCount('pending')} color="warning">Pending</Badge>} 
            value="pending" 
          />
          <Tab 
            label={<Badge badgeContent={getStatusCount('approved')} color="success">Approved</Badge>} 
            value="approved" 
          />
          <Tab 
            label={<Badge badgeContent={getStatusCount('rejected')} color="error">Rejected</Badge>} 
            value="rejected" 
          />
          <Tab 
            label={<Badge badgeContent={getStatusCount('fulfilled')} color="info">Fulfilled</Badge>} 
            value="fulfilled" 
          />
        </Tabs>
      </Card>

      {/* Data Grid */}
      <Card sx={{ height: 500 }}>
        <DataGrid
          rows={filteredRequests}
          columns={columns}
          loading={loading}
          getRowId={(row) => row._id}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          getRowClassName={(params) => {
            const role = params.row.requesterUserId?.role;
            if (role === 'external') return 'external-user-row';
            if (role === 'hospital') return 'hospital-user-row';
            return '';
          }}
          sx={{
            '& .external-user-row': {
              bgcolor: 'rgba(255, 152, 0, 0.05)',
            },
            '& .hospital-user-row': {
              bgcolor: 'rgba(33, 150, 243, 0.05)',
            },
          }}
        />
      </Card>

      {/* Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedRequest?.requesterUserId?.role === 'external' ? (
              <Person color="warning" />
            ) : (
              <LocalHospital color="primary" />
            )}
            <Typography variant="h6">Request Details</Typography>
            <Chip 
              label={selectedRequest?.status} 
              color={getStatusColor(selectedRequest?.status || '') as any}
              size="small"
              sx={{ ml: 'auto' }}
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Grid container spacing={3}>
              {/* Patient Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Patient Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Patient Name</Typography>
                    <Typography variant="body1">{selectedRequest.patientName || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Blood Group</Typography>
                    <Typography variant="body1" fontWeight="bold" color="error">
                      {selectedRequest.bloodGroup}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Units Requested</Typography>
                    <Typography variant="body1">{selectedRequest.unitsRequested}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Urgency Level</Typography>
                    <Chip 
                      label={selectedRequest.urgency || 'Medium'}
                      color={getUrgencyColor(selectedRequest.urgency || 'Medium') as any}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Requester Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Requester Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body1">{selectedRequest.requesterUserId?.name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{selectedRequest.requesterUserId?.email}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">User Type</Typography>
                    <Chip
                      icon={selectedRequest.requesterUserId?.role === 'external' ? <Person /> : <LocalHospital />}
                      label={selectedRequest.requesterUserId?.role === 'external' ? 'External User' : 'Hospital Staff'}
                      color={getUserTypeColor(selectedRequest.requesterUserId?.role || '') as any}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* External User Specific Fields */}
              {selectedRequest.requesterUserId?.role === 'external' && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    External User Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Contact Number</Typography>
                      <Typography variant="body1">{selectedRequest.contactNumber || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Hospital Preference</Typography>
                      <Typography variant="body1">{selectedRequest.hospitalPreference || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              )}

              {/* Hospital User Specific Fields */}
              {selectedRequest.requesterUserId?.role === 'hospital' && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Hospital Staff Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Department/Ward</Typography>
                      <Typography variant="body1">{selectedRequest.department || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Staff ID</Typography>
                      <Typography variant="body1">{selectedRequest.staffId || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Doctor Name</Typography>
                      <Typography variant="body1">{selectedRequest.doctorName || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              )}

              {/* Additional Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Additional Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Notes</Typography>
                    <Typography variant="body1">{selectedRequest.notes || 'No additional notes'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Request Date</Typography>
                    <Typography variant="body1">
                      {new Date(selectedRequest.createdAt).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Medical Report</Typography>
                    {selectedRequest.medicalReportUrl ? (
                      <Button
                        size="small"
                        startIcon={<AttachFile />}
                        onClick={() => handleViewReport(selectedRequest.medicalReportUrl!)}
                      >
                        View Report
                      </Button>
                    ) : (
                      <Typography variant="body1">Not uploaded</Typography>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
          {selectedRequest?.status === 'pending' && (
            <>
              <Button 
                variant="contained" 
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => {
                  handleApprove(selectedRequest._id);
                  handleCloseDetails();
                }}
              >
                Approve
              </Button>
              <Button 
                variant="contained" 
                color="error"
                startIcon={<Cancel />}
                onClick={() => {
                  handleReject(selectedRequest._id);
                  handleCloseDetails();
                }}
              >
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Quick Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedRequestForMenu) handleViewDetails(selectedRequestForMenu);
          handleMenuClose();
        }}>
          <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        {selectedRequestForMenu?.medicalReportUrl && (
          <MenuItem onClick={() => {
            if (selectedRequestForMenu) handleViewReport(selectedRequestForMenu.medicalReportUrl!);
            handleMenuClose();
          }}>
            <ListItemIcon><Download fontSize="small" /></ListItemIcon>
            <ListItemText>Download Report</ListItemText>
          </MenuItem>
        )}
        {selectedRequestForMenu?.contactNumber && (
          <MenuItem onClick={() => {
            window.location.href = `tel:${selectedRequestForMenu.contactNumber}`;
            handleMenuClose();
          }}>
            <ListItemIcon><Phone fontSize="small" /></ListItemIcon>
            <ListItemText>Call User</ListItemText>
          </MenuItem>
        )}
        {selectedRequestForMenu?.requesterUserId?.email && (
          <MenuItem onClick={() => {
            window.location.href = `mailto:${selectedRequestForMenu.requesterUserId?.email}`;
            handleMenuClose();
          }}>
            <ListItemIcon><Email fontSize="small" /></ListItemIcon>
            <ListItemText>Email User</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Container>
  );
};

export default RequestsNew;
