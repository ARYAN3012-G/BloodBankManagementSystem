import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  People,
  LocalHospital,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface ReportStats {
  totalDonors: number;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  totalInventory: number;
  bloodGroupStats: { [key: string]: number };
}

const Reports: React.FC = () => {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch data from multiple endpoints
      const [inventoryRes, requestsRes] = await Promise.all([
        axios.get('/api/inventory'),
        axios.get('/api/requests'),
      ]);

      const inventory = inventoryRes.data.stock || inventoryRes.data;
      const requests = requestsRes.data;

      // Calculate stats
      const bloodGroupStats: { [key: string]: number } = {};
      let totalInventory = 0;

      if (Array.isArray(inventory)) {
        inventory.forEach((item: any) => {
          const units = item.units || 0;
          totalInventory += units;
          bloodGroupStats[item.bloodGroup] = (bloodGroupStats[item.bloodGroup] || 0) + units;
        });
      }

      const pendingRequests = requests.filter((r: any) => r.status === 'pending').length;
      const approvedRequests = requests.filter((r: any) => r.status === 'approved').length;

      setStats({
        totalDonors: 0, // Will be updated when donor endpoint is available
        totalRequests: requests.length,
        pendingRequests,
        approvedRequests,
        totalInventory,
        bloodGroupStats,
      });
    } catch (err: any) {
      setError('Failed to fetch reports: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading reports...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const summaryCards = [
    {
      title: 'Total Donors',
      value: stats?.totalDonors || 'N/A',
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      subtitle: 'Registered donors',
    },
    {
      title: 'Total Requests',
      value: stats?.totalRequests || 0,
      icon: <LocalHospital sx={{ fontSize: 40 }} />,
      color: '#2196f3',
      subtitle: 'All blood requests',
    },
    {
      title: 'Pending Requests',
      value: stats?.pendingRequests || 0,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      subtitle: 'Awaiting approval',
    },
    {
      title: 'Total Blood Units',
      value: stats?.totalInventory || 0,
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      color: '#f44336',
      subtitle: 'Units in inventory',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        System Reports & Analytics
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Overview of the blood donation management system
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: card.color, mr: 2 }}>
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" component="div">
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.subtitle}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h6" color="text.secondary">
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Blood Group Distribution */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Blood Group Distribution
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {Object.entries(stats?.bloodGroupStats || {}).map(([bloodGroup, units]) => (
            <Grid item xs={6} sm={3} key={bloodGroup}>
              <Box
                sx={{
                  p: 2,
                  textAlign: 'center',
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                }}
              >
                <Typography variant="h5" color="error">
                  {bloodGroup}
                </Typography>
                <Typography variant="h6">{units} units</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        {Object.keys(stats?.bloodGroupStats || {}).length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No blood inventory data available
          </Alert>
        )}
      </Paper>

      {/* Request Status Breakdown */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Request Status Breakdown
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="warning.main">
                {stats?.pendingRequests || 0}
              </Typography>
              <Typography variant="body1">Pending</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="success.main">
                {stats?.approvedRequests || 0}
              </Typography>
              <Typography variant="body1">Approved</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="primary.main">
                {stats?.totalRequests || 0}
              </Typography>
              <Typography variant="body1">Total</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Last updated: {new Date().toLocaleString()}
        </Typography>
      </Box>
    </Container>
  );
};

export default Reports;
