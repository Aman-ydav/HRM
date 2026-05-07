# HRM Reward System - Quick Reference

## 🚀 Quick Start (Copy-Paste)

```bash
# 1. Navigate to backend
cd d:\MyWork\HRM\backend

# 2. Install packages
npm install

# 3. Copy environment template
copy .env.example .env

# 4. Edit .env with your MongoDB URI and credentials
# nano .env  (or open with text editor)

# 5. Start development server
npm run dev

# 6. In new terminal, seed sample data
npm run seed

# 7. Access API
# http://localhost:5000/api/v1/health
```

---

## 📝 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hrm.com | admin123 |
| HR Manager | hr@hrm.com | hr123 |
| Employee 1 | john.doe@hrm.com | john123 |
| Employee 2 | jane.smith@hrm.com | jane123 |
| Employee 3 | mike.wilson@hrm.com | mike123 |
| Employee 4 | emma.davis@hrm.com | emma123 |

---

## 🔑 Environment Variables Template

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/hrm_reward_system
JWT_SECRET=your_secret_key_min_32_characters_long
JWT_EXPIRE=7d
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
GEMINI_API_KEY=your_gemini_key
CORS_ORIGIN=http://localhost:3000
```

---

## 📊 Project Statistics

| Metric | Count |
|--------|-------|
| Total Files | 40+ |
| Models | 7 |
| Controllers | 8 |
| Routes | 8 |
| Middleware | 3 |
| Validation Rules | 2+ |
| API Endpoints | 40+ |
| Dependencies | 14 |

---

## 📁 File Structure at a Glance

```
backend/
├── app.js ......................... Express configuration
├── server.js ...................... Entry point
├── package.json ................... Dependencies
├── .env ........................... Environment (create from .env.example)
├── .gitignore
├── config/
│   ├── database.js ............... MongoDB connection
│   ├── jwt.js .................... JWT config
│   ├── email.js .................. Email config
│   └── multer.js ................. File upload config
├── models/ ........................ Database schemas (7 files)
├── controllers/ ................... Business logic (8 files)
├── routes/ ........................ API endpoints (8 files)
├── middleware/ .................... Custom middleware (3 files)
├── utils/ ......................... Helper functions (5 files)
├── validations/ ................... Input validation (2 files)
├── constants/ ..................... Application constants
├── ai/ ............................ AI integration
├── database/ ...................... Database utilities
├── docs/ .......................... Documentation (3 files)
├── uploads/ ....................... File storage
└── tests/ ......................... Test files (future)
```

---

## 🔗 API Base URL

```
http://localhost:5000/api/v1
```

---

## 🔐 Authentication

All requests need JWT token in header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📚 API Routes Summary

| Feature | Methods | Endpoints |
|---------|---------|-----------|
| **Auth** | 7 | /auth/* |
| **Employees** | 7 | /employees/* |
| **Attendance** | 6 | /attendance/* |
| **Performance** | 6 | /performance/* |
| **Rewards** | 6 | /rewards/* |
| **Feedback** | 6 | /feedback/* |
| **Dashboard** | 5 | /dashboard/* |
| **AI** | 3 | /ai/* |

**Total: 40+ endpoints**

---

## 🧪 Testing Quick Commands

### Register
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"test123\",\"role\":\"employee\"}"
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@hrm.com\",\"password\":\"admin123\"}"
```

### Health Check
```bash
curl http://localhost:5000/api/v1/health
```

---

## 🎯 Key Features Implemented

✅ JWT Authentication  
✅ Role-Based Access Control (Admin, HR, Employee)  
✅ Employee Management  
✅ Attendance Tracking (Check-in/Check-out)  
✅ Performance Reviews  
✅ Reward System (Points, Bonuses, Badges)  
✅ Feedback System  
✅ AI-Powered Analytics  
✅ Admin Dashboard  
✅ Email Notifications  
✅ Pagination & Filtering  
✅ Error Handling  
✅ Input Validation  
✅ Security Headers (Helmet)  
✅ CORS Protection  

---

## 🔧 Useful npm Commands

```bash
npm run dev           # Start development with auto-reload
npm start            # Start production server
npm run seed         # Create sample data
npm audit            # Check for vulnerabilities
npm audit fix        # Fix vulnerabilities
npm list             # List all packages
npm update           # Update all packages
npm install pkg      # Install specific package
npm uninstall pkg    # Remove package
```

---

## 🐛 Troubleshooting Common Issues

| Issue | Solution |
|-------|----------|
| Port 5000 in use | Change PORT in .env or kill process |
| MongoDB not connecting | Check MONGODB_URI and network access |
| Email not sending | Use app password, not Gmail password |
| JWT token errors | Re-login to get new token |
| CORS errors | Update CORS_ORIGIN in .env |
| Module not found | Run `npm install` |

---

## 📋 Validation Rules

### Registration
- Email: Valid email format, unique
- Password: Minimum 6 characters
- Role: admin, employee, or hr_manager

### Login
- Email: Required, valid format
- Password: Required

### Employee Profile
- First Name: 2+ characters
- Last Name: 2+ characters
- Email: Valid, unique
- Department: Required
- Position: Required

---

## 🔒 Security Features

✅ Password hashing with bcryptjs (10 rounds)  
✅ JWT token expiration  
✅ CORS protection  
✅ Helmet.js security headers  
✅ Input validation & sanitization  
✅ Role-based access control  
✅ HTTP-only cookies  
✅ SQL injection prevention  
✅ XSS protection  

---

## 📖 Documentation Files

1. **README.md** - Project overview & features
2. **SETUP_GUIDE.md** - Detailed setup instructions
3. **INSTALLATION.md** - Step-by-step installation
4. **API_DOCUMENTATION.md** - Complete API reference
5. **QUICK_REFERENCE.md** - This file

---

## 🚀 Next Steps After Setup

1. ✅ Backend setup (DONE)
2. ⬜ Create frontend (React/Vue)
3. ⬜ Connect frontend to backend
4. ⬜ Deploy to cloud (Heroku/AWS)
5. ⬜ Setup monitoring & logging
6. ⬜ Performance optimization
7. ⬜ Security audit
8. ⬜ Launch to production

---

## 💡 Tips & Best Practices

- Always use `.env` for secrets
- Never commit `.env` to git
- Keep JWT_SECRET secure and long
- Use HTTPS in production
- Test APIs before deployment
- Monitor server logs regularly
- Backup database frequently
- Update dependencies monthly
- Follow REST conventions
- Use meaningful error messages

---

## 📞 Need Help?

1. Check **docs/** folder for detailed guides
2. Review **README.md** for overview
3. Check **API_DOCUMENTATION.md** for endpoints
4. Look at error logs in terminal
5. Verify MongoDB connection
6. Confirm environment variables

---

## 🎓 Learning Resources

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/docs/)
- [Mongoose](https://mongoosejs.com/)
- [JWT Auth](https://jwt.io/)
- [REST API Best Practices](https://restfulapi.net/)

---

## ✨ Features Checklist

- [x] User authentication
- [x] Employee management
- [x] Attendance tracking
- [x] Performance reviews
- [x] Reward system
- [x] Feedback system
- [x] Dashboard analytics
- [x] AI integration
- [x] Email notifications
- [x] Error handling
- [x] Input validation
- [x] Role-based access
- [x] API documentation
- [x] Sample data seeding
- [x] Security features

---

**Last Updated:** January 2024  
**Backend Version:** 1.0.0  
**Node Minimum:** 16.0.0

Happy coding! 🎉
