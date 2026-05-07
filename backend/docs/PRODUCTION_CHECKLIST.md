📋 PRODUCTION DEPLOYMENT CHECKLIST
==================================

This checklist ensures the HRM Reward System backend is production-ready before deployment.

## ✅ CRITICAL - MUST COMPLETE BEFORE DEPLOYMENT

### 1. Environment Variables Configuration
- [ ] Copy `.env.example` to `.env` in production
- [ ] Set `NODE_ENV=production`
- [ ] Set `MONGODB_URI` to production database URI
- [ ] Set `JWT_SECRET` to a strong, unique secret (generate: `openssl rand -base64 32`)
- [ ] Set `JWT_EXPIRE` (recommended: "7d")
- [ ] Set `BCRYPT_ROUNDS` to 10 (minimum for security)
- [ ] Set `CORS_ORIGIN` to your frontend domain (e.g., "https://yourfrontend.com")
- [ ] Set `EMAIL_USER` to your Gmail account
- [ ] Set `EMAIL_PASSWORD` to Gmail app password (NOT regular password)
- [ ] Set `GEMINI_API_KEY` (optional, but recommended for AI features)
- [ ] Set `API_BASE_URL` to your production API URL (e.g., "https://api.yourdomain.com")
- [ ] Verify all required variables are set: `npm run check-env` (if available)

### 2. Database Preparation
- [ ] MongoDB production cluster created and secured
- [ ] Database connection verified
- [ ] Network access configured (whitelist production server IP)
- [ ] Database backups configured (daily minimum)
- [ ] Indexes created on all query fields (automatic via Mongoose)
- [ ] Database user created with minimum required permissions
- [ ] Connection string uses MongoDB authentication

### 3. Code & Dependencies
- [ ] All dependencies installed: `npm install --production`
- [ ] No `npm audit` vulnerabilities (critical level)
- [ ] seedData.js verified to NOT run in production
- [ ] Node.js version matches package.json requirements (v16+)
- [ ] npm version matches requirements (v8+)

### 4. Security Checks
- [ ] All passwords hashed with bcrypt (10 salt rounds minimum)
- [ ] JWT tokens use strong secret
- [ ] CORS configured to specific domain only (NOT *)
- [ ] Helmet security headers enabled
- [ ] HTTPS/SSL enabled on production server
- [ ] Database credentials NOT in git history
- [ ] `.env` file in `.gitignore`
- [ ] API rate limiting configured for auth endpoints
- [ ] No console.log statements in controller code (except errors)
- [ ] Input validation on all endpoints
- [ ] Authorization checks on all protected endpoints

### 5. Email Configuration
- [ ] Gmail account created (or use production email service)
- [ ] Gmail "Less Secure App Access" disabled (use app password)
- [ ] App password generated and stored in `.env`
- [ ] Test email sending from production: `node -e "require('./utils/emailUtils.js').sendEmail('test@example.com', 'Test', '<h1>Test</h1>')"`
- [ ] Email templates reviewed for branding
- [ ] Notification emails not blocking main requests (non-blocking implementation)

### 6. File Uploads & Storage
- [ ] `/uploads` directory created and writable
- [ ] File upload size limit set (5MB default)
- [ ] Allowed file types configured (jpeg, jpg, png, gif, pdf)
- [ ] File upload destination verified
- [ ] Disk space monitored on server

### 7. Logging & Monitoring
- [ ] Error logging configured (to file or external service)
- [ ] Server logs collected and rotated
- [ ] Performance monitoring enabled
- [ ] Database performance monitored
- [ ] Alerts configured for critical errors
- [ ] No sensitive data logged (passwords, tokens)

### 8. Testing Before Deployment
- [ ] Manual API testing completed:
  - [ ] User registration works
  - [ ] Login returns valid JWT token
  - [ ] Token expires correctly
  - [ ] Password reset flow works
  - [ ] Attendance check-in/check-out functions
  - [ ] Rewards assignment and approval workflow
  - [ ] Dashboard aggregations return correct data
  - [ ] Pagination works on all list endpoints
- [ ] Authorization checks verified (employees can't access other's data)
- [ ] Database backup tested and verified restorable

### 9. API Documentation
- [ ] API endpoints documented (see docs/ folder)
- [ ] Default credentials removed from documentation
- [ ] Authentication method documented
- [ ] Error codes and messages documented
- [ ] Rate limiting documented

### 10. Deployment Process
- [ ] Production server prepared (Node.js, npm installed)
- [ ] Process manager configured (PM2, forever, or systemd)
- [ ] Automatic restart on server reboot enabled
- [ ] Deployment script created and tested
- [ ] Rollback plan documented
- [ ] Staging environment matches production exactly

### 11. Post-Deployment Verification
- [ ] Server started successfully
- [ ] Health check endpoint returns 200
- [ ] Environment validation passed (check logs)
- [ ] Test user registration works
- [ ] Test login works
- [ ] Emails send successfully
- [ ] Database queries perform acceptably
- [ ] Error logs monitored for issues
- [ ] User can access all core features

## ⚠️ KNOWN LIMITATIONS & RECOMMENDATIONS

### Email Configuration
- **Current**: Uses nodemailer with Gmail SMTP
- **For Production**: Consider using SendGrid, Mailgun, or AWS SES for better deliverability
- **Action**: If moving to different provider, update `config/email.js`

### AI Features (Gemini API)
- **Current**: Optional, falls back to mock responses if not configured
- **For Production**: Set `GEMINI_API_KEY` for full AI capabilities
- **Note**: AI responses are non-blocking and don't affect core operations

### Token Management
- **Current**: 7-day expiration, no refresh tokens
- **Recommended**: Implement refresh token endpoint for better UX
- **Fallback**: Users can re-login after token expires

### Rate Limiting
- **Current**: Not implemented
- **Recommended**: Add express-rate-limit package
- **Action**: 
  ```bash
  npm install express-rate-limit
  # Then configure in app.js before routes
  ```

### Monitoring & Analytics
- **Current**: Basic console logging
- **Recommended**: Integrate with error tracking (Sentry, DataDog)
- **Recommended**: Application Performance Monitoring (APM)

## 🔒 SECURITY BEST PRACTICES

1. **Database Security**
   - Use strong password for MongoDB user
   - Enable MongoDB authentication
   - Whitelist only necessary IPs
   - Use VPN or private network when possible

2. **API Security**
   - HTTPS/SSL mandatory in production
   - CORS configured to specific domains only
   - Rate limiting on authentication endpoints
   - Input validation on all endpoints
   - SQL injection / NoSQL injection prevention via Mongoose

3. **Credential Management**
   - Never commit `.env` to git
   - Use environment-specific .env files
   - Rotate secrets regularly
   - Store secrets in secrets manager (AWS Secrets Manager, HashiCorp Vault)

4. **Monitoring**
   - Log all authentication attempts
   - Alert on repeated failed logins
   - Monitor database query performance
   - Track API response times
   - Monitor server resources (CPU, memory, disk)

## 📊 PERFORMANCE OPTIMIZATION

1. **Database**
   - Ensure indexes on: email, role, employeeId, department, status
   - Use pagination (default 10, max 100 items per request)
   - Avoid N+1 queries (use populate for relationships)

2. **Caching**
   - Consider Redis for session caching
   - Cache employee lists for dashboard queries
   - Cache frequently accessed employee profiles

3. **Response Compression**
   - Enable gzip compression in app.js
   - Minify JSON responses where possible

4. **Database Connection**
   - Use connection pooling (Mongoose default)
   - Monitor connection pool usage
   - Set appropriate timeout values

## 🚨 TROUBLESHOOTING

### Server Won't Start
- Check all required environment variables are set
- Check MongoDB connection string is valid
- Check port is not already in use
- Review error logs for specific issues

### Database Connection Fails
- Verify MONGODB_URI is correct
- Check network access (firewall, security groups)
- Verify MongoDB user permissions
- Confirm database server is running

### Email Sending Fails
- Verify EMAIL_USER and EMAIL_PASSWORD are correct
- Check Gmail account allows app passwords
- Verify network allows SMTP (port 587)
- Test SMTP connection manually

### Authentication Issues
- Verify JWT_SECRET is set and consistent
- Check token expiration time
- Verify CORS_ORIGIN matches frontend domain
- Check Authorization header format: "Bearer <token>"

### Performance Issues
- Check database indexes are created
- Monitor MongoDB query performance
- Check server CPU/memory usage
- Review API response times
- Consider pagination limits

## ✅ VERIFICATION COMMANDS

Run these commands before deployment:

```bash
# Check environment variables
npm run check-env

# Run basic tests
npm test

# Verify seed data is disabled
npm run seed  # Should fail in production

# Start server and check logs
npm start

# Check health endpoint
curl http://localhost:5000/health

# Test authentication
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","role":"employee"}'
```

## 📞 SUPPORT & CONTACT

For issues or questions:
1. Check logs: `cat logs/error.log`
2. Review documentation in `docs/` folder
3. Check MongoDB logs for database issues
4. Monitor CPU/memory for performance issues

## ✅ DEPLOYMENT SIGN-OFF

- [ ] All checklist items completed
- [ ] Production database backups verified
- [ ] Team lead reviewed security configuration
- [ ] Deployment authorized by manager
- [ ] Post-deployment testing completed
- [ ] Monitoring and alerts configured

**Date Deployed**: __________
**Deployed By**: __________
**Reviewed By**: __________

---

Last Updated: 2024
