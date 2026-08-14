import { db, dbGetCollection, dbSaveDoc } from '../db/firebase';

// In-Memory Database Collections (Synchronized with Firestore)
export let users: any[] = [
  {
    id: 'usr-1',
    name: 'Ashenafi Sentayehu',
    amharicName: 'አሸናፊ ስንታየሁ',
    email: 'ashu@admin.edu',
    password: 'Admin@123!',
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
    email: 'head@head.edu',
    password: 'Head@123!',
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
    email: 'teacher@class.edu',
    password: 'Teacher@123!',
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
    email: 'teacher2@class.edu',
    password: 'Teacher@123!',
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
    password: 'Coordinator@123!',
    phone: '+251 911 678901',
    employeeId: 'CRD-401',
    role: 'COORDINATOR',
    status: 'ACTIVE',
    department: 'ህጻናት እና አዳጊ',
    createdAt: '2026-01-18T08:00:00Z',
  },
];

export let academicYears: string[] = ['2024/2025', '2025/2026', '2026/2027', '2027/2028'];

export const defaultEightClasses: any[] = [
  { id: 'cls-1', name: 'Medebe Lukas', amharicName: 'ምደባ ሉቃስ', level: 1, academicYear: '2025/2026', sections: ['A', 'B'], semesters: ['Semester I', 'Semester II'] },
  { id: 'cls-2', name: 'Medebe Matewos', amharicName: 'ምደባ ማቴዎስ', level: 2, academicYear: '2025/2026', sections: ['A', 'B'], semesters: ['Semester I', 'Semester II'] },
  { id: 'cls-3', name: 'Medebe Markos', amharicName: 'ምደባ ማርቆስ', level: 3, academicYear: '2025/2026', sections: ['A', 'B', 'C'], semesters: ['Semester I', 'Semester II'] },
  { id: 'cls-4', name: 'Medebe Yohannes', amharicName: 'ምደባ ዮሐንስ', level: 4, academicYear: '2025/2026', sections: ['A', 'B'], semesters: ['Semester I', 'Semester II'] },
  { id: 'cls-5', name: 'Medebe Pawlos', amharicName: 'ምደባ ጳውሎስ', level: 5, academicYear: '2025/2026', sections: ['A', 'B'], semesters: ['Semester I', 'Semester II'] },
  { id: 'cls-6', name: 'Medebe Petros', amharicName: 'ምደባ ጴጥሮስ', level: 6, academicYear: '2025/2026', sections: ['A', 'B'], semesters: ['Semester I', 'Semester II'] },
  { id: 'cls-7', name: 'Medebe Estifanos', amharicName: 'ምደባ እስጢፋኖስ', level: 7, academicYear: '2025/2026', sections: ['A', 'B'], semesters: ['Semester I', 'Semester II'] },
  { id: 'cls-8', name: 'Medebe Dawit', amharicName: 'ምደባ ዳዊት', level: 8, academicYear: '2025/2026', sections: ['A', 'B'], semesters: ['Semester I', 'Semester II'] },
];

export let academicClasses: any[] = [...defaultEightClasses];

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
  {
    id: 'crs-301',
    code: 'GE101',
    title: "Ge'ez Language & Grammar",
    amharicTitle: 'የግዕዝ ቋንቋ እና ሰዋሰው',
    creditHours: 3,
    classId: 'cls-5',
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
    id: 'crs-302',
    code: 'CH101',
    title: 'Church History & Tradition',
    amharicTitle: 'የቤተክርስቲያን ታሪክ እና ትውፊት',
    creditHours: 3,
    classId: 'cls-6',
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
    id: 'crs-401',
    code: 'NT101',
    title: 'New Testament Exegesis',
    amharicTitle: 'የአዲስ ኪዳን ትርጓሜ',
    creditHours: 3,
    classId: 'cls-7',
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
    id: 'crs-402',
    code: 'PT101',
    title: 'Pastoral Theology & Hymnody',
    amharicTitle: 'የሥርዓተ አምልኮ እና ዜማ ጥናት',
    creditHours: 3,
    classId: 'cls-8',
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
];

export const defaultEightyStudents: any[] = [
  // Class 1: Medebe Lukas (cls-1)
  { id: 'std-1', studentId: 'ST-2026-001', firstName: 'Abebe', lastName: 'Girma', amharicName: 'አበበ ግርማ', gender: 'Male', email: 'abebe.girma@student.amras.edu', phone: '+251 911 234501', classId: 'cls-1', className: 'Medebe Lukas', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-2', studentId: 'ST-2026-002', firstName: 'Hana', lastName: 'Alemu', amharicName: 'ሃና አለሙ', gender: 'Female', email: 'hana.alemu@student.amras.edu', phone: '+251 911 234502', classId: 'cls-1', className: 'Medebe Lukas', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-3', studentId: 'ST-2026-003', firstName: 'Kebede', lastName: 'Mulugeta', amharicName: 'ከበደ ሙሉጌታ', gender: 'Male', email: 'kebede.mulugeta@student.amras.edu', phone: '+251 911 234503', classId: 'cls-1', className: 'Medebe Lukas', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-4', studentId: 'ST-2026-004', firstName: 'Makeda', lastName: 'Taye', amharicName: 'ማክዳ ታዬ', gender: 'Female', email: 'makeda.taye@student.amras.edu', phone: '+251 911 234504', classId: 'cls-1', className: 'Medebe Lukas', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-5', studentId: 'ST-2026-005', firstName: 'Yared', lastName: 'Tadesse', amharicName: 'ያሬድ ታደሰ', gender: 'Male', email: 'yared.tadesse@student.amras.edu', phone: '+251 911 234505', classId: 'cls-1', className: 'Medebe Lukas', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-6', studentId: 'ST-2026-006', firstName: 'Selamawit', lastName: 'Belay', amharicName: 'ሰላማዊት በላይ', gender: 'Female', email: 'selamawit.belay@student.amras.edu', phone: '+251 911 234506', classId: 'cls-1', className: 'Medebe Lukas', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-7', studentId: 'ST-2026-007', firstName: 'Biruk', lastName: 'Assefa', amharicName: 'ብሩክ አሰፋ', gender: 'Male', email: 'biruk.assefa@student.amras.edu', phone: '+251 911 234507', classId: 'cls-1', className: 'Medebe Lukas', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-8', studentId: 'ST-2026-008', firstName: 'Hiwot', lastName: 'Hailu', amharicName: 'ሕይወት ኃይሉ', gender: 'Female', email: 'hiwot.hailu@student.amras.edu', phone: '+251 911 234508', classId: 'cls-1', className: 'Medebe Lukas', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-9', studentId: 'ST-2026-009', firstName: 'Dawit', lastName: 'Mengistu', amharicName: 'ዳዊት መንግሥቱ', gender: 'Male', email: 'dawit.mengistu@student.amras.edu', phone: '+251 911 234509', classId: 'cls-1', className: 'Medebe Lukas', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-10', studentId: 'ST-2026-010', firstName: 'Bethlehem', lastName: 'Tesfaye', amharicName: 'ቤተልሔም ተስፋዬ', gender: 'Female', email: 'bethlehem.tesfaye@student.amras.edu', phone: '+251 911 234510', classId: 'cls-1', className: 'Medebe Lukas', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },

  // Class 2: Medebe Matewos (cls-2)
  { id: 'std-11', studentId: 'ST-2026-011', firstName: 'Yonas', lastName: 'Kassa', amharicName: 'ዮናስ ካሣ', gender: 'Male', email: 'yonas.kassa@student.amras.edu', phone: '+251 911 234511', classId: 'cls-2', className: 'Medebe Matewos', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-12', studentId: 'ST-2026-012', firstName: 'Rahel', lastName: 'Desta', amharicName: 'ራሔል ደስታ', gender: 'Female', email: 'rahel.desta@student.amras.edu', phone: '+251 911 234512', classId: 'cls-2', className: 'Medebe Matewos', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-13', studentId: 'ST-2026-013', firstName: 'Ermias', lastName: 'Solomon', amharicName: 'ኤርሚያስ ሰሎሞን', gender: 'Male', email: 'ermias.solomon@student.amras.edu', phone: '+251 911 234513', classId: 'cls-2', className: 'Medebe Matewos', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-14', studentId: 'ST-2026-014', firstName: 'Mahlet', lastName: 'Worku', amharicName: 'ማኅሌት ወርቁ', gender: 'Female', email: 'mahlet.worku@student.amras.edu', phone: '+251 911 234514', classId: 'cls-2', className: 'Medebe Matewos', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-15', studentId: 'ST-2026-015', firstName: 'Samuel', lastName: 'Tefera', amharicName: 'ሳሙኤል ተፈራ', gender: 'Male', email: 'samuel.tefera@student.amras.edu', phone: '+251 911 234515', classId: 'cls-2', className: 'Medebe Matewos', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-16', studentId: 'ST-2026-016', firstName: 'Frehiwot', lastName: 'Negash', amharicName: 'ፍሬሕይወት ነጋሽ', gender: 'Female', email: 'frehiwot.negash@student.amras.edu', phone: '+251 911 234516', classId: 'cls-2', className: 'Medebe Matewos', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-17', studentId: 'ST-2026-017', firstName: 'Natnael', lastName: 'Gizaw', amharicName: 'ናትናኤል ግዛው', gender: 'Male', email: 'natnael.gizaw@student.amras.edu', phone: '+251 911 234517', classId: 'cls-2', className: 'Medebe Matewos', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-18', studentId: 'ST-2026-018', firstName: 'Tsion', lastName: 'Getachew', amharicName: 'ጽዮን ጌታቸው', gender: 'Female', email: 'tsion.getachew@student.amras.edu', phone: '+251 911 234518', classId: 'cls-2', className: 'Medebe Matewos', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-19', studentId: 'ST-2026-019', firstName: 'Henok', lastName: 'Berhanu', amharicName: 'ሄኖክ ብርሃኑ', gender: 'Male', email: 'henok.berhanu@student.amras.edu', phone: '+251 911 234519', classId: 'cls-2', className: 'Medebe Matewos', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-20', studentId: 'ST-2026-020', firstName: 'Eden', lastName: 'Melaku', amharicName: 'ኤደን መላኩ', gender: 'Female', email: 'eden.melaku@student.amras.edu', phone: '+251 911 234520', classId: 'cls-2', className: 'Medebe Matewos', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },

  // Class 3: Medebe Markos (cls-3)
  { id: 'std-21', studentId: 'ST-2026-021', firstName: 'Daniel', lastName: 'Mekonnen', amharicName: 'ዳንኤል መኮንን', gender: 'Male', email: 'daniel.mekonnen@student.amras.edu', phone: '+251 911 234521', classId: 'cls-3', className: 'Medebe Markos', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-22', studentId: 'ST-2026-022', firstName: 'Meron', lastName: 'Zeleke', amharicName: 'ሜሮን ዘለቀ', gender: 'Female', email: 'meron.zeleke@student.amras.edu', phone: '+251 911 234522', classId: 'cls-3', className: 'Medebe Markos', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-23', studentId: 'ST-2026-023', firstName: 'Yohannes', lastName: 'Gebre', amharicName: 'ዮሐንስ ገብሬ', gender: 'Male', email: 'yohannes.gebre@student.amras.edu', phone: '+251 911 234523', classId: 'cls-3', className: 'Medebe Markos', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-24', studentId: 'ST-2026-024', firstName: 'Ruth', lastName: 'Fikru', amharicName: 'ሩት ፍቅሩ', gender: 'Female', email: 'ruth.fikru@student.amras.edu', phone: '+251 911 234524', classId: 'cls-3', className: 'Medebe Markos', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-25', studentId: 'ST-2026-025', firstName: 'Abiy', lastName: 'Demisse', amharicName: 'አብይ ደሚሴ', gender: 'Male', email: 'abiy.demisse@student.amras.edu', phone: '+251 911 234525', classId: 'cls-3', className: 'Medebe Markos', section: 'C', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-26', studentId: 'ST-2026-026', firstName: 'Kalkidan', lastName: 'Tilahun', amharicName: 'ቃልኪዳን ጥላሁን', gender: 'Female', email: 'kalkidan.tilahun@student.amras.edu', phone: '+251 911 234526', classId: 'cls-3', className: 'Medebe Markos', section: 'C', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-27', studentId: 'ST-2026-027', firstName: 'Tewodros', lastName: 'Kassahun', amharicName: 'ቴዎድሮስ ካሳሁን', gender: 'Male', email: 'tewodros.kassahun@student.amras.edu', phone: '+251 911 234527', classId: 'cls-3', className: 'Medebe Markos', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-28', studentId: 'ST-2026-028', firstName: 'Genet', lastName: 'Wolde', amharicName: 'ገነት ወልዴ', gender: 'Female', email: 'genet.wolde@student.amras.edu', phone: '+251 911 234528', classId: 'cls-3', className: 'Medebe Markos', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-29', studentId: 'ST-2026-029', firstName: 'Michael', lastName: 'Hailemariam', amharicName: 'ሚካኤል ኃይለማርያም', gender: 'Male', email: 'michael.hailemariam@student.amras.edu', phone: '+251 911 234529', classId: 'cls-3', className: 'Medebe Markos', section: 'C', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-30', studentId: 'ST-2026-030', firstName: 'Senait', lastName: 'Shibeshi', amharicName: 'ሰናይት ሽበሺ', gender: 'Female', email: 'senait.shibeshi@student.amras.edu', phone: '+251 911 234530', classId: 'cls-3', className: 'Medebe Markos', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },

  // Class 4: Medebe Yohannes (cls-4)
  { id: 'std-31', studentId: 'ST-2026-031', firstName: 'Eyob', lastName: 'Mesfin', amharicName: 'ኢዮብ መስፍን', gender: 'Male', email: 'eyob.mesfin@student.amras.edu', phone: '+251 911 234531', classId: 'cls-4', className: 'Medebe Yohannes', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-32', studentId: 'ST-2026-032', firstName: 'Marta', lastName: 'Bogale', amharicName: 'ማርታ ቦጋለ', gender: 'Female', email: 'marta.bogale@student.amras.edu', phone: '+251 911 234532', classId: 'cls-4', className: 'Medebe Yohannes', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-33', studentId: 'ST-2026-033', firstName: 'Fasil', lastName: 'Asrat', amharicName: 'ፋሲል አስራት', gender: 'Male', email: 'fasil.asrat@student.amras.edu', phone: '+251 911 234533', classId: 'cls-4', className: 'Medebe Yohannes', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-34', studentId: 'ST-2026-034', firstName: 'Samrawit', lastName: 'Abebaw', amharicName: 'ሳምራዊት አበበው', gender: 'Female', email: 'samrawit.abebaw@student.amras.edu', phone: '+251 911 234534', classId: 'cls-4', className: 'Medebe Yohannes', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-35', studentId: 'ST-2026-035', firstName: 'Bereket', lastName: 'Wondimu', amharicName: 'በረከት ወንድሙ', gender: 'Male', email: 'bereket.wondimu@student.amras.edu', phone: '+251 911 234535', classId: 'cls-4', className: 'Medebe Yohannes', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-36', studentId: 'ST-2026-036', firstName: 'Tigist', lastName: 'Lemma', amharicName: 'ትዕግስት ለማ', gender: 'Female', email: 'tigist.lemma@student.amras.edu', phone: '+251 911 234536', classId: 'cls-4', className: 'Medebe Yohannes', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-37', studentId: 'ST-2026-037', firstName: 'Nahom', lastName: 'Fantahun', amharicName: 'ናሆም ፋንታሁን', gender: 'Male', email: 'nahom.fantahun@student.amras.edu', phone: '+251 911 234537', classId: 'cls-4', className: 'Medebe Yohannes', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-38', studentId: 'ST-2026-038', firstName: 'Blen', lastName: 'Teshome', amharicName: 'ብሌን ተሾመ', gender: 'Female', email: 'blen.teshome@student.amras.edu', phone: '+251 911 234538', classId: 'cls-4', className: 'Medebe Yohannes', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-39', studentId: 'ST-2026-039', firstName: 'Surafel', lastName: 'Bekele', amharicName: 'ሱራፌል በቀለ', gender: 'Male', email: 'surafel.bekele@student.amras.edu', phone: '+251 911 234539', classId: 'cls-4', className: 'Medebe Yohannes', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-40', studentId: 'ST-2026-040', firstName: 'Lidya', lastName: 'Aklilu', amharicName: 'ሊዲያ አክሊሉ', gender: 'Female', email: 'lidya.aklilu@student.amras.edu', phone: '+251 911 234540', classId: 'cls-4', className: 'Medebe Yohannes', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },

  // Class 5: Medebe Pawlos (cls-5)
  { id: 'std-41', studentId: 'ST-2026-041', firstName: 'Ezra', lastName: 'Cherinet', amharicName: 'ዕዝራ ቸርነት', gender: 'Male', email: 'ezra.cherinet@student.amras.edu', phone: '+251 911 234541', classId: 'cls-5', className: 'Medebe Pawlos', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-42', studentId: 'ST-2026-042', firstName: 'Saron', lastName: 'Gashaw', amharicName: 'ሳሮን ጋሻው', gender: 'Female', email: 'saron.gashaw@student.amras.edu', phone: '+251 911 234542', classId: 'cls-5', className: 'Medebe Pawlos', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-43', studentId: 'ST-2026-043', firstName: 'Elias', lastName: 'Yilma', amharicName: 'ኤልያስ ይልማ', gender: 'Male', email: 'elias.yilma@student.amras.edu', phone: '+251 911 234543', classId: 'cls-5', className: 'Medebe Pawlos', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-44', studentId: 'ST-2026-044', firstName: 'Helina', lastName: 'Sisay', amharicName: 'ሄሊና ሲሳይ', gender: 'Female', email: 'helina.sisay@student.amras.edu', phone: '+251 911 234544', classId: 'cls-5', className: 'Medebe Pawlos', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-45', studentId: 'ST-2026-045', firstName: 'Kirubel', lastName: 'Hailu', amharicName: 'ኪሩቤል ኃይሉ', gender: 'Male', email: 'kirubel.hailu@student.amras.edu', phone: '+251 911 234545', classId: 'cls-5', className: 'Medebe Pawlos', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-46', studentId: 'ST-2026-046', firstName: 'Martha', lastName: 'Dagnachew', amharicName: 'ማርታ ዳኛቸው', gender: 'Female', email: 'martha.dagnachew@student.amras.edu', phone: '+251 911 234546', classId: 'cls-5', className: 'Medebe Pawlos', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-47', studentId: 'ST-2026-047', firstName: 'Robel', lastName: 'Yohannes', amharicName: 'ሮቤል ዮሐንስ', gender: 'Male', email: 'robel.yohannes@student.amras.edu', phone: '+251 911 234547', classId: 'cls-5', className: 'Medebe Pawlos', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-48', studentId: 'ST-2026-048', firstName: 'Feven', lastName: 'Kifle', amharicName: 'ፌቨን ክፍሌ', gender: 'Female', email: 'feven.kifle@student.amras.edu', phone: '+251 911 234548', classId: 'cls-5', className: 'Medebe Pawlos', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-49', studentId: 'ST-2026-049', firstName: 'Abel', lastName: 'Shimelis', amharicName: 'አቤል ሽመልስ', gender: 'Male', email: 'abel.shimelis@student.amras.edu', phone: '+251 911 234549', classId: 'cls-5', className: 'Medebe Pawlos', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-50', studentId: 'ST-2026-050', firstName: 'Hermela', lastName: 'Tariku', amharicName: 'ሄርሜላ ታሪኩ', gender: 'Female', email: 'hermela.tariku@student.amras.edu', phone: '+251 911 234550', classId: 'cls-5', className: 'Medebe Pawlos', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },

  // Class 6: Medebe Petros (cls-6)
  { id: 'std-51', studentId: 'ST-2026-051', firstName: 'Petros', lastName: 'Gebremichael', amharicName: 'ጴጥሮስ ገብረሚካኤል', gender: 'Male', email: 'petros.gebremichael@student.amras.edu', phone: '+251 911 234551', classId: 'cls-6', className: 'Medebe Petros', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-52', studentId: 'ST-2026-052', firstName: 'Kidist', lastName: 'Tsegaye', amharicName: 'ቅድስት ፀጋዬ', gender: 'Female', email: 'kidist.tsegaye@student.amras.edu', phone: '+251 911 234552', classId: 'cls-6', className: 'Medebe Petros', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-53', studentId: 'ST-2026-053', firstName: 'Binyam', lastName: 'Ayalew', amharicName: 'ቢንያም አያሌው', gender: 'Male', email: 'binyam.ayalew@student.amras.edu', phone: '+251 911 234553', classId: 'cls-6', className: 'Medebe Petros', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-54', studentId: 'ST-2026-054', firstName: 'Meklit', lastName: 'Endale', amharicName: 'መክሊት እንዳለ', gender: 'Female', email: 'meklit.endale@student.amras.edu', phone: '+251 911 234554', classId: 'cls-6', className: 'Medebe Petros', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-55', studentId: 'ST-2026-055', firstName: 'Desta', lastName: 'Wubetu', amharicName: 'ደስታ ውበቱ', gender: 'Male', email: 'desta.wubetu@student.amras.edu', phone: '+251 911 234555', classId: 'cls-6', className: 'Medebe Petros', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-56', studentId: 'ST-2026-056', firstName: 'Arsema', lastName: 'Haile', amharicName: 'አርሴማ ኃይሌ', gender: 'Female', email: 'arsema.haile@student.amras.edu', phone: '+251 911 234556', classId: 'cls-6', className: 'Medebe Petros', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-57', studentId: 'ST-2026-057', firstName: 'Temesgen', lastName: 'Aseged', amharicName: 'ተመስገን አሰገደ', gender: 'Male', email: 'temesgen.aseged@student.amras.edu', phone: '+251 911 234557', classId: 'cls-6', className: 'Medebe Petros', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-58', studentId: 'ST-2026-058', firstName: 'Aster', lastName: 'Girma', amharicName: 'አስቴር ግርማ', gender: 'Female', email: 'aster.girma@student.amras.edu', phone: '+251 911 234558', classId: 'cls-6', className: 'Medebe Petros', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-59', studentId: 'ST-2026-059', firstName: 'Samson', lastName: 'Mulatu', amharicName: 'ሳምሶን ሙላቱ', gender: 'Male', email: 'samson.mulatu@student.amras.edu', phone: '+251 911 234559', classId: 'cls-6', className: 'Medebe Petros', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-60', studentId: 'ST-2026-060', firstName: 'Danawit', lastName: 'Fisseha', amharicName: 'ዳናዊት ፍስሐ', gender: 'Female', email: 'danawit.fisseha@student.amras.edu', phone: '+251 911 234560', classId: 'cls-6', className: 'Medebe Petros', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },

  // Class 7: Medebe Estifanos (cls-7)
  { id: 'std-61', studentId: 'ST-2026-061', firstName: 'Estifanos', lastName: 'Tekle', amharicName: 'እስጢፋኖስ ተክሌ', gender: 'Male', email: 'estifanos.tekle@student.amras.edu', phone: '+251 911 234561', classId: 'cls-7', className: 'Medebe Estifanos', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-62', studentId: 'ST-2026-062', firstName: 'Sara', lastName: 'Woldekidan', amharicName: 'ሳራ ወልደኪዳን', gender: 'Female', email: 'sara.woldekidan@student.amras.edu', phone: '+251 911 234562', classId: 'cls-7', className: 'Medebe Estifanos', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-63', studentId: 'ST-2026-063', firstName: 'Zerihun', lastName: 'Alebachew', amharicName: 'ዘሪሁን አለባቸው', gender: 'Male', email: 'zerihun.alebachew@student.amras.edu', phone: '+251 911 234563', classId: 'cls-7', className: 'Medebe Estifanos', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-64', studentId: 'ST-2026-064', firstName: 'Eyerusalem', lastName: 'Guta', amharicName: 'ኢየሩሳሌም ጉታ', gender: 'Female', email: 'eyerusalem.guta@student.amras.edu', phone: '+251 911 234564', classId: 'cls-7', className: 'Medebe Estifanos', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-65', studentId: 'ST-2026-065', firstName: 'Habtamu', lastName: 'Bizuneh', amharicName: 'ሀብታሙ ብዙነህ', gender: 'Male', email: 'habtamu.bizuneh@student.amras.edu', phone: '+251 911 234565', classId: 'cls-7', className: 'Medebe Estifanos', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-66', studentId: 'ST-2026-066', firstName: 'Melat', lastName: 'Kebede', amharicName: 'መላት ከበደ', gender: 'Female', email: 'melat.kebede@student.amras.edu', phone: '+251 911 234566', classId: 'cls-7', className: 'Medebe Estifanos', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-67', studentId: 'ST-2026-067', firstName: 'Getnet', lastName: 'Amare', amharicName: 'ጌትነት አማረ', gender: 'Male', email: 'getnet.amare@student.amras.edu', phone: '+251 911 234567', classId: 'cls-7', className: 'Medebe Estifanos', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-68', studentId: 'ST-2026-068', firstName: 'Rahel', lastName: 'Gebretsadik', amharicName: 'ራሔል ገብረጻድቅ', gender: 'Female', email: 'rahel.gebretsadik@student.amras.edu', phone: '+251 911 234568', classId: 'cls-7', className: 'Medebe Estifanos', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-69', studentId: 'ST-2026-069', firstName: 'Solomon', lastName: 'Ashenafi', amharicName: 'ሰሎሞን አሸናፊ', gender: 'Male', email: 'solomon.ashenafi@student.amras.edu', phone: '+251 911 234569', classId: 'cls-7', className: 'Medebe Estifanos', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-70', studentId: 'ST-2026-070', firstName: 'Deborah', lastName: 'Yohannes', amharicName: 'ዲቦራ ዮሐንስ', gender: 'Female', email: 'deborah.yohannes@student.amras.edu', phone: '+251 911 234570', classId: 'cls-7', className: 'Medebe Estifanos', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },

  // Class 8: Medebe Dawit (cls-8)
  { id: 'std-71', studentId: 'ST-2026-071', firstName: 'Dawit', lastName: 'Woldegiorgis', amharicName: 'ዳዊት ወልደጊዮርጊስ', gender: 'Male', email: 'dawit.woldegiorgis@student.amras.edu', phone: '+251 911 234571', classId: 'cls-8', className: 'Medebe Dawit', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-72', studentId: 'ST-2026-072', firstName: 'Mariamawit', lastName: 'Tadesse', amharicName: 'ማርያማዊት ታደሰ', gender: 'Female', email: 'mariamawit.tadesse@student.amras.edu', phone: '+251 911 234572', classId: 'cls-8', className: 'Medebe Dawit', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-73', studentId: 'ST-2026-073', firstName: 'Yonatan', lastName: 'Birhanu', amharicName: 'ዮናታን ብርሃኑ', gender: 'Male', email: 'yonatan.birhanu@student.amras.edu', phone: '+251 911 234573', classId: 'cls-8', className: 'Medebe Dawit', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-74', studentId: 'ST-2026-074', firstName: 'Tinsae', lastName: 'Mengistu', amharicName: 'ትንሣኤ መንግሥቱ', gender: 'Female', email: 'tinsae.mengistu@student.amras.edu', phone: '+251 911 234574', classId: 'cls-8', className: 'Medebe Dawit', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-75', studentId: 'ST-2026-075', firstName: 'Yohannes', lastName: 'Tesfahun', amharicName: 'ዮሐንስ ተስፋሁን', gender: 'Male', email: 'yohannes.tesfahun@student.amras.edu', phone: '+251 911 234575', classId: 'cls-8', className: 'Medebe Dawit', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-76', studentId: 'ST-2026-076', firstName: 'Ruth', lastName: 'Getu', amharicName: 'ሩት ጌቱ', gender: 'Female', email: 'ruth.getu@student.amras.edu', phone: '+251 911 234576', classId: 'cls-8', className: 'Medebe Dawit', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-77', studentId: 'ST-2026-077', firstName: 'Mikiyas', lastName: 'Negussie', amharicName: 'ሚኪያስ ንጉሴ', gender: 'Male', email: 'mikiyas.negussie@student.amras.edu', phone: '+251 911 234577', classId: 'cls-8', className: 'Medebe Dawit', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-78', studentId: 'ST-2026-078', firstName: 'Eleni', lastName: 'Mulu', amharicName: 'እሌኒ ሙሉ', gender: 'Female', email: 'eleni.mulu@student.amras.edu', phone: '+251 911 234578', classId: 'cls-8', className: 'Medebe Dawit', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-79', studentId: 'ST-2026-079', firstName: 'Fikadu', lastName: 'Workneh', amharicName: 'ፍቃዱ ወርቅነህ', gender: 'Male', email: 'fikadu.workneh@student.amras.edu', phone: '+251 911 234579', classId: 'cls-8', className: 'Medebe Dawit', section: 'A', academicYear: '2025/2026', status: 'ACTIVE' },
  { id: 'std-80', studentId: 'ST-2026-080', firstName: 'Hawi', lastName: 'Dibaba', amharicName: 'ሀዊ ዲባባ', gender: 'Female', email: 'hawi.dibaba@student.amras.edu', phone: '+251 911 234580', classId: 'cls-8', className: 'Medebe Dawit', section: 'B', academicYear: '2025/2026', status: 'ACTIVE' },
];

export let students: any[] = [...defaultEightyStudents];

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
  {
    id: 'sch-4',
    courseId: 'crs-101',
    courseCode: 'DOGMA-1',
    courseTitle: 'Dogmatic Theology & Church History',
    classId: 'cls-1',
    className: 'Class 1',
    section: 'A',
    teacherId: 'usr-3',
    teacherName: 'Instructor Abebe Kebede',
    day: 'Sunday',
    startTime: '09:00',
    endTime: '11:00',
    room: 'Hall A (Sunday Main)',
  },
  {
    id: 'sch-5',
    courseId: 'crs-102',
    courseCode: 'LITURGY-1',
    courseTitle: 'Biblical Studies & Liturgy',
    classId: 'cls-2',
    className: 'Class 2',
    section: 'A',
    teacherId: 'usr-4',
    teacherName: 'Instructor Tigist Haile',
    day: 'Sunday',
    startTime: '11:30',
    endTime: '13:30',
    room: 'Hall B (Sunday)',
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
      { studentId: 'std-1', studentCode: 'ST-2026-001', studentName: 'Abebe Girma', studentAmharicName: 'አበበ ግርማ', status: 'PRESENT', remark: 'On time and active' },
      { studentId: 'std-2', studentCode: 'ST-2026-002', studentName: 'Hana Alemu', studentAmharicName: 'ሃና አለሙ', status: 'PRESENT', remark: '' },
      { studentId: 'std-3', studentCode: 'ST-2026-003', studentName: 'Kebede Mulugeta', studentAmharicName: 'ከበደ ሙሉጌታ', status: 'LATE', remark: 'Arrived 15m late' },
      { studentId: 'std-4', studentCode: 'ST-2026-004', studentName: 'Makeda Taye', studentAmharicName: 'ማክዳ ታዬ', status: 'PRESENT', remark: '' },
      { studentId: 'std-5', studentCode: 'ST-2026-005', studentName: 'Yared Tadesse', studentAmharicName: 'ያሬድ ታደሰ', status: 'PRESENT', remark: '' },
      { studentId: 'std-6', studentCode: 'ST-2026-006', studentName: 'Selamawit Belay', studentAmharicName: 'ሰላማዊት በላይ', status: 'PRESENT', remark: '' },
      { studentId: 'std-7', studentCode: 'ST-2026-007', studentName: 'Biruk Assefa', studentAmharicName: 'ብሩክ አሰፋ', status: 'EXCUSED', remark: 'Family illness' },
      { studentId: 'std-8', studentCode: 'ST-2026-008', studentName: 'Hiwot Hailu', studentAmharicName: 'ሕይወት ኃይሉ', status: 'PRESENT', remark: '' },
      { studentId: 'std-9', studentCode: 'ST-2026-009', studentName: 'Dawit Mengistu', studentAmharicName: 'ዳዊት መንግሥቱ', status: 'PRESENT', remark: '' },
      { studentId: 'std-10', studentCode: 'ST-2026-010', studentName: 'Bethlehem Tesfaye', studentAmharicName: 'ቤተልሔም ተስፋዬ', status: 'PRESENT', remark: '' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'att-2',
    date: '2026-08-09',
    classId: 'cls-1',
    className: 'Class 1',
    section: 'A',
    takenByUserId: 'usr-3',
    takenByUserName: 'Instructor Abebe Kebede',
    entries: [
      { studentId: 'std-1', studentCode: 'ST-2026-001', studentName: 'Abebe Girma', studentAmharicName: 'አበበ ግርማ', status: 'PRESENT', remark: 'Attentive in class' },
      { studentId: 'std-2', studentCode: 'ST-2026-002', studentName: 'Hana Alemu', studentAmharicName: 'ሃና አለሙ', status: 'PRESENT', remark: 'Excellent recitation' },
      { studentId: 'std-3', studentCode: 'ST-2026-003', studentName: 'Kebede Mulugeta', studentAmharicName: 'ከበደ ሙሉጌታ', status: 'PRESENT', remark: '' },
      { studentId: 'std-4', studentCode: 'ST-2026-004', studentName: 'Makeda Taye', studentAmharicName: 'ማክዳ ታዬ', status: 'PRESENT', remark: '' },
      { studentId: 'std-5', studentCode: 'ST-2026-005', studentName: 'Yared Tadesse', studentAmharicName: 'ያሬድ ታደሰ', status: 'LATE', remark: 'Transport delay' },
      { studentId: 'std-6', studentCode: 'ST-2026-006', studentName: 'Selamawit Belay', studentAmharicName: 'ሰላማዊት በላይ', status: 'PRESENT', remark: '' },
      { studentId: 'std-7', studentCode: 'ST-2026-007', studentName: 'Biruk Assefa', studentAmharicName: 'ብሩክ አሰፋ', status: 'PRESENT', remark: '' },
      { studentId: 'std-8', studentCode: 'ST-2026-008', studentName: 'Hiwot Hailu', studentAmharicName: 'ሕይወት ኃይሉ', status: 'ABSENT', remark: 'Unnotified absence' },
      { studentId: 'std-9', studentCode: 'ST-2026-009', studentName: 'Dawit Mengistu', studentAmharicName: 'ዳዊት መንግሥቱ', status: 'PRESENT', remark: '' },
      { studentId: 'std-10', studentCode: 'ST-2026-010', studentName: 'Bethlehem Tesfaye', studentAmharicName: 'ቤተልሔም ተስፋዬ', status: 'PRESENT', remark: '' },
    ],
    createdAt: '2026-08-09T10:00:00Z',
  },
  {
    id: 'att-3',
    date: '2026-08-02',
    classId: 'cls-1',
    className: 'Class 1',
    section: 'A',
    takenByUserId: 'usr-3',
    takenByUserName: 'Instructor Abebe Kebede',
    entries: [
      { studentId: 'std-1', studentCode: 'ST-2026-001', studentName: 'Abebe Girma', studentAmharicName: 'አበበ ግርማ', status: 'PRESENT', remark: '' },
      { studentId: 'std-2', studentCode: 'ST-2026-002', studentName: 'Hana Alemu', studentAmharicName: 'ሃና አለሙ', status: 'PRESENT', remark: '' },
      { studentId: 'std-3', studentCode: 'ST-2026-003', studentName: 'Kebede Mulugeta', studentAmharicName: 'ከበደ ሙሉጌታ', status: 'ABSENT', remark: 'Sick leave granted' },
      { studentId: 'std-4', studentCode: 'ST-2026-004', studentName: 'Makeda Taye', studentAmharicName: 'ማክዳ ታዬ', status: 'PRESENT', remark: '' },
      { studentId: 'std-5', studentCode: 'ST-2026-005', studentName: 'Yared Tadesse', studentAmharicName: 'ያሬድ ታደሰ', status: 'PRESENT', remark: '' },
      { studentId: 'std-6', studentCode: 'ST-2026-006', studentName: 'Selamawit Belay', studentAmharicName: 'ሰላማዊት በላይ', status: 'PRESENT', remark: '' },
      { studentId: 'std-7', studentCode: 'ST-2026-007', studentName: 'Biruk Assefa', studentAmharicName: 'ብሩክ አሰፋ', status: 'PRESENT', remark: '' },
      { studentId: 'std-8', studentCode: 'ST-2026-008', studentName: 'Hiwot Hailu', studentAmharicName: 'ሕይወት ኃይሉ', status: 'PRESENT', remark: '' },
      { studentId: 'std-9', studentCode: 'ST-2026-009', studentName: 'Dawit Mengistu', studentAmharicName: 'ዳዊት መንግሥቱ', status: 'LATE', remark: '' },
      { studentId: 'std-10', studentCode: 'ST-2026-010', studentName: 'Bethlehem Tesfaye', studentAmharicName: 'ቤተልሔም ተስፋዬ', status: 'PRESENT', remark: '' },
    ],
    createdAt: '2026-08-02T10:00:00Z',
  },
  {
    id: 'att-4',
    date: '2026-07-26',
    classId: 'cls-1',
    className: 'Class 1',
    section: 'A',
    takenByUserId: 'usr-5',
    takenByUserName: 'Coordinator Dawit Bekele',
    entries: [
      { studentId: 'std-1', studentCode: 'ST-2026-001', studentName: 'Abebe Girma', studentAmharicName: 'አበበ ግርማ', status: 'PRESENT', remark: '' },
      { studentId: 'std-2', studentCode: 'ST-2026-002', studentName: 'Hana Alemu', studentAmharicName: 'ሃና አለሙ', status: 'PRESENT', remark: '' },
      { studentId: 'std-3', studentCode: 'ST-2026-003', studentName: 'Kebede Mulugeta', studentAmharicName: 'ከበደ ሙሉጌታ', status: 'PRESENT', remark: '' },
      { studentId: 'std-4', studentCode: 'ST-2026-004', studentName: 'Makeda Taye', studentAmharicName: 'ማክዳ ታዬ', status: 'PRESENT', remark: '' },
      { studentId: 'std-5', studentCode: 'ST-2026-005', studentName: 'Yared Tadesse', studentAmharicName: 'ያሬድ ታደሰ', status: 'PRESENT', remark: '' },
    ],
    createdAt: '2026-07-26T10:00:00Z',
  },
];

export const defaultBehavioralNotes: any[] = [
  {
    id: 'note-1',
    studentId: 'std-1',
    studentName: 'Abebe Girma',
    studentAmharicName: 'አበበ ግርማ',
    title: 'Exemplary Liturgical Participation & Choral Dedication',
    category: 'SPIRITUAL_GROWTH',
    severity: 'POSITIVE',
    content: 'Abebe displayed outstanding reverence, consistency, and active choir leadership during Sunday morning prayer services and class hymn recitations.',
    recordedByUserId: 'usr-3',
    recordedByUserName: 'Instructor Abebe Kebede',
    recordedByUserRole: 'TEACHER',
    date: '2026-08-05',
    academicYear: '2025/2026',
    actionTaken: 'Commended in front of class assembly',
    followUpRequired: false,
    createdAt: '2026-08-05T11:30:00Z',
  },
  {
    id: 'note-2',
    studentId: 'std-1',
    studentName: 'Abebe Girma',
    studentAmharicName: 'አበበ ግርማ',
    title: 'Top Academic Assignment Achievement in Programming',
    category: 'ACADEMIC_EFFORT',
    severity: 'POSITIVE',
    content: 'Completed advanced programming algorithms ahead of schedule and voluntarily mentored peer classmates in Section A.',
    recordedByUserId: 'usr-3',
    recordedByUserName: 'Instructor Abebe Kebede',
    recordedByUserRole: 'TEACHER',
    date: '2026-07-20',
    academicYear: '2025/2026',
    actionTaken: 'Awarded Class Peer Mentor certificate',
    followUpRequired: false,
    createdAt: '2026-07-20T14:15:00Z',
  },
  {
    id: 'note-3',
    studentId: 'std-2',
    studentName: 'Hana Alemu',
    studentAmharicName: 'ሃና አለሙ',
    title: 'Distinguished Conduct and Punctuality Recognition',
    category: 'COMMENDATION',
    severity: 'POSITIVE',
    content: 'Maintains 100% on-time attendance record and participates constructively in all ethical discussions.',
    recordedByUserId: 'usr-5',
    recordedByUserName: 'Coordinator Dawit Bekele',
    recordedByUserRole: 'COORDINATOR',
    date: '2026-08-02',
    academicYear: '2025/2026',
    actionTaken: 'Nominated for Semester Conduct Award',
    followUpRequired: false,
    createdAt: '2026-08-02T09:45:00Z',
  },
  {
    id: 'note-4',
    studentId: 'std-3',
    studentName: 'Kebede Mulugeta',
    studentAmharicName: 'ከበደ ሙሉጌታ',
    title: 'Punctuality Advisory & Morning Arrival Reminder',
    category: 'ATTENDANCE_PUNCTUALITY',
    severity: 'WARNING',
    content: 'Student was tardy for two consecutive Sunday morning classes. Spoke with student regarding morning transport logistics and time management.',
    recordedByUserId: 'usr-3',
    recordedByUserName: 'Instructor Abebe Kebede',
    recordedByUserRole: 'TEACHER',
    date: '2026-08-08',
    academicYear: '2025/2026',
    actionTaken: 'Direct verbal counseling and schedule plan agreed',
    followUpRequired: true,
    createdAt: '2026-08-08T12:00:00Z',
  },
  {
    id: 'note-5',
    studentId: 'std-4',
    studentName: 'Makeda Taye',
    studentAmharicName: 'ማክዳ ታዬ',
    title: 'Active Community Outreach & Charity Volunteerism',
    category: 'SPIRITUAL_GROWTH',
    severity: 'POSITIVE',
    content: 'Helped organize the Sunday School youth outreach and charity book distribution with genuine humility and enthusiasm.',
    recordedByUserId: 'usr-5',
    recordedByUserName: 'Coordinator Dawit Bekele',
    recordedByUserRole: 'COORDINATOR',
    date: '2026-07-28',
    academicYear: '2025/2026',
    actionTaken: 'Recorded in student character portfolio',
    followUpRequired: false,
    createdAt: '2026-07-28T16:20:00Z',
  },
  {
    id: 'note-6',
    studentId: 'std-5',
    studentName: 'Yared Tadesse',
    studentAmharicName: 'ያሬድ ታደሰ',
    title: 'Study Habit Improvement Counseling Session',
    category: 'COUNSELING',
    severity: 'NEUTRAL',
    content: 'Held an academic consultation with Yared regarding study group participation and revision methods for upcoming midterm exams.',
    recordedByUserId: 'usr-2',
    recordedByUserName: 'Biruk Wendemeneh',
    recordedByUserRole: 'DEPT_HEAD',
    date: '2026-08-01',
    academicYear: '2025/2026',
    actionTaken: 'Provided supplementary study materials and paired with peer tutor',
    followUpRequired: true,
    createdAt: '2026-08-01T15:00:00Z',
  },
];

export let behavioralNotes: any[] = [...defaultBehavioralNotes];

export const defaultAcademicCalendarEvents: any[] = [
  // 2026/2027 Upcoming Events & Deadlines
  {
    id: 'evt-2026-01',
    title: 'New Student Registration & Placement (2026/2027)',
    amharicTitle: 'የአዲስ ተማሪዎች ምዝገባ እና ምደባ (፳፻፲፱ ዓ.ም.)',
    type: 'REGISTRATION',
    startDate: '2026-08-20',
    endDate: '2026-09-05',
    academicYear: '2026/2027',
    semester: 'Semester I',
    description: 'Annual registration and section allocation for new and returning Sunday School students across all 8 class levels.',
    amharicDescription: 'ለሁሉም 8 የክፍል ደረጃዎች የአዳዲስ እና ነባር የሰንበት ትምህርት ቤት ተማሪዎች ዓመታዊ ምዝገባ እና የምደባ ማረጋገጫ።',
    location: 'Main Administrative Hall / Registrar Office',
    targetAudience: 'ALL',
    isImportant: true,
  },
  {
    id: 'evt-2026-02',
    title: 'Filseta Fasting & Feast (St. Mary)',
    amharicTitle: 'የፍልሰታ ጾም እና በዓለ ፍልሰታ',
    type: 'SPECIAL_EVENT',
    startDate: '2026-08-07',
    endDate: '2026-08-22',
    academicYear: '2025/2026',
    semester: 'All',
    description: 'Sixteen days of spiritual fasting, morning liturgies, and youth special fellowship.',
    amharicDescription: 'የአስራ ስድስት ቀናት መንፈሳዊ የፍልሰታ ጾም፣ የቅዳሴ ጸሎት እና የወጣቶች መንፈሳዊ ጉባኤ።',
    location: 'Holy Trinity Cathedral & St. Abraham Sanctuary',
    targetAudience: 'ALL',
    isImportant: false,
  },
  {
    id: 'evt-2026-03',
    title: 'Enkutatash 2019 E.C. (Ethiopian New Year)',
    amharicTitle: 'እንቁጣጣሽ ፳፻፲፱ ዓ.ም. (የዘመን መለወጫ)',
    type: 'HOLIDAY',
    startDate: '2026-09-11',
    endDate: '2026-09-11',
    academicYear: '2026/2027',
    semester: 'Semester I',
    description: 'National and Ecclesiastical New Year celebration (Meskerem 1).',
    amharicDescription: 'ብሔራዊ እና ቤተክርስቲያናዊ የዘመን መለወጫ በዓል (መስከረም 1)።',
    location: 'All Sanctuaries & Sunday School Grounds',
    targetAudience: 'ALL',
    isImportant: true,
  },
  {
    id: 'evt-2026-04',
    title: 'Semester I Opening & Orientation Assembly',
    amharicTitle: 'የመጀመሪያ ሴሚስተር መክፈቻ እና የተማሪዎች ገለጻ',
    type: 'ACADEMIC_MILESTONE',
    startDate: '2026-09-20',
    endDate: '2026-09-20',
    academicYear: '2026/2027',
    semester: 'Semester I',
    description: 'Official opening of Sunday School classes, curriculum distribution, and student orientation.',
    amharicDescription: 'የሰንበት ትምህርት ቤት ትምህርት መክፈቻ፣ የመማሪያ መጽሐፍት ስርጭት እና አቀባበል።',
    location: 'Assembly Hall',
    targetAudience: 'STUDENTS',
    isImportant: true,
  },
  {
    id: 'evt-2026-05',
    title: 'Meskel (Finding of the True Cross)',
    amharicTitle: 'በዓለ መስቀል (ደመራ)',
    type: 'HOLIDAY',
    startDate: '2026-09-27',
    endDate: '2026-09-28',
    academicYear: '2026/2027',
    semester: 'Semester I',
    description: 'Holy Demera procession and celebratory Feast of the Holy Cross (Meskerem 17).',
    amharicDescription: 'የደመራ ማብራት ሥነ-ስርዓት እና የታላቁ በዓለ መስቀል ክብረ በዓል (መስከረም 17)።',
    location: 'Meskel Square & St. Abraham Compound',
    targetAudience: 'ALL',
    isImportant: true,
  },
  {
    id: 'evt-2026-06',
    title: 'Semester I Midterm Examination Week',
    amharicTitle: 'የመጀመሪያ ሴሚስተር የፈተና ሳምንት (Midterm)',
    type: 'EXAM',
    startDate: '2026-11-28',
    endDate: '2026-12-06',
    academicYear: '2026/2027',
    semester: 'Semester I',
    description: 'Midterm written assessments across all active courses and class levels (Classes 1 to 8).',
    amharicDescription: 'ለሁሉም 8 የክፍል ደረጃዎች የተዘጋጀ የመጀመሪያ ሴሚስተር የጽሑፍ እና የቃል አጋማሽ ፈተና።',
    location: 'Classrooms 101 - 208',
    targetAudience: 'STUDENTS',
    isImportant: true,
  },
  {
    id: 'evt-2026-07',
    title: 'Genna (Ethiopian Christmas Feast)',
    amharicTitle: 'በዓለ ልደት (ገና)',
    type: 'HOLIDAY',
    startDate: '2027-01-07',
    endDate: '2027-01-07',
    academicYear: '2026/2027',
    semester: 'Semester I',
    description: 'Celebration of the Nativity of our Lord Jesus Christ (Tahsas 29).',
    amharicDescription: 'የጌታችንና የመድኃኒታችን የኢየሱስ ክርስቶስ የልደት በዓል (ታኅሣሥ 29)።',
    location: 'Main Sanctuary',
    targetAudience: 'ALL',
    isImportant: true,
  },
  {
    id: 'evt-2026-08',
    title: 'Timket (Ethiopian Epiphany Feast)',
    amharicTitle: 'በዓለ ጥምቀት (ከተራ)',
    type: 'HOLIDAY',
    startDate: '2027-01-19',
    endDate: '2027-01-20',
    academicYear: '2026/2027',
    semester: 'Semester I',
    description: 'Holy Epiphany processions, Tabot blessing, and choir presentation.',
    amharicDescription: 'የከተራ እና የጥምቀት በዓል አከባበር፣ የጽላት አጃቢነት እና የዝማሬ አገልግሎት።',
    location: 'Timkete Bahir Ground',
    targetAudience: 'ALL',
    isImportant: true,
  },
  {
    id: 'evt-2026-09',
    title: 'Semester I Final Examination Week',
    amharicTitle: 'የመጀመሪያ ሴሚስተር ማጠቃለያ ፈተና ሳምንት (Finals)',
    type: 'EXAM',
    startDate: '2027-01-23',
    endDate: '2027-01-31',
    academicYear: '2026/2027',
    semester: 'Semester I',
    description: 'Final examination period covering all subjects. Strict attendance required.',
    amharicDescription: 'የመጀመሪያ ሴሚስተር ማጠቃለያ ፈተናዎች የሚሰጡበት ወቅት።',
    location: 'All Examination Halls',
    targetAudience: 'STUDENTS',
    isImportant: true,
  },
  {
    id: 'evt-2026-10',
    title: 'Semester I Mark Submission Deadline',
    amharicTitle: 'የመምህራን የማርክ ማስረከቢያ የመጨረሻ ቀን',
    type: 'ACADEMIC_MILESTONE',
    startDate: '2027-02-05',
    endDate: '2027-02-05',
    academicYear: '2026/2027',
    semester: 'Semester I',
    description: 'Final deadline for instructors to input, calculate, and submit grades to Coordinators.',
    amharicDescription: 'መምህራን ማርክ ሞልተው ለአስተባባሪዎች የሚያስረክቡበት የመጨረሻ ቀን።',
    location: 'AMRAS Online Portal',
    targetAudience: 'TEACHERS',
    isImportant: true,
  },
  {
    id: 'evt-2026-11',
    title: 'Semester I Student Report Card Distribution',
    amharicTitle: 'የመጀመሪያ ሴሚስተር የውጤት ካርድ ማደያ ቀን',
    type: 'ACADEMIC_MILESTONE',
    startDate: '2027-02-07',
    endDate: '2027-02-07',
    academicYear: '2026/2027',
    semester: 'Semester I',
    description: 'Official distribution of approved A4 report cards and parent consultations.',
    amharicDescription: 'የተማሪዎች ውጤት ካርድ ለወላጆች የሚሰጥበት እና ውይይት የሚደረግበት ዕለት።',
    location: 'Sunday School Auditorium',
    targetAudience: 'PARENTS',
    isImportant: true,
  },

  // 2025/2026 Recorded Events
  {
    id: 'evt-2025-01',
    title: 'Fast of Nenewe (Three Days of Jonah)',
    amharicTitle: 'የነነዌ ጾም',
    type: 'SPECIAL_EVENT',
    startDate: '2026-02-23',
    endDate: '2026-02-25',
    academicYear: '2025/2026',
    semester: 'Semester II',
    description: 'Three solemn days of prayer, fasting, and repentance.',
    amharicDescription: 'የሦስት ቀናት የነነዌ ጾም እና የንስሐ ጸሎት።',
    location: 'Church Sanctuary',
    targetAudience: 'ALL',
    isImportant: false,
  },
  {
    id: 'evt-2025-02',
    title: 'Adwa Victory Memorial Day',
    amharicTitle: 'የዓድዋ ድል በዓል',
    type: 'HOLIDAY',
    startDate: '2026-03-02',
    endDate: '2026-03-02',
    academicYear: '2025/2026',
    semester: 'Semester II',
    description: 'Commemoration of the historic Battle of Adwa victory (Yekatit 23).',
    amharicDescription: 'የታላቁ የዓድዋ ድል መታሰቢያ በዓል (የካቲት 23)።',
    location: 'Church & Sunday School Grounds',
    targetAudience: 'ALL',
    isImportant: false,
  },
  {
    id: 'evt-2025-03',
    title: 'Fasika (Ethiopian Easter / Tensae)',
    amharicTitle: 'በዓለ ትንሣኤ (ፋሲካ)',
    type: 'HOLIDAY',
    startDate: '2026-04-19',
    endDate: '2026-04-20',
    academicYear: '2025/2026',
    semester: 'Semester II',
    description: 'Glorious feast of the Resurrection of our Lord Jesus Christ.',
    amharicDescription: 'የጌታችንና የመድኃኒታችን የኢየሱስ ክርስቶስ የትንሣኤ በዓል (ሚያዝያ 11)።',
    location: 'Main Sanctuary',
    targetAudience: 'ALL',
    isImportant: true,
  },
  {
    id: 'evt-2025-04',
    title: 'Semester II Final Examinations (2025/2026)',
    amharicTitle: 'የሁለተኛ ሴሚስተር ዓመታዊ ማጠቃለያ ፈተና',
    type: 'EXAM',
    startDate: '2026-06-06',
    endDate: '2026-06-14',
    academicYear: '2025/2026',
    semester: 'Semester II',
    description: 'End-of-year final exams determining advancement and ranking.',
    amharicDescription: 'የዓመቱ ማጠቃለያ ፈተናዎች የሚሰጡበት ወቅት።',
    location: 'All Classrooms',
    targetAudience: 'STUDENTS',
    isImportant: true,
  },
  {
    id: 'evt-2025-05',
    title: 'Annual Graduation & Outstanding Student Awards',
    amharicTitle: 'ዓመታዊ የተማሪዎች ምረቃ እና የላቀ ውጤት ሽልማት',
    type: 'SPECIAL_EVENT',
    startDate: '2026-06-28',
    endDate: '2026-06-28',
    academicYear: '2025/2026',
    semester: 'Semester II',
    description: 'Graduation ceremony for Level 8 graduates and award distribution for top 3 rankers in each class.',
    amharicDescription: 'የ8ኛ ክፍል ተማሪዎች የምረቃ ሥነ-ስርዓት እና የደረጃ ተሸላሚዎች የሽልማት ፕሮግራም።',
    location: 'Great Auditorium',
    targetAudience: 'ALL',
    isImportant: true,
  },
];

export let academicCalendarEvents: any[] = [...defaultAcademicCalendarEvents];

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

export function setBehavioralNotes(newNotes: any[]) {
  behavioralNotes = newNotes;
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

      // Ensure all 4 actor roles (Admin, Dept-Head, Teacher, Coordinator) are present with exact credentials requested
      const defaultUsersMap: Record<string, { email: string; pass: string; role: string; name: string; amharicName: string; employeeId: string; phone: string }> = {
        'usr-1': { email: 'ashu@admin.edu', pass: 'Admin@123!', role: 'ADMIN', name: 'Ashenafi Sentayehu', amharicName: 'አሸናፊ ስንታየሁ', employeeId: 'ADM-101', phone: '+251 919183146' },
        'usr-2': { email: 'head@head.edu', pass: 'Head@123!', role: 'DEPT_HEAD', name: 'Biruk Wendemeneh', amharicName: 'ብሩክ ወንድሜነህ', employeeId: 'DHD-201', phone: '+251 948822471' },
        'usr-3': { email: 'teacher@class.edu', pass: 'Teacher@123!', role: 'TEACHER', name: 'Instructor Abebe Kebede', amharicName: 'መምህር አበበ ከበደ', employeeId: 'TCH-301', phone: '+251 911 456789' },
        'usr-4': { email: 'teacher2@class.edu', pass: 'Teacher@123!', role: 'TEACHER', name: 'Instructor Tigist Haile', amharicName: 'መምህር ትዕግሥት ሀይሌ', employeeId: 'TCH-302', phone: '+251 911 567890' },
        'usr-5': { email: 'coordinator@amras.edu', pass: 'Coordinator@123!', role: 'COORDINATOR', name: 'Coordinator Dawit Bekele', amharicName: 'አስተባባሪ ዳዊት በቀለ', employeeId: 'CRD-401', phone: '+251 911 678901' },
      };

      // Synchronize and apply credentials to users collection
      for (const [id, def] of Object.entries(defaultUsersMap)) {
        let existing = users.find((u) => u.id === id || (u.role === def.role && u.role !== 'TEACHER'));
        if (!existing) {
          existing = {
            id,
            name: def.name,
            amharicName: def.amharicName,
            email: def.email,
            password: def.pass,
            phone: def.phone,
            employeeId: def.employeeId,
            role: def.role,
            status: 'ACTIVE',
            department: 'ህጻናት እና አዳጊ',
            createdAt: '2026-01-18T08:00:00Z',
          };
          users.push(existing);
          await dbSaveDoc('users', existing.id, existing);
        } else {
          let updated = false;
          // Synchronize email and password if not custom-edited
          if (existing.email === 'admin@amras.edu' || existing.email === 'ashu@admin.edu') {
            existing.email = 'ashu@admin.edu';
            existing.password = 'Admin@123!';
            updated = true;
          }
          if (existing.email === 'depthead@amras.edu' || existing.email === 'bura@head.edu' || existing.email === 'head@head.edu') {
            existing.email = 'head@head.edu';
            existing.password = 'Head@123!';
            updated = true;
          }
          if (existing.email === 'teacher@amras.edu' || existing.email === 'teacher1@amras.edu' || existing.email === 'teacher@class.edu') {
            existing.email = 'teacher@class.edu';
            existing.password = 'Teacher@123!';
            updated = true;
          }
          if (existing.email === 'teacher2@amras.edu' || existing.email === 'teacher2@class.edu') {
            existing.email = 'teacher2@class.edu';
            existing.password = 'Teacher@123!';
            updated = true;
          }
          if (existing.email === 'coordinator@amras.edu') {
            existing.email = 'coordinator@amras.edu';
            existing.password = 'Coordinator@123!';
            updated = true;
          }
          if (!existing.password) {
            existing.password = def.pass;
            updated = true;
          }
          if (updated) {
            await dbSaveDoc('users', existing.id, existing);
          }
        }
      }

      const dbClasses = await dbGetCollection('academicClasses');
      if (dbClasses && dbClasses.length > 0) {
        const existingClassIds = new Set(dbClasses.map((c: any) => c.id));
        const mergedClasses = [...dbClasses];
        for (const defClass of defaultEightClasses) {
          if (!existingClassIds.has(defClass.id)) {
            mergedClasses.push(defClass);
            await dbSaveDoc('academicClasses', defClass.id, defClass);
          }
        }
        mergedClasses.sort((a: any, b: any) => (a.level || 0) - (b.level || 0));
        academicClasses = mergedClasses;
      } else {
        academicClasses = [...defaultEightClasses];
        for (const c of academicClasses) await dbSaveDoc('academicClasses', c.id, c);
      }

      const dbYears = await dbGetCollection('academicYears');
      if (dbYears.length > 0) academicYears = dbYears.map((y: any) => y.year || y.id);

      const dbCourses = await dbGetCollection('courses');
      if (dbCourses.length > 0) courses = dbCourses;

      const dbStudents = await dbGetCollection('students');
      if (dbStudents && dbStudents.length > 0) {
        const existingStudentIds = new Set(dbStudents.map((s: any) => s.id));
        const mergedStudents = [...dbStudents];
        for (const defStd of defaultEightyStudents) {
          if (!existingStudentIds.has(defStd.id)) {
            mergedStudents.push(defStd);
            await dbSaveDoc('students', defStd.id, defStd);
          }
        }
        students = mergedStudents;
      } else {
        students = [...defaultEightyStudents];
        for (const st of students) await dbSaveDoc('students', st.id, st);
      }

      const dbMarks = await dbGetCollection('marks');
      if (dbMarks.length > 0) marks = dbMarks;

      const dbSubmissions = await dbGetCollection('submissionReviews');
      if (dbSubmissions.length > 0) submissionReviews = dbSubmissions;

      const dbSchedules = await dbGetCollection('schedules');
      if (dbSchedules.length > 0) schedules = dbSchedules;

      const dbAttendance = await dbGetCollection('attendanceRecords');
      if (dbAttendance.length > 0) attendanceRecords = dbAttendance;

      const dbNotes = await dbGetCollection('behavioralNotes');
      if (dbNotes && dbNotes.length > 0) {
        const existingNoteIds = new Set(dbNotes.map((n: any) => n.id));
        const mergedNotes = [...dbNotes];
        for (const defNote of defaultBehavioralNotes) {
          if (!existingNoteIds.has(defNote.id)) {
            mergedNotes.push(defNote);
            await dbSaveDoc('behavioralNotes', defNote.id, defNote);
          }
        }
        behavioralNotes = mergedNotes;
      } else {
        behavioralNotes = [...defaultBehavioralNotes];
        for (const note of behavioralNotes) await dbSaveDoc('behavioralNotes', note.id, note);
      }

      const dbAuditLogs = await dbGetCollection('auditLogs');
      if (dbAuditLogs.length > 0) auditLogs = dbAuditLogs;

      const dbEvents = await dbGetCollection('academicCalendarEvents');
      if (dbEvents && dbEvents.length > 0) {
        const existingEventIds = new Set(dbEvents.map((e: any) => e.id));
        const mergedEvents = [...dbEvents];
        for (const defEvt of defaultAcademicCalendarEvents) {
          if (!existingEventIds.has(defEvt.id)) {
            mergedEvents.push(defEvt);
            await dbSaveDoc('academicCalendarEvents', defEvt.id, defEvt);
          }
        }
        academicCalendarEvents = mergedEvents;
      } else {
        academicCalendarEvents = [...defaultAcademicCalendarEvents];
        for (const ev of academicCalendarEvents) await dbSaveDoc('academicCalendarEvents', ev.id, ev);
      }

      console.log(`✅ Firestore loaded: ${students.length} students, ${marks.length} mark records, ${attendanceRecords.length} attendance logs, and ${behavioralNotes.length} behavioral notes.`);
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
      for (const note of behavioralNotes) await dbSaveDoc('behavioralNotes', note.id, note);
      for (const log of auditLogs) await dbSaveDoc('auditLogs', log.id, log);
      for (const ev of academicCalendarEvents) await dbSaveDoc('academicCalendarEvents', ev.id, ev);
      console.log('✅ Initial database seed complete in Firestore!');
    }
  } catch (err) {
    console.error('Error during Firestore data initialization:', err);
  }
}
