# MessMate Setup Guide

Complete setup instructions for development and deployment.

## Prerequisites

- **Node.js 18+** and npm
- **MongoDB 5.0+** (local installation or MongoDB Atlas account)
- **Google OAuth Credentials** (from Google Cloud Console)
- **Git** for version control
- **Docker & Docker Compose** (optional, for containerized deployment)

## Quick Start (Development)

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/yourusername/Mess-feedback-sys.git
cd Mess-feedback-sys

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure Environment Variables

**Backend (.env file):**

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```
MONGO_URI=mongodb://localhost:27017/mess-feedback
PORT=5001
NODE_ENV=development
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_super_secret_key_here
COLLEGE_DOMAIN=sst.scaler.com
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Frontend (.env file):**

```bash
cd ../client
cp .env.example .env
```

Edit `client/.env`:
```
VITE_API_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
# macOS (if installed via Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Or manually run
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGO_URI` in `.env`

### 4. Start Development Servers

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

Expected output:
```
✅ MongoDB Connected!
Server is running on http://localhost:5001
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Expected output:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### 5. Test the Application

1. Open http://localhost:5173 in your browser
2. Log in with your Google account
3. Submit feedback for a meal

---

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click "Create Project"
3. Name it "MessMate"
4. Wait for project creation

### 2. Enable Google+ API

1. In Google Cloud Console, search "Google+ API"
2. Click "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "Credentials" in the left sidebar
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Add Authorized JavaScript Origins:
   - `http://localhost:5173` (development)
   - `http://localhost:3000` (alternative dev)
   - `https://yourdomain.com` (production)
5. Add Authorized Redirect URIs:
   - `http://localhost:5173` 
   - `https://yourdomain.com`
6. Copy the Client ID and Client Secret
7. Paste into `.env` files

---

## Docker Setup (Recommended for Production)

### 1. Build and Run with Docker Compose

```bash
# Create .env file for docker-compose
cp server/.env.example .env.docker

# Edit .env.docker with your settings

# Build and start all services
docker-compose up --build
```

### 2. Access Services

- Frontend: http://localhost:80
- Backend API: http://localhost:5001
- MongoDB: localhost:27017

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### 4. Stop Services

```bash
docker-compose down

# Remove volumes too (clears database)
docker-compose down -v
```

---

## Database Seeding (Optional)

Populate test data:

```bash
cd server
node seed.js
```

This creates:
- Sample users (student, vendor, admin)
- Sample feedback
- Sample menus

---

## Verification Checklist

- [ ] MongoDB is running and connected
- [ ] Backend starts without errors (`npm run dev`)
- [ ] Frontend starts without errors (`npm run dev`)
- [ ] Can access http://localhost:5173
- [ ] Google OAuth login works
- [ ] Can submit feedback
- [ ] Admin dashboard loads
- [ ] API responds to `http://localhost:5001/health`

---

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB if not running
brew services start mongodb-community
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5001
```
**Solution:** Kill process on that port
```bash
# macOS/Linux
lsof -ti:5001 | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5001).OwningProcess | Stop-Process
```

### Google OAuth Not Working
**Solution:** Verify in Google Cloud Console
- Check Client ID matches in `.env`
- Verify localhost:5173 in Authorized Origins
- Check browser console for specific error

### Frontend Can't Connect to Backend
**Solution:** Check CORS configuration
```bash
# Test backend is running
curl http://localhost:5001/health

# Check CORS_ORIGINS in server/.env
echo $CORS_ORIGINS

# Verify VITE_API_URL in client/.env
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## Production Deployment

### Environment-Specific Setup

Create separate `.env` files:
- `.env.development` - Local development
- `.env.staging` - Staging environment
- `.env.production` - Production

### Backend Deployment (Heroku, Railway, Render)

1. Ensure `start` script in `server/package.json` is configured:
```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

2. Set production environment variables on platform
3. Connect MongoDB (Atlas recommended)
4. Deploy: `git push` or use platform's deployment

### Frontend Deployment (Vercel, Netlify)

1. Build production bundle:
```bash
cd client
npm run build
```

2. Connect to deployment platform
3. Set `VITE_API_URL` to production backend URL
4. Deploy: push to GitHub or use platform's interface

### Docker Production Deployment

```bash
# Build images
docker build -t messmate-backend ./server
docker build -t messmate-frontend ./client

# Push to registry (Docker Hub, ECR, etc.)
docker tag messmate-backend yourregistry/messmate-backend:latest
docker push yourregistry/messmate-backend:latest

docker tag messmate-frontend yourregistry/messmate-frontend:latest
docker push yourregistry/messmate-frontend:latest

# Deploy on server with docker-compose.yml
docker-compose -f docker-compose.yml up -d
```

---

## Maintenance

### Backup Database

```bash
# Local MongoDB
mongodump --db mess-feedback --out ./backup

# MongoDB Atlas
# Use Atlas backup feature in web console
```

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Update to latest versions (use with caution)
npm upgrade
```

### Monitor Health

```bash
# Check backend health
curl http://localhost:5001/health

# Check database connection
mongodb connection string test

# Monitor logs
npm run dev # Shows logs in real-time
```

---

## Support & Documentation

- **API Documentation**: See README.md
- **Database Schema**: See SCHEMA.md
- **Architecture**: See ARCHITECTURE.md
- **Issues**: GitHub Issues tab
- **Discussions**: GitHub Discussions

---

**Last Updated:** 2024
**Maintained by:** Darshana
