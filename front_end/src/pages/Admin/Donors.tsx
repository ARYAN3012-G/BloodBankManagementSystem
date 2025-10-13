import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

interface Donor {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  bloodGroup: string;
  dob?: string;
  lastDonationDate?: string;
  donationHistory: Array<{ date: string; units: number }>;
  eligibilityNotes?: string;
  createdAt: string;
}

const Donors: React.FC = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/donors');
      setDonors(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Donor management endpoint not yet implemented. This feature is coming soon!');
      } else {
        setError('Failed to fetch donors: ' + (err.response?.data?.error || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const calculateAge = (dob?: string) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading donors...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Donor Management
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        View and manage registered blood donors
      </Typography>

      {error && (
        <Alert severity={error.includes('coming soon') ? 'info' : 'error'} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!error && donors.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No donors registered yet.
        </Alert>
      )}

      {donors.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Blood Group</strong></TableCell>
                <TableCell><strong>Age</strong></TableCell>
                <TableCell><strong>Last Donation</strong></TableCell>
                <TableCell><strong>Total Donations</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {donors.map((donor) => (
                <TableRow key={donor._id} hover>
                  <TableCell>{donor.userId?.name || 'N/A'}</TableCell>
                  <TableCell>{donor.userId?.email || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={donor.bloodGroup} 
                      color="error" 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{calculateAge(donor.dob)}</TableCell>
                  <TableCell>{formatDate(donor.lastDonationDate)}</TableCell>
                  <TableCell>{donor.donationHistory?.length || 0}</TableCell>
                  <TableCell>
                    <Chip 
                      label="Active" 
                      color="success" 
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Total Donors: {donors.length}
        </Typography>
      </Box>
    </Container>
  );
};

export default Donors;
