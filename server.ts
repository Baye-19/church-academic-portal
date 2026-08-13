import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initializeApp as initFirebaseApp, getApps as getFirebaseApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const app = express();
const PORT = 3000;

app.use(express.json());

// Firebase Firestore Cloud Database Setup
let db: any = null;

try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const firebaseConfig = {
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
    };

    const firebaseApp = !getFirebaseApps().length ? initFirebaseApp(firebaseConfig) : getFirebaseApps()[0];
    db = config.firestoreDatabaseId && config.firestoreDatabaseId.trim() !== ''
      ? getFirestore(firebaseApp, config.firestoreDatabaseId)
      : getFirestore(firebaseApp);
    console.log('✅ Connected to Firebase Firestore Database:', config.projectId);
  }
} catch (err) {
  console.error('❌ Firebase connection error:', err);
}

// Firestore Helper Functions
async function dbGetCollection(colName: string): Promise<any[]> {
  if (!db) return [];
  try {
    const colRef = collection(db, colName);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((d) => ({ ...d.data() }));
  } catch (e) {
    console.error(`Error reading ${colName} from Firestore:`, e);
    return [];
  }
}

async function dbSaveDoc(colName: string, docId: string, data: any) {
  if (!db) return;
  try {
    const docRef = doc(db, colName, docId);
    await setDoc(docRef, JSON.parse(JSON.stringify(data)), { merge: true });
  } catch (e) {
    console.error(`Error saving doc ${docId} in ${colName} to Firestore:`, e);
  }
}

async function dbDeleteDoc(colName: string, docId: string) {
  if (!db) return;
  try {
    const docRef = doc(db, colName, docId);
    await deleteDoc(docRef);
  } catch (e) {
    console.error(`Error deleting doc ${docId} in ${colName} from Firestore:`, e);
  }
}

// In-Memory Database State (Pre-seeded with realistic data)
let users = [
  {
    id: 'usr-1',
    name: 'Ashenafi Sentayehu',
    amharicName: 'አሸናፊ ስንታየሁ',
    email: 'ashu@admin.edu',
    phone: '+251 919183146',
    employeeId: 'ADM-101',
    role: 'ADMIN',
    status: 'ACTIVE',
    department: 'ህጻናት እና አዳጊ',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'usr-2',
    name: 'Biruk Wendemeneh',
    amharicName: 'ብሩክ ወንድሜነህ',
    email: 'bura@head.edu',
    phone: '+251 948822471',
    employeeId: 'DHD-201',
    role: 'DEPT_HEAD',
    status: 'ACTIVE',
    department: 'ህጻናት እና አዳጊ',
    createdAt: '2026-01-12T08:00:00Z',
  },
  {
    id: 'usr-3',
    name: 'Instructor Abebe Kebede',
    amharicName: 'መምህር አበበ ከበደ',
    email: 'teacher1@amras.edu',
    phone: '+251 911 456789',
    employeeId: 'TCH-301',
    role: 'TEACHER',
    status: 'ACTIVE',
    department: 'ህጻናት እና አዳጊ',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'usr-4',
    name: 'Instructor Tigist Haile',
    amharicName: 'መምህር ትዕግሥት ሀይሌ',
    email: 'teacher2@amras.edu',
    phone: '+251 911 567890',
    employeeId: 'TCH-302',
    role: 'TEACHER',
    status: 'ACTIVE',
    department: 'ህጻናት እና አዳጊ',
    createdAt: '2026-01-16T08:00:00Z',
  },
  {
    id: 'usr-5',
    name: 'Coordinator Dawit Bekele',
    amharicName: 'አስተባባሪ ዳዊት በቀለ',
    email: 'coordinator@amras.edu',
    phone: '+251 911 678901',
    employeeId: 'CRD-401',
    role: 'COORDINATOR',
    status: 'ACTIVE',
    department: 'ህጻናት እና አዳጊ',
    createdAt: '2026-01-18T08:00:00Z',
  },
];

let academicYears = ['2024/2025', '2025/2026', '2026/2027', '2027/2028'];

let academicClasses = [
  { id: 'cls-1', name: 'Class 1', amharicName: 'ደረጃ 1', level: 1, academicYear: '2025/2026', sections: ['A', 'B'], semesters: ['Semester I', 'Semester II'] },
  { id: 'cls-2', name: 'Class 2', amharicName: 'ደረጃ 2', level: 2, academicYear: '2025/2026', sections: ['A', 'B'], semesters: ['Semester I', 'Semester II'] },
  { id: 'cls-3', name: 'Class 3', amharicName: 'ደረጃ 3', level: 3, academicYear: '2025/2026', sections: ['A', 'B', 'C'], semesters: ['Semester I', 'Semester II'] },
  { id: 'cls-4', name: 'Class 4', amharicName: 'ደረጃ 4', level: 4, academicYear: '2025/2026', sections: ['A', 'B'], semesters: ['Semester I', 'Semester II'] },
  { id: 'cls-5', name: 'Class 5', amharicName: 'ደረጃ 5', level: 5, academicYear: '2025/2026', sections: ['A'], semesters: ['Semester I', 'Semester II'] },
  { id: 'cls-6', name: 'Class 6', amharicName: 'ደረጃ 6', level: 6, academicYear: '2025/2026', sections: ['A'], semesters: ['Semester I', 'Semester II'] },
  { id: 'cls-7', name: 'Class 7', amharicName: 'ደረጃ 7', level: 7, academicYear: '2025/2026', sections: ['A'], semesters: ['Semester I', 'Semester II'] },
  { id: 'cls-8', name: 'Class 8', amharicName: 'ደረጃ 8', level: 8, academicYear: '2025/2026', sections: ['A'], semesters: ['Semester I', 'Semester II'] },
];

let courses = [
  {
    id: 'crs-101',
    code: 'CS101',
    title: 'Introduction to Computer Programming',
    amharicTitle: 'የኮምፒውተር ፕሮግራሚንግ መግቢያ',
    creditHours: 4,
    classId: 'cls-1',
    semester: 'Semester I',
    academicYear: '2025/2026',
    teacherId: 'usr-3',
    teacherName: 'Instructor Abebe Kebede',
    coordinatorId: 'usr-5',
    coordinatorName: 'Coordinator Dawit Bekele',
    maxAssignment: 15,
    maxQuiz: 10,
    maxMidterm: 25,
    maxFinal: 50,
    status: 'ACTIVE',
  },
  {
    id: 'crs-103',
    code: 'TH101',
    title: 'Dogmatic Theology',
    amharicTitle: 'የዶግማ እና እምነት ትምህርት',
    creditHours: 3,
    classId: 'cls-1',
    semester: 'Semester I',
    academicYear: '2025/2026',
    teacherId: 'usr-4',
    teacherName: 'Instructor Tigist Haile',
    coordinatorId: 'usr-5',
    coordinatorName: 'Coordinator Dawit Bekele',
    maxAssignment: 20,
    maxQuiz: 10,
    maxMidterm: 20,
    maxFinal: 50,
    status: 'ACTIVE',
  },
  {
    id: 'crs-104',
    code: 'ETH101',
    title: 'Christian Ethics & Life',
    amharicTitle: 'ክርስቲያናዊ ሥነ-ምግባር',
    creditHours: 3,
    classId: 'cls-1',
    semester: 'Semester I',
    academicYear: '2025/2026',
    teacherId: 'usr-3',
    teacherName: 'Instructor Abebe Kebede',
    coordinatorId: 'usr-5',
    coordinatorName: 'Coordinator Dawit Bekele',
    maxAssignment: 20,
    maxQuiz: 10,
    maxMidterm: 20,
    maxFinal: 50,
    status: 'ACTIVE',
  },
  {
    id: 'crs-102',
    code: 'CS102',
    title: 'Data Structures & Algorithms',
    amharicTitle: 'የዳታ መዋቅሮች እና አልጎሪዝም',
    creditHours: 4,
    classId: 'cls-2',
    semester: 'Semester I',
    academicYear: '2025/2026',
    teacherId: 'usr-3',
    teacherName: 'Instructor Abebe Kebede',
    coordinatorId: 'usr-5',
    coordinatorName: 'Coordinator Dawit Bekele',
    maxAssignment: 20,
    maxQuiz: 10,
    maxMidterm: 20,
    maxFinal: 50,
    status: 'ACTIVE',
  },
  {
    id: 'crs-201',
    code: 'CS201',
    title: 'Database Management Systems',
    amharicTitle: 'የዳታቤዝ አስተዳደር ሥርዓት',
    creditHours: 3,
    classId: 'cls-3',
    semester: 'Semester I',
    academicYear: '2025/2026',
    teacherId: 'usr-4',
    teacherName: 'Instructor Tigist Haile',
    coordinatorId: 'usr-5',
    coordinatorName: 'Coordinator Dawit Bekele',
    maxAssignment: 15,
    maxQuiz: 15,
    maxMidterm: 20,
    maxFinal: 50,
    status: 'ACTIVE',
  },
  {
    id: 'crs-202',
    code: 'CS202',
    title: 'Software Engineering Principles',
    amharicTitle: 'የሶፍትዌር ኢንጂነሪንግ መሠረቶች',
    creditHours: 3,
    classId: 'cls-4',
    semester: 'Semester II',
    academicYear: '2025/2026',
    teacherId: 'usr-4',
    teacherName: 'Instructor Tigist Haile',
    coordinatorId: 'usr-5',
    coordinatorName: 'Coordinator Dawit Bekele',
    maxAssignment: 20,
    maxQuiz: 10,
    maxMidterm: 20,
    maxFinal: 50,
    status: 'ACTIVE',
  },
];

let students = [
  {
    id: 'std-1',
    studentId: 'ST-2026-001',
    firstName: 'Abebe',
    lastName: 'Girma',
    amharicName: 'አበበ ግርማ',
    gender: 'Male',
    email: 'abebe.girma@student.amras.edu',
    phone: '+251 922 111111',
    classId: 'cls-1',
    className: 'Class 1',
    section: 'A',
    academicYear: '2025/2026',
    status: 'ACTIVE',
  },
  {
    id: 'std-2',
    studentId: 'ST-2026-002',
    firstName: 'Hana',
    lastName: 'Alemu',
    amharicName: 'ሃና አለሙ',
    gender: 'Female',
    email: 'hana.alemu@student.amras.edu',
    phone: '+251 922 222222',
    classId: 'cls-1',
    className: 'Class 1',
    section: 'A',
    academicYear: '2025/2026',
    status: 'ACTIVE',
  },
  {
    id: 'std-3',
    studentId: 'ST-2026-003',
    firstName: 'Kebede',
    lastName: 'Mulugeta',
    amharicName: 'ከበደ ሙሉጌታ',
    gender: 'Male',
    email: 'kebede.m@student.amras.edu',
    phone: '+251 922 333333',
    classId: 'cls-1',
    className: 'Class 1',
    section: 'A',
    academicYear: '2025/2026',
    status: 'ACTIVE',
  },
  {
    id: 'std-4',
    studentId: 'ST-2026-004',
    firstName: 'Makeda',
    lastName: 'Taye',
    amharicName: 'ማክዳ ታዬ',
    gender: 'Female',
    email: 'makeda.t@student.amras.edu',
    phone: '+251 922 444444',
    classId: 'cls-1',
    className: 'Class 1',
    section: 'B',
    academicYear: '2025/2026',
    status: 'ACTIVE',
  },
  {
    id: 'std-5',
    studentId: 'ST-2026-005',
    firstName: 'Yonas',
    lastName: 'Kassa',
    amharicName: 'ዮናስ ካሣ',
    gender: 'Male',
    email: 'yonas.k@student.amras.edu',
    phone: '+251 922 555555',
    classId: 'cls-2',
    className: 'Class 2',
    section: 'A',
    academicYear: '2025/2026',
    status: 'ACTIVE',
  },
];

let marks: any[] = [
  // Course CS101 Marks
  {
    id: 'mrk-1',
    studentId: 'std-1',
    studentCode: 'ST-2026-001',
    studentName: 'Abebe Girma',
    studentAmharicName: 'አበበ ግርማ',
    courseId: 'crs-101',
    assignment: 14,
    quiz: 9,
    midterm: 23,
    final: 46,
    total: 92,
    grade: 'A+',
    gradePoint: 4.0,
    status: 'SUBMITTED',
  },
  {
    id: 'mrk-2',
    studentId: 'std-2',
    studentCode: 'ST-2026-002',
    studentName: 'Hana Alemu',
    studentAmharicName: 'ሃና አለሙ',
    courseId: 'crs-101',
    assignment: 13,
    quiz: 8,
    midterm: 21,
    final: 43,
    total: 85,
    grade: 'A',
    gradePoint: 4.0,
    status: 'SUBMITTED',
  },
  {
    id: 'mrk-3',
    studentId: 'std-3',
    studentCode: 'ST-2026-003',
    studentName: 'Kebede Mulugeta',
    studentAmharicName: 'ከበደ ሙሉጌታ',
    courseId: 'crs-101',
    assignment: 10,
    quiz: 6,
    midterm: 18,
    final: 38,
    total: 72,
    grade: 'C+',
    gradePoint: 2.5,
    status: 'SUBMITTED',
  },
  {
    id: 'mrk-4',
    studentId: 'std-4',
    studentCode: 'ST-2026-004',
    studentName: 'Makeda Taye',
    studentAmharicName: 'ማክዳ ታዬ',
    courseId: 'crs-101',
    assignment: 12,
    quiz: 7,
    midterm: 20,
    final: 41,
    total: 80,
    grade: 'B+',
    gradePoint: 3.5,
    status: 'SUBMITTED',
  },

  // Course TH101 Marks
  {
    id: 'mrk-5',
    studentId: 'std-1',
    studentCode: 'ST-2026-001',
    studentName: 'Abebe Girma',
    studentAmharicName: 'አበበ ግርማ',
    courseId: 'crs-103',
    assignment: 18,
    quiz: 9,
    midterm: 18,
    final: 45,
    total: 90,
    grade: 'A+',
    gradePoint: 4.0,
    status: 'SUBMITTED',
  },
  {
    id: 'mrk-6',
    studentId: 'std-2',
    studentCode: 'ST-2026-002',
    studentName: 'Hana Alemu',
    studentAmharicName: 'ሃና አለሙ',
    courseId: 'crs-103',
    assignment: 19,
    quiz: 10,
    midterm: 19,
    final: 47,
    total: 95,
    grade: 'A+',
    gradePoint: 4.0,
    status: 'APPROVED',
  },
  {
    id: 'mrk-7',
    studentId: 'std-3',
    studentCode: 'ST-2026-003',
    studentName: 'Kebede Mulugeta',
    studentAmharicName: 'ከበደ ሙሉጌታ',
    courseId: 'crs-103',
    assignment: 15,
    quiz: 7,
    midterm: 14,
    final: 39,
    total: 75,
    grade: 'B',
    gradePoint: 3.0,
    status: 'SUBMITTED',
  },
  {
    id: 'mrk-8',
    studentId: 'std-4',
    studentCode: 'ST-2026-004',
    studentName: 'Makeda Taye',
    studentAmharicName: 'ማክዳ ታዬ',
    courseId: 'crs-103',
    assignment: 17,
    quiz: 8,
    midterm: 16,
    final: 41,
    total: 82,
    grade: 'A-',
    gradePoint: 3.75,
    status: 'APPROVED',
  },

  // Course ETH101 Marks
  {
    id: 'mrk-9',
    studentId: 'std-1',
    studentCode: 'ST-2026-001',
    studentName: 'Abebe Girma',
    studentAmharicName: 'አበበ ግርማ',
    courseId: 'crs-104',
    assignment: 17,
    quiz: 8,
    midterm: 18,
    final: 44,
    total: 87,
    grade: 'A',
    gradePoint: 4.0,
    status: 'SUBMITTED',
  },
  {
    id: 'mrk-10',
    studentId: 'std-2',
    studentCode: 'ST-2026-002',
    studentName: 'Hana Alemu',
    studentAmharicName: 'ሃና አለሙ',
    courseId: 'crs-104',
    assignment: 18,
    quiz: 9,
    midterm: 19,
    final: 46,
    total: 92,
    grade: 'A+',
    gradePoint: 4.0,
    status: 'APPROVED',
  },
  {
    id: 'mrk-11',
    studentId: 'std-3',
    studentCode: 'ST-2026-003',
    studentName: 'Kebede Mulugeta',
    studentAmharicName: 'ከበደ ሙሉጌታ',
    courseId: 'crs-104',
    assignment: 12,
    quiz: 6,
    midterm: 15,
    final: 35,
    total: 68,
    grade: 'C+',
    gradePoint: 2.5,
    status: 'SUBMITTED',
  },
  {
    id: 'mrk-12',
    studentId: 'std-4',
    studentCode: 'ST-2026-004',
    studentName: 'Makeda Taye',
    studentAmharicName: 'ማክዳ ታዬ',
    courseId: 'crs-104',
    assignment: 16,
    quiz: 8,
    midterm: 17,
    final: 43,
    total: 84,
    grade: 'A',
    gradePoint: 4.0,
    status: 'APPROVED',
  },
];

let submissionReviews: any[] = [
  {
    id: 'sub-1',
    courseId: 'crs-101',
    courseCode: 'CS101',
    courseTitle: 'Introduction to Computer Programming',
    teacherId: 'usr-3',
    teacherName: 'Instructor Abebe Kebede',
    coordinatorId: 'usr-5',
    coordinatorName: 'Coordinator Dawit Bekele',
    studentCount: 4,
    submittedAt: '2026-02-10T10:30:00Z',
    status: 'SUBMITTED',
    averageScore: 82.25,
    passRate: 100,
  },
];

let schedules = [
  {
    id: 'sch-1',
    courseId: 'crs-101',
    courseCode: 'CS101',
    courseTitle: 'Intro to Programming',
    classId: 'cls-1',
    className: 'Class 1',
    section: 'A',
    teacherId: 'usr-3',
    teacherName: 'Instructor Abebe Kebede',
    day: 'Monday',
    startTime: '08:30',
    endTime: '10:30',
    room: 'Lab 101',
  },
  {
    id: 'sch-2',
    courseId: 'crs-102',
    courseCode: 'CS102',
    courseTitle: 'Data Structures',
    classId: 'cls-2',
    className: 'Class 2',
    section: 'A',
    teacherId: 'usr-3',
    teacherName: 'Instructor Abebe Kebede',
    day: 'Wednesday',
    startTime: '10:30',
    endTime: '12:30',
    room: 'Hall 202',
  },
  {
    id: 'sch-3',
    courseId: 'crs-201',
    courseCode: 'CS201',
    courseTitle: 'Database Systems',
    classId: 'cls-3',
    className: 'Class 3',
    section: 'A',
    teacherId: 'usr-4',
    teacherName: 'Instructor Tigist Haile',
    day: 'Tuesday',
    startTime: '08:30',
    endTime: '10:30',
    room: 'Lab 103',
  },
];

let auditLogs = [
  {
    id: 'log-1',
    timestamp: '2026-02-10T10:30:00Z',
    userId: 'usr-3',
    userName: 'Instructor Abebe Kebede',
    userRole: 'TEACHER',
    action: 'MARKS_SUBMITTED',
    details: 'Submitted marks for CS101 (4 students)',
    ip: '192.168.1.42',
  },
  {
    id: 'log-2',
    timestamp: '2026-02-09T14:15:00Z',
    userId: 'usr-2',
    userName: 'Prof. Alemayehu Worku',
    userRole: 'DEPT_HEAD',
    action: 'SCHEDULE_CREATED',
    details: 'Assigned CS201 to Lab 103 on Tuesday',
    ip: '192.168.1.10',
  },
];

let attendanceRecords: any[] = [
  {
    id: 'att-1',
    date: new Date().toISOString().split('T')[0],
    classId: 'cls-1',
    className: 'Class 1',
    section: 'A',
    takenByUserId: 'usr-1',
    takenByUserName: 'Ashenafi Sentayehu',
    entries: [
      { studentId: 'std-1', studentCode: 'ST-2026-001', studentName: 'Abebe Girma', studentAmharicName: 'አበበ ግርማ', status: 'PRESENT', remark: 'On time' },
      { studentId: 'std-2', studentCode: 'ST-2026-002', studentName: 'Hana Alemu', studentAmharicName: 'ሃና አለሙ', status: 'PRESENT', remark: '' },
      { studentId: 'std-3', studentCode: 'ST-2026-003', studentName: 'Kebede Mulugeta', studentAmharicName: 'ከበደ ሙሉጌታ', status: 'LATE', remark: 'Arrived 15m late' },
      { studentId: 'std-4', studentCode: 'ST-2026-004', studentName: 'Makeda Taye', studentAmharicName: 'ማክዳ ታዬ', status: 'PRESENT', remark: '' },
    ],
    createdAt: new Date().toISOString(),
  },
];

let notifications = [
  {
    id: 'notif-1',
    timestamp: '2026-02-10T10:30:00Z',
    userId: 'usr-5',
    title: 'New Mark Submission',
    message: 'Instructor Abebe Kebede submitted marks for CS101 for review.',
    read: false,
    type: 'info',
  },
  {
    id: 'notif-2',
    timestamp: '2026-02-09T09:00:00Z',
    userId: 'usr-3',
    title: 'Schedule Updated',
    message: 'Your teaching schedule for CS101 has been confirmed.',
    read: true,
    type: 'success',
  },
];

// Grade Calculator Helper
function calculateGrade(total: number) {
  if (total >= 90) return { grade: 'A+', point: 4.0 };
  if (total >= 85) return { grade: 'A', point: 4.0 };
  if (total >= 80) return { grade: 'B+', point: 3.5 };
  if (total >= 75) return { grade: 'B', point: 3.0 };
  if (total >= 70) return { grade: 'C+', point: 2.5 };
  if (total >= 65) return { grade: 'C', point: 2.0 };
  if (total >= 50) return { grade: 'D', point: 1.0 };
  return { grade: 'F', point: 0.0 };
}

// REST API ROUTES

// Auth Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials or user not found.' });
  }

  // Record Audit Log
  const logObj = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    userRole: user.role as any,
    action: 'USER_LOGIN',
    details: `User ${user.email} logged in successfully`,
    ip: req.ip || '127.0.0.1',
  };
  auditLogs.unshift(logObj);
  dbSaveDoc('auditLogs', logObj.id, logObj);

  res.json({
    success: true,
    token: `jwt-simulated-token-${user.id}-${Date.now()}`,
    user,
  });
});

// Users
app.get('/api/users', (req: Request, res: Response) => {
  res.json({ success: true, data: users });
});

app.post('/api/users', async (req: Request, res: Response) => {
  const newUser = {
    id: `usr-${Date.now()}`,
    ...req.body,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  await dbSaveDoc('users', newUser.id, newUser);
  res.json({ success: true, data: newUser });
});

app.put('/api/users/:id/profile', async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const { name, amharicName, email, phone, department, avatar } = req.body;
  if (name !== undefined) user.name = name;
  if (amharicName !== undefined) user.amharicName = amharicName;
  if (email !== undefined) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (department !== undefined) user.department = department;
  if (avatar !== undefined) (user as any).avatar = avatar;

  await dbSaveDoc('users', user.id, user);
  res.json({ success: true, data: user });
});

// Academic Classes & Years
app.get('/api/classes', (req: Request, res: Response) => {
  res.json({ success: true, data: academicClasses });
});

app.post('/api/classes', async (req: Request, res: Response) => {
  const { name, amharicName, level, academicYear, sections, semesters } = req.body;
  const newClass = {
    id: `cls-${Date.now()}`,
    name: name || `Class ${academicClasses.length + 1}`,
    amharicName: amharicName || `ደረጃ ${academicClasses.length + 1}`,
    level: Number(level) || (academicClasses.length + 1),
    academicYear: academicYear || '2025/2026',
    sections: Array.isArray(sections) ? sections : ['A'],
    semesters: Array.isArray(semesters) && semesters.length > 0 ? semesters : ['Semester I', 'Semester II'],
  };
  academicClasses.push(newClass);
  await dbSaveDoc('academicClasses', newClass.id, newClass);
  res.json({ success: true, data: newClass });
});

app.put('/api/classes/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const index = academicClasses.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Class not found' });
  }
  academicClasses[index] = {
    ...academicClasses[index],
    ...req.body,
  };
  await dbSaveDoc('academicClasses', academicClasses[index].id, academicClasses[index]);
  res.json({ success: true, data: academicClasses[index] });
});

app.get('/api/academic-years', (req: Request, res: Response) => {
  res.json({ success: true, data: academicYears });
});

app.post('/api/academic-years', async (req: Request, res: Response) => {
  const { year } = req.body;
  if (year && !academicYears.includes(year)) {
    academicYears.push(year);
    await dbSaveDoc('academicYears', year, { id: year, year });
  }
  res.json({ success: true, data: academicYears });
});

// Courses
app.get('/api/courses', (req: Request, res: Response) => {
  res.json({ success: true, data: courses });
});

app.post('/api/courses', async (req: Request, res: Response) => {
  const newCourse = {
    id: `crs-${Date.now()}`,
    ...req.body,
    status: 'ACTIVE',
  };
  courses.push(newCourse);
  await dbSaveDoc('courses', newCourse.id, newCourse);
  res.json({ success: true, data: newCourse });
});

app.put('/api/courses/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const index = courses.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  courses[index] = {
    ...courses[index],
    ...req.body,
  };
  await dbSaveDoc('courses', courses[index].id, courses[index]);
  res.json({ success: true, data: courses[index] });
});

// Students
app.get('/api/students', (req: Request, res: Response) => {
  res.json({ success: true, data: students });
});

app.post('/api/students', async (req: Request, res: Response) => {
  const newStudent = {
    id: `std-${Date.now()}`,
    studentId: req.body.studentId || `ST-2026-${Math.floor(100 + Math.random() * 900)}`,
    ...req.body,
    status: 'ACTIVE',
  };
  students.push(newStudent);
  await dbSaveDoc('students', newStudent.id, newStudent);
  res.json({ success: true, data: newStudent });
});

app.put('/api/students/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const index = students.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }
  students[index] = { ...students[index], ...req.body };
  await dbSaveDoc('students', id, students[index]);
  res.json({ success: true, data: students[index] });
});

app.delete('/api/students/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  students = students.filter((s) => s.id !== id);
  await dbDeleteDoc('students', id);
  res.json({ success: true, message: 'Student removed' });
});

// Marks
app.get('/api/marks', (req: Request, res: Response) => {
  const { courseId } = req.query;
  if (courseId) {
    const courseMarks = marks.filter((m) => m.courseId === courseId);
    return res.json({ success: true, data: courseMarks });
  }
  res.json({ success: true, data: marks });
});

app.post('/api/marks/save', async (req: Request, res: Response) => {
  const { courseId, entries, isSubmit, teacherId, teacherName } = req.body;

  for (const entry of entries) {
    let total = Number(entry.assignment || 0) + Number(entry.quiz || 0) + Number(entry.midterm || 0) + Number(entry.final || 0);
    if (entry.customMarks && typeof entry.customMarks === 'object') {
      Object.values(entry.customMarks).forEach((val: any) => {
        total += Number(val || 0);
      });
    }

    const { grade, point } = calculateGrade(total);

    const existingIndex = marks.findIndex((m) => m.studentId === entry.studentId && m.courseId === courseId);

    const markObj = {
      id: existingIndex >= 0 ? marks[existingIndex].id : `mrk-${Date.now()}-${entry.studentId}`,
      studentId: entry.studentId,
      studentCode: entry.studentCode,
      studentName: entry.studentName,
      studentAmharicName: entry.studentAmharicName,
      courseId,
      assignment: Number(entry.assignment || 0),
      quiz: Number(entry.quiz || 0),
      midterm: Number(entry.midterm || 0),
      final: Number(entry.final || 0),
      customMarks: entry.customMarks || {},
      total,
      grade,
      gradePoint: point,
      status: isSubmit ? 'SUBMITTED' : ('DRAFT' as any),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      marks[existingIndex] = markObj;
    } else {
      marks.push(markObj);
    }
    await dbSaveDoc('marks', markObj.id, markObj);
  }

  if (isSubmit) {
    // Add or update review submission
    const courseObj = courses.find((c) => c.id === courseId);
    const existingSub = submissionReviews.find((s) => s.courseId === courseId);
    const updatedSub = {
      id: existingSub ? existingSub.id : `sub-${Date.now()}`,
      courseId,
      courseCode: courseObj?.code || 'CS',
      courseTitle: courseObj?.title || 'Course Title',
      teacherId: teacherId || 'usr-3',
      teacherName: teacherName || 'Instructor Abebe',
      coordinatorId: courseObj?.coordinatorId || 'usr-5',
      coordinatorName: courseObj?.coordinatorName || 'Coordinator Dawit',
      studentCount: entries.length,
      submittedAt: new Date().toISOString(),
      status: 'SUBMITTED' as any,
    };

    if (existingSub) {
      const idx = submissionReviews.findIndex((s) => s.id === existingSub.id);
      submissionReviews[idx] = updatedSub;
    } else {
      submissionReviews.push(updatedSub);
    }
    await dbSaveDoc('submissionReviews', updatedSub.id, updatedSub);

    // Add Audit Log
    const logObj = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: teacherId || 'usr-3',
      userName: teacherName || 'Instructor',
      userRole: 'TEACHER',
      action: 'MARKS_SUBMITTED',
      details: `Submitted marks for ${courseObj?.code} (${entries.length} students)`,
      ip: req.ip || '127.0.0.1',
    };
    auditLogs.unshift(logObj);
    await dbSaveDoc('auditLogs', logObj.id, logObj);

    // Resolve class details
    const classObj = academicClasses.find((cls) => cls.id === courseObj?.classId);
    const classNameDisplay = classObj ? `${classObj.name} (${classObj.amharicName})` : (courseObj?.classId || 'Class');

    // Notify ALL Admins, Dept Heads, and Coordinators
    const adminRecipients = users.filter(
      (u) => u.role === 'ADMIN' || u.role === 'DEPT_HEAD' || u.role === 'COORDINATOR' || u.id === courseObj?.coordinatorId
    );
    const recipientIds = Array.from(new Set(adminRecipients.map((u) => u.id)));

    recipientIds.forEach((adminId) => {
      notifications.unshift({
        id: `notif-${Date.now()}-${adminId}`,
        timestamp: new Date().toISOString(),
        userId: adminId,
        title: 'New Teacher Result Submission',
        message: `Teacher ${teacherName || 'Instructor'} submitted student results for course ${courseObj?.code || ''} (${courseObj?.title || ''}) taught in ${classNameDisplay}.`,
        read: false,
        type: 'info',
      });
    });
  }

  res.json({ success: true, message: isSubmit ? 'Submitted successfully' : 'Draft saved' });
});

// Results Analysis
app.get('/api/results/course/:courseId', (req: Request, res: Response) => {
  const { courseId } = req.params;
  const courseObj = courses.find((c) => c.id === courseId);
  const courseMarks = marks.filter((m) => m.courseId === courseId);

  if (courseMarks.length === 0) {
    return res.json({
      success: true,
      data: {
        course: courseObj,
        hasMarks: false,
        totalStudents: 0,
        rankings: [],
      },
    });
  }

  const totals = courseMarks.map((m) => m.total);
  const highest = Math.max(...totals);
  const lowest = Math.min(...totals);
  const avg = Number((totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(1));
  const passCount = courseMarks.filter((m) => m.total >= 50).length;
  const passRate = Number(((passCount / courseMarks.length) * 100).toFixed(1));
  const failRate = Number((100 - passRate).toFixed(1));

  // Sort by Total Descending for Rankings
  const sorted = [...courseMarks].sort((a, b) => b.total - a.total);
  const rankings = sorted.map((m, index) => ({
    rank: index + 1,
    ...m,
  }));

  // Grade Distribution
  const gradeDist: Record<string, number> = { 'A+': 0, A: 0, 'B+': 0, B: 0, 'C+': 0, C: 0, D: 0, F: 0 };
  courseMarks.forEach((m) => {
    gradeDist[m.grade] = (gradeDist[m.grade] || 0) + 1;
  });

  res.json({
    success: true,
    data: {
      course: courseObj,
      hasMarks: true,
      totalStudents: courseMarks.length,
      highest,
      lowest,
      classAverage: avg,
      passRate,
      failRate,
      rankings,
      gradeDistribution: Object.entries(gradeDist).map(([grade, count]) => ({ grade, count })),
    },
  });
});

// Review Queue / Submissions
app.get('/api/submissions', (req: Request, res: Response) => {
  res.json({ success: true, data: submissionReviews });
});

app.post('/api/submissions/:id/approve', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reviewerId, reviewerName } = req.body;
  const sub = submissionReviews.find((s) => s.id === id);

  if (sub) {
    sub.status = 'APPROVED';
    sub.reviewedAt = new Date().toISOString();
    await dbSaveDoc('submissionReviews', sub.id, sub);

    // Mark corresponding marks as APPROVED
    for (const m of marks) {
      if (m.courseId === sub.courseId) {
        m.status = 'APPROVED';
        await dbSaveDoc('marks', m.id, m);
      }
    }

    // Add Audit Log
    const logObj = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: reviewerId || 'usr-5',
      userName: reviewerName || 'Coordinator',
      userRole: 'COORDINATOR',
      action: 'MARKS_APPROVED',
      details: `Approved marks for ${sub.courseCode}`,
      ip: req.ip || '127.0.0.1',
    };
    auditLogs.unshift(logObj);
    await dbSaveDoc('auditLogs', logObj.id, logObj);

    // Notify Teacher
    notifications.unshift({
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: sub.teacherId,
      title: 'Marks Approved',
      message: `Your submitted marks for ${sub.courseCode} have been approved!`,
      read: false,
      type: 'success',
    });
  }

  res.json({ success: true, message: 'Submission approved' });
});

app.post('/api/submissions/:id/reject', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reviewerId, reviewerName, reason } = req.body;
  const sub = submissionReviews.find((s) => s.id === id);

  if (sub) {
    sub.status = 'REJECTED';
    sub.rejectionReason = reason;
    sub.reviewedAt = new Date().toISOString();
    await dbSaveDoc('submissionReviews', sub.id, sub);

    // Set marks back to REJECTED with reason
    for (const m of marks) {
      if (m.courseId === sub.courseId) {
        m.status = 'REJECTED';
        m.rejectionReason = reason;
        await dbSaveDoc('marks', m.id, m);
      }
    }

    // Audit Log
    const logObj = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: reviewerId || 'usr-5',
      userName: reviewerName || 'Coordinator',
      userRole: 'COORDINATOR',
      action: 'MARKS_REJECTED',
      details: `Rejected marks for ${sub.courseCode}. Reason: ${reason}`,
      ip: req.ip || '127.0.0.1',
    };
    auditLogs.unshift(logObj);
    await dbSaveDoc('auditLogs', logObj.id, logObj);

    // Notify Teacher
    notifications.unshift({
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: sub.teacherId,
      title: 'Marks Revision Requested',
      message: `Your marks for ${sub.courseCode} need revision. Reason: "${reason}"`,
      read: false,
      type: 'danger',
    });
  }

  res.json({ success: true, message: 'Submission rejected' });
});

// Schedules
app.get('/api/schedules', (req: Request, res: Response) => {
  res.json({ success: true, data: schedules });
});

app.post('/api/schedules', async (req: Request, res: Response) => {
  const newSched = req.body;

  // Conflict Detection: check if same teacher or room at same day and overlapping time
  const conflict = schedules.find((s) => {
    if (s.day !== newSched.day) return false;
    const sameTeacher = s.teacherId === newSched.teacherId;
    const sameRoom = s.room.toLowerCase() === newSched.room.toLowerCase();

    if (!sameTeacher && !sameRoom) return false;

    // Overlap check
    const startA = s.startTime;
    const endA = s.endTime;
    const startB = newSched.startTime;
    const endB = newSched.endTime;

    return startA < endB && startB < endA;
  });

  if (conflict) {
    return res.status(409).json({
      success: false,
      message: `Schedule Conflict! ${conflict.room} or instructor ${conflict.teacherName} is already assigned on ${conflict.day} (${conflict.startTime}-${conflict.endTime}) for ${conflict.courseCode}.`,
    });
  }

  const added = {
    id: `sch-${Date.now()}`,
    ...newSched,
  };
  schedules.push(added);
  await dbSaveDoc('schedules', added.id, added);

  res.json({ success: true, data: added });
});

app.put('/api/schedules/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const index = schedules.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Schedule not found' });
  }

  const newSched = req.body;

  const conflict = schedules.find((s) => {
    if (s.id === id) return false;
    if (s.day !== newSched.day) return false;
    const sameTeacher = s.teacherId === newSched.teacherId;
    const sameRoom = s.room.toLowerCase() === (newSched.room || '').toLowerCase();

    if (!sameTeacher && !sameRoom) return false;

    const startA = s.startTime;
    const endA = s.endTime;
    const startB = newSched.startTime;
    const endB = newSched.endTime;

    return startA < endB && startB < endA;
  });

  if (conflict) {
    return res.status(409).json({
      success: false,
      message: `Schedule Conflict! ${conflict.room} or instructor ${conflict.teacherName} is already assigned on ${conflict.day} (${conflict.startTime}-${conflict.endTime}) for ${conflict.courseCode}.`,
    });
  }

  schedules[index] = {
    ...schedules[index],
    ...newSched,
  };
  await dbSaveDoc('schedules', id, schedules[index]);

  res.json({ success: true, data: schedules[index] });
});

app.delete('/api/schedules/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  schedules = schedules.filter((s) => s.id !== id);
  await dbDeleteDoc('schedules', id);
  res.json({ success: true, message: 'Schedule removed' });
});

// Attendance Tracking Routes
app.get('/api/attendance', (req: Request, res: Response) => {
  const { classId, date } = req.query;
  let filtered = attendanceRecords;
  if (classId) {
    filtered = filtered.filter((a) => a.classId === classId);
  }
  if (date) {
    filtered = filtered.filter((a) => a.date === date);
  }
  res.json({ success: true, data: filtered });
});

app.post('/api/attendance', async (req: Request, res: Response) => {
  const { classId, className, section, date, takenByUserId, takenByUserName, entries } = req.body;

  const existingIdx = attendanceRecords.findIndex((a) => a.classId === classId && a.date === date);

  const recordObj = {
    id: existingIdx >= 0 ? attendanceRecords[existingIdx].id : `att-${Date.now()}`,
    classId,
    className,
    section: section || 'A',
    date,
    takenByUserId,
    takenByUserName,
    entries,
    createdAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    attendanceRecords[existingIdx] = recordObj;
  } else {
    attendanceRecords.unshift(recordObj);
  }
  await dbSaveDoc('attendanceRecords', recordObj.id, recordObj);

  // Audit log entry
  const logObj = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: takenByUserId || 'usr-1',
    userName: takenByUserName || 'System',
    userRole: 'TEACHER',
    action: 'ATTENDANCE_TAKEN',
    details: `Recorded attendance for ${className} on ${date} (${entries.length} students)`,
    ip: req.ip || '127.0.0.1',
  };
  auditLogs.unshift(logObj);
  await dbSaveDoc('auditLogs', logObj.id, logObj);

  res.json({ success: true, data: recordObj });
});

// Audit Logs
app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json({ success: true, data: auditLogs });
});

// Notifications
app.get('/api/notifications', (req: Request, res: Response) => {
  const { userId } = req.query;
  const userNotifs = notifications.filter((n) => !userId || n.userId === userId);
  res.json({ success: true, data: userNotifs });
});

app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const notif = notifications.find((n) => n.id === id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

// Firestore Initialization and Seeding Data Sync
async function initFirestoreData() {
  if (!db) return;
  try {
    const dbUsers = await dbGetCollection('users');
    if (dbUsers && dbUsers.length > 0) {
      console.log('🔄 Loading persisted records from Cloud Firestore database...');
      users = dbUsers;

      const dbClasses = await dbGetCollection('academicClasses');
      if (dbClasses.length > 0) academicClasses = dbClasses;

      const dbYears = await dbGetCollection('academicYears');
      if (dbYears.length > 0) academicYears = dbYears.map((y: any) => y.year || y.id);

      const dbCourses = await dbGetCollection('courses');
      if (dbCourses.length > 0) courses = dbCourses;

      const dbStudents = await dbGetCollection('students');
      if (dbStudents.length > 0) students = dbStudents;

      const dbMarks = await dbGetCollection('marks');
      if (dbMarks.length > 0) marks = dbMarks;

      const dbSubmissions = await dbGetCollection('submissionReviews');
      if (dbSubmissions.length > 0) submissionReviews = dbSubmissions;

      const dbSchedules = await dbGetCollection('schedules');
      if (dbSchedules.length > 0) schedules = dbSchedules;

      const dbAttendance = await dbGetCollection('attendanceRecords');
      if (dbAttendance.length > 0) attendanceRecords = dbAttendance;

      const dbAuditLogs = await dbGetCollection('auditLogs');
      if (dbAuditLogs.length > 0) auditLogs = dbAuditLogs;

      console.log(`✅ Firestore loaded: ${students.length} students, ${marks.length} mark records, and ${attendanceRecords.length} attendance logs.`);
    } else {
      console.log('🌱 Seeding initial records to Cloud Firestore database...');
      for (const u of users) await dbSaveDoc('users', u.id, u);
      for (const c of academicClasses) await dbSaveDoc('academicClasses', c.id, c);
      for (const y of academicYears) await dbSaveDoc('academicYears', y, { id: y, year: y });
      for (const crs of courses) await dbSaveDoc('courses', crs.id, crs);
      for (const st of students) await dbSaveDoc('students', st.id, st);
      for (const m of marks) await dbSaveDoc('marks', m.id, m);
      for (const s of submissionReviews) await dbSaveDoc('submissionReviews', s.id, s);
      for (const sch of schedules) await dbSaveDoc('schedules', sch.id, sch);
      for (const att of attendanceRecords) await dbSaveDoc('attendanceRecords', att.id, att);
      for (const log of auditLogs) await dbSaveDoc('auditLogs', log.id, log);
      console.log('✅ Initial database seed complete in Firestore!');
    }
  } catch (err) {
    console.error('Error during Firestore data initialization:', err);
  }
}

// Vite Development or Static Production Middleware
async function startServer() {
  await initFirestoreData();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AMRAS Backend & Vite Frontend Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
