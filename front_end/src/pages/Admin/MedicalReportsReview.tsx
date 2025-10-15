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
  Avatar,
} from '@mui/material';
import {
  Description,
  CheckCircle,
  Cancel,
  Pending,
  Person,
  Email,
  Schedule,
  MedicalServices,
  Visibility,
  ThumbUp,
  ThumbDown,
} from '@mui/icons-material';
import axios from 'axios';

interface MedicalReport {
  _id: string;
  donorId: {
    _id: string;
    userId: {
      name: string;
      email: string;
    };
    bloodGroup: string;
  };
  reportType: 'health_checkup' | 'blood_test' | 'medical_clearance' | 'other';
  fileName: string;
  fileSize: number;
  reportUrl: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: {
    name: string;
    email: string;
  };
  reviewedAt?: string;
  reviewNotes?: string;
  validUntil?: string;
}

const MedicalReportsReview: React.FC = () => {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    fetchPendingReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, currentTab]);

  const fetchPendingReports = async () => {
    try {
      const response = await axios.get('/api/medical-reports/pending');
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch pending reports:', error);
      setSnackbarMessage('Failed to load pending medical reports');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    switch (currentTab) {
      case 0: // All
        setFilteredReports(reports);
        break;
      case 1: // Pending
        setFilteredReports(reports.filter(r => r.status === 'pending'));
        break;
      case 2: // Health Checkups
        setFilteredReports(reports.filter(r => r.reportType === 'health_checkup'));
        break;
      case 3: // Blood Tests
        setFilteredReports(reports.filter(r => r.reportType === 'blood_test'));
        break;
      default:
        setFilteredReports(reports);
    }
  };

  const handleReview = async () => {
    if (!selectedReport) return;

    setSubmitting(true);
    try {
      await axios.patch(`/api/medical-reports/${selectedReport._id}/review`, {
        status: reviewAction,
        reviewNotes: reviewNotes
      });

      setSnackbarMessage(`Medical report ${reviewAction}d successfully`);
      setSnackbarOpen(true);
      setReviewDialogOpen(false);
      setReviewNotes('');
      fetchPendingReports();
    } catch (error: any) {
      setSnackbarMessage(error.response?.data?.error || `Failed to ${reviewAction} medical report`);
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const openReviewDialog = (report: MedicalReport, action: 'approve' | 'reject') => {
    setSelectedReport(report);
    setReviewAction(action);
    setReviewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      case 'pending': return <Pending />;
      default: return <Pending />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'health_checkup': return 'Health Checkup';
      case 'blood_test': return 'Blood Test';
      case 'medical_clearance': return 'Medical Clearance';
      case 'other': return 'Other';
      default: return type;
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'health_checkup': return 'primary';
      case 'blood_test': return 'secondary';
      case 'medical_clearance': return 'success';
      case 'other': return 'default';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <MedicalServices sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4">
          Medical Reports Review
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Review and approve medical reports submitted by donors to verify their eligibility for blood donation.
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {reports.filter(r => r.status === 'pending').length}
              </Typography>
              <Typography variant="body2">Pending Review</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {reports.filter(r => r.reportType === 'health_checkup').length}
              </Typography>
              <Typography variant="body2">Health Checkups</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="secondary.main">
                {reports.filter(r => r.reportType === 'blood_test').length}
              </Typography>
              <Typography variant="body2">Blood Tests</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {reports.length}
              </Typography>
              <Typography variant="body2">Total Reports</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          variant="fullWidth"
        >
          <Tab label={`All Reports (${reports.length})`} />
          <Tab label={`Pending (${reports.filter(r => r.status === 'pending').length})`} />
          <Tab label={`Health Checkups (${reports.filter(r => r.reportType === 'health_checkup').length})`} />
          <Tab label={`Blood Tests (${reports.filter(r => r.reportType === 'blood_test').length})`} />
        </Tabs>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Medical Reports for Review
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredReports.length === 0 ? (
            <Alert severity="info">
              No medical reports found for the selected filter.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Donor</TableCell>
                    <TableCell>Blood Group</TableCell>
                    <TableCell>Report Type</TableCell>
                    <TableCell>File Name</TableCell>
                    <TableCell>File Size</TableCell>
                    <TableCell>Upload Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            <Person />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {report.donorId.userId.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {report.donorId.userId.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.donorId.bloodGroup}
                          color="error"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getReportTypeLabel(report.reportType)}
                          color={getReportTypeColor(report.reportType) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Description sx={{ mr: 1, color: 'text.secondary' }} />
                          {report.fileName}
                        </Box>
                      </TableCell>
                      <TableCell>{formatFileSize(report.fileSize)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                          {new Date(report.uploadedAt).toLocaleDateString()}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(report.status)}
                          label={report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          color={getStatusColor(report.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => {
                              // Open file in new tab
                              window.open(`http://localhost:4000${report.reportUrl}`, '_blank');
                            }}
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
                                onClick={() => openReviewDialog(report, 'approve')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                startIcon={<ThumbDown />}
                                onClick={() => openReviewDialog(report, 'reject')}
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
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {reviewAction === 'approve' ? 'Approve' : 'Reject'} Medical Report
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Donor:</strong> {selectedReport.donorId.userId.name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Report Type:</strong> {getReportTypeLabel(selectedReport.reportType)}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>File:</strong> {selectedReport.fileName}
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label={`Review Notes ${reviewAction === 'reject' ? '(Required)' : '(Optional)'}`}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={
                  reviewAction === 'approve' 
                    ? 'Add any notes about the approval...'
                    : 'Please provide a reason for rejection...'
                }
                sx={{ mt: 2 }}
              />

              <Alert severity={reviewAction === 'approve' ? 'success' : 'warning'} sx={{ mt: 2 }}>
                {reviewAction === 'approve' 
                  ? 'Approving this report will mark the donor as medically eligible for donation.'
                  : 'Rejecting this report may affect the donor\'s eligibility status. Please provide a clear reason.'
                }
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleReview}
            variant="contained"
            color={reviewAction === 'approve' ? 'success' : 'error'}
            disabled={submitting || (reviewAction === 'reject' && !reviewNotes.trim())}
          >
            {submitting ? <CircularProgress size={20} /> : reviewAction === 'approve' ? 'Approve' : 'Reject'}
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

export default MedicalReportsReview;
