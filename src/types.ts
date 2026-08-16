export type UserRole = 'ADMIN' | 'DEPT_HEAD' | 'TEACHER' | 'COORDINATOR';

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface User {
  id: string;
  name: string;
  amharicName?: string;
  email: string;
  password?: string;
  phone: string;
  employeeId: string;
  role: UserRole;
  status: AccountStatus;
  department: string;
  avatar?: string;
  createdAt?: string;
}

export interface AcademicClass {
  id: string;
  name: string; // e.g. "Class 1", "Class 2"
  amharicName: string; // e.g. "ደረጃ 1"
  level: number; // 1 to 8
  academicYear: string;
  sections: string[];
  semesters?: string[]; // e.g. ["Semester I", "Semester II", "Semester III"]
}

export interface AssessmentColumn {
  id: string; // e.g., 'assignment', 'quiz', 'midterm', 'final', or 'col-12345'
  name: string; // e.g., 'Assignment', 'Quiz', 'Test', 'Midterm', 'Final Exam', 'Attendance'
  maxMark: number; // e.g., 15, 10, 25, 50, etc.
}

export interface Course {
  id: string;
  code: string;
  title: string;
  amharicTitle: string;
  creditHours: number;
  classId: string;
  className?: string;
  semester: 'Semester I' | 'Semester II';
  academicYear: string;
  teacherId?: string;
  teacherName?: string;
  coordinatorId?: string;
  coordinatorName?: string;
  maxAssignment: number;
  maxQuiz: number;
  maxMidterm: number;
  maxFinal: number;
  assessmentColumns?: AssessmentColumn[];
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Student {
  id: string;
  studentId: string; // e.g. "ST-2026-001"
  firstName: string;
  lastName: string;
  amharicName: string;
  gender: 'Male' | 'Female';
  email: string;
  phone: string;
  classId: string;
  className: string;
  section: string;
  academicYear: string;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
}

export type BehavioralNoteCategory =
  | 'COMMENDATION'
  | 'SPIRITUAL_GROWTH'
  | 'ACADEMIC_EFFORT'
  | 'ATTENDANCE_PUNCTUALITY'
  | 'DISCIPLINARY'
  | 'COUNSELING'
  | 'GENERAL';

export type BehavioralSeverity = 'POSITIVE' | 'NEUTRAL' | 'WARNING' | 'CRITICAL';

export type BehavioralFlagType =
  | 'NONE'
  | 'ATTENDANCE_WARNING'
  | 'ACADEMIC_ALERT'
  | 'DISCIPLINARY_ACTION'
  | 'PASTORAL_CARE'
  | 'SPECIAL_ATTENTION'
  | 'MERIT_COMMENDATION';

export type BehavioralFlagStatus = 'ACTIVE' | 'UNDER_REVIEW' | 'RESOLVED';
export type BehavioralFlagPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL_URGENT';

export interface BehavioralNote {
  id: string;
  studentId: string;
  studentName?: string;
  studentAmharicName?: string;
  title: string;
  category: BehavioralNoteCategory;
  severity: BehavioralSeverity;
  content: string;
  recordedByUserId: string;
  recordedByUserName: string;
  recordedByUserRole?: string;
  date: string; // YYYY-MM-DD
  academicYear?: string;
  actionTaken?: string;
  followUpRequired?: boolean;
  isFlag?: boolean;
  flagType?: BehavioralFlagType;
  flagStatus?: BehavioralFlagStatus;
  flagPriority?: BehavioralFlagPriority;
  shortWarningNote?: string;
  tags?: string[];
  resolvedAt?: string;
  resolvedByUserId?: string;
  resolvedByUserName?: string;
  resolutionNotes?: string;
  createdAt: string;
}

export interface StudentProfileData {
  student: Student;
  academicClass?: AcademicClass;
  attendanceSummary: {
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    attendanceRate: number; // 0 - 100
  };
  attendanceHistory: {
    id: string;
    date: string;
    ethiopianDate?: string;
    className: string;
    section: string;
    status: AttendanceStatus;
    remark?: string;
    takenByUserName: string;
  }[];
  grades: {
    marks: (Mark & {
      courseCode?: string;
      courseTitle?: string;
      courseAmharicTitle?: string;
      creditHours?: number;
      semester?: string;
      academicYear?: string;
      teacherName?: string;
    })[];
    totalCreditHours: number;
    earnedCreditHours: number;
    gpa: number;
    standing: string;
    amharicStanding: string;
  };
  behavioralNotes: BehavioralNote[];
}

export interface Mark {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  studentAmharicName?: string;
  courseId: string;
  assignment: number; // e.g. out of 15
  quiz: number;       // e.g. out of 10
  midterm: number;    // e.g. out of 25
  final: number;      // e.g. out of 50
  customMarks?: Record<string, number>;
  total: number;      // 0-100
  grade: string;      // A+, A, B+, B, C+, C, D, F
  gradePoint: number; // 4.0, 3.5, etc.
  status: SubmissionStatus;
  rejectionReason?: string;
  updatedAt?: string;
}

export interface SubmissionReview {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  teacherId: string;
  teacherName: string;
  coordinatorId?: string;
  coordinatorName?: string;
  studentCount: number;
  submittedAt: string;
  reviewedAt?: string;
  status: SubmissionStatus;
  rejectionReason?: string;
  averageScore?: number;
  passRate?: number;
}

export interface ScheduleItem {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classId: string;
  className: string;
  section: string;
  teacherId: string;
  teacherName: string;
  day: DayOfWeek;
  startTime: string; // e.g., "08:30"
  endTime: string;   // e.g., "10:30"
  room: string;      // e.g., "Room 204"
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  ip: string;
}

export interface Notification {
  id: string;
  timestamp: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'danger';
  link?: string;
}

export interface GradingScale {
  grade: string;
  min: number;
  max: number;
  point: number;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface StudentAttendanceEntry {
  studentId: string;
  studentCode: string;
  studentName: string;
  studentAmharicName?: string;
  status: AttendanceStatus;
  remark?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  classId: string;
  className: string;
  section: string;
  takenByUserId: string;
  takenByUserName: string;
  entries: StudentAttendanceEntry[];
  createdAt: string;
}

export type CalendarEventType =
  | 'EXAM'
  | 'HOLIDAY'
  | 'REGISTRATION'
  | 'ACADEMIC_MILESTONE'
  | 'MEETING'
  | 'SPECIAL_EVENT';

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  amharicTitle: string;
  type: CalendarEventType;
  startDate: string; // YYYY-MM-DD
  endDate?: string;  // YYYY-MM-DD (inclusive)
  academicYear: string; // e.g. "2025/2026", "2026/2027"
  semester?: 'Semester I' | 'Semester II' | 'All';
  description?: string;
  amharicDescription?: string;
  location?: string;
  targetAudience?: 'ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS' | 'ADMIN';
  isImportant?: boolean;
  color?: string;
  createdBy?: string;
  createdAt?: string;
}

export type Language = 'en' | 'am';
