import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  Chip,
  Button,
  LinearProgress,
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
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Warning,
  ErrorOutline,
  CheckCircle,
  Refresh,
  Settings,
  PersonSearch,
  Close,
  Inventory
} from '@mui/icons-material';
import axios from '../../config/axios';
import { useNavigate } from 'react-router-dom';

interface InventoryItem {
  _id: string;
  bloodGroup: string;
  units: number;
  threshold: {
    minimumUnits: number;
    targetUnits: number;
    alertEnabled: boolean;
  } | null;
  status: string;
  statusColor: string;
  message: string;
  needsDonors: boolean;
}

const LowInventoryWidget: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInventoryWithThresholds();
  }, []);

  const fetchInventoryWithThresholds = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/inventory/with-thresholds');
      setInventory(response.data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const lowStockItems = inventory.filter(item => item.needsDonors);
  const criticalItems = inventory.filter(item => item.status === 'critical');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <ErrorOutline color="error" />;
      case 'low':
        return <Warning color="warning" />;
      case 'optimal':
        return <CheckCircle color="success" />;
      default:
        return <CheckCircle color="success" />;
    }
  };

  const handleFindDonors = (item: InventoryItem) => {
    // Create a pseudo-request for this blood group
    navigate('/admin/donation-flow', { 
      state: { 
        inventoryReplenishment: true,
        bloodGroup: item.bloodGroup,
        unitsNeeded: item.threshold ? item.threshold.targetUnits - item.units : 10
      }
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (lowStockItems.length === 0) {
    return (
      <Card sx={{ backgroundColor: '#e8f5e9', border: '2px solid #4caf50' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircle color="success" sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                ✅ All Inventory Levels Normal
              </Typography>
            </Box>
            <Box>
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={fetchInventoryWithThresholds}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="View Full Inventory">
                <IconButton size="small" onClick={() => navigate('/admin/inventory')}>
                  <Inventory />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Typography variant="body2" color="textSecondary" gutterBottom>
            All blood groups are at or above minimum threshold levels. The system will automatically alert you when stock runs low.
          </Typography>

          {/* Threshold Information */}
          <Paper variant="outlined" sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center' }}>
              <Settings sx={{ fontSize: 18, mr: 1 }} />
              Configured Threshold Levels
            </Typography>
            <Typography variant="caption" color="textSecondary" paragraph>
              The system monitors inventory and triggers alerts when blood stock falls below these levels:
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {inventory.map((item) => (
                <Chip
                  key={item._id}
                  label={`${item.bloodGroup}: ${item.units}/${item.threshold?.minimumUnits || 0} units`}
                  color={
                    item.status === 'critical' ? 'error' :
                    item.status === 'low' ? 'warning' :
                    item.status === 'optimal' ? 'success' : 'default'
                  }
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              ))}
            </Box>

            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f44336' }} />
                <Typography variant="caption">Critical (&lt; 50% min)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff9800' }} />
                <Typography variant="caption">Low (&lt; minimum)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#4caf50' }} />
                <Typography variant="caption">Optimal (≥ target)</Typography>
              </Box>
            </Box>
          </Paper>

          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button
              variant="text"
              size="small"
              startIcon={<Settings />}
              onClick={() => navigate('/admin/inventory')}
            >
              Manage Thresholds
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ backgroundColor: criticalItems.length > 0 ? '#ffebee' : '#fff3e0' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {criticalItems.length > 0 ? (
                <ErrorOutline color="error" sx={{ mr: 1 }} />
              ) : (
                <Warning color="warning" sx={{ mr: 1 }} />
              )}
              <Typography variant="h6">
                {criticalItems.length > 0 ? '🚨 Critical' : '⚠️ Low'} Inventory Alert
              </Typography>
            </Box>
            <Box>
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={fetchInventoryWithThresholds}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Settings">
                <IconButton size="small" onClick={() => setSettingsDialog(true)}>
                  <Settings />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Alert 
            severity={criticalItems.length > 0 ? "error" : "warning"}
            sx={{ mb: 2 }}
          >
            <Typography variant="body2">
              <strong>{lowStockItems.length} blood group(s)</strong> need immediate attention. 
              {criticalItems.length > 0 && ` ${criticalItems.length} are at CRITICAL levels!`}
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {lowStockItems.map((item) => (
              <Paper 
                key={item._id} 
                variant="outlined" 
                sx={{ 
                  p: 2,
                  backgroundColor: item.status === 'critical' ? '#ffcdd2' : '#fff9c4'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    {getStatusIcon(item.status)}
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {item.bloodGroup}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {item.message}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ textAlign: 'right', minWidth: 120 }}>
                      <Typography variant="h4" color={item.status === 'critical' ? 'error' : 'warning'}>
                        {item.units}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        / {item.threshold?.targetUnits || 0} units
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(item.units / (item.threshold?.targetUnits || 1)) * 100}
                        color={item.status === 'critical' ? 'error' : 'warning'}
                        sx={{ mt: 1 }}
                      />
                    </Box>

                    <Button
                      variant="contained"
                      color={item.status === 'critical' ? 'error' : 'warning'}
                      startIcon={<PersonSearch />}
                      onClick={() => handleFindDonors(item)}
                      size="small"
                    >
                      Find Donors
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setSelectedItem(item);
                        setDetailsDialog(true);
                      }}
                    >
                      Details
                    </Button>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>

          {/* Threshold Legend */}
          <Paper variant="outlined" sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
              📊 Threshold Settings:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', fontSize: '0.75rem' }}>
              <Typography variant="caption">
                🔴 Critical: &lt; 50% of minimum
              </Typography>
              <Typography variant="caption">
                🟠 Low: &lt; minimum threshold
              </Typography>
              <Typography variant="caption">
                🟢 Normal: Between min-target
              </Typography>
              <Typography variant="caption">
                ✅ Optimal: ≥ target level
              </Typography>
            </Box>
          </Paper>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="textSecondary">
              🔄 Last updated: {new Date().toLocaleTimeString()}
            </Typography>
            <Box>
              <Button
                variant="text"
                size="small"
                onClick={() => navigate('/admin/inventory')}
                sx={{ mr: 1 }}
              >
                View Full Inventory
              </Button>
              <Button
                variant="text"
                size="small"
                startIcon={<Settings />}
                onClick={() => navigate('/admin/inventory')}
              >
                Settings
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog 
        open={detailsDialog} 
        onClose={() => setDetailsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedItem?.bloodGroup} Inventory Details
            </Typography>
            <IconButton size="small" onClick={() => setDetailsDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box>
              <Alert severity={selectedItem.status === 'critical' ? 'error' : 'warning'} sx={{ mb: 2 }}>
                {selectedItem.message}
              </Alert>

              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Current Stock:</strong></TableCell>
                      <TableCell align="right">{selectedItem.units} units</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Minimum Threshold:</strong></TableCell>
                      <TableCell align="right">{selectedItem.threshold?.minimumUnits || 0} units</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Target Level:</strong></TableCell>
                      <TableCell align="right">{selectedItem.threshold?.targetUnits || 0} units</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Units Needed:</strong></TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={`${(selectedItem.threshold?.targetUnits || 0) - selectedItem.units} units`}
                          color="error"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Status:</strong></TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={selectedItem.status.toUpperCase()}
                          color={selectedItem.statusColor as any}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  📋 Recommended Actions:
                </Typography>
                <ol style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>Click "Find Donors" to search for eligible donors</li>
                  <li>Send notifications to suitable donors</li>
                  <li>Schedule appointments when donors accept</li>
                  <li>Complete donations to replenish inventory</li>
                </ol>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
          {selectedItem && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonSearch />}
              onClick={() => {
                setDetailsDialog(false);
                handleFindDonors(selectedItem);
              }}
            >
              Find Donors Now
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog 
        open={settingsDialog} 
        onClose={() => setSettingsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Inventory Threshold Settings
            </Typography>
            <IconButton size="small" onClick={() => setSettingsDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Configure minimum and target levels for each blood group.
          </Typography>
          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => {
              setSettingsDialog(false);
              navigate('/admin/inventory');
            }}
          >
            Go to Inventory Management
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LowInventoryWidget;
