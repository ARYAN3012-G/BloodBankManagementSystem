# Changelog

## [1.1.0] - 2025-10-27

### Added - Cloudinary Cloud Storage Integration

#### Problem Solved
- Medical reports were stored in local filesystem, causing files to be inaccessible across different instances
- Files uploaded locally couldn't be seen from deployed version
- Render's ephemeral filesystem deleted files on server restarts
- Each local computer had separate file storage

#### Solution Implemented
- **Cloud Storage**: Integrated Cloudinary for persistent, centralized file storage
- **Universal Access**: Files now accessible from all instances (local & deployed)
- **Persistent Storage**: Files survive server restarts and deployments

### Modified Files

#### Backend
- ✅ `src/config/cloudinary.ts` - NEW: Cloudinary configuration
- ✅ `src/utils/cloudinaryUpload.ts` - NEW: Upload/delete utilities
- ✅ `src/models/MedicalReport.ts` - Added `cloudinaryPublicId` field
- ✅ `src/controllers/medicalReportController.ts` - Cloudinary upload implementation
- ✅ `.env.example` - Added Cloudinary environment variables
- ✅ `package.json` - Added cloudinary dependency

#### Frontend
- ✅ `front_end/src/pages/Donor/MedicalReports.tsx` - Fixed View button for cloud URLs
- ✅ `front_end/src/pages/Admin/MedicalReportsReview.tsx` - Fixed View button
- ✅ `front_end/src/pages/Admin/AdminDonorManagement.tsx` - Fixed View button

### Configuration Required

#### Environment Variables (Add to `.env` and Render):
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Get credentials from: https://cloudinary.com/console

### Technical Details

#### How It Works
1. **Upload Flow**:
   - File received by backend via multer (memory storage)
   - File buffer uploaded directly to Cloudinary
   - Cloudinary returns permanent HTTPS URL
   - URL and metadata saved in MongoDB
   - File accessible from anywhere

2. **View Flow**:
   - Frontend detects URL type (cloud vs local)
   - Cloud URLs (starting with `https://`) used directly
   - Legacy local paths prefixed with backend URL
   - Opens in new tab from Cloudinary CDN

3. **Delete Flow**:
   - File deleted from Cloudinary using publicId
   - Database record removed
   - Graceful fallback if cloud deletion fails

#### File Storage Location
- **Cloudinary folder**: `blood-bank/medical-reports/`
- **Supported formats**: PDF, JPG, JPEG, PNG
- **Max file size**: 10MB
- **Free tier**: 25GB storage, 25GB bandwidth/month

### Benefits
- ✅ Files accessible from any computer or deployment
- ✅ No file loss on server restarts
- ✅ Works with Render's ephemeral filesystem
- ✅ Centralized storage for all instances
- ✅ Built-in CDN for fast file delivery
- ✅ Automatic HTTPS for secure transfers

### Migration Notes
- **Old reports**: Previously uploaded reports remain in local `uploads/` folder
- **New reports**: All new uploads go to Cloudinary
- **Backward compatibility**: View button handles both cloud and local paths
- **Recommendation**: Re-upload important old reports

### Setup Instructions
See `SETUP_INSTRUCTIONS.txt` and `back_end/CLOUDINARY_SETUP_GUIDE.txt`

---

## Previous Versions
See git history for earlier changes.
