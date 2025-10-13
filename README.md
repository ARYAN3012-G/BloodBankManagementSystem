# 🩸 Blood Bank Management System

A comprehensive full-stack blood bank management system built with the MERN stack (MongoDB, Express.js, React, Node.js) and TypeScript.

## ✨ Features

### 👥 Multi-Role System
- **Admin**: Complete system management and oversight
- **Donor**: Register, manage profile, track donation history
- **Hospital**: Request blood units, upload documents, track requests
- **External User**: Emergency blood requests with documentation

### 🔐 Core Functionality
- JWT-based authentication with role-based access control
- Real-time blood inventory management
- Blood request approval workflow
- Donation history tracking
- Medical document upload support
- Responsive design for all devices

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - RESTful API
- **MongoDB** + **Mongoose** - Database & ODM
- **TypeScript** - Type safety
- **JWT** - Authentication
- **Multer** - File uploads
- **Bcrypt** - Password hashing

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library
- **React Router DOM** - Navigation
- **Axios** - HTTP client
- **React Hook Form** - Form handling

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd BloodBankManagementSystem
   ```

2. **Backend Setup**
   ```bash
   cd back_end
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

3. **Frontend Setup**
   ```bash
   cd ../front_end
   npm install
   ```

4. **Start Development Servers**
   
   **Windows:**
   ```bash
   # From project root
   start-dev.bat
   ```
   
   **Mac/Linux:**
   ```bash
   chmod +x start-dev.sh
   ./start-dev.sh
   ```
   
   **Manual Start:**
   ```bash
   # Terminal 1 - Backend
   cd back_end
   npm run dev
   
   # Terminal 2 - Frontend
   cd front_end
   npm start
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

## 📁 Project Structure

```
BloodBankManagementSystem/
├── back_end/                 # Node.js Backend
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   └── scripts/         # Utility scripts
│   ├── uploads/             # File uploads
│   ├── .env.example         # Environment template
│   └── package.json
│
├── front_end/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── App.tsx
│   └── package.json
│
├── .gitignore
└── README.md
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Donors
- `GET /api/donors` - List all donors (Admin)
- `GET /api/donor/me` - Get donor profile
- `POST /api/donor/register` - Register as donor

### Inventory
- `GET /api/inventory` - Get blood stock
- `POST /api/inventory` - Add blood units (Admin)

### Requests
- `GET /api/requests` - List requests
- `POST /api/requests` - Create request
- `POST /api/requests/:id/approve` - Approve (Admin)
- `POST /api/requests/:id/reject` - Reject (Admin)

### Uploads
- `POST /api/upload` - Upload medical document
- `GET /api/files` - List uploaded files (Admin)

## 🎨 Features Highlights

### Responsive Design
- 📱 Mobile-first approach
- 📊 Adaptive layouts for all screen sizes
- 🍔 Hamburger menu for mobile devices

### Security
- 🔒 JWT authentication
- 🛡️ Password hashing with bcrypt
- ✅ Role-based access control
- 🔐 Protected API routes

### User Experience
- ⚡ Real-time validation
- 🎯 Intuitive dashboards
- 📝 Form validation
- 🔄 Loading states

## 🧪 Development

### Backend Development
```bash
cd back_end
npm run dev          # Start with nodemon
npm run build        # Build TypeScript
npm run start        # Start production
```

### Frontend Development
```bash
cd front_end
npm start            # Development server
npm run build        # Production build
npm test             # Run tests
```

## 📝 Environment Variables

Create `.env` in `back_end/`:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/blood-bank
JWT_SECRET=your-super-secret-key
NODE_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Aryan Rajesh Gadam**
- Email: aryanrajeshgadam.3012@gmail.com

## 🙏 Acknowledgments

- Arts Blood Foundation
- Material-UI team
- MongoDB team
- All contributors

---

**Made with ❤️ for saving lives through technology**
