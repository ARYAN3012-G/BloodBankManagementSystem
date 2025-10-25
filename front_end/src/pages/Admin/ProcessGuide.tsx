import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import {
  Inventory,
  LocalHospital,
  Person,
  CheckCircle,
  Schedule,
  Notifications,
  Verified,
  Assignment
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ProcessGuide: React.FC = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const steps = [
    {
      label: 'Hospital Creates Blood Request',
      icon: <LocalHospital />,
      description: 'Hospital user creates a request for blood',
      details: [
        'Hospital specifies blood group and units needed',
        'Request status: PENDING',
        'Admin receives notification'
      ],
      color: '#f44336'
    },
    {
      label: 'Admin Approves Request',
      icon: <CheckCircle />,
      description: 'Admin reviews and approves the request',
      details: [
        'System checks inventory availability',
        'If sufficient: Inventory deducted, Request status → APPROVED',
        'If insufficient: Redirects to Donation Flow Dashboard'
      ],
      color: '#ff9800'
    },
    {
      label: 'Donation Flow (If Needed)',
      icon: <Person />,
      description: 'Collecting blood through donor appointments',
      details: [
        'Tab 1: Find suitable donors → Send notifications',
        'Tab 2: Donors respond → Accept/Decline',
        'Tab 3: Schedule appointments with accepted donors',
        'Complete appointment → Record donation → Update inventory'
      ],
      color: '#2196f3'
    },
    {
      label: 'Inventory Updated',
      icon: <Inventory />,
      description: 'Blood inventory is updated with collected blood',
      details: [
        'Donation recorded in system',
        'Inventory += collected units',
        'Blood expiry set to 35 days from collection',
        'Request status checked: If unitsCollected ≥ unitsRequested → COMPLETED'
      ],
      color: '#4caf50'
    },
    {
      label: 'Hospital Collects Blood',
      icon: <Assignment />,
      description: 'Hospital physically collects the blood',
      details: [
        'Request status: APPROVED or COMPLETED',
        'Hospital user goes to collection location',
        'Hospital clicks "Confirm Collection" button',
        'Request status → COLLECTED',
        'Collection timestamp recorded'
      ],
      color: '#9c27b0'
    },
    {
      label: 'Admin Verifies Collection',
      icon: <Verified />,
      description: 'Admin verifies the collection',
      details: [
        'Admin reviews collected request',
        'Clicks "Verify Collection"',
        'Request status → VERIFIED',
        'Process complete ✓'
      ],
      color: '#00bcd4'
    }
  ];

  const requestStatuses = [
    { status: 'pending', description: 'Request created, awaiting admin approval', color: 'warning' },
    { status: 'approved', description: 'Approved by admin, inventory deducted', color: 'info' },
    { status: 'completed', description: 'Enough blood collected through donations (unitsCollected ≥ unitsRequested)', color: 'success' },
    { status: 'collected', description: 'Hospital confirmed physical collection', color: 'secondary' },
    { status: 'verified', description: 'Admin verified the collection - COMPLETE', color: 'success' },
    { status: 'reschedule-requested', description: 'Hospital requested to reschedule collection date', color: 'warning' },
    { status: 'no-show', description: 'Hospital did not show up for collection', color: 'error' },
    { status: 'cancelled', description: 'Request cancelled by hospital or admin', color: 'error' },
    { status: 'rejected', description: 'Request rejected by admin', color: 'error' }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.6 }}
      >
        <Paper 
          sx={{ 
            p: { xs: 3, md: 4 }, 
            mb: 3,
            background: 'linear-gradient(135deg, #e11d48 0%, #fb7185 40%, #0ea5a4 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.95) 0%, rgba(251, 113, 133, 0.85) 40%, rgba(14, 165, 164, 0.95) 100%)',
              zIndex: 0
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 800,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
              }}
            >
              🩸 Blood Management Process Guide
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', opacity: 0.95 }}>
              Complete end-to-end process from hospital request to blood collection
            </Typography>
          </Box>
        </Paper>
      </motion.div>

      {/* Main Process Flow */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeIn}
        transition={{ duration: 0.5 }}
      >
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#1f2937', mb: 3 }}>
            📋 Complete Process Flow
          </Typography>
          <Stepper orientation="vertical" sx={{ mt: 2 }}>
          {steps.map((step, index) => (
            <Step key={index} active={true} completed={false}>
              <StepLabel
                icon={
                  <Box
                    sx={{
                      backgroundColor: step.color,
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}
                  >
                    {step.icon}
                  </Box>
                }
              >
                <Typography variant="h6">{step.label}</Typography>
              </StepLabel>
              <StepContent>
                <Typography color="textSecondary" paragraph>
                  {step.description}
                </Typography>
                <Box sx={{ pl: 2, borderLeft: `3px solid ${step.color}` }}>
                  {step.details.map((detail, idx) => (
                    <Typography key={idx} variant="body2" sx={{ mb: 1 }}>
                      • {detail}
                    </Typography>
                  ))}
                </Box>
              </StepContent>
            </Step>
          ))}
          </Stepper>
        </Paper>
      </motion.div>

      {/* Request Status Guide */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
        transition={{ duration: 0.5 }}
      >
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#1f2937', mb: 3 }}>
            🏷️ Request Status Meanings
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {requestStatuses.map((item, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div variants={fadeIn}>
                  <Card 
                    variant="outlined"
                    sx={{
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Chip
                          label={item.status.toUpperCase()}
                          color={item.color as any}
                          sx={{ mr: 2, fontWeight: 600 }}
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.95rem' }}>
                        {item.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </motion.div>

      {/* After Inventory Update */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeIn}
        transition={{ duration: 0.5 }}
      >
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Typography variant="h5" gutterBottom sx={{ color: '#16a34a', fontWeight: 700, mb: 2 }}>
            🔄 What Happens After Inventory Update?
          </Typography>
          <Divider sx={{ my: 2 }} />
        
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            When a donation is completed and inventory is updated:
          </Typography>
        </Alert>

        <Box sx={{ pl: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            1️⃣ Automatic Request Check
          </Typography>
          <Typography variant="body1" paragraph sx={{ pl: 2 }}>
            • System checks if the related blood request has collected enough units<br />
            • If <strong>unitsCollected ≥ unitsRequested</strong> → Request status changes to <Chip label="COMPLETED" color="success" size="small" /><br />
            • Request remains <Chip label="APPROVED" color="info" size="small" /> if more units still needed
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            2️⃣ Inventory Available
          </Typography>
          <Typography variant="body1" paragraph sx={{ pl: 2 }}>
            • Blood is now in inventory with 35-day expiry<br />
            • Available for current request or future requests<br />
            • System uses FIFO (First In, First Out) - oldest blood used first
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            3️⃣ Hospital Notification
          </Typography>
          <Typography variant="body1" paragraph sx={{ pl: 2 }}>
            • Hospital user sees request status updated<br />
            • If <Chip label="COMPLETED" color="success" size="small" />, hospital can collect blood<br />
            • Collection date and location already specified in approval
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            4️⃣ Appointment & Donation Process (Admin Side)
          </Typography>
          <Card variant="outlined" sx={{ ml: 2, mb: 2, backgroundColor: '#e8f5e9' }}>
            <CardContent>
              <Typography variant="body1" paragraph>
                <strong>🩸 Donation Flow in Website:</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Status:</strong> <Chip label="SCHEDULED" color="warning" size="small" sx={{ mr: 1 }} /><br />
                <strong>Action:</strong> Admin clicks "✅ Confirm Arrival" when donor arrives<br />
                <strong>System:</strong> Appointment status → <Chip label="CONFIRMED" color="info" size="small" />
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" paragraph>
                <strong>Status:</strong> <Chip label="CONFIRMED" color="info" size="small" sx={{ mr: 1 }} /><br />
                <strong>Action:</strong> Admin clicks "🩸 Start Donation" when ready<br />
                <strong>System:</strong> Appointment status → <Chip label="IN_PROGRESS" color="secondary" size="small" />
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" paragraph>
                <strong>Status:</strong> <Chip label="IN_PROGRESS" color="secondary" size="small" sx={{ mr: 1 }} /><br />
                <strong>Action:</strong> Admin clicks "Complete" after successful donation<br />
                <strong>System:</strong>
                <ul style={{ marginTop: '8px', marginBottom: 0 }}>
                  <li>Records donation (units collected: usually 1)</li>
                  <li>Updates inventory (+1 unit, expires in 35 days)</li>
                  <li>Updates donor history (ineligible for 90 days)</li>
                  <li>Checks request: If unitsCollected ≥ unitsRequested → <Chip label="COMPLETED" color="success" size="small" /></li>
                  <li>Appointment status → <Chip label="COMPLETED" color="success" size="small" /></li>
                  <li>Removed from active appointments</li>
                </ul>
              </Typography>
            </CardContent>
          </Card>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            5️⃣ Hospital Collection Process
          </Typography>
          <Card variant="outlined" sx={{ ml: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
            <CardContent>
              <Typography variant="body1" paragraph>
                <strong>Step 1:</strong> Hospital goes to specified collection location<br />
                <strong>Step 2:</strong> Hospital clicks "Confirm Collection" button in their dashboard<br />
                <strong>Step 3:</strong> Request status → <Chip label="COLLECTED" color="secondary" size="small" /><br />
                <strong>Step 4:</strong> Admin verifies the collection<br />
                <strong>Step 5:</strong> Request status → <Chip label="VERIFIED" color="success" size="small" /> ✅<br />
                <strong>Result:</strong> Process complete!
              </Typography>
            </CardContent>
          </Card>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            6️⃣ Auto-Transition to Blood Request Management
          </Typography>
          <Card variant="outlined" sx={{ ml: 2, mb: 2, backgroundColor: '#fff3e0' }}>
            <CardContent>
              <Typography variant="body1" paragraph>
                <strong>⚡ Automatic Process When Request is Fulfilled:</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                When enough blood is collected (units collected ≥ units requested):
              </Typography>
              <ol style={{ margin: 0 }}>
                <li>Request status → <Chip label="COMPLETED" color="success" size="small" /></li>
                <li>Collection date automatically set (tomorrow)</li>
                <li>Collection location set (where blood was donated)</li>
                <li>Collection instructions generated</li>
                <li><strong>Request REMOVED from Donation Flow Dashboard</strong></li>
                <li><strong>Request APPEARS in Blood Request Management</strong></li>
                <li>Hospital receives notification to collect blood</li>
              </ol>
            </CardContent>
          </Card>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            7️⃣ Final Updates
          </Typography>
          <Typography variant="body1" paragraph sx={{ pl: 2 }}>
            <strong>Donor Profile:</strong><br />
            • Last donation date updated<br />
            • Marked as ineligible for 90 days<br />
            • Next eligible date calculated automatically<br />
            • Donation history recorded<br /><br />
            <strong>Request Flow:</strong><br />
            • ✅ If completed → Moved to Blood Request Management → Hospital collects<br />
            • 🔄 If more units needed → Remains in Donation Flow → Continue collecting<br />
            • 🏥 Once hospital confirms collection → Admin verifies → <Chip label="VERIFIED" color="success" size="small" />
          </Typography>
          </Box>
        </Paper>
      </motion.div>

      {/* Key Points */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeIn}
        transition={{ duration: 0.5 }}
      >
        <Paper 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#1e40af' }}>
            💡 Key Points to Remember
          </Typography>
        <Box sx={{ pl: 2 }}>
          <Typography variant="body1" paragraph>
            ✅ <strong>Inventory is deducted TWICE:</strong>
          </Typography>
          <Box sx={{ pl: 4, mb: 2 }}>
            <Typography variant="body2">
              1. When admin approves request (if sufficient inventory exists)<br />
              2. When hospital confirms collection (final deduction)
            </Typography>
          </Box>

          <Typography variant="body1" paragraph>
            ✅ <strong>If inventory insufficient:</strong>
          </Typography>
          <Box sx={{ pl: 4, mb: 2 }}>
            <Typography variant="body2">
              • Admin cannot approve directly<br />
              • System redirects to Donation Flow Dashboard<br />
              • Admin must collect blood through donor appointments first
            </Typography>
          </Box>

          <Typography variant="body1" paragraph>
            ✅ <strong>Request fulfillment:</strong>
          </Typography>
          <Box sx={{ pl: 4, mb: 2 }}>
            <Typography variant="body2">
              • Request = COMPLETED means enough blood collected (unitsCollected ≥ unitsRequested)<br />
              • Hospital can now collect the blood<br />
              • Admin must verify after hospital collection
            </Typography>
          </Box>

          <Typography variant="body1" paragraph>
            ✅ <strong>Blood expiry:</strong>
          </Typography>
          <Box sx={{ pl: 4 }}>
            <Typography variant="body2">
              • All blood expires 35 days after collection<br />
              • System uses oldest blood first (FIFO)<br />
              • Expired blood automatically handled by inventory system
            </Typography>
          </Box>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default ProcessGuide;
