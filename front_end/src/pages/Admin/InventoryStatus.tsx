import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Paper,
  Chip,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Bloodtype,
  Warning,
  ErrorOutline,
  CheckCircle,
  PersonSearch,
  Refresh,
  ArrowBack
} from '@mui/icons-material';
import axios from '../../config/axios';
import { useNavigate } from 'react-router-dom';

interface AggregatedInventory {
  bloodGroup: string;
  totalUnits: number;
  minimumUnits: number;
  targetUnits: number;
  status: string;
  statusColor: string;
  message: string;
  needsDonors: boolean;
}

const InventoryStatus: React.FC = () => {
  const [inventory, setInventory] = useState<AggregatedInventory[]>([]);
  const [activeProactiveRequests, setActiveProactiveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInventory();
    fetchActiveProactiveRequests();
  }, []);

  const fetchActiveProactiveRequests = async () => {
    try {
      const response = await axios.get('/api/requests');
      const requestsData = response.data.requests || response.data || [];
      
      // Filter for active proactive inventory requests (pending or completed status)
      const proactive = requestsData.filter((req: any) => 
        req.type === 'proactive_inventory' && 
        ['pending', 'completed'].includes(req.status)
      );
      
      setActiveProactiveRequests(proactive);
    } catch (error) {
      console.error('Failed to fetch proactive requests:', error);
      setActiveProactiveRequests([]);
    }
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/inventory/with-thresholds');
      
      // Aggregate inventory by blood group
      const aggregated = aggregateInventory(response.data);
      setInventory(aggregated);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const aggregateInventory = (items: any[]) => {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    // Default thresholds if not found
    const defaultThresholds: { [key: string]: { minimumUnits: number; targetUnits: number } } = {
      'A+': { minimumUnits: 10, targetUnits: 25 },
      'A-': { minimumUnits: 5, targetUnits: 15 },
      'B+': { minimumUnits: 10, targetUnits: 25 },
      'B-': { minimumUnits: 5, targetUnits: 15 },
      'AB+': { minimumUnits: 3, targetUnits: 10 },
      'AB-': { minimumUnits: 2, targetUnits: 8 },
      'O+': { minimumUnits: 15, targetUnits: 35 },
      'O-': { minimumUnits: 8, targetUnits: 20 },
    };
    
    return bloodGroups.map(bloodGroup => {
      // Sum up all units for this blood group
      const groupItems = items.filter(item => item.bloodGroup === bloodGroup);
      const totalUnits = groupItems.reduce((sum, item) => sum + (item.units || 0), 0);
      
      // Get threshold (should be same for all items of same blood group)
      const threshold = groupItems[0]?.threshold || defaultThresholds[bloodGroup] || { minimumUnits: 10, targetUnits: 20 };
      
      // Calculate status
      let status = 'normal';
      let statusColor = 'success';
      let message = 'Stock levels are adequate';
      let needsDonors = false;

      if (totalUnits < threshold.minimumUnits / 2) {
        status = 'critical';
        statusColor = 'error';
        message = `CRITICAL: Only ${totalUnits} units remaining!`;
        needsDonors = true;
      } else if (totalUnits < threshold.minimumUnits) {
        status = 'low';
        statusColor = 'warning';
        message = `LOW: ${totalUnits} units (minimum: ${threshold.minimumUnits})`;
        needsDonors = true;
      } else if (totalUnits >= threshold.targetUnits) {
        status = 'optimal';
        statusColor = 'success';
        message = `OPTIMAL: ${totalUnits} units available`;
      } else {
        status = 'normal';
        statusColor = 'default';
        message = `Normal: ${totalUnits} units available`;
      }

      return {
        bloodGroup,
        totalUnits,
        minimumUnits: threshold.minimumUnits,
        targetUnits: threshold.targetUnits,
        status,
        statusColor,
        message,
        needsDonors
      };
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <ErrorOutline sx={{ fontSize: 40, color: '#d32f2f' }} />;
      case 'low':
        return <Warning sx={{ fontSize: 40, color: '#f57c00' }} />;
      case 'optimal':
        return <CheckCircle sx={{ fontSize: 40, color: '#4caf50' }} />;
      default:
        return <CheckCircle sx={{ fontSize: 40, color: '#666' }} />;
    }
  };

  const handleFindDonors = (bloodGroup: string, unitsNeeded: number) => {
    navigate('/admin/proactive-recruitment', {
      state: {
        bloodGroup,
        unitsNeeded
      }
    });
  };

  const lowStockItems = inventory.filter(item => item.needsDonors);
  const criticalItems = inventory.filter(item => item.status === 'critical');
  const normalItems = inventory.filter(item => item.status === 'normal');
  const optimalItems = inventory.filter(item => item.status === 'optimal');

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Bloodtype sx={{ fontSize: 40, color: '#e11d48' }} />
            Blood Group Distribution
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Real-time inventory status and threshold monitoring
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin')}
            sx={{ mr: 1 }}
          >
            Back to Admin
          </Button>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={fetchInventory}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Alert Banner */}
      {lowStockItems.length > 0 && (
        <Alert 
          severity={criticalItems.length > 0 ? "error" : "warning"}
          sx={{ mb: 3 }}
          icon={criticalItems.length > 0 ? <ErrorOutline /> : <Warning />}
        >
          <Typography variant="h6" gutterBottom>
            {criticalItems.length > 0 ? '🚨 CRITICAL INVENTORY ALERT' : '⚠️ LOW INVENTORY ALERT'}
          </Typography>
          <Typography variant="body2">
            {lowStockItems.length} blood group(s) need immediate attention.
            {criticalItems.length > 0 && ` ${criticalItems.length} are at CRITICAL levels!`}
            {' '}Scroll down to see details and find donors.
          </Typography>
        </Alert>
      )}

      {/* Blood Group Distribution Grid */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          📊 Current Stock Levels
        </Typography>
        <Grid container spacing={2}>
          {inventory.map((item) => (
            <Grid item xs={6} sm={4} md={3} key={item.bloodGroup}>
              <Card
                variant="outlined"
                sx={{
                  backgroundColor:
                    item.status === 'critical' ? '#ffebee' :
                    item.status === 'low' ? '#fff3e0' :
                    item.status === 'optimal' ? '#e8f5e9' : '#f5f5f5',
                  border: '2px solid',
                  borderColor:
                    item.status === 'critical' ? '#f44336' :
                    item.status === 'low' ? '#ff9800' :
                    item.status === 'optimal' ? '#4caf50' : '#e0e0e0',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 'bold',
                      color:
                        item.status === 'critical' ? '#d32f2f' :
                        item.status === 'low' ? '#f57c00' : '#000'
                    }}
                  >
                    {item.bloodGroup}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
                    {item.totalUnits} units
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                    Min: {item.minimumUnits} | Target: {item.targetUnits}
                  </Typography>
                  <Chip
                    label={item.status.toUpperCase()}
                    color={item.statusColor as any}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Status Legend */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          📖 Status Legend:
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#f44336' }} />
            <Typography variant="body2">Critical (&lt; 50% min)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#ff9800' }} />
            <Typography variant="body2">Low (&lt; minimum)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#666' }} />
            <Typography variant="body2">Normal (min - target)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#4caf50' }} />
            <Typography variant="body2">Optimal (≥ target)</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Active Proactive Recruitment Campaigns */}
      {activeProactiveRequests.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.50', borderLeft: 4, borderColor: 'primary.main' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              📊 Active Recruitment Campaigns
            </Typography>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={async () => {
                if (window.confirm('Delete duplicate campaigns? This will keep the ones with appointments and remove empty duplicates.')) {
                  try {
                    const response = await axios.get('/api/admin/cleanup/proactive-requests');
                    const requests = response.data.requests;
                    
                    // Group by blood group
                    const grouped: any = {};
                    requests.forEach((req: any) => {
                      if (!grouped[req.bloodGroup]) grouped[req.bloodGroup] = [];
                      grouped[req.bloodGroup].push(req);
                    });
                    
                    // For each blood group, keep the one with data and delete others
                    let deleted = 0;
                    for (const bloodGroup in grouped) {
                      const reqs = grouped[bloodGroup];
                      if (reqs.length > 1) {
                        // Sort by hasData (true first), then by appointmentsCount desc
                        reqs.sort((a: any, b: any) => {
                          if (a.hasData !== b.hasData) return b.hasData ? 1 : -1;
                          return b.appointmentsCount - a.appointmentsCount;
                        });
                        
                        // Keep first, delete rest
                        for (let i = 1; i < reqs.length; i++) {
                          await axios.delete(`/api/admin/cleanup/proactive-requests/${reqs[i]._id}`, {
                            data: { deleteRelatedData: false }
                          });
                          deleted++;
                        }
                      }
                    }
                    
                    alert(`Cleaned up ${deleted} duplicate campaigns!`);
                    fetchActiveProactiveRequests();
                  } catch (error) {
                    alert('Failed to clean up duplicates');
                  }
                }
              }}
            >
              Clean Up Duplicates
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click on a campaign to view its tracking dashboard
          </Typography>
          <Grid container spacing={2}>
            {activeProactiveRequests.map((request) => (
              <Grid item xs={12} md={6} key={request._id}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }} onClick={() => navigate(`/admin/proactive-tracking/${request._id}`)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Bloodtype color="error" />
                        <Typography variant="h6">{request.bloodGroup}</Typography>
                        <Chip 
                          label={request.status === 'completed' ? 'Collection Complete' : 'In Progress'} 
                          color={request.status === 'completed' ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Progress: {request.unitsCollected || 0} / {request.unitsRequested} units
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(((request.unitsCollected || 0) / request.unitsRequested) * 100, 100)} 
                      sx={{ mt: 1, height: 8, borderRadius: 5 }}
                    />
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Typography variant="caption">
                        Notified: {request.donorsNotified || 0}
                      </Typography>
                      <Typography variant="caption">
                        Appointments: {request.appointmentsScheduled || 0}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Low Stock Alerts with Find Donors */}
      {lowStockItems.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: criticalItems.length > 0 ? '#d32f2f' : '#f57c00' }}>
            {criticalItems.length > 0 ? '🚨 Critical Stock Alerts' : '⚠️ Low Stock Alerts'}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            {lowStockItems.map((item) => (
              <Grid item xs={12} md={6} key={item.bloodGroup}>
                <Card
                  variant="outlined"
                  sx={{
                    backgroundColor: item.status === 'critical' ? '#ffcdd2' : '#ffe0b2',
                    border: '2px solid',
                    borderColor: item.status === 'critical' ? '#f44336' : '#ff9800',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        {getStatusIcon(item.status)}
                      </Box>
                      <Box sx={{ flex: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: item.status === 'critical' ? '#d32f2f' : '#f57c00' }}>
                          Blood Group: {item.bloodGroup}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Current:</strong> {item.totalUnits} units
                        </Typography>
                        <Typography variant="body2">
                          <strong>Minimum:</strong> {item.minimumUnits} units
                        </Typography>
                        <Typography variant="body2">
                          <strong>Target:</strong> {item.targetUnits} units
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Status:</strong> <Chip label={item.status.toUpperCase()} color={item.statusColor as any} size="small" />
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>
                          Units needed: {item.targetUnits - item.totalUnits} units
                        </Typography>
                        
                        <LinearProgress
                          variant="determinate"
                          value={(item.totalUnits / item.targetUnits) * 100}
                          color={item.status === 'critical' ? 'error' : 'warning'}
                          sx={{ mt: 2, height: 8, borderRadius: 1 }}
                        />
                        
                        <Button
                          variant="contained"
                          color={item.status === 'critical' ? 'error' : 'warning'}
                          startIcon={<PersonSearch />}
                          onClick={() => handleFindDonors(item.bloodGroup, item.targetUnits - item.totalUnits)}
                          fullWidth
                          sx={{ mt: 2 }}
                        >
                          Find Donors for {item.bloodGroup}
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Process Flow Info */}
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              🔄 What happens when you click "Find Donors":
            </Typography>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              <li>Opens dedicated Proactive Donor Recruitment interface</li>
              <li>Shows all eligible donors for selected blood group</li>
              <li>Select donors and customize notification message</li>
              <li>Send urgent notifications → Track responses → Schedule appointments</li>
              <li>Inventory automatically updated after each donation</li>
              <li>Status rechecked and alerts removed when target reached</li>
            </ol>
          </Alert>
        </Paper>
      )}

      {/* Normal Stock - Proactive Management */}
      {normalItems.length > 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#666' }}>
            📊 Normal Stock - Proactive Management
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            These blood groups are at adequate levels. You can proactively collect donations to reach optimal target levels.
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            {normalItems.map((item) => (
              <Grid item xs={12} md={6} key={item.bloodGroup}>
                <Card
                  variant="outlined"
                  sx={{
                    backgroundColor: '#f5f5f5',
                    border: '2px solid #9e9e9e',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <CheckCircle sx={{ fontSize: 40, color: '#666' }} />
                      </Box>
                      <Box sx={{ flex: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                          Blood Group: {item.bloodGroup}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Current:</strong> {item.totalUnits} units
                        </Typography>
                        <Typography variant="body2">
                          <strong>Minimum:</strong> {item.minimumUnits} units ✅
                        </Typography>
                        <Typography variant="body2">
                          <strong>Target:</strong> {item.targetUnits} units
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Status:</strong> <Chip label="NORMAL" color="default" size="small" />
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, fontWeight: 500, color: '#1976d2' }}>
                          💡 Collect {item.targetUnits - item.totalUnits} more units to reach optimal level
                        </Typography>
                        
                        <LinearProgress
                          variant="determinate"
                          value={(item.totalUnits / item.targetUnits) * 100}
                          color="primary"
                          sx={{ mt: 2, height: 8, borderRadius: 1 }}
                        />
                        
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<PersonSearch />}
                          onClick={() => handleFindDonors(item.bloodGroup, item.targetUnits - item.totalUnits)}
                          fullWidth
                          sx={{ mt: 2 }}
                        >
                          Find Donors for {item.bloodGroup}
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption">
              <strong>Proactive Management:</strong> Even though stock is adequate, scheduling donations now helps maintain optimal levels and prevents future shortages.
            </Typography>
          </Alert>
        </Paper>
      )}

      {/* Optimal Stock - Maintenance Mode */}
      {optimalItems.length > 0 && (
        <Paper sx={{ p: 3, mt: 3, backgroundColor: '#f1f8f4' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
            ✅ Optimal Stock - Maintenance Mode
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            These blood groups have reached or exceeded target levels. Continue scheduling donations to maintain optimal stock.
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            {optimalItems.map((item) => (
              <Grid item xs={12} md={6} key={item.bloodGroup}>
                <Card
                  variant="outlined"
                  sx={{
                    backgroundColor: '#e8f5e9',
                    border: '2px solid #4caf50',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <CheckCircle sx={{ fontSize: 40, color: '#4caf50' }} />
                      </Box>
                      <Box sx={{ flex: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                          Blood Group: {item.bloodGroup}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Current:</strong> {item.totalUnits} units 🎉
                        </Typography>
                        <Typography variant="body2">
                          <strong>Minimum:</strong> {item.minimumUnits} units ✅
                        </Typography>
                        <Typography variant="body2">
                          <strong>Target:</strong> {item.targetUnits} units ✅
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Status:</strong> <Chip label="OPTIMAL" color="success" size="small" />
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, fontWeight: 500, color: '#2e7d32' }}>
                          ✅ Stock at optimal level - {item.totalUnits - item.targetUnits} units above target!
                        </Typography>
                        
                        <LinearProgress
                          variant="determinate"
                          value={100}
                          color="success"
                          sx={{ mt: 2, height: 8, borderRadius: 1 }}
                        />
                        
                        <Button
                          variant="outlined"
                          color="success"
                          startIcon={<PersonSearch />}
                          onClick={() => handleFindDonors(item.bloodGroup, 5)}
                          fullWidth
                          sx={{ mt: 2 }}
                        >
                          Schedule Maintenance Donations
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="caption">
              <strong>Maintenance Mode:</strong> Stock is at optimal levels! Schedule regular donations to maintain this status and ensure continuous availability.
            </Typography>
          </Alert>
        </Paper>
      )}
    </Container>
  );
};

export default InventoryStatus;
