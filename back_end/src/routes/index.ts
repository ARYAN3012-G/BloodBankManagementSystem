import { Router } from 'express';
import { login, register } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { getStock, addUnits } from '../controllers/inventoryController';
import { createRequest, listRequests, getRequestById, approveAndAssign, rejectRequest, confirmCollection, requestReschedule, cancelRequest, verifyCollection, markAsCollected, markAsNoShow, handleReschedule, checkNoShows } from '../controllers/requestController';
import { markInventorySatisfied } from '../controllers/markInventorySatisfied';
import { donorProfile, registerDonor, listAllDonors, toggleAvailability, toggleDonorStatus, getDonorEligibility, createDonor, getAllDonors, getDonorById, updateDonor, updateDonorStatus, deleteDonor, findEligibleDonors, recordDonation, getDonorStats } from '../controllers/donorController';
import { uploadFile, checkFile, listFiles, upload } from '../controllers/uploadController';

// Enhanced donation flow controllers
import { getSuitableDonorsForRequest, createEnhancedRequest, getRequestDashboard } from '../controllers/enhancedRequestController';
import { sendDonationRequestNotifications, getDonorNotifications, respondToNotification, markNotificationAsRead, getRequestNotificationResponses, getAllNotificationsForAdmin } from '../controllers/notificationController';
import { createAppointment, createAppointmentFromNotification, getAppointments, getDonorAppointments, updateAppointmentStatus, cancelAppointment, getAppointmentStats, completeAppointment } from '../controllers/appointmentController';
import { uploadMedicalReport, getDonorMedicalReports, getPendingMedicalReports, reviewMedicalReport, deleteMedicalReport, getDonorMedicalReportsById, medicalReportUpload } from '../controllers/medicalReportController';
import { getPendingAdmins, approveAdmin, rejectAdmin, checkMainAdminStatus, getAdminStats, getAllAdmins, toggleAdminStatus, deleteAdmin } from '../controllers/adminApprovalController';
import { setupMainAdmin } from '../controllers/setupController';
import { checkInventoryThresholds, getThresholdSettings, updateThresholdSettings, getInventoryWithThresholds } from '../controllers/inventoryThresholdController';
import { getProactiveRequestsForCleanup, deleteProactiveRequest } from '../controllers/adminCleanupController';
import { cleanupInvalidDonors } from '../controllers/cleanupController';
import { recordDonation as recordDonationDirect } from '../controllers/donationController';

// Middleware
import { authLimiter, requestLimiter, uploadLimiter } from '../middleware/rateLimiter';
import { 
  registerValidation, 
  loginValidation, 
  bloodRequestValidation,
  donorRegistrationValidation,
  inventoryValidation,
  validateObjectId
} from '../middleware/validation';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ message: 'Arts Blood Foundation API' });
});

// Auth - with rate limiting and validation
router.post('/auth/register', authLimiter, registerValidation, register);
router.post('/auth/login', authLimiter, loginValidation, login);

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

// Requests - with rate limiting and validation
router.get('/requests', requireAuth(['admin', 'hospital', 'external']), listRequests);
router.get('/requests/:id', requireAuth(['admin', 'hospital', 'external']), validateObjectId, getRequestById);
router.post('/requests', requireAuth(['hospital', 'external']), requestLimiter, bloodRequestValidation, createRequest);
router.post('/requests/:id/approve', requireAuth(['admin']), validateObjectId, approveAndAssign);
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
router.post('/requests/:id/mark-inventory-satisfied', requireAuth(['admin']), markInventorySatisfied); // Mark donation flow complete

// System cron endpoint
router.post('/system/check-no-shows', checkNoShows); // Can be called by cron or admin

// Admin Cleanup Tools
router.get('/admin/cleanup/proactive-requests', requireAuth(['admin']), getProactiveRequestsForCleanup);
router.delete('/admin/cleanup/proactive-requests/:id', requireAuth(['admin']), deleteProactiveRequest);
router.post('/admin/cleanup/invalid-donors', requireAuth(['admin']), cleanupInvalidDonors); // Clean up donors without userId

// Donor Management (New Enhanced System)
router.post('/donors', requireAuth(['admin']), createDonor); // Admin creates donor
router.get('/donors', requireAuth(['admin']), getAllDonors); // Admin gets all donors with filtering
router.get('/donors/:id', requireAuth(['admin']), getDonorById); // Admin gets specific donor
router.put('/donors/:id', requireAuth(['admin']), updateDonor); // Admin updates donor
router.patch('/donors/:id/status', requireAuth(['admin']), updateDonorStatus); // Admin updates status
router.patch('/donors/:donorId/toggle-status', requireAuth(['admin']), toggleDonorStatus); // Toggle active status
router.delete('/donors/:id', requireAuth(['admin']), deleteDonor); // Admin deletes donor

// Donor self-management - with validation
router.get('/donor/me', requireAuth(['donor']), donorProfile); // Donor profile
router.post('/donor/register', requireAuth(['donor']), donorRegistrationValidation, registerDonor); // Donor registration
router.patch('/donor/availability', requireAuth(['donor']), toggleAvailability); // Donor availability
router.get('/donor/eligibility', requireAuth(['donor']), getDonorEligibility); // Donor eligibility

// Legacy donor routes (for backward compatibility)
router.get('/legacy-donors', requireAuth(['admin']), listAllDonors); // Legacy route
router.patch('/legacy-donors/:donorId/status', requireAuth(['admin']), toggleDonorStatus); // Legacy route

// Donor calling and notifications
router.get('/donors/eligible/:bloodGroup', requireAuth(['admin']), findEligibleDonors); // Find eligible donors
router.post('/donors/:id/donate', requireAuth(['admin']), recordDonation); // Record donation (legacy route)
router.get('/donors/stats', requireAuth(['admin']), getDonorStats); // Donor statistics

// Donation Management
router.post('/donations/record', requireAuth(['admin']), recordDonationDirect); // Record donation directly (proactive collection)

// Enhanced Request Management
router.post('/requests/enhanced', requireAuth(['hospital', 'external']), createEnhancedRequest); // Enhanced request creation
router.post('/requests/proactive', requireAuth(['admin']), createRequest); // Proactive inventory request
router.get('/requests/:requestId/suitable-donors', requireAuth(['admin']), getSuitableDonorsForRequest); // Get suitable donors
router.get('/requests/dashboard', requireAuth(['admin']), getRequestDashboard); // Request dashboard

// Notification System
router.post('/notifications/send-donation-request', requireAuth(['admin']), sendDonationRequestNotifications); // Send notifications
router.get('/notifications/admin/all', requireAuth(['admin']), getAllNotificationsForAdmin); // Get all notifications (admin view)
router.get('/notifications/donor', requireAuth(['donor']), getDonorNotifications); // Get donor notifications
router.post('/notifications/:notificationId/respond', requireAuth(['donor']), respondToNotification); // Respond to notification
router.patch('/notifications/:notificationId/read', requireAuth(['donor']), markNotificationAsRead); // Mark as read
router.get('/requests/:requestId/notification-responses', requireAuth(['admin']), getRequestNotificationResponses); // Get responses

// Appointment System
router.post('/appointments', requireAuth(['admin']), createAppointment); // Create appointment directly (proactive collection)
router.post('/appointments/from-notification', requireAuth(['admin']), createAppointmentFromNotification); // Create appointment from notification
router.get('/appointments', requireAuth(['admin']), getAppointments); // Get all appointments
router.get('/appointments/donor', requireAuth(['donor']), getDonorAppointments); // Get donor appointments
router.patch('/appointments/:appointmentId/status', requireAuth(['admin']), updateAppointmentStatus); // Update status
router.post('/appointments/:appointmentId/complete', requireAuth(['admin']), completeAppointment); // Complete appointment - records donation & updates inventory
router.delete('/appointments/:appointmentId', requireAuth(['admin', 'donor']), cancelAppointment); // Cancel appointment
router.get('/appointments/stats', requireAuth(['admin']), getAppointmentStats); // Appointment statistics

// Medical Reports System - with rate limiting for uploads
router.post('/medical-reports/upload', requireAuth(['donor']), uploadLimiter, medicalReportUpload.single('report'), uploadMedicalReport); // Upload report
router.get('/medical-reports/my-reports', requireAuth(['donor']), getDonorMedicalReports); // Get donor's reports
router.get('/medical-reports/pending', requireAuth(['admin']), getPendingMedicalReports); // Get pending reports
router.get('/medical-reports/donor/:donorId', requireAuth(['admin']), getDonorMedicalReportsById); // Get reports for specific donor
router.patch('/medical-reports/:reportId/review', requireAuth(['admin']), reviewMedicalReport); // Review report
router.delete('/medical-reports/:reportId', requireAuth(['admin', 'donor']), deleteMedicalReport); // Delete report

// Main Admin System (only for main admin)
router.get('/admin/pending-admins', requireAuth(['admin']), getPendingAdmins); // Get pending admin registrations
router.get('/admin/all-admins', requireAuth(['admin']), getAllAdmins); // Get all admin users
router.post('/admin/:adminId/approve', requireAuth(['admin']), approveAdmin); // Approve admin
router.post('/admin/:adminId/reject', requireAuth(['admin']), rejectAdmin); // Reject admin
router.patch('/admin/:adminId/toggle-status', requireAuth(['admin']), toggleAdminStatus); // Enable/disable admin
router.delete('/admin/:adminId', requireAuth(['admin']), deleteAdmin); // Delete admin
router.get('/admin/main-admin-status', requireAuth(['admin']), checkMainAdminStatus); // Check if main admin
router.get('/admin/admin-stats', requireAuth(['admin']), getAdminStats); // Admin statistics

router.get('/files', requireAuth(['admin']), listFiles); // List all uploaded files (admin only)
router.get('/files/:filename', checkFile); // Check if a specific file exists

export default router;
