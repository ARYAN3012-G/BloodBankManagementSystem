import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Container,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Login,
  PersonAdd,
  Dashboard,
  AdminPanelSettings,
  Bloodtype,
  Assignment,
  MedicalServices,
  Info,
  Notifications,
  AccountCircle,
  Close as CloseIcon,
  Inventory,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [lowStockCount, setLowStockCount] = React.useState(0);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    if (user?.role === 'admin') {
      fetchInventoryStatus();
      // Auto-refresh every 5 minutes
      const interval = setInterval(fetchInventoryStatus, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Handle scroll for navbar transparency
  React.useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const fetchInventoryStatus = async () => {
    try {
      const response = await axios.get('/api/inventory/with-thresholds');
      // Aggregate by blood group to get low stock count
      const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      const aggregated = bloodGroups.map(bloodGroup => {
        const groupItems = response.data.filter((item: any) => item.bloodGroup === bloodGroup);
        const totalUnits = groupItems.reduce((sum: number, item: any) => sum + (item.units || 0), 0);
        const threshold = groupItems[0]?.threshold || { minimumUnits: 0 };
        return { totalUnits, minimumUnits: threshold.minimumUnits };
      });
      const lowStock = aggregated.filter((item: any) => item.totalUnits < item.minimumUnits).length;
      setLowStockCount(lowStock);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    }
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleClose();
    setMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar
      position="fixed"
      color="transparent"
      sx={{
        backgroundColor: scrolled ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.95)',
        backdropFilter: scrolled ? 'saturate(180%) blur(10px)' : 'saturate(180%) blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(226,232,240,0.5)' : '1px solid #e2e8f0',
        boxShadow: scrolled ? '0 1px 3px rgba(0,0,0,0.05)' : '0 1px 3px rgba(0,0,0,0.08)',
        zIndex: 1100,
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ minHeight: { xs: 64, md: 72 }, px: 0, justifyContent: 'space-between' }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              cursor: 'pointer',
              fontWeight: 800,
              letterSpacing: '-0.01em',
              background: 'linear-gradient(90deg, #e11d48 0%, #0ea5a4 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              fontSize: { xs: '1.1rem', sm: '1.35rem' },
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
            onClick={() => navigate('/')}
          >
            🩸 Arts Blood Foundation
          </Typography>

          {user && !isMobile ? (
            <>
              <Button
                color="inherit"
                startIcon={<Dashboard />}
                onClick={() => navigate('/dashboard')}
                sx={{ mr: 1, fontWeight: 700 }}
              >
                Dashboard
              </Button>

              {user.role === 'donor' && (
                <>
                  <Button
                    color="inherit"
                    startIcon={<PersonAdd />}
                    onClick={() => navigate('/donor-register')}
                    sx={{ mr: 1, fontWeight: 700 }}
                  >
                    Register as Donor
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<Dashboard />}
                    onClick={() => navigate('/donor-dashboard')}
                    sx={{ mr: 1, fontWeight: 700 }}
                  >
                    Donor Dashboard
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<MedicalServices />}
                    onClick={() => navigate('/donor/medical-reports')}
                    sx={{ mr: 1, fontWeight: 700 }}
                  >
                    Medical Reports
                  </Button>
                </>
              )}

              {(user.role === 'hospital' || user.role === 'external') && (
                <Button
                  color="inherit"
                  startIcon={<Bloodtype />}
                  onClick={() => navigate('/blood-request')}
                  sx={{ mr: 1, fontWeight: 700 }}
                >
                  Request Blood
                </Button>
              )}

              {user.role === 'admin' && (
                <>
                  <Button
                    color="inherit"
                    startIcon={<AdminPanelSettings />}
                    onClick={() => navigate('/admin')}
                    sx={{ mr: 1, fontWeight: 700 }}
                  >
                    Admin Panel
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<Notifications />}
                    onClick={() => navigate('/admin/donation-flow')}
                    sx={{ mr: 1, fontWeight: 700 }}
                  >
                    Donation Flow
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<Info />}
                    onClick={() => navigate('/admin/process-guide')}
                    sx={{ mr: 1, fontWeight: 700 }}
                  >
                    Process Guide
                  </Button>
                </>
              )}

              {user.role === 'admin' && (
                <IconButton
                  size="large"
                  aria-label={`Inventory status - ${lowStockCount} blood types low on stock`}
                  onClick={() => navigate('/admin/inventory-status')}
                  color="inherit"
                  sx={{ mr: 1 }}
                  title="View Inventory Status"
                >
                  <Badge badgeContent={lowStockCount} color="error">
                    <Inventory />
                  </Badge>
                </IconButton>
              )}

              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>
                  <Typography variant="body2">
                    {user.name} ({user.role})
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : !isMobile ? (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button 
                color="inherit" 
                onClick={() => navigate('/login')}
                sx={{ 
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 600,
                  px: 2.5,
                  py: 1,
                  '&:hover': {
                    bgcolor: 'rgba(225, 29, 72, 0.04)',
                  }
                }}
              >
                Login
              </Button>
              <Button 
                variant="contained"
                color="primary"
                onClick={() => navigate('/register')}
                sx={{ 
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 700,
                  px: 3,
                  py: 1,
                  boxShadow: '0 2px 8px rgba(225, 29, 72, 0.25)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.35)',
                  }
                }}
              >
                Register
              </Button>
            </Box>
          ) : null}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ ml: 1 }}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        id="mobile-navigation-drawer"
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            bgcolor: 'background.paper',
          },
        }}
        aria-label="Mobile navigation menu"
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Menu
          </Typography>
          <IconButton 
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        
        <List sx={{ pt: 2 }}>
          {!user && (
            <ListItem button onClick={() => handleNavigation('/')}>
              <ListItemIcon><Home color="primary" /></ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
          )}
          
          {user ? (
            <>
              <ListItem button onClick={() => handleNavigation('/dashboard')}>
                <ListItemIcon><Dashboard color="primary" /></ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>

              {user.role === 'donor' && (
                <>
                  <ListItem button onClick={() => handleNavigation('/donor-register')}>
                    <ListItemIcon><PersonAdd color="primary" /></ListItemIcon>
                    <ListItemText primary="Register as Donor" />
                  </ListItem>
                  <ListItem button onClick={() => handleNavigation('/donor-dashboard')}>
                    <ListItemIcon><Dashboard color="primary" /></ListItemIcon>
                    <ListItemText primary="Donor Dashboard" />
                  </ListItem>
                  <ListItem button onClick={() => handleNavigation('/donor/medical-reports')}>
                    <ListItemIcon><MedicalServices color="primary" /></ListItemIcon>
                    <ListItemText primary="Medical Reports" />
                  </ListItem>
                </>
              )}

              {(user.role === 'hospital' || user.role === 'external') && (
                <>
                  <ListItem button onClick={() => handleNavigation('/blood-request')}>
                    <ListItemIcon><Bloodtype color="secondary" /></ListItemIcon>
                    <ListItemText primary="Request Blood" />
                  </ListItem>
                  <ListItem button onClick={() => handleNavigation('/my-requests')}>
                    <ListItemIcon><Assignment color="secondary" /></ListItemIcon>
                    <ListItemText primary="My Requests" />
                  </ListItem>
                </>
              )}

              {user.role === 'admin' && (
                <>
                  <ListItem button onClick={() => handleNavigation('/admin')}>
                    <ListItemIcon><AdminPanelSettings color="primary" /></ListItemIcon>
                    <ListItemText primary="Admin Panel" />
                  </ListItem>
                  <ListItem button onClick={() => handleNavigation('/admin/donation-flow')}>
                    <ListItemIcon><Notifications color="primary" /></ListItemIcon>
                    <ListItemText primary="Donation Flow" />
                  </ListItem>
                  <ListItem button onClick={() => handleNavigation('/admin/process-guide')}>
                    <ListItemIcon><Info color="primary" /></ListItemIcon>
                    <ListItemText primary="Process Guide" />
                  </ListItem>
                  <ListItem button onClick={() => handleNavigation('/admin/inventory-status')}>
                    <ListItemIcon>
                      <Badge badgeContent={lowStockCount} color="error">
                        <Inventory color="primary" />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText primary="Inventory Status" />
                  </ListItem>
                </>
              )}

              <Divider sx={{ my: 2 }} />
              
              <ListItem>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Typography>
                </Box>
              </ListItem>
              
              <ListItem button onClick={handleLogout}>
                <ListItemIcon><AccountCircle color="error" /></ListItemIcon>
                <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem button onClick={() => handleNavigation('/login')}>
                <ListItemText primary="Login" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/register')}>
                <ListItemText primary="Register" />
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
