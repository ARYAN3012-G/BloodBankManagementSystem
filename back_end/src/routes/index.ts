import { Router } from 'express';
import { login, register } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { getStock, addUnits } from '../controllers/inventoryController';
import { createRequest, listRequests, approveAndAssign, rejectRequest } from '../controllers/requestController';
import { donorProfile, registerDonor, listAllDonors, toggleAvailability, toggleDonorStatus, getDonorEligibility } from '../controllers/donorController';
import { upload, uploadFile, checkFile, listFiles } from '../controllers/uploadController';
import { recordDonation, listDonations, getDonationStats, getDonorHistory } from '../controllers/donationController';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ message: 'Arts Blood Foundation API' });
});

// Auth
router.post('/auth/register', register);
router.post('/auth/login', login);

// Inventory
router.get('/inventory', requireAuth(['admin', 'hospital']), getStock);
router.post('/inventory', requireAuth(['admin']), addUnits);

// Requests
router.get('/requests', requireAuth(['admin', 'hospital', 'external']), listRequests);
router.post('/requests', requireAuth(['hospital', 'external']), createRequest);
router.post('/requests/:id/approve', requireAuth(['admin']), approveAndAssign);
router.post('/requests/:id/reject', requireAuth(['admin']), rejectRequest);

// Donor
router.get('/donors', requireAuth(['admin']), listAllDonors);
router.get('/donor/me', requireAuth(['donor']), donorProfile);
router.post('/donor/register', requireAuth(['donor']), registerDonor);
router.patch('/donor/availability', requireAuth(['donor']), toggleAvailability); // Donor toggles availability
router.get('/donor/eligibility', requireAuth(['donor']), getDonorEligibility); // Get eligibility status
router.patch('/donors/:donorId/status', requireAuth(['admin']), toggleDonorStatus); // Admin toggles active status

// Donations
router.post('/donations/record', requireAuth(['admin']), recordDonation); // Admin records donation
router.get('/donations', requireAuth(['admin']), listDonations); // List all donations
router.get('/donations/stats', requireAuth(['admin']), getDonationStats); // Donation statistics
router.get('/donations/donor/:donorId', requireAuth(['admin', 'donor']), getDonorHistory); // Donor history

// File Upload
router.post('/upload', requireAuth(['hospital', 'external']), upload.single('file'), uploadFile);
router.get('/files', requireAuth(['admin']), listFiles); // List all uploaded files (admin only)
router.get('/files/:filename', checkFile); // Check if a specific file exists

export default router;


