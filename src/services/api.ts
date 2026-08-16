import {
  AcademicCalendarEvent,
  AcademicClass,
  AttendanceRecord,
  BehavioralNote,
  Course,
  Mark,
  ScheduleItem,
  Student,
  StudentProfileData,
  SubmissionReview,
  User,
} from '../types';

function getAuthHeaders(customHeaders?: Record<string, string>): HeadersInit {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('amras_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const customHeaders = (init?.headers as Record<string, string>) || {};
  return fetch(input, {
    ...init,
    headers: getAuthHeaders(customHeaders),
  });
}

export const api = {
  async login(email: string, password?: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async verifySession(): Promise<{ success: boolean; user?: User; data?: User }> {
    const res = await authFetch('/api/auth/me');
    return res.json();
  },

  async getUsers(): Promise<{ success: boolean; data: User[] }> {
    const res = await authFetch('/api/users');
    return res.json();
  },

  async createUser(userData: Partial<User>) {
    const res = await authFetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  async updateUser(id: string, userData: Partial<User>) {
    const res = await authFetch(`/api/users/${id}/profile`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  async getClasses() {
    const res = await authFetch('/api/classes');
    return res.json();
  },

  async createClass(classData: Partial<AcademicClass>) {
    const res = await authFetch('/api/classes', {
      method: 'POST',
      body: JSON.stringify(classData),
    });
    return res.json();
  },

  async updateClass(id: string, classData: Partial<AcademicClass>) {
    const res = await authFetch(`/api/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(classData),
    });
    return res.json();
  },

  async getAcademicYears(): Promise<{ success: boolean; data: string[] }> {
    const res = await authFetch('/api/academic-years');
    return res.json();
  },

  async addAcademicYear(year: string) {
    const res = await authFetch('/api/academic-years', {
      method: 'POST',
      body: JSON.stringify({ year }),
    });
    return res.json();
  },

  async getCourses(): Promise<{ success: boolean; data: Course[] }> {
    const res = await authFetch('/api/courses');
    return res.json();
  },

  async createCourse(courseData: Partial<Course>) {
    const res = await authFetch('/api/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
    return res.json();
  },

  async updateCourse(id: string, courseData: Partial<Course>) {
    const res = await authFetch(`/api/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
    return res.json();
  },

  async getStudents(): Promise<{ success: boolean; data: Student[] }> {
    const res = await authFetch('/api/students');
    return res.json();
  },

  async getStudentProfile(studentId: string): Promise<{ success: boolean; data: StudentProfileData }> {
    const res = await authFetch(`/api/students/${studentId}/profile`);
    return res.json();
  },

  async getStudentBehavioralNotes(studentId: string): Promise<{ success: boolean; data: BehavioralNote[] }> {
    const res = await authFetch(`/api/students/${studentId}/behavioral-notes`);
    return res.json();
  },

  async createStudentBehavioralNote(studentId: string, noteData: Partial<BehavioralNote>): Promise<{ success: boolean; data: BehavioralNote }> {
    const res = await authFetch(`/api/students/${studentId}/behavioral-notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
    return res.json();
  },

  async quickAttachBehavioralFlag(studentId: string, flagData: Partial<BehavioralNote>): Promise<{ success: boolean; data: BehavioralNote }> {
    const res = await authFetch(`/api/students/${studentId}/quick-flag`, {
      method: 'POST',
      body: JSON.stringify(flagData),
    });
    return res.json();
  },

  async updateBehavioralFlagStatus(
    studentId: string,
    noteId: string,
    payload: {
      flagStatus: 'ACTIVE' | 'UNDER_REVIEW' | 'RESOLVED';
      resolutionNotes?: string;
      resolvedByUserId?: string;
      resolvedByUserName?: string;
    }
  ): Promise<{ success: boolean; data: BehavioralNote }> {
    const res = await authFetch(`/api/students/${studentId}/behavioral-notes/${noteId}/flag-status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async deleteStudentBehavioralNote(studentId: string, noteId: string): Promise<{ success: boolean; message: string }> {
    const res = await authFetch(`/api/students/${studentId}/behavioral-notes/${noteId}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async createStudent(studentData: Partial<Student>) {
    const res = await authFetch('/api/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
    return res.json();
  },

  async getMarks(courseId?: string): Promise<{ success: boolean; data: Mark[] }> {
    const url = courseId ? `/api/marks?courseId=${courseId}` : '/api/marks';
    const res = await authFetch(url);
    return res.json();
  },

  async saveMarks(courseId: string, entries: any[], isSubmit: boolean, teacherId?: string, teacherName?: string) {
    const res = await authFetch('/api/marks/save', {
      method: 'POST',
      body: JSON.stringify({ courseId, entries, isSubmit, teacherId, teacherName }),
    });
    return res.json();
  },

  async getResultAnalysis(courseId: string) {
    const res = await authFetch(`/api/results/course/${courseId}`);
    return res.json();
  },

  async getSubmissions(): Promise<{ success: boolean; data: SubmissionReview[] }> {
    const res = await authFetch('/api/submissions');
    return res.json();
  },

  async approveSubmission(id: string, reviewerId?: string, reviewerName?: string) {
    const res = await authFetch(`/api/submissions/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ reviewerId, reviewerName }),
    });
    return res.json();
  },

  async rejectSubmission(id: string, reason: string, reviewerId?: string, reviewerName?: string) {
    const res = await authFetch(`/api/submissions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason, reviewerId, reviewerName }),
    });
    return res.json();
  },

  async getSchedules(): Promise<{ success: boolean; data: ScheduleItem[] }> {
    const res = await authFetch('/api/schedules');
    return res.json();
  },

  async createSchedule(schedData: Partial<ScheduleItem>) {
    const res = await authFetch('/api/schedules', {
      method: 'POST',
      body: JSON.stringify(schedData),
    });
    return res.json();
  },

  async deleteSchedule(id: string) {
    const res = await authFetch(`/api/schedules/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async updateUserProfile(userId: string, data: Partial<User>) {
    const res = await authFetch(`/api/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateSchedule(id: string, schedData: Partial<ScheduleItem>) {
    const res = await authFetch(`/api/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(schedData),
    });
    return res.json();
  },

  async getAuditLogs() {
    const res = await authFetch('/api/audit-logs');
    return res.json();
  },

  async getNotifications(userId?: string) {
    const url = userId ? `/api/notifications?userId=${userId}` : '/api/notifications';
    const res = await authFetch(url);
    return res.json();
  },

  async markNotificationRead(id: string) {
    const res = await authFetch(`/api/notifications/${id}/read`, { method: 'POST' });
    return res.json();
  },

  async getAttendance(classId?: string, date?: string): Promise<{ success: boolean; data: AttendanceRecord[] }> {
    let url = '/api/attendance';
    const params = new URLSearchParams();
    if (classId) params.append('classId', classId);
    if (date) params.append('date', date);
    if (params.toString()) url += `?${params.toString()}`;
    const res = await authFetch(url);
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
    const res = await authFetch('/api/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getAcademicCalendarEvents(params?: { academicYear?: string; semester?: string; type?: string }): Promise<{ success: boolean; data: AcademicCalendarEvent[] }> {
    let url = '/api/academic-calendar';
    if (params) {
      const q = new URLSearchParams();
      if (params.academicYear) q.append('academicYear', params.academicYear);
      if (params.semester) q.append('semester', params.semester);
      if (params.type) q.append('type', params.type);
      if (q.toString()) url += `?${q.toString()}`;
    }
    const res = await authFetch(url);
    return res.json();
  },

  async createAcademicCalendarEvent(eventData: Partial<AcademicCalendarEvent>) {
    const res = await authFetch('/api/academic-calendar', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
    return res.json();
  },

  async updateAcademicCalendarEvent(id: string, eventData: Partial<AcademicCalendarEvent>) {
    const res = await authFetch(`/api/academic-calendar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
    return res.json();
  },

  async deleteAcademicCalendarEvent(id: string) {
    const res = await authFetch(`/api/academic-calendar/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
};
