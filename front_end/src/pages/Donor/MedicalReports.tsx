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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload,
  Description,
  CheckCircle,
  Cancel,
  Pending,
  FileDownload,
  Delete,
  MedicalServices,
} from '@mui/icons-material';
import axios from 'axios';

interface MedicalReport {
  _id: string;
  reportType: 'health_checkup' | 'blood_test' | 'medical_clearance' | 'other';
  fileName: string;
  fileSize: number;
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

const MedicalReports: React.FC = () => {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reportType, setReportType] = useState<string>('health_checkup');
  const [validUntil, setValidUntil] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('/api/medical-reports/my-reports');
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch medical reports:', error);
      setSnackbarMessage('Failed to load medical reports');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setSnackbarMessage('Only PDF, JPG, and PNG files are allowed');
        setSnackbarOpen(true);
        return;
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setSnackbarMessage('File size must be less than 10MB');
        setSnackbarOpen(true);
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setSnackbarMessage('Please select a file to upload');
      setSnackbarOpen(true);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('report', selectedFile);
      formData.append('reportType', reportType);
      if (validUntil) {
        formData.append('validUntil', validUntil);
      }

      const response = await axios.post('/api/medical-reports/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(progress);
        },
      });

      setSnackbarMessage('Medical report uploaded successfully!');
      setSnackbarOpen(true);
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setReportType('health_checkup');
      setValidUntil('');
      fetchReports();
    } catch (error: any) {
      setSnackbarMessage(error.response?.data?.error || 'Failed to upload medical report');
      setSnackbarOpen(true);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to delete this medical report?')) {
      return;
    }

    try {
      await axios.delete(`/api/medical-reports/${reportId}`);
      setSnackbarMessage('Medical report deleted successfully');
      setSnackbarOpen(true);
      fetchReports();
    } catch (error: any) {
      setSnackbarMessage(error.response?.data?.error || 'Failed to delete medical report');
      setSnackbarOpen(true);
    }
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MedicalServices sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4">
            My Medical Reports
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          onClick={() => setUploadDialogOpen(true)}
        >
          Upload Report
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Upload your medical reports for admin review. Approved reports help verify your eligibility for blood donation.
      </Typography>

      {/* Reports Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Your Medical Reports
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : reports.length === 0 ? (
            <Alert severity="info">
              No medical reports uploaded yet. Upload your first report to get started.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Report Type</TableCell>
                    <TableCell>File Name</TableCell>
                    <TableCell>File Size</TableCell>
                    <TableCell>Upload Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Valid Until</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Description sx={{ mr: 1, color: 'text.secondary' }} />
                          {getReportTypeLabel(report.reportType)}
                        </Box>
                      </TableCell>
                      <TableCell>{report.fileName}</TableCell>
                      <TableCell>{formatFileSize(report.fileSize)}</TableCell>
                      <TableCell>
                        {new Date(report.uploadedAt).toLocaleDateString()}
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
                        {report.validUntil 
                          ? new Date(report.validUntil).toLocaleDateString()
                          : 'No expiry'
                        }
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {report.status === 'pending' && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Delete />}
                              onClick={() => handleDelete(report._id)}
                            >
                              Delete
                            </Button>
                          )}
                          {report.reviewNotes && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                alert(`Review Notes:\n\n${report.reviewNotes}`);
                              }}
                            >
                              View Notes
                            </Button>
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

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Medical Report</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="health_checkup">Health Checkup</MenuItem>
                <MenuItem value="blood_test">Blood Test</MenuItem>
                <MenuItem value="medical_clearance">Medical Clearance</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="date"
              label="Valid Until (Optional)"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 3 }}
            />

            <Box sx={{ mb: 3 }}>
              <input
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  fullWidth
                  sx={{ p: 2 }}
                >
                  {selectedFile ? selectedFile.name : 'Choose File (PDF, JPG, PNG - Max 10MB)'}
                </Button>
              </label>
            </Box>

            {uploading && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Uploading... {uploadProgress}%
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}

            <Alert severity="info" sx={{ mb: 2 }}>
              Supported formats: PDF, JPG, PNG. Maximum file size: 10MB.
              Your report will be reviewed by an administrator.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!selectedFile || uploading}
          >
            {uploading ? <CircularProgress size={20} /> : 'Upload'}
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

export default MedicalReports;
