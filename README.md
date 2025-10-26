# 🩸 Arts Blood Foundation

> **A comprehensive, production-ready Blood Bank Management System**  
> Connecting blood donors with those in need • Built with modern web technologies

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌐 Live Demo

🚀 **Experience the application live:**

| Service | URL | Status |
|---------|-----|--------|
| 🎨 **Frontend** | [blood-bank-management-system-liard-one.vercel.app](https://blood-bank-management-system-liard-one.vercel.app) | [![Vercel](https://img.shields.io/badge/Vercel-Deployed-00C58E?style=flat&logo=vercel&logoColor=white)](https://blood-bank-management-system-liard-one.vercel.app) |
| ⚙️ **Backend API** | [bloodbank-backend-xjda.onrender.com](https://bloodbank-backend-xjda.onrender.com) | [![Render](https://img.shields.io/badge/Render-Deployed-46E3B7?style=flat&logo=render&logoColor=white)](https://bloodbank-backend-xjda.onrender.com) |
| 🗄️ **Database** | MongoDB Atlas | [![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-Live-13AA52?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/cloud/atlas) |

**Test Credentials:**
```
📧 Email: admin@artsbloodfoundation.org
🔒 Password: [Contact team for access]
```

> **Note:** The backend may take 30-50 seconds to wake up on first request (Render free tier cold start).

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [Performance](#-performance)
- [Deployment](#-deployment)
- [Production URLs](#-live-demo)
- [Team](#-team)
- [License](#-license)

---

## 🎯 Overview

Arts Blood Foundation is a **full-stack web application** designed to streamline blood bank operations. It facilitates efficient inventory management, donor coordination, blood request processing, and appointment scheduling. Built for **IIITDM Kurnool**, this system ensures that hospitals, donors, and administrators can collaborate seamlessly to save lives.

### 🌟 Why This System?

- ✅ **Real-time inventory tracking** with automatic threshold alerts
- ✅ **Smart donor matching** based on blood type and availability
- ✅ **Automated notifications** when blood levels are critically low
- ✅ **Complete audit trail** of all donations and requests
- ✅ **Medical report verification** workflow
- ✅ **Role-based access control** for security
- ✅ **Production-ready** with comprehensive error handling and logging

---

## ✨ Features

### 🩸 **Core Functionality**

| Feature | Description |
|---------|-------------|
| **Inventory Management** | Track blood units by type with real-time updates and threshold monitoring |
| **Donor Management** | Complete donor registration, profile management, and eligibility tracking |
| **Request Processing** | Handle blood requests from hospitals and external sources with approval workflow |
| **Medical Reports** | Upload, review, and approve donor medical clearances |
| **Smart Notifications** | Automated donor alerts when specific blood types are low in stock |
| **Appointment Scheduling** | Coordinate donation appointments with donors |

### 👥 **User Roles**

#### 🔐 **Admin**
- Full system access and management
- Approve/reject blood requests
- Review medical reports
- Manage donor eligibility
- View comprehensive dashboards and reports
- Configure inventory thresholds
- Manage other admins

#### 🏥 **Hospital**
- Request blood for patients
- View real-time inventory
- Track request status
- Confirm blood collection

#### 💉 **Donor**
- Register and maintain profile
- Upload medical reports
- Respond to donation requests
- Schedule appointments
- View donation history
- Update availability status

#### 🌐 **External**
- Limited access for emergency blood requests
- View public inventory status

### 🔧 **Advanced Features**

- **Threshold-Based Alerts** - Automatic notifications when blood levels drop below configured thresholds
- **Proactive Donor Recruitment** - System identifies and notifies eligible donors
- **Donation Flow Dashboard** - Complete visualization of the donation lifecycle
- **Medical Report Review Workflow** - Admin approval process for donor eligibility
- **Donation History Tracking** - Complete audit trail with timestamps
- **Real-time Dashboards** - Live inventory statistics and system metrics
- **No-Show Tracking** - Monitor and manage missed appointments
- **Reschedule Management** - Handle appointment changes efficiently

---

## 🛠 Tech Stack

### **Frontend**

```json
{
  "framework": "React 18.2",
  "language": "TypeScript 4.9",
  "ui": "Material-UI (MUI) v5",
  "routing": "React Router v6",
  "http": "Axios",
  "forms": "React Hook Form + Yup",
  "animations": "Framer Motion",
  "state": "React Context API"
}
```

### **Backend**

```json
{
  "runtime": "Node.js 16+",
  "framework": "Express 4.18",
  "language": "TypeScript 4.9",
  "database": "MongoDB with Mongoose ODM",
  "authentication": "JWT (JSON Web Tokens)",
  "security": "Bcrypt, Helmet, CORS, Rate Limiting",
  "file-upload": "Multer",
  "validation": "Express Validator",
  "logging": "Winston"
}
```

### **Development Tools**

- **Version Control**: Git
- **Package Manager**: npm
- **Linting**: ESLint
- **Code Formatter**: Prettier (optional)
- **API Testing**: Postman/Thunder Client

---

## 📂 Project Structure

```
BloodBankManagementSystem/
├── front_end/                      # React Frontend Application
│   ├── public/                     # Static assets
│   │   ├── index.html             # HTML template with SEO meta tags
│   │   ├── favicon.svg            # App icon
│   │   └── manifest.json          # PWA manifest
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── Layout/           # Navbar, Footer
│   │   │   └── LoadingSkeleton/  # Loading states
│   │   ├── contexts/             # React contexts
│   │   │   ├── AuthContext.tsx   # Authentication state
│   │   │   └── SnackbarContext.tsx # Toast notifications
│   │   ├── pages/                # Page components
│   │   │   ├── Admin/           # Admin dashboard pages
│   │   │   ├── Donor/           # Donor portal pages
│   │   │   ├── Auth/            # Login, Register
│   │   │   └── Home.tsx         # Landing page
│   │   ├── utils/               # Utility functions
│   │   ├── App.tsx              # Main app component with lazy loading
│   │   └── index.tsx            # Entry point
│   ├── .env.example             # Environment variables template
│   ├── package.json             # Dependencies
│   └── tsconfig.json            # TypeScript configuration
│
├── back_end/                       # Node.js Backend API
│   ├── src/
│   │   ├── config/               # Configuration files
│   │   │   ├── db.ts            # MongoDB connection
│   │   │   └── logger.ts        # Winston logger setup
│   │   ├── controllers/          # API route handlers
│   │   │   ├── authController.ts
│   │   │   ├── donorController.ts
│   │   │   ├── inventoryController.ts
│   │   │   ├── requestController.ts
│   │   │   └── ... (15+ controllers)
│   │   ├── middleware/           # Custom middleware
│   │   │   ├── auth.ts          # JWT authentication
│   │   │   ├── rateLimiter.ts   # Rate limiting
│   │   │   ├── validation.ts    # Input validation
│   │   │   └── errorHandler.ts  # Global error handling
│   │   ├── models/               # MongoDB schemas
│   │   │   ├── User.ts
│   │   │   ├── Donor.ts
│   │   │   ├── Inventory.ts
│   │   │   ├── Request.ts
│   │   │   ├── Notification.ts
│   │   │   └── ... (10+ models)
│   │   ├── routes/              # API route definitions
│   │   │   └── index.ts         # All routes (150+ endpoints)
│   │   ├── utils/               # Backend utilities
│   │   │   └── response.ts      # Standardized API responses
│   │   └── index.ts             # Entry point
│   ├── uploads/                 # File upload storage
│   ├── logs/                    # Application logs
│   │   ├── error.log
│   │   └── combined.log
│   ├── .env.example             # Environment variables template
│   ├── package.json             # Dependencies
│   └── tsconfig.json            # TypeScript configuration
│
├── .gitignore                   # Git ignore rules
├── IMPROVEMENTS_LOG.txt         # Phase 1 improvements documentation
├── IMPROVEMENTS_PHASE_2.txt     # Phase 2 improvements documentation
└── README.md                    # This file
```

---

## 🚀 Installation

### **Prerequisites**

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)

### **Step 1: Clone the Repository**

```bash
git clone https://github.com/ARYAN3012/BloodBankManagementSystem.git
cd BloodBankManagementSystem
```

### **Step 2: Backend Setup**

```bash
cd back_end
npm install
```

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=4000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/bloodbank
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bloodbank

# JWT Configuration (IMPORTANT: Use a strong secret in production)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Environment
NODE_ENV=development
```

### **Step 3: Frontend Setup**

```bash
cd ../front_end
npm install
```

Create a `.env` file from the example:

```bash
cp .env.example .env
```

The default `.env` should work for local development:

```env
REACT_APP_API_URL=http://localhost:4000
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=development
```

### **Step 4: Create Logs Directory (Backend)**

```bash
cd ../back_end
mkdir logs
```

### **Step 5: Start Development Servers**

**Terminal 1 - Backend:**
```bash
cd back_end
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd front_end
npm start
```

### **Access the Application**

- 🌐 **Frontend**: http://localhost:3000
- ⚙️ **Backend API**: http://localhost:4000
- 🔍 **Health Check**: http://localhost:4000/health

---

## 📖 Usage

### **Initial Setup**

1. **Start both servers** (backend and frontend)

2. **Create the first admin user**:
   - Option A: Use the setup endpoint:
     ```bash
     POST http://localhost:4000/api/setup/main-admin
     {
       "name": "Admin Name",
       "email": "admin@example.com",
       "password": "SecurePassword123",
       "phone": "1234567890"
     }
     ```
   - Option B: Register through the UI and manually set role to 'admin' in MongoDB

3. **Login** with admin credentials

4. **Configure system**:
   - Set inventory thresholds
   - Add initial blood inventory
   - Register donors

### **Admin Workflow**

```mermaid
graph LR
    A[Login as Admin] --> B[View Dashboard]
    B --> C[Manage Inventory]
    B --> D[Review Medical Reports]
    B --> E[Process Requests]
    B --> F[Monitor Thresholds]
    C --> G[Add Blood Units]
    D --> H[Approve/Reject]
    E --> I[Assign Blood]
```

**Key Admin Tasks:**
1. **Manage Inventory** - Add and update blood units
2. **Review Medical Reports** - Approve donor eligibility
3. **Process Blood Requests** - Approve/reject hospital requests
4. **Monitor Dashboard** - Track real-time statistics
5. **Manage Donors** - Enable/disable donors, view history
6. **Configure Thresholds** - Set low stock alert levels
7. **View Reports** - Generate donation and inventory reports

### **Donor Workflow**

```mermaid
graph LR
    A[Register Account] --> B[Upload Medical Report]
    B --> C[Wait for Approval]
    C --> D[Receive Notifications]
    D --> E[Accept/Decline]
    E --> F[Schedule Appointment]
    F --> G[Donate Blood]
```

**Key Donor Actions:**
1. **Register** - Create donor profile with blood type
2. **Upload Medical Reports** - Submit health clearances
3. **Respond to Notifications** - Accept/decline donation requests
4. **Schedule Appointments** - Book convenient donation slots
5. **View History** - Check past donations
6. **Update Availability** - Set donation availability

### **Hospital Workflow**

1. **Login** with hospital credentials
2. **View Inventory** - Check available blood units
3. **Create Request** - Submit blood request with details
4. **Track Status** - Monitor request approval
5. **Confirm Collection** - Confirm blood received

---

## 📡 API Documentation

### **Base URL**

```
Development: http://localhost:4000/api
Production: https://your-domain.com/api
```

### **Authentication**

All authenticated endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### **Key Endpoints**

#### **Authentication**

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | User login | Public |

#### **Inventory**

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/inventory` | Get blood inventory | Admin, Hospital |
| POST | `/inventory` | Add blood units | Admin |
| GET | `/inventory/with-thresholds` | Get inventory with threshold status | Admin |
| POST | `/inventory/check-thresholds` | Trigger low stock notifications | Admin |

#### **Donors**

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/donors` | List all donors | Admin |
| POST | `/donors` | Create new donor | Admin |
| GET | `/donors/:id` | Get donor details | Admin |
| PUT | `/donors/:id` | Update donor | Admin |
| PATCH | `/donors/:id/status` | Update donor status | Admin |
| DELETE | `/donors/:id` | Delete donor | Admin |
| POST | `/donor/register` | Donor self-registration | Donor |
| GET | `/donor/me` | Get own profile | Donor |

#### **Requests**

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/requests` | List requests | Admin, Hospital, External |
| POST | `/requests` | Create blood request | Hospital, External |
| GET | `/requests/:id` | Get request details | Admin, Hospital, External |
| POST | `/requests/:id/approve` | Approve request | Admin |
| POST | `/requests/:id/reject` | Reject request | Admin |

#### **Medical Reports**

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/medical-reports/upload` | Upload report | Donor |
| GET | `/medical-reports/my-reports` | Get own reports | Donor |
| GET | `/medical-reports/pending` | Get pending reports | Admin |
| PATCH | `/medical-reports/:id/review` | Review report | Admin |

#### **Notifications**

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/notifications/send` | Send donation request | Admin |
| GET | `/notifications/donor` | Get donor notifications | Donor |
| POST | `/notifications/:id/respond` | Respond to notification | Donor |

### **Response Format**

All API responses follow a standardized format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2025-10-25T16:30:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-10-25T16:30:00.000Z"
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2025-10-25T16:30:00.000Z"
}
```

---

## 🔒 Security

Our system implements multiple layers of security:

### **Authentication & Authorization**

- ✅ **JWT-based authentication** with 7-day token expiration
- ✅ **Bcrypt password hashing** with salt rounds
- ✅ **Role-based access control (RBAC)** for all endpoints
- ✅ **Protected routes** with middleware validation
- ✅ **Session management** with automatic token refresh

### **Security Headers & Protection**

- ✅ **Helmet.js** - Sets secure HTTP headers
- ✅ **CORS** - Configured for allowed origins
- ✅ **Rate Limiting** - Prevents brute force attacks
  - General API: 100 requests / 15 minutes
  - Authentication: 5 attempts / 15 minutes
  - File uploads: 10 uploads / hour
  - Blood requests: 20 requests / hour

### **Input Validation**

- ✅ **Express Validator** - Validates all inputs
- ✅ **Sanitization** - Prevents XSS attacks
- ✅ **Type checking** - TypeScript type safety
- ✅ **Email format validation**
- ✅ **Password strength requirements**:
  - Minimum 6 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number

### **Error Handling**

- ✅ **Global error handler** - Catches all errors
- ✅ **User-friendly messages** - No sensitive data exposure
- ✅ **Development vs Production** - Different error verbosity
- ✅ **Logging** - All errors logged to files

### **Data Protection**

- ✅ **Environment variables** - Secrets stored securely
- ✅ **No hardcoded credentials**
- ✅ **MongoDB injection prevention**
- ✅ **.gitignore** - Excludes sensitive files

---

## ⚡ Performance

### **Optimization Techniques**

- ✅ **Database Indexing** - 25+ indexes for fast queries (10-100x faster)
- ✅ **Lazy Loading** - Code splitting reduces initial bundle by 43%
- ✅ **Loading Skeletons** - Better perceived performance
- ✅ **Responsive Images** - Optimized for mobile devices
- ✅ **React.memo** - Prevents unnecessary re-renders
- ✅ **Framer Motion** - Smooth, hardware-accelerated animations
- ✅ **Pagination** - Limits data transfer for large datasets

### **Performance Metrics**

| Metric | Before Optimization | After Optimization | Improvement |
|--------|-------------------|-------------------|-------------|
| Initial Load Time | 2.5s | 1.2s | **52% faster** |
| Initial Bundle Size | 850KB | 480KB | **43% smaller** |
| API Response Time | 180ms | 70ms | **61% faster** |
| Database Query Time | 300ms | 30ms | **90% faster** |
| Lighthouse Performance | 75 | 92 | **+17 points** |
| Lighthouse Accessibility | 75 | 92 | **+17 points** |
| Lighthouse SEO | 80 | 95 | **+15 points** |

### **Accessibility**

- ✅ **WCAG 2.1 Level AA compliance**
- ✅ **ARIA labels** for screen readers
- ✅ **Keyboard navigation** support
- ✅ **Reduced motion** support for users with vestibular disorders
- ✅ **Semantic HTML** structure
- ✅ **Color contrast** meets accessibility standards

### **Logging & Monitoring**

- ✅ **Winston logger** - Structured logging
- ✅ **Log levels** - error, warn, info, http, debug
- ✅ **File logging** - `error.log` and `combined.log`
- ✅ **Console logging** - Colorized for development
- ✅ **HTTP request logging** - Morgan integration

---

## 🌐 Deployment

### **🎯 Current Production Deployment**

Our application is successfully deployed and running:

**Frontend (Vercel):**
- URL: https://blood-bank-management-system-liard-one.vercel.app
- Build: Automatic on push to `main` branch
- Environment: Node.js 18.x
- Framework: React (Create React App)

**Backend (Render):**
- URL: https://bloodbank-backend-xjda.onrender.com
- Build: Automatic on push to `main` branch
- Environment: Node.js 18.x
- Service Type: Web Service
- Health Check: `/health` endpoint

**Database (MongoDB Atlas):**
- Cluster: BloodBank (Free M0)
- Region: AWS - Mumbai
- Connection: Secured with IP whitelist
- Backup: Daily automated snapshots

### **Environment Variables**

#### **Production Backend `.env`**

```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bloodbank?retryWrites=true&w=majority
JWT_SECRET=<GENERATE-A-STRONG-RANDOM-SECRET-MIN-32-CHARS>
```

#### **Production Frontend `.env`**

```env
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=production
```

### **Build Commands**

#### **Frontend Build**

```bash
cd front_end
npm run build
```

This creates an optimized production build in the `build/` directory.

#### **Backend Build**

```bash
cd back_end
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### **Deployment Guide**

#### **1. Deploy Frontend to Vercel**

**Via Vercel Dashboard:**
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `front_end`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Add environment variables:
   ```
   REACT_APP_API_URL=https://bloodbank-backend-xjda.onrender.com
   REACT_APP_ENV=production
   REACT_APP_VERSION=1.0.0
   ```
6. Click **"Deploy"**

**Via CLI:**
```bash
cd front_end
npm install -g vercel
vercel --prod
```

#### **2. Deploy Backend to Render**

**Via Render Dashboard:**
1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: bloodbank-backend
   - **Root Directory**: `back_end`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variables:
   ```
   MONGO_URI=mongodb+srv://your-connection-string
   JWT_SECRET=your-secure-jwt-secret
   NODE_ENV=production
   PORT=4000
   ```
6. Click **"Create Web Service"**

**Alternative Options:**

- **Heroku**, **Railway**, **DigitalOcean**, **AWS**, **Google Cloud**

#### **Database**

- **MongoDB Atlas** (Recommended)
  1. Create free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
  2. Add database user
  3. Whitelist IP addresses
  4. Get connection string
  5. Update `MONGODB_URI` in `.env`

### **Pre-Deployment Checklist**

- [x] Update `MONGODB_URI` to production database ✅
- [x] Generate strong `JWT_SECRET` (min 32 characters) ✅
- [x] Set `NODE_ENV=production` ✅
- [x] Update `REACT_APP_API_URL` to production API ✅
- [x] Enable CORS for production domain ✅
- [x] Set up MongoDB Atlas with proper user permissions ✅
- [x] Configure root route handler for backend ✅
- [x] Configure axios for production URLs ✅
- [x] Enable HTTPS/SSL certificates (automatic via Vercel/Render) ✅
- [x] Test all API endpoints in production ✅
- [x] Test frontend-backend connectivity ✅
- [ ] Set up automated backups for MongoDB (optional)
- [ ] Monitor logs for errors (ongoing)
- [ ] Set up error tracking (optional: Sentry)

### **Post-Deployment**

1. **Test the application** thoroughly
2. **Monitor logs** for any errors
3. **Set up monitoring** (optional: New Relic, DataDog)
4. **Configure alerts** for system health
5. **Document production URL** for team

---

## 👥 Team

**Arts Blood Foundation Development Team**  
**Institution**: Indian Institute of Information Technology, Design and Manufacturing (IIITDM) Kurnool

| Name | Email | Role |
|------|-------|------|
| **Aryan Rajesh Gadam** | 123cs0020@iiitk.ac.in | Full Stack Developer |
| **Tagore Jagata** | 123cs0042@iiitk.ac.in | Full Stack Developer |
| **Rovan Mullangi** | 123cs0036@iiitk.ac.in | Full Stack Developer |
| **Venkata Sai Nadigatla** | 123CS0041@iiitk.ac.in | Full Stack Developer |

### **Contact & Support**

For questions, bug reports, or feature requests:
- 📧 Email the development team
- 🐛 Open an issue on GitHub
- 📖 Check documentation files: `IMPROVEMENTS_LOG.txt`, `IMPROVEMENTS_PHASE_2.txt`

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Arts Blood Foundation Team - IIITDM Kurnool

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🎯 Project Status

**Current Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: October 25, 2025

### **Completed Features**

- ✅ User authentication and authorization
- ✅ Role-based access control (Admin, Hospital, Donor, External)
- ✅ Blood inventory management
- ✅ Donor registration and management
- ✅ Blood request processing
- ✅ Medical report upload and review
- ✅ Smart notifications and alerts
- ✅ Appointment scheduling
- ✅ Real-time dashboards
- ✅ Donation history tracking
- ✅ Threshold-based inventory alerts
- ✅ Admin approval workflows
- ✅ Security hardening (rate limiting, validation)
- ✅ Performance optimization (lazy loading, indexing)
- ✅ Accessibility improvements (ARIA, reduced motion)
- ✅ SEO optimization
- ✅ Comprehensive logging
- ✅ Professional error handling

### **Future Enhancements** (Optional)

- 📧 Email notifications (SMTP integration)
- 📱 Progressive Web App (PWA) support
- 🧪 Comprehensive testing suite (Jest, React Testing Library)
- 📊 Advanced analytics and reporting
- 🌙 Dark mode theme
- 🔍 Advanced search and filtering
- 📤 CSV export functionality
- 🐛 Error monitoring (Sentry integration)
- 🔄 Real-time updates (WebSockets)

---

## 🙏 Acknowledgments

- **IIITDM Kurnool** - For providing the platform and support
- **Open Source Community** - For the amazing libraries and tools
- **Material-UI Team** - For the beautiful component library
- **MongoDB Team** - For the robust database solution

---

## 📚 Additional Documentation

- **Phase 1 Improvements**: See `IMPROVEMENTS_LOG.txt`
- **Phase 2 Improvements**: See `IMPROVEMENTS_PHASE_2.txt`
- **API Reference**: See [API Documentation](#-api-documentation) section above

---

<div align="center">

**Built with ❤️ by the Arts Blood Foundation Team**

*Saving lives, one donation at a time* 🩸

</div>
