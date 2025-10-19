# Blood Bank Management System

A comprehensive web-based blood bank management system built with React, Node.js, TypeScript, and MongoDB.

## Features

### 🩸 **Core Functionality**
- **Inventory Management** - Track blood units by type with threshold monitoring
- **Donor Management** - Complete donor registration and profile management
- **Request Processing** - Handle blood requests from hospitals and external sources
- **Medical Reports** - Upload and review donor medical clearances
- **Smart Notifications** - Automated donor alerts when blood levels are low

### 👥 **User Roles**
- **Admin** - Full system access and management
- **Hospital** - Request blood and view inventory
- **Donor** - Register, upload medical reports, respond to donation requests
- **External** - Limited access for blood requests

### 🔧 **Advanced Features**
- **Threshold-Based Alerts** - Automatic notifications when blood levels drop
- **Appointment Scheduling** - Coordinate donation appointments
- **Medical Report Review** - Admin approval workflow for donor eligibility
- **Donation History Tracking** - Complete audit trail
- **Real-time Dashboard** - Live inventory and statistics

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for components
- **React Router** for navigation
- **Axios** for API calls
- **React Hook Form** for form handling

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **Bcrypt** for password hashing

## Project Structure

```
BloodBankManagementSystem/
├── front_end/                 # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   │   ├── Admin/        # Admin dashboard pages
│   │   │   └── Donor/        # Donor portal pages
│   │   ├── contexts/         # React contexts (Auth, etc.)
│   │   └── utils/            # Utility functions
│   └── public/               # Static assets
├── back_end/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/      # API route handlers
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API route definitions
│   │   ├── middleware/       # Custom middleware
│   │   └── utils/            # Backend utilities
│   └── uploads/              # File upload storage
└── README.md                 # Project documentation
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd BloodBankManagementSystem
```

### 2. Backend Setup
```bash
cd back_end
npm install
```

Create `.env` file:
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/bloodbank
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### 3. Frontend Setup
```bash
cd ../front_end
npm install
```

### 4. Start Development Servers

**Backend:**
```bash
cd back_end
npm run dev
```

**Frontend:**
```bash
cd front_end
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## Usage

### Initial Setup
1. **Create Main Admin**: Use the setup endpoint to create the first admin user
2. **Login**: Access the admin panel with your credentials
3. **Configure Thresholds**: Set blood inventory threshold levels
4. **Add Donors**: Register donors or allow self-registration

### Admin Workflow
1. **Manage Inventory** - Add/update blood units
2. **Review Medical Reports** - Approve donor eligibility
3. **Process Requests** - Handle blood requests from hospitals
4. **Monitor Dashboard** - Track system statistics

### Donor Workflow
1. **Register Account** - Create donor profile
2. **Upload Medical Reports** - Submit health clearances
3. **Respond to Notifications** - Accept/decline donation requests
4. **Schedule Appointments** - Book donation slots

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Inventory
- `GET /api/inventory` - Get blood inventory
- `POST /api/inventory` - Add blood units
- `POST /api/inventory/check-thresholds` - Check low stock alerts

### Donors
- `GET /api/donors` - List all donors (admin)
- `POST /api/donors` - Create new donor
- `PATCH /api/donors/:id/toggle-status` - Enable/disable donor

### Medical Reports
- `POST /api/medical-reports/upload` - Upload medical report
- `GET /api/medical-reports/pending` - Get pending reviews
- `PATCH /api/medical-reports/:id/review` - Approve/reject report

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Production Deployment

### Environment Variables (Production)

**Backend `.env`:**
```env
NODE_ENV=production
PORT=4000
MONGODB_URI=<your-production-mongodb-uri>
JWT_SECRET=<strong-random-secret-min-32-chars>
```

### Deployment Steps

1. **Build Frontend:**
```bash
cd front_end
npm run build
```

2. **Build Backend:**
```bash
cd back_end
npm run build
```

3. **Deploy Options:**
- **Frontend:** Vercel, Netlify, or serve build folder
- **Backend:** Heroku, Railway, DigitalOcean, or AWS
- **Database:** MongoDB Atlas (recommended)

### Security Checklist
- ✓ JWT tokens expire in 7 days
- ✓ Passwords hashed with bcrypt
- ✓ Helmet.js security headers enabled
- ✓ CORS properly configured
- ✓ Input validation on all forms
- ✓ Protected routes with authentication
- ✓ Role-based access control (RBAC)
- ✓ Error boundary for crash prevention
- ✓ Environment variables for secrets

### Performance Features
- ✓ Toast notifications for user feedback
- ✓ Loading skeletons for better UX
- ✓ Lazy loading components
- ✓ Optimized Material-UI theme
- ✓ Responsive design (mobile-first)
- ✓ Professional error handling

## Support

**Project Team (IIIT Kurnool):**
- Aryan Rajesh Gadam - 123cs0020@iiitk.ac.in
- Tagore Jagata - 123cs0042@iiitk.ac.in
- Rovan Mullangi - 123cs0036@iiitk.ac.in
- Venkata Sai Nadigatla - 123CS0041@iiitk.ac.in

For support and questions, please contact the development team.
