import { db, dbGetCollection, dbSaveDoc } from '../db/firebase';

// In-Memory Database Collections (Synchronized with Firestore)
export let users: any[] = [
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

export let academicYears: string[] = ['2024/2025', '2025/2026', '2026/2027', '2027/2028'];

export let academicClasses: any[] = [
  { id: 'cls-1', name: 'Class 1', amharicName: 'ደረጃ 1', level: 1, academicYear: '2025/2026', sections: ['A', 'B'], semesters: ['Semester I', 'Semester II'] },
  { id: 'cls-2', name: 'Class 2', amharicName: 'ደረጃ 2', level: 2, academicYear: '2025/2026', sections: ['A', 'B'], semesters: ['Semester I', 'Semester II'] },
  { id: 'cls-3', name: 'Class 3', amharicName: 'ደረጃ 3', level: 3, academicYear: '2025/2026', sections: ['A', 'B', 'C'], semesters: ['Semester I', 'Semester II'] },
  { id: 'cls-4', name: 'Class 4', amharicName: 'ደረጃ 4', level: 4, academicYear: '2025/2026', sections: ['A', 'B'], semesters: ['Semester I', 'Semester II'] },
  { id: 'cls-5', name: 'Class 5', amharicName: 'ደረጃ 5', level: 5, academicYear: '2025/2026', sections: ['A'], semesters: ['Semester I', 'Semester II'] },
  { id: 'cls-6', name: 'Class 6', amharicName: 'ደረጃ 6', level: 6, academicYear: '2025/2026', sections: ['A'], semesters: ['Semester I', 'Semester II'] },
  { id: 'cls-7', name: 'Class 7', amharicName: 'ደረጃ 7', level: 7, academicYear: '2025/2026', sections: ['A'], semesters: ['Semester I', 'Semester II'] },
  { id: 'cls-8', name: 'Class 8', amharicName: 'ደረጃ 8', level: 8, academicYear: '2025/2026', sections: ['A'], semesters: ['Semester I', 'Semester II'] },
];

export let courses: any[] = [
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

export let students: any[] = [
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

export let marks: any[] = [
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

export let submissionReviews: any[] = [
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

export let schedules: any[] = [
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

export let auditLogs: any[] = [
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

export let attendanceRecords: any[] = [
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

export let notifications: any[] = [
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

// Mutator helpers
export function setStudents(newStudents: any[]) {
  students = newStudents;
}

// Grade Calculator Helper
export function calculateGrade(total: number) {
  if (total >= 90) return { grade: 'A+', point: 4.0 };
  if (total >= 85) return { grade: 'A', point: 4.0 };
  if (total >= 80) return { grade: 'B+', point: 3.5 };
  if (total >= 75) return { grade: 'B', point: 3.0 };
  if (total >= 70) return { grade: 'C+', point: 2.5 };
  if (total >= 65) return { grade: 'C', point: 2.0 };
  if (total >= 60) return { grade: 'C-', point: 1.75 };
  if (total >= 50) return { grade: 'D', point: 1.0 };
  return { grade: 'F', point: 0.0 };
}

// Firestore Initialization and Seeding Sync
export async function initFirestoreData() {
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
