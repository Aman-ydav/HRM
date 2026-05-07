# HRM Reward System - Setup Guide

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your MongoDB URI and other credentials:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hrm_reward_system
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
GEMINI_API_KEY=your_gemini_key
```

### 3. Start Development Server
```bash
npm run dev
```

Server runs on: `http://localhost:5000`

### 4. Check Health
```bash
curl http://localhost:5000/api/v1/health
```

### 5. Seed Sample Data
```bash
npm run seed
```

**Default Credentials:**
- Admin: `admin@hrm.com` / `admin123`
- HR: `hr@hrm.com` / `hr123`
- Sample Employees: `firstname.lastname@hrm.com` / `firstname123`

---

## MongoDB Setup

### Option 1: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create account and cluster
3. Create database user
4. Get connection string
5. Add to `.env` as `MONGODB_URI`
6. **Important:** Add your IP to network access

### Option 2: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB:
   ```bash
   mongod
   ```
3. Use connection string:
   ```
   mongodb://localhost:27017/hrm_reward_system
   ```

---

## Email Configuration

### Gmail SMTP Setup

1. Enable 2-Factor Authentication
2. Generate App Password:
   - Go to Google Account Security
   - Select "App passwords"
   - Choose Mail and Windows Computer
   - Copy generated password
3. Add to `.env`:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

### SendGrid Setup

1. Sign up at [SendGrid](https://sendgrid.com)
2. Get API key from settings
3. Update `config/email.js` with SendGrid transport
4. Add to `.env`:
   ```env
   SENDGRID_API_KEY=your_api_key
   ```

---

## AI Configuration

### Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Add to `.env`:
   ```env
   GEMINI_API_KEY=your_api_key
   ```

### How to Use AI Features

- Get AI recommendations: `GET /api/v1/ai/recommendations/:employeeId`
- Burnout analysis: `GET /api/v1/ai/burnout-analysis`
- Reward fairness: `GET /api/v1/ai/fairness-analysis`

---

## Project Structure

```
backend/
│
├── config/              # Configuration files
│   ├── database.js      # MongoDB connection
│   ├── jwt.js           # JWT settings
│   ├── email.js         # Email configuration
│   └── multer.js        # File upload config
│
├── controllers/         # Business logic
│   ├── authController.js
│   ├── employeeController.js
│   ├── attendanceController.js
│   ├── performanceController.js
│   ├── rewardController.js
│   ├── feedbackController.js
│   ├── dashboardController.js
│   └── aiController.js
│
├── middleware/          # Custom middleware
│   ├── auth.js          # JWT authentication
│   ├── errorHandler.js  # Global error handler
│   └── validation.js    # Input validation
│
├── models/              # MongoDB schemas
│   ├── User.js
│   ├── Employee.js
│   ├── Attendance.js
│   ├── Performance.js
│   ├── Reward.js
│   ├── Feedback.js
│   └── Notification.js
│
├── routes/              # API routes
│   ├── authRoutes.js
│   ├── employeeRoutes.js
│   ├── attendanceRoutes.js
│   ├── performanceRoutes.js
│   ├── rewardRoutes.js
│   ├── feedbackRoutes.js
│   ├── dashboardRoutes.js
│   └── aiRoutes.js
│
├── services/            # Business services
├── utils/               # Helper functions
│   ├── tokenUtils.js
│   ├── emailUtils.js
│   ├── responseUtils.js
│   ├── calculationUtils.js
│   └── paginationUtils.js
│
├── validations/         # Input validation rules
│   ├── authValidation.js
│   └── employeeValidation.js
│
├── ai/                  # AI integration folder
│   └── gemini-service.js (to be created)
│
├── database/            # Database utilities
│   └── seedData.js      # Sample data
│
├── constants/           # Application constants
│   └── index.js
│
├── docs/                # Documentation
│   ├── API_DOCUMENTATION.md
│   └── SETUP_GUIDE.md
│
├── uploads/             # Uploaded files directory
├── tests/               # Test files
├── app.js               # Express app configuration
├── server.js            # Server entry point
└── package.json         # Dependencies
```

---

## API Testing

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"test123",
    "role":"employee",
    "firstName":"John",
    "lastName":"Doe"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"test123"
  }'

# Get Profile (replace TOKEN)
curl -X GET http://localhost:5000/api/v1/employees/profile \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Import API collection from `docs/postman-collection.json`
3. Set `base_url` variable
4. Test endpoints

### Using Thunder Client (VS Code)

1. Install Thunder Client extension
2. Create requests in VS Code
3. Test APIs

---

## Common Issues & Solutions

### Issue: MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
- Check MongoDB is running
- Verify `MONGODB_URI` in `.env`
- Check firewall settings
- For Atlas: Add your IP to network access

### Issue: JWT Token Error
```
Error: Invalid or expired token
```

**Solution:**
- Login again to get new token
- Check `JWT_SECRET` matches in `.env`
- Verify token format: `Bearer <token>`

### Issue: Email Not Sending
```
Error: Invalid login: 535 5.7.8 Username and password not accepted
```

**Solution:**
- Use app-specific password, not Gmail password
- Enable "Less secure app access"
- Check email credentials in `.env`
- Verify SMTP settings

### Issue: CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Set correct `CORS_ORIGIN` in `.env`
- Ensure frontend URL is allowed
- Check request headers

### Issue: Database Duplicate Key Error
```
E11000 duplicate key error
```

**Solution:**
- Clean data: `npm run seed`
- Or drop and recreate database

---

## Performance Optimization

### Database Indexing
Already configured in models for:
- Email lookups
- Employee ID searches
- Date ranges
- Status filters

### Caching (Future)
Consider implementing Redis for:
- Session storage
- Dashboard cache
- API responses

### Rate Limiting
Add express-rate-limit:
```bash
npm install express-rate-limit
```

---

## Security Checklist

- [ ] Change `JWT_SECRET` in production
- [ ] Use strong MongoDB password
- [ ] Enable MongoDB IP whitelisting
- [ ] Use HTTPS in production
- [ ] Set secure CORS_ORIGIN
- [ ] Enable HTTPS-only cookies
- [ ] Use environment variables for secrets
- [ ] Keep dependencies updated
- [ ] Enable helmet for HTTP headers
- [ ] Implement rate limiting
- [ ] Add input sanitization
- [ ] Enable CSRF protection

---

## Deployment

### Deploy to Heroku

```bash
# Login
heroku login

# Create app
heroku create your-app-name

# Set config variables
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Deploy to AWS EC2

1. Launch EC2 instance
2. Install Node.js and MongoDB
3. Clone repository
4. Set environment variables
5. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "hrm-backend"
   ```

### Deploy to DigitalOcean

1. Create Droplet
2. Install Node.js
3. Clone repo
4. Set up Nginx as reverse proxy
5. Install SSL certificate with Let's Encrypt
6. Use systemd for service management

---

## Maintenance

### Regular Tasks

- Monitor database size
- Clean up old files
- Review API logs
- Update dependencies
- Backup database
- Check security advisories

### Update Dependencies

```bash
npm outdated          # Check for updates
npm update            # Update all
npm audit             # Check vulnerabilities
npm audit fix         # Fix vulnerabilities
```

### Database Backup

```bash
# Export data
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/hrm_reward_system"

# Restore data
mongorestore --uri "mongodb+srv://user:pass@cluster.mongodb.net/hrm_reward_system"
```

---

## Monitoring

### Error Tracking
Consider using:
- Sentry
- Rollbar
- LogRocket

### Performance Monitoring
- New Relic
- Datadog
- Scout

### Analytics
- Google Analytics
- Mixpanel
- Amplitude

---

## Support & Documentation

- 📖 [README.md](../README.md) - Project overview
- 📚 [API Documentation](./API_DOCUMENTATION.md) - Detailed API docs
- 🐛 [GitHub Issues](https://github.com) - Report bugs
- 💬 [Discussions](https://github.com) - Ask questions

---

## Next Steps

1. ✅ Setup environment
2. ✅ Start development server
3. ✅ Seed sample data
4. ✅ Test APIs with Postman
5. ⬜ Create frontend (React)
6. ⬜ Setup CI/CD pipeline
7. ⬜ Deploy to production
8. ⬜ Monitor and maintain

---

**Happy Building! 🚀**
