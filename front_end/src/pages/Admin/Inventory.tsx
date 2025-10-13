import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useForm } from 'react-hook-form';
import axios from 'axios';

interface InventoryItem {
  _id: string;
  bloodGroup: string;
  units: number;
  expiryDate: string;
  location?: string;
  donorId?: {
    _id: string;
    userId: {
      name: string;
      email: string;
    };
  };
  collectionDate?: string;
  createdAt: string;
}

interface AddInventoryForm {
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  units: number;
  expiryDate: string;
  location?: string;
  donorId?: string;
  collectionDate?: string;
}

interface Donor {
  _id: string;
  userId: {
    name: string;
    email: string;
  };
  bloodGroup: string;
}

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AddInventoryForm>();

  const watchBloodGroup = watch('bloodGroup');

  useEffect(() => {
    fetchInventory();
    fetchDonors();
  }, []);

  useEffect(() => {
    if (watchBloodGroup) {
      setSelectedBloodGroup(watchBloodGroup);
    }
  }, [watchBloodGroup]);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('/api/inventory');
      setInventory(response.data.stock || response.data);
    } catch (err) {
      setError('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchDonors = async () => {
    try {
      const response = await axios.get('/api/donors');
      setDonors(response.data);
    } catch (err) {
      console.error('Failed to fetch donors:', err);
      // Don't show error, donors are optional
    }
  };

  const onSubmit = async (data: AddInventoryForm) => {
    try {
      setLoading(true);
      await axios.post('/api/inventory', data);
      setSuccess('Inventory added successfully!');
      setOpenDialog(false);
      reset();
      fetchInventory();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add inventory');
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'bloodGroup', headerName: 'Blood Group', width: 120 },
    { field: 'units', headerName: 'Units', width: 80 },
    { 
      field: 'donorName', 
      headerName: 'Donor', 
      width: 180,
      valueGetter: (params: any) => params.row.donorId?.userId?.name || 'Anonymous'
    },
    { 
      field: 'collectionDate', 
      headerName: 'Collection Date', 
      width: 150,
      valueGetter: (params: any) => {
        const date = params.row.collectionDate || params.row.createdAt;
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      }
    },
    { 
      field: 'expiryDate', 
      headerName: 'Expiry Date', 
      width: 150,
      valueGetter: (params: any) => new Date(params.row.expiryDate).toLocaleDateString()
    },
    { field: 'location', headerName: 'Location', width: 120 },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Blood Inventory
        </Typography>
        <Button
          variant="contained"
          onClick={() => setOpenDialog(true)}
        >
          Add Inventory
        </Button>
      </Box>

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

      <Card sx={{ height: 400 }}>
        <DataGrid
          rows={inventory}
          columns={columns}
          loading={loading}
          getRowId={(row) => row._id}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
        />
      </Card>

      {/* Add Inventory Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Blood Inventory</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
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
              id="units"
              label="Units"
              type="number"
              inputProps={{ min: 1 }}
              {...register('units', {
                required: 'Units is required',
                min: { value: 1, message: 'Minimum 1 unit required' },
              })}
              error={!!errors.units}
              helperText={errors.units?.message}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="expiryDate"
              label="Expiry Date"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              {...register('expiryDate', {
                required: 'Expiry date is required',
              })}
              error={!!errors.expiryDate}
              helperText={errors.expiryDate?.message}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="donor-label">Donor (Optional)</InputLabel>
              <Select
                labelId="donor-label"
                id="donorId"
                label="Donor (Optional)"
                {...register('donorId')}
              >
                <MenuItem value="">
                  <em>Anonymous / External</em>
                </MenuItem>
                {donors
                  .filter(d => !selectedBloodGroup || d.bloodGroup === selectedBloodGroup)
                  .map(donor => (
                    <MenuItem key={donor._id} value={donor._id}>
                      {donor.userId.name} ({donor.bloodGroup})
                    </MenuItem>
                  ))}
              </Select>
              {selectedBloodGroup && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Showing only {selectedBloodGroup} donors
                </Typography>
              )}
            </FormControl>

            <TextField
              margin="normal"
              fullWidth
              id="collectionDate"
              label="Collection Date (Optional)"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              {...register('collectionDate')}
              helperText="Leave empty to use today's date"
            />

            <TextField
              margin="normal"
              fullWidth
              id="location"
              label="Location (Optional)"
              {...register('location')}
              placeholder="e.g., Refrigerator A, Shelf 2"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              Add Inventory
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Inventory;
