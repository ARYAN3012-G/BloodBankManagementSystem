import { Router } from 'express';
import { login, register } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { getStock, addUnits } from '../controllers/inventoryController';
import { createRequest, listRequests, approveAndAssign, rejectRequest, confirmCollection, requestReschedule, cancelRequest, verifyCollection, markAsCollected, markAsNoShow, handleReschedule, checkNoShows } from '../controllers/requestController';
import { donorProfile, registerDonor, listAllDonors, toggleAvailability, toggleDonorStatus, getDonorEligibility, createDonor, getAllDonors, getDonorById, updateDonor, updateDonorStatus, deleteDonor, findEligibleDonors, recordDonation, getDonorStats } from '../controllers/donorController';
import { upload, uploadFile, checkFile, listFiles } from '../controllers/uploadController';

// Enhanced donation flow controllers
import { getSuitableDonorsForRequest, createEnhancedRequest, getRequestDashboard } from '../controllers/enhancedRequestController';
import { sendDonationRequestNotifications, getDonorNotifications, respondToNotification, markNotificationAsRead, getRequestNotificationResponses } from '../controllers/notificationController';
import { createAppointmentFromNotification, getAppointments, getDonorAppointments, updateAppointmentStatus, cancelAppointment, getAppointmentStats, completeAppointment } from '../controllers/appointmentController';
import { uploadMedicalReport, getDonorMedicalReports, getPendingMedicalReports, reviewMedicalReport, deleteMedicalReport, getDonorMedicalReportsById, upload as medicalUpload } from '../controllers/medicalReportController';
import { getPendingAdmins, approveAdmin, rejectAdmin, checkMainAdminStatus, getAdminStats } from '../controllers/adminApprovalController';
import { setupMainAdmin } from '../controllers/setupController';
import { checkInventoryThresholds, getThresholdSettings, updateThresholdSettings, getInventoryWithThresholds } from '../controllers/inventoryThresholdController';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ message: 'Arts Blood Foundation API' });
});

// Auth
router.post('/auth/register', register);
router.post('/auth/login', login);

// Setup (temporary for initial main admin setup)
router.post('/setup/main-admin', setupMainAdmin); // No auth required for initial setup

// Inventory
router.get('/inventory', requireAuth(['admin', 'hospital']), getStock);
router.post('/inventory', requireAuth(['admin']), addUnits);

// Inventory Threshold System (Smart Donation Scheduling)
router.get('/inventory/with-thresholds', requireAuth(['admin']), getInventoryWithThresholds); // Get inventory with threshold status
router.post('/inventory/check-thresholds', requireAuth(['admin']), checkInventoryThresholds); // Check and trigger donor notifications
router.get('/inventory/threshold-settings', requireAuth(['admin']), getThresholdSettings); // Get threshold settings
router.put('/inventory/threshold-settings', requireAuth(['admin']), updateThresholdSettings); // Update threshold settings

// Requests
router.get('/requests', requireAuth(['admin', 'hospital', 'external']), listRequests);
router.post('/requests', requireAuth(['hospital', 'external']), createRequest);
router.post('/requests/:id/approve', requireAuth(['admin']), approveAndAssign);
router.post('/requests/:id/reject', requireAuth(['admin']), rejectRequest);

// User request actions
router.post('/requests/:id/confirm-collection', requireAuth(['hospital', 'external']), confirmCollection);
router.post('/requests/:id/request-reschedule', requireAuth(['hospital', 'external']), requestReschedule);
router.post('/requests/:id/cancel', requireAuth(['hospital', 'external']), cancelRequest);

// Admin request actions
router.patch('/requests/:id/verify-collection', requireAuth(['admin']), verifyCollection);
router.patch('/requests/:id/mark-collected', requireAuth(['admin']), markAsCollected);
router.patch('/requests/:id/mark-no-show', requireAuth(['admin']), markAsNoShow);
router.post('/requests/:id/handle-reschedule', requireAuth(['admin']), handleReschedule);

// System cron endpoint
router.post('/system/check-no-shows', checkNoShows); // Can be called by cron or admin

// Donor Management (New Enhanced System)
router.post('/donors', requireAuth(['admin']), createDonor); // Admin creates donor
router.get('/donors', requireAuth(['admin']), getAllDonors); // Admin gets all donors with filtering
router.get('/donors/:id', requireAuth(['admin']), getDonorById); // Admin gets specific donor
router.put('/donors/:id', requireAuth(['admin']), updateDonor); // Admin updates donor
router.patch('/donors/:id/status', requireAuth(['admin']), updateDonorStatus); // Admin updates status
router.patch('/donors/:donorId/toggle-status', requireAuth(['admin']), toggleDonorStatus); // Toggle active status
router.delete('/donors/:id', requireAuth(['admin']), deleteDonor); // Admin deletes donor

// Donor self-management
router.get('/donor/me', requireAuth(['donor']), donorProfile); // Donor profile
router.post('/donor/register', requireAuth(['donor']), registerDonor); // Donor registration
router.patch('/donor/availability', requireAuth(['donor']), toggleAvailability); // Donor availability
router.get('/donor/eligibility', requireAuth(['donor']), getDonorEligibility); // Donor eligibility

// Legacy donor routes (for backward compatibility)
router.get('/legacy-donors', requireAuth(['admin']), listAllDonors); // Legacy route
router.patch('/legacy-donors/:donorId/status', requireAuth(['admin']), toggleDonorStatus); // Legacy route

// Donor calling and notifications
router.get('/donors/eligible/:bloodGroup', requireAuth(['admin']), findEligibleDonors); // Find eligible donors
router.post('/donors/:id/donate', requireAuth(['admin']), recordDonation); // Record donation
router.get('/donors/stats', requireAuth(['admin']), getDonorStats); // Donor statistics

// Enhanced Request Management
router.post('/requests/enhanced', requireAuth(['hospital', 'external']), createEnhancedRequest); // Enhanced request creation
router.get('/requests/:requestId/suitable-donors', requireAuth(['admin']), getSuitableDonorsForRequest); // Get suitable donors
router.get('/requests/dashboard', requireAuth(['admin']), getRequestDashboard); // Request dashboard

// Notification System
router.post('/notifications/send-donation-request', requireAuth(['admin']), sendDonationRequestNotifications); // Send notifications
router.get('/notifications/donor', requireAuth(['donor']), getDonorNotifications); // Get donor notifications
router.post('/notifications/:notificationId/respond', requireAuth(['donor']), respondToNotification); // Respond to notification
router.patch('/notifications/:notificationId/read', requireAuth(['donor']), markNotificationAsRead); // Mark as read
router.get('/requests/:requestId/notification-responses', requireAuth(['admin']), getRequestNotificationResponses); // Get responses

// Appointment System
router.post('/appointments/from-notification', requireAuth(['admin']), createAppointmentFromNotification); // Create appointment
router.get('/appointments', requireAuth(['admin']), getAppointments); // Get all appointments
router.get('/appointments/donor', requireAuth(['donor']), getDonorAppointments); // Get donor appointments
router.patch('/appointments/:appointmentId/status', requireAuth(['admin']), updateAppointmentStatus); // Update status
router.post('/appointments/:appointmentId/complete', requireAuth(['admin']), completeAppointment); // Complete appointment - records donation & updates inventory
router.delete('/appointments/:appointmentId', requireAuth(['admin', 'donor']), cancelAppointment); // Cancel appointment
router.get('/appointments/stats', requireAuth(['admin']), getAppointmentStats); // Appointment statistics

// Medical Reports System
router.post('/medical-reports/upload', requireAuth(['donor']), medicalUpload.single('report'), uploadMedicalReport); // Upload report
router.get('/medical-reports/my-reports', requireAuth(['donor']), getDonorMedicalReports); // Get donor's reports
router.get('/medical-reports/pending', requireAuth(['admin']), getPendingMedicalReports); // Get pending reports
router.get('/medical-reports/donor/:donorId', requireAuth(['admin']), getDonorMedicalReportsById); // Get reports for specific donor
router.patch('/medical-reports/:reportId/review', requireAuth(['admin']), reviewMedicalReport); // Review report
router.delete('/medical-reports/:reportId', requireAuth(['admin', 'donor']), deleteMedicalReport); // Delete report

// Main Admin System (only for main admin)
router.get('/admin/pending-admins', requireAuth(['admin']), getPendingAdmins); // Get pending admin registrations
router.post('/admin/:adminId/approve', requireAuth(['admin']), approveAdmin); // Approve admin
router.post('/admin/:adminId/reject', requireAuth(['admin']), rejectAdmin); // Reject admin
router.get('/admin/main-admin-status', requireAuth(['admin']), checkMainAdminStatus); // Check if main admin
router.get('/admin/admin-stats', requireAuth(['admin']), getAdminStats); // Admin statistics

// File Upload
router.post('/upload', requireAuth(['hospital', 'external']), upload.single('file'), uploadFile);
router.get('/files', requireAuth(['admin']), listFiles); // List all uploaded files (admin only)
router.get('/files/:filename', checkFile); // Check if a specific file exists

export default router;
