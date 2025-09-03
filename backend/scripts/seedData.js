import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';
import Registration from '../models/Registration.js';
import Result from '../models/Result.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
    const dbName = process.env.MONGODB_DB || 'university_course_management';
    console.log('Connecting to MongoDB URI:', mongoURI, ' dbName:', dbName);
    await mongoose.connect(mongoURI, { dbName });
    console.log('✅ MongoDB connected for seeding');
    console.log('Connected host:', mongoose.connection.host);
    console.log('Connected db  :', mongoose.connection.name);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('Clearing existing data...');
    await Promise.all([
      Admin.deleteMany({}),
      Student.deleteMany({}),
      Course.deleteMany({}),
      Registration.deleteMany({}),
      Result.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // PLAIN passwords (models will hash)
    const admins = await Admin.create([
      {
        name: 'System Administrator',
        email: 'admin@university.edu',
        password: 'admin123',
        role: 'admin',
        isActive: true
      },
      {
        name: 'Academic Coordinator',
        email: 'coordinator@university.edu',
        password: 'admin123',
        role: 'admin',
        isActive: true
      },
    ]);
    console.log(`👨‍💼 Created ${admins.length} admin users`);

    const courses = await Course.create([
      { title: 'Introduction to Programming', code: 'CS101', description: 'Fundamentals of programming using modern languages', credits: 3, department: 'Computer Science', maxEnrollment: 30 },
      { title: 'Data Structures and Algorithms', code: 'CS201', description: 'Advanced data structures and algorithmic thinking', credits: 4, department: 'Computer Science', maxEnrollment: 25 },
      { title: 'Database Management Systems', code: 'CS301', description: 'Design and implementation of database systems', credits: 3, department: 'Computer Science', maxEnrollment: 20 },
      { title: 'Web Development', code: 'CS401', description: 'Modern web development with full-stack technologies', credits: 4, department: 'Computer Science', maxEnrollment: 25 },
      { title: 'Software Engineering', code: 'CS501', description: 'Software development lifecycle and project management', credits: 3, department: 'Computer Science', maxEnrollment: 20 },
      { title: 'Calculus I', code: 'MATH101', description: 'Differential and integral calculus', credits: 4, department: 'Mathematics', maxEnrollment: 40 },
      { title: 'Linear Algebra', code: 'MATH201', description: 'Vector spaces, matrices, and linear transformations', credits: 3, department: 'Mathematics', maxEnrollment: 35 },
      { title: 'Physics I', code: 'PHYS101', description: 'Classical mechanics and thermodynamics', credits: 4, department: 'Physics', maxEnrollment: 30 },
    ]);
    console.log(`📚 Created ${courses.length} courses`);

    const students = await Student.create([
      { name: 'John Smith', studentId: 'S12345', email: 'john.smith@student.university.edu', password: 'student123', role: 'student', isActive: true },
      { name: 'Emily Johnson', studentId: 'S12346', email: 'emily.johnson@student.university.edu', password: 'student123', role: 'student', isActive: true },
      { name: 'Michael Brown', studentId: 'S12347', email: 'michael.brown@student.university.edu', password: 'student123', role: 'student', isActive: true },
      { name: 'Sarah Davis', studentId: 'S12348', email: 'sarah.davis@student.university.edu', password: 'student123', role: 'student', isActive: true },
      { name: 'David Wilson', studentId: 'S12349', email: 'david.wilson@student.university.edu', password: 'student123', role: 'student', isActive: true },
      { name: 'Lisa Anderson', studentId: 'S12350', email: 'lisa.anderson@student.university.edu', password: 'student123', role: 'student', isActive: true },
      { name: 'James Taylor', studentId: 'S12351', email: 'james.taylor@student.university.edu', password: 'student123', role: 'student', isActive: true },
      { name: 'Maria Garcia', studentId: 'S12352', email: 'maria.garcia@student.university.edu', password: 'student123', role: 'student', isActive: true },
      { name: 'Robert Martinez', studentId: 'S12353', email: 'robert.martinez@student.university.edu', password: 'student123', role: 'student', isActive: true },
      { name: 'Jennifer Lee', studentId: 'S12354', email: 'jennifer.lee@student.university.edu', password: 'student123', role: 'student', isActive: true },
    ]);
    console.log(`👨‍🎓 Created ${students.length} students`);

    // Registrations + some Results
    const registrations = [];
    const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D'];

    for (const student of students) {
      const numCourses = Math.floor(Math.random() * 4) + 2; // 2-5
      const selected = new Set();

      while (selected.size < numCourses) {
        const randomCourse = courses[Math.floor(Math.random() * courses.length)];
        if (selected.has(randomCourse._id.toString())) continue;
        selected.add(randomCourse._id.toString());

        // Use a valid enum: 'active' (default) or set explicitly
        const registration = await Registration.create({
          studentId: student._id,
          courseId: randomCourse._id,
          semester: 'Fall 2024',
          academicYear: '2024-2025',
          status: 'active',
        });

        registrations.push(registration);

        // Assign a grade sometimes → then mark as completed
        if (Math.random() > 0.3) {
          const randomGrade = grades[Math.floor(Math.random() * grades.length)];
          await Result.create({
            studentId: student._id,
            courseId: randomCourse._id,
            grade: randomGrade,
            assignedBy: admins[0]._id,
            semester: 'Fall 2024',
            academicYear: '2024-2025',
            comments: 'Good performance in coursework and exams',
          });

          registration.status = 'completed';
          await registration.save();
        }
      }
    }
    console.log(`📝 Created ${registrations.length} registrations`);

    const [a, s, c, r, resCount] = await Promise.all([
      Admin.countDocuments(),
      Student.countDocuments(),
      Course.countDocuments(),
      Registration.countDocuments(),
      Result.countDocuments(),
    ]);

    console.log('\n🎉 Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   👨‍💼 Admins: ${a}`);
    console.log(`   👨‍🎓 Students: ${s}`);
    console.log(`   📚 Courses: ${c}`);
    console.log(`   📝 Registrations: ${r}`);
    console.log(`   🏆 Results: ${resCount}`);

    console.log('\n🔐 Demo Credentials:');
    console.log('   Admin: admin@university.edu / admin123');
    console.log('   Student: S12345 / student123');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

connectDB().then(seedData);
