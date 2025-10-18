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
  Notifications,
  AccountCircle,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
      position="sticky"
      color="transparent"
      sx={{
        backgroundColor: 'rgba(255,255,255,0.7)',
        backdropFilter: 'saturate(180%) blur(10px)',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ minHeight: { xs: 64, md: 72 }, px: 0, gap: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              cursor: 'pointer',
              fontWeight: 800,
              letterSpacing: '-0.01em',
              background: 'linear-gradient(90deg, #e11d48 0%, #0ea5a4 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              fontSize: { xs: '1rem', sm: '1.25rem' },
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
                </>
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
            <Box>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button color="inherit" onClick={() => navigate('/register')}>
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
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            bgcolor: 'background.paper',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Menu
          </Typography>
          <IconButton onClick={() => setMobileMenuOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        
        <List sx={{ pt: 2 }}>
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
                <ListItem button onClick={() => handleNavigation('/blood-request')}>
                  <ListItemIcon><Bloodtype color="secondary" /></ListItemIcon>
                  <ListItemText primary="Request Blood" />
                </ListItem>
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
