# University Course Management System - Backend API

A comprehensive RESTful API built with Node.js, Express.js, and MongoDB for managing university courses, students, registrations, and academic results with role-based authentication.

## 🚀 Features

### Authentication & Security
- **JWT-based Authentication**: Secure token-based authentication for admins and students
- **Role-based Access Control**: Separate permissions for administrators and students
- **Password Security**: Bcrypt hashing with salt rounds for secure password storage
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Protection against brute-force attacks
- **CORS Support**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js for security best practices

### Admin Capabilities
- **Course Management**: Full CRUD operations for university courses
- **Student Management**: Create, update, and manage student profiles
- **Registration Management**: Handle student course enrollments
- **Results Management**: Assign and manage student grades
- **Bulk Operations**: Efficient bulk creation and grade assignment

### Student Capabilities
- **Profile Management**: Update personal information and passwords
- **Course Viewing**: Access registered courses and enrollment status
- **Results Viewing**: View assigned grades and calculate GPA
- **Academic Progress**: Track completion status and academic performance

## 🛠 Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: Express Validator
- **Security**: Bcrypt, Helmet, CORS, Rate Limiting
- **Development**: Nodemon for hot reloading

## 📁 Project Structure

```
backend/
├── controllers/           # Business logic handlers
│   ├── authController.js     # Authentication operations
│   ├── courseController.js   # Course management
│   ├── studentController.js  # Student management
│   ├── registrationController.js # Registration management
│   └── resultController.js   # Results management
├── middleware/            # Custom middleware
│   ├── auth.js              # JWT authentication & authorization
│   ├── validation.js        # Input validation rules
│   └── errorHandler.js      # Global error handling
├── models/                # MongoDB schemas
│   ├── Admin.js             # Admin user model
│   ├── Student.js           # Student model
│   ├── Course.js            # Course model
│   ├── Registration.js      # Registration model
│   └── Result.js            # Result model
├── routes/                # API route definitions
│   ├── authRoutes.js        # Authentication routes
│   ├── courseRoutes.js      # Course endpoints
│   ├── studentRoutes.js     # Student endpoints
│   ├── registrationRoutes.js # Registration endpoints
│   └── resultRoutes.js      # Result endpoints
├── scripts/               # Utility scripts
│   └── seedData.js          # Database seeding script
├── server.js              # Main application entry point
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
├── Dockerfile             # Docker containerization
├── docker-compose.yml     # Multi-container setup
└── healthcheck.js         # Health monitoring
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Local Development Setup

1. **Clone and Navigate**
```bash
git clone <repository-url>
cd university-course-management/backend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB**
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (update MONGODB_URI in .env)
```

5. **Seed Database**
```bash
npm run seed
```

6. **Start Development Server**
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Docker Setup

1. **Using Docker Compose (Recommended)**
```bash
docker-compose up -d
```

This starts:
- MongoDB database on port 27017
- Backend API on port 5000
- Mongo Express (DB admin UI) on port 8081

2. **Individual Docker Build**
```bash
docker build -t university-backend .
docker run -p 5000:5000 university-backend
```

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/university_course_management
MONGODB_URI_ATLAS=mongodb+srv://username:password@cluster.mongodb.net/university_course_management

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📊 Data Models

### Admin Model
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  role: String (default: 'admin'),
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Student Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  studentId: String (unique, required, format: S12345),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (default: 'student'),
  isActive: Boolean (default: true),
  lastLogin: Date,
  enrollmentDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Course Model
```javascript
{
  _id: ObjectId,
  title: String (required),
  code: String (unique, required, format: CS101),
  description: String,
  credits: Number (1-6, default: 3),
  department: String,
  isActive: Boolean (default: true),
  maxEnrollment: Number (default: 50),
  createdAt: Date,
  updatedAt: Date
}
```

### Registration Model
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: Student),
  courseId: ObjectId (ref: Course),
  registrationDate: Date (default: now),
  status: String (enum: active, dropped, completed),
  semester: String,
  academicYear: String (format: 2024-2025),
  createdAt: Date,
  updatedAt: Date
}
```

### Result Model
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: Student),
  courseId: ObjectId (ref: Course),
  grade: String (enum: A+, A, A-, B+, B, B-, C+, C, C-, D+, D, F),
  gradePoints: Number (0-4.0),
  assignedBy: ObjectId (ref: Admin),
  assignedAt: Date (default: now),
  semester: String,
  academicYear: String,
  comments: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 API Endpoints

### Authentication Endpoints

#### Admin Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/admin/register` - Register new admin (admin-only)

#### Student Authentication
- `POST /api/auth/student/login` - Student login
- `PUT /api/auth/student/profile` - Update student profile (student-only)

#### Common Authentication
- `GET /api/auth/validate` - Validate JWT token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### Course Management (Admin Only)
- `GET /api/courses` - Get all courses (with search/pagination)
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `GET /api/courses/:id/stats` - Get course statistics

### Student Management (Admin Only)
- `GET /api/students` - Get all students (with search/pagination)
- `GET /api/students/:id` - Get single student
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `POST /api/students/bulk` - Bulk create students
- `GET /api/students/:id/stats` - Get student statistics

### Registration Management (Admin Only)
- `GET /api/registrations` - Get all registrations
- `GET /api/registrations/:id` - Get single registration
- `POST /api/registrations` - Create registration
- `PUT /api/registrations/:id` - Update registration
- `DELETE /api/registrations/:id` - Delete registration
- `GET /api/registrations/student/:studentId` - Get student's registrations
- `GET /api/registrations/course/:courseId` - Get course's registrations
- `POST /api/registrations/bulk` - Bulk register students

### Result Management (Admin Only)
- `GET /api/results` - Get all results
- `GET /api/results/:id` - Get single result
- `POST /api/results` - Create result (assign grade)
- `PUT /api/results/:id` - Update result
- `DELETE /api/results/:id` - Delete result
- `GET /api/results/student/:studentId` - Get student's results
- `GET /api/results/course/:courseId` - Get course's results
- `POST /api/results/bulk` - Bulk assign grades

### Student Self-Service
- `GET /api/students/me/courses` - Get own courses (student-only)
- `GET /api/students/me/results` - Get own results (student-only)

## 🔒 Authentication & Authorization

### JWT Token Structure
```javascript
{
  id: "user_id",
  email: "user@example.com", // for admins
  studentId: "S12345", // for students
  role: "admin" | "student",
  iat: timestamp,
  exp: timestamp
}
```

### Middleware Protection
- **authenticate**: Verifies JWT token and attaches user to request
- **requireAdmin**: Ensures user has admin role
- **requireStudent**: Ensures user has student role
- **requireSelfAccess**: Allows admins full access, students only their own data

### Security Features
- Password hashing with bcrypt (12 salt rounds)
- JWT token expiration and validation
- Input sanitization and validation
- Rate limiting for API endpoints
- CORS configuration for frontend integration
- Helmet.js for security headers

## 📝 API Usage Examples

### Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@university.edu", "password": "admin123"}'
```

### Create Course (Admin)
```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title": "Web Development", "code": "CS401"}'
```

### Student Login
```bash
curl -X POST http://localhost:5000/api/auth/student/login \
  -H "Content-Type: application/json" \
  -d '{"studentId": "S12345", "password": "student123"}'
```

### Get Student Courses
```bash
curl -X GET http://localhost:5000/api/students/me/courses \
  -H "Authorization: Bearer YOUR_STUDENT_JWT_TOKEN"
```

## 🧪 Testing

### Manual Testing
1. Start the server: `npm run dev`
2. Use Postman or curl to test endpoints
3. Check MongoDB data using Mongo Express: `http://localhost:8081`

### Database Seeding
```bash
npm run seed
```

Creates sample data:
- 2 admin accounts
- 10 student accounts
- 8 courses across different departments
- Random registrations and grades

### Demo Credentials
**Admin Access:**
- Email: `admin@university.edu`
- Password: `admin123`

**Student Access:**
- Student ID: `S12345`
- Password: `student123`

## 🚀 Deployment

### Local Deployment
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Seed database
npm run seed

# Start production server
npm start
```

### Cloud Deployment (Railway)

1. **Prepare for Deployment**
```bash
# Ensure all dependencies are in package.json
npm install --production
```

2. **Deploy to Railway**
- Connect your GitHub repository to Railway
- Set environment variables in Railway dashboard
- Deploy automatically on git push

3. **Environment Variables for Production**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/university_course_management
JWT_SECRET=your_production_jwt_secret_key
FRONTEND_URL=https://your-frontend-domain.com
```

### Cloud Deployment (Heroku)

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Deploy to Heroku**
```bash
heroku create university-course-api
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_jwt_secret
git push heroku main
```

### Cloud Deployment (Render)

1. **Connect Repository**
- Link your GitHub repository to Render
- Select "Web Service" deployment type

2. **Configuration**
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables: Set all required variables

### Docker Deployment

1. **Build and Run**
```bash
# Build image
docker build -t university-backend .

# Run container
docker run -p 5000:5000 --env-file .env university-backend
```

2. **Docker Compose (Full Stack)**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📊 Database Management

### MongoDB Atlas Setup
1. Create MongoDB Atlas account
2. Create new cluster
3. Configure network access (0.0.0.0/0 for development)
4. Create database user
5. Get connection string and update MONGODB_URI

### Local MongoDB Setup
```bash
# Install MongoDB Community Edition
# macOS
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb

# Start MongoDB service
sudo systemctl start mongod

# Connect to MongoDB shell
mongosh
```

### Database Seeding
```bash
# Seed with sample data
npm run seed

# This creates:
# - 2 admin accounts
# - 10 student accounts  
# - 8 courses
# - Random registrations
# - Sample grades
```

## 🔍 API Documentation

### Response Format
All API responses follow this structure:
```javascript
{
  "status": "success" | "error",
  "message": "Descriptive message",
  "data": {
    // Response data
  },
  "pagination": { // For paginated responses
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### Error Responses
```javascript
{
  "status": "error",
  "message": "Error description",
  "errors": [ // For validation errors
    {
      "field": "email",
      "message": "Invalid email format",
      "value": "invalid-email"
    }
  ]
}
```

### Authentication Headers
```javascript
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🛡️ Security Features

### Password Security
- Bcrypt hashing with 12 salt rounds
- Password strength validation (minimum 6 characters)
- Secure password comparison

### JWT Security
- Configurable expiration time
- Secret key from environment variables
- Token validation middleware

### Input Validation
- Email format validation
- Student ID format validation (S12345)
- Course code format validation (CS101)
- Grade enum validation
- MongoDB ObjectId validation

### Rate Limiting
- 100 requests per 15 minutes per IP
- Configurable via environment variables
- Applied to all API routes

### CORS Configuration
- Configurable allowed origins
- Credentials support for authenticated requests
- Preflight request handling

## 🧪 Testing & Development

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with sample data
```

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Database Admin UI
Access Mongo Express at `http://localhost:8081` when using Docker Compose:
- Username: `admin`
- Password: `admin123`

## 📈 Performance & Scalability

### Database Optimization
- Proper indexing on frequently queried fields
- Compound indexes for complex queries
- Virtual fields for computed properties
- Efficient aggregation pipelines

### API Optimization
- Pagination for large datasets
- Field selection for reduced payload
- Population control for related data
- Caching headers for static content

### Error Handling
- Global error handling middleware
- Async error wrapper for controllers
- Proper HTTP status codes
- Detailed error logging

## 🔧 Maintenance

### Database Backup
```bash
# Create backup
mongodump --uri="mongodb://localhost:27017/university_course_management"

# Restore backup
mongorestore --uri="mongodb://localhost:27017/university_course_management" dump/
```

### Log Management
- Morgan logging in development
- Structured logging for production
- Error tracking and monitoring

### Updates & Migrations
- Version control for database schema changes
- Migration scripts for data updates
- Backward compatibility considerations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact: support@university.edu

## 🎯 Future Enhancements

- **Real-time Features**: WebSocket integration for live updates
- **File Upload**: Support for document and image uploads
- **Email Notifications**: Automated grade and registration notifications
- **Analytics**: Advanced reporting and dashboard analytics
- **Audit Logging**: Track all system changes and user actions
- **API Versioning**: Support for multiple API versions
- **Caching**: Redis integration for improved performance
- **Testing**: Comprehensive unit and integration tests