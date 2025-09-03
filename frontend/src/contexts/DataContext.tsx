// src/contexts/DataContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

/** ---------- Types ---------- */
export interface Course {
  _id: string;
  title: string;
  code: string;
  description?: string;
  credits: number;
  department?: string;
  maxEnrollment: number;
  createdAt: string | Date;
}

export interface Student {
  _id: string;
  name: string;
  studentId: string;
  email: string;
  createdAt: string | Date;
}

export interface Registration {
  _id: string;
  studentId: string;              // normalized to string in state
  courseId: string;               // normalized to string in state
  registrationDate: string | Date;
  status: string;                 // 'active' | 'completed'
  semester?: string;
  academicYear?: string;
}

export interface Result {
  _id: string;
  studentId: string | { _id: string };
  courseId: string | { _id: string; code?: string; title?: string };
  grade: string;
  gradePoints?: number;
  assignedAt: string | Date;
  semester?: string;
  academicYear?: string;
  comments?: string;
}

interface DataContextType {
  courses: Course[];
  students: Student[];
  registrations: Registration[];
  results: Result[];
  loading: boolean;
  studentGpa?: number;

  refreshData: () => Promise<void>;

  addCourse: (course: Omit<Course, '_id' | 'createdAt'>) => Promise<void>;
  updateCourse: (id: string, course: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;

  addStudent: (student: Omit<Student, '_id' | 'createdAt'>) => Promise<void>;
  updateStudent: (id: string, student: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  addRegistration: (registration: Omit<Registration, '_id' | 'registrationDate'>) => Promise<void>;
  deleteRegistration: (id: string) => Promise<void>;

  addResult: (result: Omit<Result, '_id' | 'assignedAt' | 'gradePoints'>) => Promise<void>;
  updateResult: (id: string, result: Partial<Result>) => Promise<void>;
  deleteResult: (id: string) => Promise<void>;
}

/** ---------- Context / Hook ---------- */
const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
};

/** ---------- Helpers ---------- */
const getId = (v: any): string | undefined =>
  typeof v === 'string' ? v : v && typeof v === 'object' && v._id ? v._id : undefined;

/** ---------- Provider ---------- */
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [studentGpa, setStudentGpa] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      // reset on logout
      setCourses([]);
      setStudents([]);
      setRegistrations([]);
      setResults([]);
      setStudentGpa(undefined);
      setLoading(false);
    }
  }, [user]);

  const refreshData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (user.role === 'admin') {
        // Admin: load everything
        const [coursesRes, studentsRes, registrationsRes, resultsRes] = await Promise.all([
          apiService.getCourses(),
          apiService.getStudents(),
          apiService.getRegistrations(),
          apiService.getResults(),
        ]);

        setCourses(coursesRes.data.courses || []);
        setStudents(studentsRes.data.students || []);
        setRegistrations(registrationsRes.data.registrations || []);
        setResults(resultsRes.data.results || []);
        setStudentGpa(undefined);
      } else {
        // Student: load scoped data (ALL registrations: active + completed) and GPA
        const [coursesRes, studentCoursesRes, studentResultsRes] = await Promise.all([
          apiService.getCourses(),
          apiService.getStudentCourses(),
          apiService.getStudentResults(),
        ]);

        setCourses(coursesRes.data.courses || []);

        const mappedRegs: Registration[] =
          (studentCoursesRes.data?.courses || []).map((c: any) => ({
            _id: c.registrationId,
            studentId: user.id,
            courseId: getId(c.course) || c.course?._id || c.courseId || '',
            registrationDate: c.registrationDate || c.createdAt,
            status: c.status,
            semester: c.semester,
            academicYear: c.academicYear,
          }));

        setRegistrations(mappedRegs);

        const resultList: Result[] = studentResultsRes.data.results || [];
        setResults(resultList);

        if (typeof studentResultsRes.data.gpa === 'number') {
          setStudentGpa(studentResultsRes.data.gpa);
        } else {
          // fallback compute
          const gp: Record<string, number> = {
            'A+': 4.0, 'A': 4.0, 'A-': 3.7,
            'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7,
            'D+': 1.3, 'D': 1.0, 'F': 0.0,
          };
          const rs = resultList || [];
          const g = rs.length ? rs.reduce((s, r) => s + (gp[r.grade] ?? 0), 0) / rs.length : 0;
          setStudentGpa(Number(g.toFixed(2)));
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  /** ---------- Mutators ---------- */

  // Courses
  const addCourse = async (courseData: Omit<Course, '_id' | 'createdAt'>) => {
    const r = await apiService.createCourse(courseData);
    if (r.status === 'success') setCourses(prev => [...prev, r.data.course]);
  };

  const updateCourse = async (id: string, courseData: Partial<Course>) => {
    const r = await apiService.updateCourse(id, courseData);
    if (r.status === 'success') {
      setCourses(prev => prev.map(c => (c._id === id ? r.data.course : c)));
    }
  };

  const deleteCourse = async (id: string) => {
    const r = await apiService.deleteCourse(id);
    if (r.status === 'success') {
      setCourses(prev => prev.filter(c => c._id !== id));
      setRegistrations(prev => prev.filter(reg => reg.courseId !== id));
      setResults(prev =>
        prev.filter(res => (getId(res.courseId) || (res.courseId as string)) !== id)
      );
    }
  };

  // Students
  const addStudent = async (studentData: Omit<Student, '_id' | 'createdAt'>) => {
    const r = await apiService.createStudent(studentData);
    if (r.status === 'success') setStudents(prev => [...prev, r.data.student]);
  };

  const updateStudent = async (id: string, studentData: Partial<Student>) => {
    const r = await apiService.updateStudent(id, studentData);
    if (r.status === 'success') {
      setStudents(prev => prev.map(s => (s._id === id ? r.data.student : s)));
    }
  };

  const deleteStudent = async (id: string) => {
    const r = await apiService.deleteStudent(id);
    if (r.status === 'success') {
      setStudents(prev => prev.filter(s => s._id !== id));
      setRegistrations(prev => prev.filter(reg => reg.studentId !== id));
      setResults(prev =>
        prev.filter(res => (getId(res.studentId) || (res.studentId as string)) !== id)
      );
    }
  };

  // Registrations
  const addRegistration = async (registrationData: Omit<Registration, '_id' | 'registrationDate'>) => {
    const r = await apiService.createRegistration(registrationData as any);
    if (r.status === 'success') setRegistrations(prev => [...prev, r.data.registration]);
  };

  const deleteRegistration = async (id: string) => {
    // Remove server-side
    const r = await apiService.deleteRegistration(id);
    if (r.status === 'success') {
      // Find the registration being removed (to also clean matching results)
      const regToRemove = registrations.find(rr => rr._id === id);
      setRegistrations(prev => prev.filter(reg => reg._id !== id));
      if (regToRemove) {
        setResults(prev =>
          prev.filter(res =>
            !(
              (getId(res.studentId) || (res.studentId as string)) === regToRemove.studentId &&
              (getId(res.courseId) || (res.courseId as string)) === regToRemove.courseId
            )
          )
        );
      }
    }
  };

  // Results
  const addResult = async (resultData: Omit<Result, '_id' | 'assignedAt' | 'gradePoints'>) => {
    const r = await apiService.createResult(resultData as any);
    if (r.status === 'success') setResults(prev => [...prev, r.data.result]);
  };

  const updateResult = async (id: string, resultData: Partial<Result>) => {
    const r = await apiService.updateResult(id, resultData as any);
    if (r.status === 'success') {
      setResults(prev => prev.map(res => (res._id === id ? r.data.result : res)));
    }
  };

  const deleteResult = async (id: string) => {
    const r = await apiService.deleteResult(id);
    if (r.status === 'success') {
      setResults(prev => prev.filter(res => res._id !== id));
    }
  };

  return (
    <DataContext.Provider
      value={{
        courses,
        students,
        registrations,
        results,
        loading,
        studentGpa,
        refreshData,
        addCourse,
        updateCourse,
        deleteCourse,
        addStudent,
        updateStudent,
        deleteStudent,
        addRegistration,
        deleteRegistration,
        addResult,
        updateResult,
        deleteResult,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};