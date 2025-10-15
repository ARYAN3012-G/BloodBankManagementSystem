import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  LinearProgress,
  Snackbar,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Search,
  Delete,
  Bloodtype,
  Schedule,
  Visibility,
  CheckCircle,
  Cancel,
  Pending,
  MedicalServices,
  ThumbUp,
  ThumbDown,
  ToggleOn,
  ToggleOff,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import axios from 'axios';

interface Donor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  medicalHistory: string;
  isActive: boolean;
  isAvailable: boolean;
  eligibilityStatus: string;
  verificationStatus: string;
  totalDonations: number;
  lastDonationDate?: string;
  nextEligibleDate?: string;
  userId?: {
    name: string;
    email: string;
  };
  donorType: 'regular' | 'emergency' | 'flexible';
  status: 'active' | 'inactive' | 'suspended';
  isEligible?: boolean;
  canDonate?: boolean;
}

interface DonorStats {
  totalDonors: number;
  activeDonors: number;
  inactiveDonors: number;
  stats: Array<{
    _id: string;
    totalDonors: number;
    activeDonors: number;
    regularDonors: number;
    emergencyDonors: number;
    flexibleDonors: number;
    avgDonations: number;
  }>;
}

const AdminDonorManagement: React.FC = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [stats, setStats] = useState<DonorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [donorTypeFilter, setDonorTypeFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [dialogTab, setDialogTab] = useState(0);
  const [medicalReports, setMedicalReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const showMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const fetchDonorMedicalReports = async (donorId: string) => {
    setLoadingReports(true);
    try {
      const response = await axios.get(`/api/medical-reports/donor/${donorId}`);
      setMedicalReports(response.data);
    } catch (error) {
      console.error('Failed to fetch medical reports:', error);
      setMedicalReports([]);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleViewDonor = (donor: Donor) => {
    setSelectedDonor(donor);
    setDialogTab(0);
    setDetailDialogOpen(true);
    fetchDonorMedicalReports(donor._id);
  };

  const handleReviewMedicalReport = async (reportId: string, status: 'approved' | 'rejected', notes: string) => {
    try {
      await axios.patch(`/api/medical-reports/${reportId}/review`, {
        status,
        reviewNotes: notes
      });
      showMessage(`Medical report ${status} successfully`);
      if (selectedDonor) {
        fetchDonorMedicalReports(selectedDonor._id);
      }
      fetchDonors(); // Refresh donor list to update eligibility
    } catch (error: any) {
      showMessage(error.response?.data?.error || `Failed to ${status} medical report`);
    }
  };

  const handleToggleDonorStatus = async (donorId: string, currentStatus: boolean) => {
    try {
      console.log('Toggle donor status:', { donorId, currentStatus });
      const newStatus = !currentStatus;
      
      const response = await axios.patch(`/api/donors/${donorId}/toggle-status`, {
        isActive: newStatus
      });
      
      console.log('Toggle response:', response.data);
      showMessage(`Donor ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchDonors(); // Refresh the list
    } catch (error: any) {
      console.error('Toggle error:', error);
      console.error('Error response:', error.response?.data);
      showMessage(error.response?.data?.error || 'Failed to update donor status');
    }
  };

  useEffect(() => {
    fetchDonors();
    fetchStats();
  }, [page, rowsPerPage, searchTerm, bloodGroupFilter, statusFilter, donorTypeFilter]);

  const fetchDonors = async () => {
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (bloodGroupFilter) params.append('bloodGroup', bloodGroupFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (donorTypeFilter) params.append('donorType', donorTypeFilter);

      const response = await axios.get(`/api/donors?${params}`);
      setDonors(response.data.donors || []);
    } catch (error) {
      console.error('Failed to fetch donors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/donors/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = searchTerm === '' ||
      donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.phone.includes(searchTerm);

    const matchesBloodGroup = bloodGroupFilter === '' || donor.bloodGroup === bloodGroupFilter;
    const matchesStatus = statusFilter === '' || donor.status === statusFilter;
    const matchesType = donorTypeFilter === '' || donor.donorType === donorTypeFilter;

    return matchesSearch && matchesBloodGroup && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Donor Management
        </Typography>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  {stats.totalDonors}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Donors
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {stats.activeDonors}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Donors
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {stats.inactiveDonors}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Inactive Donors
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {stats.stats.reduce((sum, stat) => sum + stat.emergencyDonors, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Emergency Donors
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search donors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Blood Group</InputLabel>
                <Select
                  value={bloodGroupFilter}
                  label="Blood Group"
                  onChange={(e) => setBloodGroupFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Donor Type</InputLabel>
                <Select
                  value={donorTypeFilter}
                  label="Donor Type"
                  onChange={(e) => setDonorTypeFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="regular">Regular</MenuItem>
                  <MenuItem value="emergency">Emergency</MenuItem>
                  <MenuItem value="flexible">Flexible</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Donors Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Blood Group</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Donations</TableCell>
                <TableCell>Last Donation</TableCell>
                <TableCell>Eligibility</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDonors.map((donor) => (
                <TableRow key={donor._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {donor.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{donor.email}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {donor.phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={donor.bloodGroup}
                      size="small"
                      color="primary"
                      icon={<Bloodtype />}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={donor.donorType}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={donor.status}
                      size="small"
                      color={getStatusColor(donor.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {donor.totalDonations}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {donor.lastDonationDate
                        ? new Date(donor.lastDonationDate).toLocaleDateString()
                        : 'Never'
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Chip
                        label={
                          donor.eligibilityStatus === 'eligible' ? 'Eligible' :
                          donor.eligibilityStatus === 'not_eligible' ? 'Not Eligible' :
                          'Pending'
                        }
                        size="small"
                        color={
                          donor.eligibilityStatus === 'eligible' ? 'success' :
                          donor.eligibilityStatus === 'not_eligible' ? 'error' :
                          'warning'
                        }
                      />
                      <Chip
                        label={donor.verificationStatus}
                        size="small"
                        color={getVerificationColor(donor.verificationStatus)}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDonor(donor)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={donor.isActive ? "Deactivate Donor" : "Activate Donor"}>
                        <IconButton 
                          size="small" 
                          color={donor.isActive ? "error" : "success"}
                          onClick={() => handleToggleDonorStatus(donor._id, donor.isActive)}
                        >
                          {donor.isActive ? <ToggleOff /> : <ToggleOn />}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Remove Donor">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedDonor(donor);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredDonors.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* Enhanced Donor Details Dialog with Tabs */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              {selectedDonor?.name} - Donor Management
            </Typography>
            <Chip 
              label={
                selectedDonor?.eligibilityStatus === 'eligible' ? 'eligible' :
                selectedDonor?.eligibilityStatus === 'not_eligible' ? 'not eligible' :
                selectedDonor?.eligibilityStatus === 'pending' ? 'pending' :
                'unknown'
              } 
              color={
                selectedDonor?.eligibilityStatus === 'eligible' ? 'success' :
                selectedDonor?.eligibilityStatus === 'not_eligible' ? 'error' :
                'warning'
              }
            />
          </Box>
        </DialogTitle>
        
        <Tabs value={dialogTab} onChange={(_, newValue) => setDialogTab(newValue)}>
          <Tab label="Donor Information" />
          <Tab 
            label={`Medical Reports (${medicalReports.length})`} 
            icon={<MedicalServices />}
          />
        </Tabs>

        <DialogContent>
          {selectedDonor && (
            <>
              {/* Tab 1: Donor Information */}
              {dialogTab === 0 && (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Personal Information</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="body1">{selectedDonor.name}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{selectedDonor.email}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1">{selectedDonor.phone}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Blood Group</Typography>
                      <Chip label={selectedDonor.bloodGroup} color="primary" />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Donation Information</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Total Donations</Typography>
                      <Typography variant="body1">{selectedDonor.totalDonations}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Last Donation</Typography>
                      <Typography variant="body1">
                        {selectedDonor.lastDonationDate
                          ? new Date(selectedDonor.lastDonationDate).toLocaleDateString()
                          : 'Never'
                        }
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Eligibility Status</Typography>
                      <Chip 
                        label={selectedDonor.eligibilityStatus || 'Not Set'} 
                        color={selectedDonor.eligibilityStatus === 'eligible' ? 'success' : 'error'}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Availability</Typography>
                      <Chip 
                        label={selectedDonor.isAvailable ? 'Available' : 'Not Available'} 
                        color={selectedDonor.isAvailable ? 'success' : 'default'}
                      />
                    </Box>
                  </Grid>
                </Grid>
              )}

              {/* Tab 2: Medical Reports */}
              {dialogTab === 1 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Medical Reports & Eligibility Management
                  </Typography>
                  
                  {loadingReports ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <LinearProgress />
                    </Box>
                  ) : medicalReports.length === 0 ? (
                    <Alert severity="info">
                      No medical reports uploaded by this donor yet. 
                      Donor needs to upload medical reports to become eligible for donation.
                    </Alert>
                  ) : (
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Report Type</TableCell>
                            <TableCell>File Name</TableCell>
                            <TableCell>Upload Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {medicalReports.map((report) => (
                            <TableRow key={report._id}>
                              <TableCell>
                                <Chip 
                                  label={report.reportType.replace('_', ' ').toUpperCase()} 
                                  size="small"
                                  color="primary"
                                />
                              </TableCell>
                              <TableCell>{report.fileName}</TableCell>
                              <TableCell>
                                {new Date(report.uploadedAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={
                                    report.status === 'approved' ? <CheckCircle /> :
                                    report.status === 'rejected' ? <Cancel /> : <Pending />
                                  }
                                  label={report.status.toUpperCase()}
                                  color={
                                    report.status === 'approved' ? 'success' :
                                    report.status === 'rejected' ? 'error' : 'warning'
                                  }
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => window.open(`http://localhost:4000${report.reportUrl}`, '_blank')}
                                  >
                                    View
                                  </Button>
                                  {report.status === 'pending' && (
                                    <>
                                      <Button
                                        size="small"
                                        variant="contained"
                                        color="success"
                                        startIcon={<ThumbUp />}
                                        onClick={() => handleReviewMedicalReport(report._id, 'approved', 'Approved by admin')}
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        size="small"
                                        variant="contained"
                                        color="error"
                                        startIcon={<ThumbDown />}
                                        onClick={() => {
                                          const reason = prompt('Reason for rejection:');
                                          if (reason) {
                                            handleReviewMedicalReport(report._id, 'rejected', reason);
                                          }
                                        }}
                                      >
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  <Divider sx={{ my: 3 }} />
                  
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Eligibility Rules:</strong><br />
                      • Donor becomes "Eligible" when at least one medical report is approved<br />
                      • Donor remains "Not Eligible" until medical clearance<br />
                      • Approved medical reports enable donation scheduling
                    </Typography>
                  </Alert>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Deactivate Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Deactivate Donor</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to deactivate donor "{(selectedDonor as any)?.userId?.name || selectedDonor?.name}"?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will:
            <br />• Mark them as inactive
            <br />• Prevent them from donating
            <br />• Keep their data for records
            <br />• This is safer than permanent deletion
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              // TODO: Implement deactivate functionality
              showMessage('Deactivation feature coming soon! For now, use the status toggle to make donors inactive.');
              setDeleteDialogOpen(false);
            }} 
            color="warning" 
            variant="contained"
          >
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default AdminDonorManagement;
