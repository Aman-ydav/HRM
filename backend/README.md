# HRM Employee Reward System - Backend API

A production-ready backend for an AI-powered Employee Reward System using MERN Stack (Node.js, Express, MongoDB, Mongoose).

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Employee Management**: Complete employee profile and information management
- **Attendance Tracking**: Daily check-in/check-out with analytics
- **Performance Management**: Performance reviews and ratings
- **Reward System**: Points, bonuses, badges, and employee of the month
- **Feedback System**: Employee and manager feedback with analytics
- **AI Integration**: AI-powered recommendations and analysis
- **Admin Dashboard**: Comprehensive analytics and insights
- **Notifications**: Email notifications for rewards and alerts

## 📋 Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB Atlas account or local MongoDB
- Gemini API key (for AI features)
- Email service credentials (Gmail/SendGrid)

## 🔧 Installation & Setup

### 1. Clone and Setup

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hrm_reward_system?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# AI
GEMINI_API_KEY=your_gemini_api_key

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:5000`

### 4. Start Production Server

```bash
npm start
```

## 📁 Project Structure

```
backend/
├── config/              # Configuration files
├── controllers/         # Business logic
├── middleware/          # Custom middleware
├── models/              # MongoDB schemas
├── routes/              # API routes
├── services/            # Business services
├── utils/               # Utility functions
├── validations/         # Input validation
├── ai/                  # AI integration
├── uploads/             # File uploads directory
├── database/            # Database utilities
├── constants/           # Constants
├── helpers/             # Helper functions
├── docs/                # Documentation
├── tests/               # Tests
├── app.js               # Express app
├── server.js            # Server entry point
├── package.json         # Dependencies
└── .env.example         # Environment example
```

## 🔐 Authentication

### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "employee",
  "firstName": "John",
  "lastName": "Doe",
  "department": "IT",
  "position": "Developer"
}
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "employee"
    },
    "token": "jwt_token"
  }
}
```

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout (protected)
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password/:token` - Reset password
- `GET /api/v1/auth/me` - Get current user (protected)
- `POST /api/v1/auth/change-password` - Change password (protected)

### Employees
- `GET /api/v1/employees/profile` - Get user profile
- `PUT /api/v1/employees/profile` - Update profile
- `GET /api/v1/employees/dashboard` - Get employee dashboard
- `GET /api/v1/employees/rewards` - Get employee rewards
- `GET /api/v1/employees/attendance-summary` - Get attendance summary
- `GET /api/v1/employees/performance-summary` - Get performance summary
- `GET /api/v1/employees/all` - Get all employees (Admin only)

### Attendance
- `POST /api/v1/attendance/mark` - Mark attendance
- `POST /api/v1/attendance/check-in` - Check in
- `POST /api/v1/attendance/check-out` - Check out
- `GET /api/v1/attendance/history/:employeeId` - Get attendance history
- `GET /api/v1/attendance/report/:employeeId/:month/:year` - Get monthly report
- `GET /api/v1/attendance/analytics/:employeeId` - Get analytics

### Performance
- `POST /api/v1/performance/add` - Add performance review
- `PUT /api/v1/performance/:id` - Update review
- `GET /api/v1/performance/history/:employeeId` - Get history
- `GET /api/v1/performance/analytics/:employeeId` - Get analytics
- `GET /api/v1/performance/top-performers` - Get top performers
- `GET /api/v1/performance/department/:department` - Get department performance

### Rewards
- `POST /api/v1/rewards/assign` - Assign reward
- `PUT /api/v1/rewards/approve/:id` - Approve reward
- `GET /api/v1/rewards/employee/:employeeId` - Get employee rewards
- `GET /api/v1/rewards/leaderboard` - Get leaderboard
- `GET /api/v1/rewards/bonus-history/:employeeId` - Get bonus history
- `GET /api/v1/rewards/by-type` - Get rewards by type

### Feedback
- `POST /api/v1/feedback/submit` - Submit feedback
- `GET /api/v1/feedback/received/:employeeId` - Get received feedback
- `GET /api/v1/feedback/given/:employeeId` - Get given feedback
- `DELETE /api/v1/feedback/:id` - Delete feedback
- `PUT /api/v1/feedback/:id` - Update feedback status
- `GET /api/v1/feedback/analytics/:employeeId` - Get analytics

### Dashboard
- `GET /api/v1/dashboard/admin` - Admin dashboard
- `GET /api/v1/dashboard/trends` - Monthly trends
- `GET /api/v1/dashboard/departments` - Department analytics
- `GET /api/v1/dashboard/attendance` - Attendance analytics
- `GET /api/v1/dashboard/rewards` - Reward analytics

### AI Analysis
- `GET /api/v1/ai/recommendations/:employeeId` - Get AI recommendations
- `GET /api/v1/ai/burnout-analysis` - Get burnout analysis
- `GET /api/v1/ai/fairness-analysis` - Get reward fairness analysis

## 🔑 Authentication Headers

Include JWT token in requests:

```http
Authorization: Bearer <jwt_token>
```

Or use cookie (automatically set during login).

## 👥 User Roles

1. **Admin**: Full system access
2. **HR Manager**: Can manage employees, rewards, and performance
3. **Employee**: Can view own profile, rewards, and attendance

## 🗄️ Database Models

### User
- Email (unique)
- Password (hashed)
- Role
- Email verification
- Password reset tokens

### Employee
- User reference
- Employee ID
- Name, email, phone
- Department, position
- Joining date, profile image
- Address
- Status
- Reward points, badges, bonus
- Attendance percentage
- Performance score

### Attendance
- Employee reference
- Date, check-in time, check-out time
- Total hours, status
- Late tracking

### Performance
- Employee reference
- Review period
- Task completion, productivity score
- Team collaboration score
- Rating, feedback
- Improvement areas, strengths, goals

### Reward
- Employee reference
- Reward type (points/bonus/badge)
- Reason, criteria
- Approval status
- Month

### Feedback
- Sender, receiver references
- Feedback type
- Rating, comment
- Category, anonymous flag
- Action items, follow-up date

### Notification
- Recipient reference
- Notification type
- Title, message
- Read status, priority

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-factor authentication
2. Generate app-specific password
3. Use app password in `.env`

### SendGrid Setup
1. Get API key from SendGrid
2. Update email config in `/config/email.js`

## 🤖 AI Integration

### Gemini API Setup
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env`: `GEMINI_API_KEY=your_key`

### AI Features
- Employee performance recommendations
- Burnout risk detection
- Reward fairness analysis
- Smart insights and alerts

## 🧪 Testing APIs

### Using cURL
```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","role":"employee"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Get Profile (with token)
curl -X GET http://localhost:5000/api/v1/employees/profile \
  -H "Authorization: Bearer your_jwt_token"
```

### Using Postman
1. Import the provided Postman collection
2. Set `base_url` variable to `http://localhost:5000`
3. Set `token` variable after login
4. Test all endpoints

## 🚀 Deployment

### Deploy to Heroku
```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main
```

### Deploy to AWS/DigitalOcean
1. Set up server with Node.js
2. Clone repository
3. Install dependencies
4. Set environment variables
5. Use PM2 or systemd for process management
6. Set up reverse proxy with Nginx

## 📝 Sample Data

Run seed script:
```bash
npm run seed
```

This will create:
- Admin user
- Sample employees
- Sample attendance records
- Sample performance reviews
- Sample rewards

## 🛡️ Security Features

- JWT authentication
- Password hashing with bcrypt
- CORS protection
- Helmet.js security headers
- Input validation
- SQL/NoSQL injection prevention
- XSS protection
- Rate limiting ready

## 📚 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

## 🔧 Troubleshooting

### MongoDB Connection Error
- Check MongoDB URI in `.env`
- Ensure IP whitelist includes your IP
- Verify network connectivity

### JWT Token Error
- Token might be expired
- Check JWT_SECRET in `.env`
- Re-login to get new token

### Email Not Sending
- Check email credentials in `.env`
- Enable "Less secure app access" (Gmail)
- Check spam folder

## 📞 Support

For issues and questions:
1. Check documentation
2. Review error messages
3. Check logs in console
4. Contact development team

## 📄 License

ISC

## 👨‍💻 Author

Your Name

---

**Happy Coding! 🎉**
