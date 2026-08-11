import { AcademicClass, AttendanceRecord, Course, Mark, ScheduleItem, Student, SubmissionReview, User } from '../types';

export const api = {
  async login(email: string, password?: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async getUsers(): Promise<{ success: boolean; data: User[] }> {
    const res = await fetch('/api/users');
    return res.json();
  },

  async createUser(userData: Partial<User>) {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  async getClasses() {
    const res = await fetch('/api/classes');
    return res.json();
  },

  async createClass(classData: Partial<AcademicClass>) {
    const res = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classData),
    });
    return res.json();
  },

  async updateClass(id: string, classData: Partial<AcademicClass>) {
    const res = await fetch(`/api/classes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classData),
    });
    return res.json();
  },

  async getAcademicYears(): Promise<{ success: boolean; data: string[] }> {
    const res = await fetch('/api/academic-years');
    return res.json();
  },

  async addAcademicYear(year: string) {
    const res = await fetch('/api/academic-years', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year }),
    });
    return res.json();
  },

  async getCourses(): Promise<{ success: boolean; data: Course[] }> {
    const res = await fetch('/api/courses');
    return res.json();
  },

  async createCourse(courseData: Partial<Course>) {
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData),
    });
    return res.json();
  },

  async updateCourse(id: string, courseData: Partial<Course>) {
    const res = await fetch(`/api/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData),
    });
    return res.json();
  },

  async getStudents(): Promise<{ success: boolean; data: Student[] }> {
    const res = await fetch('/api/students');
    return res.json();
  },

  async createStudent(studentData: Partial<Student>) {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    return res.json();
  },

  async getMarks(courseId?: string): Promise<{ success: boolean; data: Mark[] }> {
    const url = courseId ? `/api/marks?courseId=${courseId}` : '/api/marks';
    const res = await fetch(url);
    return res.json();
  },

  async saveMarks(courseId: string, entries: any[], isSubmit: boolean, teacherId?: string, teacherName?: string) {
    const res = await fetch('/api/marks/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, entries, isSubmit, teacherId, teacherName }),
    });
    return res.json();
  },

  async getResultAnalysis(courseId: string) {
    const res = await fetch(`/api/results/course/${courseId}`);
    return res.json();
  },

  async getSubmissions(): Promise<{ success: boolean; data: SubmissionReview[] }> {
    const res = await fetch('/api/submissions');
    return res.json();
  },

  async approveSubmission(id: string, reviewerId?: string, reviewerName?: string) {
    const res = await fetch(`/api/submissions/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewerId, reviewerName }),
    });
    return res.json();
  },

  async rejectSubmission(id: string, reason: string, reviewerId?: string, reviewerName?: string) {
    const res = await fetch(`/api/submissions/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, reviewerId, reviewerName }),
    });
    return res.json();
  },

  async getSchedules(): Promise<{ success: boolean; data: ScheduleItem[] }> {
    const res = await fetch('/api/schedules');
    return res.json();
  },

  async createSchedule(schedData: Partial<ScheduleItem>) {
    const res = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedData),
    });
    return res.json();
  },

  async deleteSchedule(id: string) {
    const res = await fetch(`/api/schedules/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async updateUserProfile(userId: string, data: Partial<User>) {
    const res = await fetch(`/api/users/${userId}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateSchedule(id: string, schedData: Partial<ScheduleItem>) {
    const res = await fetch(`/api/schedules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedData),
    });
    return res.json();
  },

  async getAuditLogs() {
    const res = await fetch('/api/audit-logs');
    return res.json();
  },

  async getNotifications(userId?: string) {
    const url = userId ? `/api/notifications?userId=${userId}` : '/api/notifications';
    const res = await fetch(url);
    return res.json();
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    return res.json();
  },

  async getAttendance(classId?: string, date?: string): Promise<{ success: boolean; data: AttendanceRecord[] }> {
    let url = '/api/attendance';
    const params = new URLSearchParams();
    if (classId) params.append('classId', classId);
    if (date) params.append('date', date);
    if (params.toString()) url += `?${params.toString()}`;
    const res = await fetch(url);
    return res.json();
  },

  async saveAttendance(data: {
    classId: string;
    className: string;
    section: string;
    date: string;
    takenByUserId: string;
    takenByUserName: string;
    entries: any[];
  }) {
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
