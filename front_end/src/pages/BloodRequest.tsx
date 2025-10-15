import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Badge,
} from '@mui/material';
import { CloudUpload, AttachFile, Person, LocalHospital } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface BloodRequestForm {
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  unitsRequested: number;
  patientName: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  notes?: string;
  contactNumber?: string;
  hospitalPreference?: string;
  department?: string;
  staffId?: string;
  doctorName?: string;
}

const BloodRequest: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BloodRequestForm>({
    defaultValues: {
      bloodGroup: '' as any, // This will prevent the undefined error
      urgency: 'Medium'
    }
  });

  const isExternalUser = user?.role === 'external';
  const isHospitalUser = user?.role === 'hospital';

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload only JPG, PNG, or PDF files');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const onSubmit = async (data: BloodRequestForm) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Check if external user must upload file
      if (isExternalUser && !selectedFile) {
        setError('External users must upload a medical report (PDF/JPG)');
        setLoading(false);
        return;
      }

      // If file is selected, upload it first
      let medicalReportUrl = '';
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadResponse = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setUploadProgress(progress);
          },
        });

        medicalReportUrl = uploadResponse.data.url;
      }

      // Submit request with file URL
      await axios.post('/api/requests', {
        ...data,
        medicalReportUrl,
      });

      setSuccess('Blood request submitted successfully! Redirecting...');
      reset();
      setSelectedFile(null);
      setUploadProgress(0);
      
      // Redirect to My Requests page after 1.5 seconds
      setTimeout(() => {
        navigate('/my-requests');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Request failed');
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ pb: 4 }}>
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 4, 
            width: '100%',
            // Strategy #2: Background color differentiation
            background: isExternalUser 
              ? 'linear-gradient(to bottom, rgba(255, 152, 0, 0.03), white)'
              : 'linear-gradient(to bottom, rgba(33, 150, 243, 0.03), white)',
            border: isExternalUser 
              ? '2px solid rgba(255, 152, 0, 0.2)'
              : '2px solid rgba(33, 150, 243, 0.2)',
          }}
        >
          {/* Strategy #1: Header Badge */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Chip
              icon={isExternalUser ? <Person /> : <LocalHospital />}
              label={isExternalUser ? 'External Request' : 'Hospital Request'}
              color={isExternalUser ? 'warning' : 'primary'}
              sx={{ 
                fontWeight: 'bold',
                fontSize: '0.9rem',
                padding: '4px 8px',
              }}
            />
          </Box>

          {/* Strategy #3: Icon differentiation */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            {isExternalUser ? <Person sx={{ fontSize: 30, color: '#ff9800' }} /> : <LocalHospital sx={{ fontSize: 30, color: '#2196f3' }} />}
            <Typography component="h1" variant="h4" align="center">
              🩸 Blood Request
            </Typography>
          </Box>
          
          {/* Strategy #6: Workflow indicator */}
          <Typography variant="body1" align="center" color="text.secondary" paragraph sx={{ mt: 1 }}>
            {isExternalUser ? 'Public Blood Request Portal' : 'Hospital Staff Portal'}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" paragraph>
            Submit a request for blood units
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="blood-group-label">Blood Group</InputLabel>
              <Select
                labelId="blood-group-label"
                id="bloodGroup"
                label="Blood Group"
                {...register('bloodGroup', { required: 'Blood group is required' })}
                error={!!errors.bloodGroup}
              >
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

            <TextField
              margin="normal"
              required
              fullWidth
              id="unitsRequested"
              label="Units Requested"
              type="number"
              inputProps={{ min: 1, max: 10 }}
              {...register('unitsRequested', {
                required: 'Number of units is required',
                min: { value: 1, message: 'Minimum 1 unit required' },
                max: { value: 10, message: 'Maximum 10 units allowed' },
              })}
              error={!!errors.unitsRequested}
              helperText={errors.unitsRequested?.message}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="patientName"
              label="Patient Name"
              {...register('patientName', {
                required: 'Patient name is required',
                minLength: {
                  value: 2,
                  message: 'Patient name must be at least 2 characters',
                },
              })}
              error={!!errors.patientName}
              helperText={errors.patientName?.message}
            />

            {/* Strategy #5: Priority/Urgency levels differentiation */}
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="urgency-label">Urgency</InputLabel>
              <Select
                labelId="urgency-label"
                id="urgency"
                label="Urgency"
                defaultValue="Medium"
                {...register('urgency', { required: 'Urgency is required' })}
                error={!!errors.urgency}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                {/* Critical option only for hospital users */}
                {isHospitalUser && (
                  <MenuItem value="Critical" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                    🚨 Critical/Emergency
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              fullWidth
              id="notes"
              label="Additional Notes (Optional)"
              multiline
              rows={3}
              {...register('notes')}
            />

            {/* Strategy #4: Field modifications based on user type */}
            {isExternalUser && (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="contactNumber"
                  label="Contact Number"
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  {...register('contactNumber', {
                    required: 'Contact number is required',
                    pattern: {
                      value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                      message: 'Please enter a valid contact number',
                    },
                  })}
                  error={!!errors.contactNumber}
                  helperText={errors.contactNumber?.message || 'Required for external users'}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  id="hospitalPreference"
                  label="Hospital Preference (Optional)"
                  placeholder="Preferred hospital name"
                  {...register('hospitalPreference')}
                  helperText="Specify if you have a preferred hospital"
                />
              </>
            )}

            {isHospitalUser && (
              <>
                <Alert severity="info" sx={{ mt: 2, mb: 1 }}>
                  <strong>Hospital Staff:</strong> Please fill in all required fields below (Department and Staff ID)
                </Alert>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="department"
                  label="Department/Ward"
                  placeholder="e.g., Emergency, ICU, Cardiology"
                  {...register('department', {
                    required: 'Department is required',
                    minLength: {
                      value: 2,
                      message: 'Department name must be at least 2 characters',
                    },
                  })}
                  error={!!errors.department}
                  helperText={errors.department?.message || 'Required for hospital staff'}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="staffId"
                  label="Staff ID"
                  placeholder="Your hospital staff ID"
                  {...register('staffId', {
                    required: 'Staff ID is required',
                    minLength: {
                      value: 3,
                      message: 'Staff ID must be at least 3 characters',
                    },
                  })}
                  error={!!errors.staffId}
                  helperText={errors.staffId?.message || 'Required for hospital staff'}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  id="doctorName"
                  label="Doctor Name (Optional)"
                  placeholder="Attending physician name"
                  {...register('doctorName')}
                  helperText="Name of the attending doctor"
                />
              </>
            )}

            {/* File Upload Section */}
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Medical Report {isExternalUser && <span style={{ color: 'red' }}>*</span>}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                {isExternalUser 
                  ? 'External users must upload a medical report (PDF, JPG, PNG - Max 5MB)'
                  : 'Optional: Upload medical report (PDF, JPG, PNG - Max 5MB)'}
              </Typography>
              
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ mb: 1 }}
              >
                {selectedFile ? 'Change File' : 'Upload Medical Report'}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </Button>

              {selectedFile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <AttachFile fontSize="small" />
                  <Chip 
                    label={selectedFile.name}
                    onDelete={() => setSelectedFile(null)}
                    color="primary"
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary">
                    ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </Typography>
                </Box>
              )}

              {uploadProgress > 0 && uploadProgress < 100 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Uploading: {uploadProgress}%
                  </Typography>
                  <Box sx={{ width: '100%', bgcolor: 'grey.300', borderRadius: 1, height: 8, mt: 0.5 }}>
                    <Box 
                      sx={{ 
                        width: `${uploadProgress}%`, 
                        bgcolor: 'primary.main', 
                        height: '100%',
                        borderRadius: 1,
                        transition: 'width 0.3s'
                      }} 
                    />
                  </Box>
                </Box>
              )}
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default BloodRequest;
