# University Course Management System

A modern, full-featured course management system built with React, TypeScript, and Tailwind CSS. This application provides comprehensive functionality for managing university courses, students, registrations, and academic results with role-based access control.

## 🎓 Features

### For Administrators
- **Dashboard Overview**: Real-time statistics and quick actions
- **Course Management**: Create, edit, and delete courses with search functionality
- **Student Management**: Manage student profiles and accounts
- **Registration Management**: Register students for courses and manage enrollments
- **Results Management**: Assign and manage student grades
- **Profile Management**: Update admin account information

### For Students
- **Personal Dashboard**: Academic overview with GPA calculation
- **Course Viewing**: View registered courses and their status
- **Results Viewing**: Access grades and academic performance
- **Profile Management**: Update personal information and password

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Authentication**: JWT-based with role-based access control

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/university-course-management.git
cd university-course-management
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🔐 Demo Credentials

### Administrator Access
- **Email**: admin@university.edu
- **Password**: admin123

### Student Access
- **Student ID**: S12345
- **Password**: student123

Additional student accounts:
- S12346 / student123 (Emily Johnson)
- S12347 / student123 (Michael Brown)

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured dashboard experience
- **Tablet**: Optimized layout for medium screens
- **Mobile**: Touch-friendly interface with collapsible navigation

## 🎨 Design System

### Color Palette
- **Primary Blue**: #1E40AF (University branding)
- **Secondary Green**: #059669 (Success states)
- **Accent Gold**: #D97706 (Highlights and warnings)
- **Supporting Colors**: Purple, Red, Yellow for various UI states

### Typography
- **Headings**: Inter font family with proper hierarchy
- **Body Text**: Optimized line spacing (150%) for readability
- **UI Elements**: Consistent weight distribution (Regular, Medium, Bold)

### Components
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Hover states with smooth transitions
- **Forms**: Clear validation and error states
- **Tables**: Sortable with search functionality

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── DataTable.tsx   # Generic table component
│   ├── Header.tsx      # Navigation header
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Modal.tsx       # Modal dialog component
│   ├── ProtectedRoute.tsx # Route protection
│   ├── Sidebar.tsx     # Navigation sidebar
│   └── StatsCard.tsx   # Statistics display
├── contexts/            # React context providers
│   ├── AuthContext.tsx # Authentication state
│   └── DataContext.tsx # Application data state
├── pages/               # Application pages
│   ├── admin/          # Administrator pages
│   ├── student/        # Student pages
│   └── Login.tsx       # Authentication page
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Deploy to Railway
1. Connect your GitHub repository to Railway
2. Set build command: `npm run build`
3. Set output directory: `dist`

## 🔒 Security Features

- **Role-based Access Control**: Separate admin and student interfaces
- **Protected Routes**: Authentication required for all dashboard access
- **Input Validation**: Client-side validation for all forms
- **Secure Authentication**: JWT-based session management
- **Data Integrity**: Relationship validation for registrations and results

## 📊 Data Models

### Course
- ID, Title, Code, Created Date

### Student
- ID, Name, Student ID, Email, Created Date

### Registration
- ID, Student ID, Course ID, Registration Date

### Result
- ID, Student ID, Course ID, Grade, Assignment Date

## 🎯 Future Enhancements

- **Backend Integration**: Replace mock data with real API
- **Database**: Integrate with MongoDB or PostgreSQL
- **File Upload**: Support for document uploads
- **Email Notifications**: Automated grade notifications
- **Analytics**: Advanced reporting and analytics
- **Calendar Integration**: Course scheduling features

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

## 🎉 Acknowledgments

- Built for educational purposes as part of modern web development curriculum
- Demonstrates industry-standard practices and design patterns
- Showcases React ecosystem and modern frontend development