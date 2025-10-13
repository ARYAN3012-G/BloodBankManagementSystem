import { Router } from 'express';
import { login, register } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { getStock, addUnits } from '../controllers/inventoryController';
import { createRequest, listRequests, approveAndAssign, rejectRequest } from '../controllers/requestController';
import { donorProfile, registerDonor, listAllDonors } from '../controllers/donorController';
import { upload, uploadFile, checkFile, listFiles } from '../controllers/uploadController';

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

// File Upload
router.post('/upload', requireAuth(['hospital', 'external']), upload.single('file'), uploadFile);
router.get('/files', requireAuth(['admin']), listFiles); // List all uploaded files (admin only)
router.get('/files/:filename', checkFile); // Check if a specific file exists

export default router;


