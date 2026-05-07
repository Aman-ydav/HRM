# Installation & Quick Start Guide

## System Requirements

- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher
- **MongoDB**: 4.4 or higher (Atlas or local)
- **RAM**: 512MB minimum
- **Disk Space**: 1GB minimum

---

## Step-by-Step Installation

### Step 1: Navigate to Backend Directory

```bash
cd d:\MyWork\HRM\backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- express (web framework)
- mongoose (MongoDB ODM)
- jsonwebtoken (authentication)
- bcryptjs (password hashing)
- dotenv (environment variables)
- cors (cross-origin requests)
- nodemailer (email sending)
- and more...

### Step 3: Configure Environment Variables

Copy the example file:
```bash
copy .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hrm_reward_system?retryWrites=true&w=majority

# JWT
JWT_SECRET=change_this_to_a_random_secret_string_in_production
JWT_EXPIRE=7d

# Email (Gmail SMTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=noreply@hrm-reward-system.com

# AI (Gemini API)
GEMINI_API_KEY=your_gemini_api_key

# CORS
CORS_ORIGIN=http://localhost:3000

# API
API_BASE_URL=http://localhost:5000
API_VERSION=v1
```

### Step 4: Start Development Server

```bash
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════╗
║   HRM REWARD SYSTEM - Backend Server      ║
╠═══════════════════════════════════════════╣
║ Server running at: http://localhost:5000  ║
║ Environment: DEVELOPMENT                  ║
║ API Version: v1                           ║
╚═══════════════════════════════════════════╝
```

### Step 5: Test Server

In a new terminal:
```bash
curl http://localhost:5000/api/v1/health
```

Should return:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Step 6: Seed Sample Data

```bash
npm run seed
```

This creates:
- ✓ Admin user: `admin@hrm.com` / `admin123`
- ✓ HR Manager: `hr@hrm.com` / `hr123`
- ✓ 4 Sample employees with credentials
- ✓ Sample attendance records
- ✓ Sample performance reviews
- ✓ Sample rewards and feedback

---

## MongoDB Setup Guide

### Option 1: MongoDB Atlas (Recommended for cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Click "Create a Project"
4. Click "Build a Database"
5. Choose Free tier (M0)
6. Select your region
7. Create database
8. Click "Connect"
9. Choose "Connect your application"
10. Copy connection string
11. Replace `<password>` with your database password
12. Add to `.env` as `MONGODB_URI`
13. **IMPORTANT**: In Network Access, add your IP or 0.0.0.0 (allow all)

Example MongoDB URI:
```
mongodb+srv://username:password@cluster0.mongodb.net/hrm_reward_system?retryWrites=true&w=majority
```

### Option 2: Local MongoDB

1. Download from https://www.mongodb.com/try/download/community
2. Install on your system
3. Start MongoDB:

**Windows:**
```bash
mongod
```

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

4. Connection string:
```
mongodb://localhost:27017/hrm_reward_system
```

---

## Email Configuration

### Gmail App Password

1. Go to https://myaccount.google.com
2. Click "Security" in left menu
3. Enable "2-Step Verification" if not already
4. Click "App passwords"
5. Select "Mail" and "Windows Computer"
6. Google generates app password
7. Copy and use as `EMAIL_PASSWORD` in `.env`

**Note:** Use the 16-character password without spaces

### Alternative: SendGrid

1. Sign up at https://sendgrid.com
2. Get API key
3. Update `config/email.js`
4. Add key to `.env`

---

## Gemini API Setup

1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Add to `.env`:
```env
GEMINI_API_KEY=your_api_key_here
```

**Without Gemini API:** Backend will use mock AI responses

---

## NPM Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Seed sample data
npm run seed

# Run tests (when configured)
npm test
```

---

## Testing APIs

### Using cURL (Command Line)

#### Register
```bash
curl -X POST http://localhost:5000/api/v1/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"newuser@example.com\",\"password\":\"password123\",\"role\":\"employee\",\"firstName\":\"John\",\"lastName\":\"Doe\"}"
```

#### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"newuser@example.com\",\"password\":\"password123\"}"
```

#### Get Profile (replace TOKEN)
```bash
curl -X GET http://localhost:5000/api/v1/employees/profile ^
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

1. Download Postman: https://www.postman.com/downloads/
2. Create new workspace
3. Create requests:
   - **Register**: POST `http://localhost:5000/api/v1/auth/register`
   - **Login**: POST `http://localhost:5000/api/v1/auth/login`
   - **Get Profile**: GET `http://localhost:5000/api/v1/employees/profile`
4. Add Authorization header with JWT token

### Using Insomnia

1. Download Insomnia: https://insomnia.rest/
2. Create workspace
3. Import API collection
4. Test endpoints

---

## Project Files Overview

| File | Purpose |
|------|---------|
| `app.js` | Express app configuration |
| `server.js` | Server entry point |
| `package.json` | Dependencies and scripts |
| `.env.example` | Environment variable template |
| `config/database.js` | MongoDB connection |
| `models/*.js` | Database schemas |
| `controllers/*.js` | Business logic |
| `routes/*.js` | API endpoints |
| `middleware/*.js` | Custom middleware |
| `utils/*.js` | Helper functions |
| `ai/geminiService.js` | AI integration |
| `docs/` | Documentation |

---

## Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Failed

1. Check MongoDB is running
2. Verify `MONGODB_URI` is correct
3. Check MongoDB password has no special characters (if it does, URL-encode them)
4. For Atlas: Ensure your IP is in network access

### Email Not Sending

1. Use 16-character app password (not Gmail password)
2. Enable "Less secure apps" for Gmail
3. Check email address spelling
4. Check email service credentials in `.env`

### JWT Token Errors

1. Copy entire token (without "Bearer ")
2. Check token hasn't expired
3. Verify `JWT_SECRET` in `.env` is consistent

---

## Useful Commands

```bash
# Check Node version
node --version

# Check npm version
npm --version

# List installed packages
npm list

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update all packages
npm update

# Install specific version
npm install package@version

# Uninstall package
npm uninstall package-name

# Clear npm cache
npm cache clean --force
```

---

## Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a random, long string
- [ ] Set `NODE_ENV=production`
- [ ] Use strong MongoDB password
- [ ] Configure secure email service
- [ ] Set `CORS_ORIGIN` to your frontend domain
- [ ] Enable HTTPS
- [ ] Use environment variables for all secrets
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Test all endpoints thoroughly
- [ ] Enable rate limiting
- [ ] Configure security headers (already done with Helmet)

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment
3. ✅ Start server
4. ✅ Test APIs
5. ⬜ Create frontend (React/Vue/Angular)
6. ⬜ Deploy to cloud
7. ⬜ Setup CI/CD pipeline

---

## Resources

- **Express.js Docs**: https://expressjs.com/
- **MongoDB Docs**: https://docs.mongodb.com/
- **Mongoose Docs**: https://mongoosejs.com/
- **JWT Guide**: https://jwt.io/
- **Node.js Docs**: https://nodejs.org/docs/

---

## Support

For issues:
1. Check `README.md`
2. Check error logs in terminal
3. Review `docs/API_DOCUMENTATION.md`
4. Check MongoDB connection
5. Verify environment variables

---

**Server is now ready! 🎉**

Start building amazing features! 🚀
