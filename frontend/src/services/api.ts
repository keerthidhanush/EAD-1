// src/services/api.ts
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async handleResponse(response: Response) {
    if (response.status === 304) {
      return { status: 'success', data: {} };
    }
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }
    
    return data;
  }

  // Authentication
  async adminLogin(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    return this.handleResponse(response);
  }

  async studentLogin(studentId: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/student/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, password })
    });
    
    return this.handleResponse(response);
  }

  async validateToken() {
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  // Courses
  async getCourses(search?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    const response = await fetch(`${API_BASE_URL}/courses?${params}`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async createCourse(courseData: { title: string; code: string; description?: string; credits?: number; department?: string }) {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(courseData)
    });
    
    return this.handleResponse(response);
  }

  async updateCourse(id: string, courseData: Partial<{ title: string; code: string; description: string; credits: number; department: string }>) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(courseData)
    });
    
    return this.handleResponse(response);
  }

  async deleteCourse(id: string) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  // Students
  async getStudents(search?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    const response = await fetch(`${API_BASE_URL}/students?${params}`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async createStudent(studentData: { name: string; studentId: string; email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(studentData)
    });
    
    return this.handleResponse(response);
  }

  async updateStudent(id: string, studentData: Partial<{ name: string; email: string; password: string }>) {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(studentData)
    });
    
    return this.handleResponse(response);
  }

  async deleteStudent(id: string) {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async getStudentCourses() {
    const response = await fetch(`${API_BASE_URL}/students/me/courses?t=${Date.now()}`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async getStudentResults() {
    const response = await fetch(`${API_BASE_URL}/students/me/results?t=${Date.now()}`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  // Registrations
  async getRegistrations(search?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    const response = await fetch(`${API_BASE_URL}/registrations?${params}`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async createRegistration(registrationData: { studentId: string; courseId: string; semester?: string; academicYear?: string }) {
    const response = await fetch(`${API_BASE_URL}/registrations`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(registrationData)
    });
    
    return this.handleResponse(response);
  }

  async deleteRegistration(id: string) {
    const response = await fetch(`${API_BASE_URL}/registrations/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  // Results
  async getResults(search?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    const response = await fetch(`${API_BASE_URL}/results?${params}`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async createResult(resultData: { studentId: string; courseId: string; grade: string; semester?: string; academicYear?: string; comments?: string }) {
    const response = await fetch(`${API_BASE_URL}/results`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(resultData)
    });
    
    return this.handleResponse(response);
  }

  async updateResult(id: string, resultData: Partial<{ grade: string; semester: string; academicYear: string; comments: string }>) {
    const response = await fetch(`${API_BASE_URL}/results/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(resultData)
    });
    
    return this.handleResponse(response);
  }

  async deleteResult(id: string) {
    const response = await fetch(`${API_BASE_URL}/results/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();