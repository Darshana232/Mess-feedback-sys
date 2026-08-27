# MessMate 🍽️

A modern, full-stack feedback system for college mess/food court management. Students rate meals, vendors manage menus, and admins track analytics—all in one beautiful, intuitive platform.

## Features ✨

- **Student Feedback System**: Rate meals across multiple dimensions (quality, taste, hygiene, quantity)
- **Real-time Analytics Dashboard**: Visualize feedback with charts, trends, and insights
- **Vendor Portal**: Manage daily menus and track performance
- **Admin Controls**: User management, analytics, suggestions review
- **Google OAuth Authentication**: Secure, seamless login
- **Responsive Design**: Works beautifully on mobile, tablet, and desktop
- **Real-time Updates**: Live menu and feedback data

## Tech Stack 🚀

### Frontend
- **React 19** with Vite for fast development
- **Tailwind CSS** for styling
- **Framer Motion** for smooth animations
- **Recharts** for beautiful data visualizations
- **Lucide React** for icons
- **Google OAuth** for authentication

### Backend
- **Express.js** with Node.js
- **MongoDB** with Mongoose ODM
- **Multer** for file uploads
- **CORS** for cross-origin requests
- **dotenv** for environment management

## Project Structure

```
Mess-feedback-sys/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── package.json
│   └── vite.config.js
├── server/                    # Express backend
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── index.js            # Server entry
│   ├── package.json
│   └── seed.js             # Database seeding
└── README.md
```

## Getting Started 🎯

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas connection string)
- Google OAuth credentials (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Mess-feedback-sys.git
   cd Mess-feedback-sys
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your credentials
   
   # Start development server
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../client
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your API URL
   
   # Start development server
   npm run dev
   ```

4. **Seed the database (optional)**
   ```bash
   cd ../server
   node seed.js
   ```

## Environment Variables 🔐

### Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/mess-feedback
# or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mess-feedback

PORT=5001
NODE_ENV=development
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret_key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

See `.env.example` files in both directories for more details.

## Development 💻

### Running Both Servers
Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Building for Production
```bash
# Frontend
cd client
npm run build

# Backend
cd server
npm start
```

## API Endpoints 📡

### Authentication
- `POST /api/auth/google` - Google OAuth login

### Feedback
- `POST /api/feedback/submit` - Submit meal feedback
- `GET /api/feedback/status` - Check if user rated meal
- `GET /api/feedback/list` - Get all feedback (filtered)

### Admin
- `GET /api/admin/analytics` - Get feedback analytics
- `GET /api/admin/suggestions` - Get user suggestions
- `GET /api/admin/users` - List all users
- `PUT /api/admin/update-user` - Change user role
- `POST /api/admin/invite-user` - Invite new user

### Vendor
- `GET /api/vendor/performance` - Vendor performance stats
- `GET /api/vendor/feedback` - Vendor-specific feedback

### Menu
- `GET /api/menu` - Get menus by date/vendor
- `POST /api/menu/update` - Update daily menu
- `POST /api/menu/upload-image` - Upload menu image

## Database Models 📊

### User
```javascript
{
  name: String,
  email: String (unique),
  picture: String,
  role: 'student' | 'vendor' | 'admin',
  assignedVendor: String,
  createdAt: Date
}
```

### Feedback
```javascript
{
  userId: ObjectId,
  vendorId: String,
  mealType: 'Breakfast' | 'Lunch' | 'Dinner',
  date: Date,
  ratings: {
    quality: 1-5,
    hygiene: 1-5,
    quantity: 1-5,
    taste: 1-5,
    overall: 1-5
  },
  suggestion: String
}
```

### Menu
```javascript
{
  vendorId: String,
  mealType: 'Breakfast' | 'Lunch' | 'Dinner',
  date: Date,
  items: String,
  imageUrl: String
}
```

## Deployment 🌍

### Using Docker

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Or build individually**
   ```bash
   # Backend
   docker build -t mess-feedback-server ./server
   docker run -p 5001:5001 --env-file server/.env mess-feedback-server

   # Frontend
   docker build -t mess-feedback-client ./client
   docker run -p 3000:80 mess-feedback-client
   ```

### Using Vercel (Frontend)
1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

### Using Render/Railway (Backend)
1. Push to GitHub
2. Create new service on Render/Railway
3. Set environment variables
4. Connect MongoDB
5. Deploy

### Manual VPS Deployment
1. SSH into your server
2. Clone repository
3. Install Node.js and MongoDB
4. Set up environment variables
5. Run `npm install` in both directories
6. Use PM2 or systemd for process management
7. Set up Nginx as reverse proxy

## User Roles & Permissions 👥

| Feature | Student | Vendor | Admin |
|---------|---------|--------|-------|
| Submit Feedback | ✅ | ❌ | ❌ |
| View Own Analytics | ✅ | ❌ | ❌ |
| Manage Menu | ❌ | ✅ | ✅ |
| View Analytics | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| Invite Users | ❌ | ❌ | ✅ |

## Security Features 🔒

- Google OAuth 2.0 authentication
- CORS protection
- MongoDB injection prevention
- Unique constraints on feedback (one rating per meal per day)
- Role-based access control
- Environment variable security
- File upload validation

## Performance Optimization ⚡

- Component lazy loading
- Image optimization
- Chart virtualization
- Database indexing
- Query optimization
- Caching strategies

## Testing 🧪

```bash
# Frontend tests
cd client
npm run test

# Backend tests
cd server
npm run test
```

## Troubleshooting 🔧

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGO_URI in .env
- Verify network access (if using Atlas)

### API Connection Error
- Verify backend is running on correct port
- Check VITE_API_URL in frontend .env
- Ensure CORS is properly configured

### Google OAuth Not Working
- Verify Google Client ID in .env
- Check authorized origins in Google Console
- Ensure credentials are for web application

### Port Already in Use
```bash
# Kill process on port 5001 (backend)
lsof -ti:5001 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see LICENSE file for details.

## Support 💬

For issues, questions, or suggestions, please:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include screenshots/logs if applicable
4. Tag with appropriate labels (bug, feature, etc.)

## Roadmap 🗺️

- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] SMS alerts for vendors
- [ ] Advanced analytics (predictive ratings)
- [ ] Image upload for feedback
- [ ] Meal recommendation system
- [ ] Social features (share feedback)
- [ ] Multi-language support
- [ ] Offline mode
- [ ] API rate limiting

## Authors 👨‍💻

- Darshana - Full Stack Developer

## Acknowledgments 🙏

- Inspired by food delivery apps (Zomato, Swiggy)
- Built with modern web technologies
- Community feedback and contributions

---

**Made with ❤️ for better college dining experiences**
