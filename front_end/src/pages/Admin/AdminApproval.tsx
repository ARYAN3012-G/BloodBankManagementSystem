import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
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
  Paper,
  Chip,
  Alert,
  TextField,
  CircularProgress,
  Snackbar,
  Tabs,
  Tab,
  Switch,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Person,
  Email,
  Schedule,
  AdminPanelSettings,
  Delete,
  Block,
  CheckCircleOutline,
} from '@mui/icons-material';
import axios from '../../config/axios';

interface PendingAdmin {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  adminStatus: 'pending' | 'approved' | 'rejected';
}

interface Admin {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  adminStatus: string;
  isActive: boolean;
  isMainAdmin: boolean;
  createdAt: string;
}

interface AdminStats {
  totalAdmins: number;
  mainAdmins: number;
  pendingAdmins: number;
  approvedAdmins: number;
  rejectedAdmins: number;
  activeAdmins: number;
  disabledAdmins: number;
}

const AdminApproval: React.FC = () => {
  const [pendingAdmins, setPendingAdmins] = useState<PendingAdmin[]>([]);
  const [allAdmins, setAllAdmins] = useState<Admin[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState<PendingAdmin | null>(null);
  const [selectedAdminForAction, setSelectedAdminForAction] = useState<Admin | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isMainAdmin, setIsMainAdmin] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    checkMainAdminStatus();
    fetchPendingAdmins();
    fetchAllAdmins();
    fetchStats();
  }, []);

  const checkMainAdminStatus = async () => {
    try {
      const response = await axios.get('/api/admin/main-admin-status');
      setIsMainAdmin(response.data.isMainAdmin);
      if (!response.data.isMainAdmin) {
        setSnackbarMessage('Access denied: Only main admin can view this page');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Failed to check main admin status:', error);
      setSnackbarMessage('Failed to verify admin permissions');
      setSnackbarOpen(true);
    }
  };

  const fetchPendingAdmins = async () => {
    try {
      const response = await axios.get('/api/admin/pending-admins');
      setPendingAdmins(response.data);
    } catch (error) {
      console.error('Failed to fetch pending admins:', error);
      setSnackbarMessage('Failed to load pending admin registrations');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAdmins = async () => {
    try {
      const response = await axios.get('/api/admin/all-admins');
      setAllAdmins(response.data);
    } catch (error) {
      console.error('Failed to fetch all admins:', error);
      setSnackbarMessage('Failed to load admin list');
      setSnackbarOpen(true);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/admin-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    }
  };

  const handleApprove = async () => {
    if (!selectedAdmin) return;

    setSubmitting(true);
    try {
      await axios.post(`/api/admin/${selectedAdmin._id}/approve`);
      setSnackbarMessage(`Admin ${selectedAdmin.name} approved successfully`);
      setSnackbarOpen(true);
      setApproveDialogOpen(false);
      fetchPendingAdmins();
      fetchStats();
    } catch (error) {
      setSnackbarMessage('Failed to approve admin');
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedAdmin) return;

    setSubmitting(true);
    try {
      await axios.post(`/api/admin/${selectedAdmin._id}/reject`, {
        reason: rejectReason
      });
      setSnackbarMessage(`Admin ${selectedAdmin.name} rejected`);
      setSnackbarOpen(true);
      setRejectDialogOpen(false);
      setRejectReason('');
      fetchPendingAdmins();
      fetchStats();
    } catch (error) {
      setSnackbarMessage('Failed to reject admin');
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (admin: Admin) => {
    try {
      const newStatus = !admin.isActive;
      await axios.patch(`/api/admin/${admin._id}/toggle-status`, {
        isActive: newStatus
      });
      setSnackbarMessage(`Admin ${admin.name} ${newStatus ? 'enabled' : 'disabled'} successfully`);
      setSnackbarOpen(true);
      fetchAllAdmins();
      fetchStats();
    } catch (error) {
      setSnackbarMessage('Failed to update admin status');
      setSnackbarOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!selectedAdminForAction) return;

    setSubmitting(true);
    try {
      await axios.delete(`/api/admin/${selectedAdminForAction._id}`);
      setSnackbarMessage(`Admin ${selectedAdminForAction.name} deleted successfully`);
      setSnackbarOpen(true);
      setDeleteDialogOpen(false);
      setSelectedAdminForAction(null);
      fetchAllAdmins();
      fetchStats();
    } catch (error) {
      setSnackbarMessage('Failed to delete admin');
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isMainAdmin) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Access Denied: Only the main administrator can access this page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AdminPanelSettings sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4">
          Admin Approval Center
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        As the main administrator, you can approve or reject new admin registrations.
      </Typography>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {stats.pendingAdmins}
                </Typography>
                <Typography variant="body2">Pending Approval</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {stats.activeAdmins}
                </Typography>
                <Typography variant="body2">Active Admins</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  {stats.disabledAdmins}
                </Typography>
                <Typography variant="body2">Disabled Admins</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  {stats.totalAdmins}
                </Typography>
                <Typography variant="body2">Total Admins</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`Pending (${stats?.pendingAdmins || 0})`} />
          <Tab label={`All Admins (${stats?.totalAdmins || 0})`} />
        </Tabs>
      </Box>

      {/* Pending Admins Table */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Pending Admin Registrations
            </Typography>

            {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : pendingAdmins.length === 0 ? (
            <Alert severity="info">
              No pending admin registrations at this time.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Registration Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingAdmins.map((admin) => (
                    <TableRow key={admin._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Person sx={{ mr: 1, color: 'text.secondary' }} />
                          {admin.name}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Email sx={{ mr: 1, color: 'text.secondary' }} />
                          {admin.email}
                        </Box>
                      </TableCell>
                      <TableCell>{admin.phone || 'Not provided'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                          {new Date(admin.createdAt).toLocaleDateString()}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={admin.adminStatus} 
                          color="warning" 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setApproveDialogOpen(true);
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setRejectDialogOpen(true);
                            }}
                          >
                            Reject
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
      )}

      {/* All Admins Table */}
      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              All Administrators
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : allAdmins.length === 0 ? (
              <Alert severity="info">
                No administrators found.
              </Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Registered</TableCell>
                      <TableCell>Active</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allAdmins.map((admin) => (
                      <TableRow key={admin._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Person sx={{ mr: 1, color: 'text.secondary' }} />
                            {admin.name}
                            {admin.isMainAdmin && (
                              <Chip 
                                label="Main Admin" 
                                size="small" 
                                color="primary" 
                                sx={{ ml: 1 }} 
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Email sx={{ mr: 1, color: 'text.secondary' }} />
                            {admin.email}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={admin.role} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={admin.adminStatus} 
                            size="small" 
                            color={
                              admin.adminStatus === 'approved' ? 'success' : 
                              admin.adminStatus === 'rejected' ? 'error' : 
                              'warning'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {!admin.isMainAdmin && admin.adminStatus !== 'rejected' && (
                            <Tooltip title={admin.isActive ? 'Disable Access' : 'Enable Access'}>
                              <Switch
                                checked={admin.isActive}
                                onChange={() => handleToggleStatus(admin)}
                                color={admin.isActive ? 'success' : 'default'}
                              />
                            </Tooltip>
                          )}
                          {!admin.isMainAdmin && admin.adminStatus === 'rejected' && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Switch
                                checked={false}
                                disabled={true}
                                sx={{ opacity: 0.3 }}
                              />
                              <Chip 
                                label="Disabled" 
                                size="small" 
                                sx={{ 
                                  bgcolor: '#e0e0e0', 
                                  color: '#757575',
                                  fontSize: '0.75rem'
                                }} 
                              />
                            </Box>
                          )}
                          {admin.isMainAdmin && (
                            <Chip 
                              icon={<CheckCircleOutline />}
                              label="Always Active" 
                              size="small" 
                              color="success"
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {!admin.isMainAdmin && (
                            <Tooltip title="Delete Admin">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => {
                                  setSelectedAdminForAction(admin);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          )}
                          {admin.isMainAdmin && (
                            <Typography variant="caption" color="text.secondary">
                              Protected
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)}>
        <DialogTitle>Approve Admin Registration</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to approve <strong>{selectedAdmin?.name}</strong> as an administrator?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            They will gain full admin access to the blood bank management system.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleApprove} 
            variant="contained" 
            color="success"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Reject Admin Registration</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to reject <strong>{selectedAdmin?.name}</strong>'s admin registration?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for rejection (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Provide a reason for rejection..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleReject} 
            variant="contained" 
            color="error"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>
          {selectedAdminForAction?.adminStatus === 'rejected' ? 'Delete Rejected User' : 'Delete Administrator'}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          {selectedAdminForAction?.adminStatus === 'rejected' ? (
            <>
              <Typography>
                Are you sure you want to delete this rejected user?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                User: <strong>{selectedAdminForAction?.name}</strong> ({selectedAdminForAction?.email})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This user's admin registration was rejected and their account will be permanently removed from the system.
              </Typography>
            </>
          ) : (
            <>
              <Typography>
                Are you sure you want to permanently delete <strong>{selectedAdminForAction?.name}</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This will remove all admin privileges and delete the account from the system.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            variant="contained" 
            color="error"
            disabled={submitting}
            startIcon={<Delete />}
          >
            {submitting ? <CircularProgress size={20} /> : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default AdminApproval;
