import { Router, Request, Response } from 'express';
import {
  students,
  defaultEightyStudents,
  setStudents,
  academicClasses,
  courses,
  marks,
  attendanceRecords,
  behavioralNotes,
  setBehavioralNotes,
  auditLogs,
} from '../store/state';
import { dbSaveDoc, dbDeleteDoc } from '../db/firebase';

const router = Router();

// Students List
router.get('/', async (req: Request, res: Response) => {
  if (students.length < 80) {
    const existingStudentIds = new Set(students.map((s) => s.id));
    for (const defStd of defaultEightyStudents) {
      if (!existingStudentIds.has(defStd.id)) {
        students.push(defStd);
        await dbSaveDoc('students', defStd.id, defStd);
      }
    }
  }

  const sortedStudents = [...students].sort((a, b) => {
    const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
    const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
    return nameA.localeCompare(nameB);
  });

  res.json({ success: true, data: sortedStudents });
});

// Comprehensive Drill-down Student Profile
router.get('/:id/profile', async (req: Request, res: Response) => {
  const { id } = req.params;
  const student = students.find((s) => s.id === id || s.studentId === id);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  // 1. Academic Class
  const academicClass = academicClasses.find((c) => c.id === student.classId);

  // 2. Attendance History & Summary
  const studentAttendanceEntries: any[] = [];
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;

  attendanceRecords.forEach((record) => {
    const entry = (record.entries || []).find(
      (e: any) => e.studentId === student.id || e.studentCode === student.studentId
    );
    if (entry) {
      const status = entry.status || 'PRESENT';
      if (status === 'PRESENT') presentCount++;
      else if (status === 'ABSENT') absentCount++;
      else if (status === 'LATE') lateCount++;
      else if (status === 'EXCUSED') excusedCount++;

      studentAttendanceEntries.push({
        id: `${record.id}-${student.id}`,
        recordId: record.id,
        date: record.date,
        className: record.className || student.className,
        section: record.section || student.section,
        status: entry.status,
        remark: entry.remark || '',
        takenByUserName: record.takenByUserName || 'Academic Staff',
      });
    }
  });

  // Sort attendance newest first
  studentAttendanceEntries.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const totalSessions = studentAttendanceEntries.length;
  // Standard attendance rate: (Present + Late * 0.5 + Excused * 1) / total
  const attendanceRate =
    totalSessions > 0
      ? Number((((presentCount + lateCount * 0.5 + excusedCount) / totalSessions) * 100).toFixed(1))
      : 100;

  // 3. Academic Marks & Grades
  const studentMarks = marks
    .filter((m) => m.studentId === student.id || m.studentCode === student.studentId)
    .map((m) => {
      const course = courses.find((c) => c.id === m.courseId);
      return {
        ...m,
        courseCode: course ? course.code : m.courseId,
        courseTitle: course ? course.title : 'Course Assessment',
        courseAmharicTitle: course ? course.amharicTitle : 'የትምህርት ውጤት',
        creditHours: course ? course.creditHours : 3,
        semester: course ? course.semester : 'Semester I',
        academicYear: course ? course.academicYear : student.academicYear,
        teacherName: course ? course.teacherName : 'Course Instructor',
      };
    });

  // Calculate GPA and Academic Standing
  let totalCreditHours = 0;
  let earnedCreditHours = 0;
  let totalQualityPoints = 0;

  studentMarks.forEach((m) => {
    const credits = m.creditHours || 3;
    const gradePoint = m.gradePoint !== undefined ? m.gradePoint : 0;
    totalCreditHours += credits;
    if (m.grade !== 'F') {
      earnedCreditHours += credits;
    }
    totalQualityPoints += gradePoint * credits;
  });

  const gpa = totalCreditHours > 0 ? Number((totalQualityPoints / totalCreditHours).toFixed(2)) : 0;

  let standing = 'Satisfactory';
  let amharicStanding = 'ጥሩ አፈጻጸም';
  if (gpa >= 3.75) {
    standing = 'Great Distinction';
    amharicStanding = 'ከፍተኛ ማዕረግ (Great Distinction)';
  } else if (gpa >= 3.5) {
    standing = 'Distinction';
    amharicStanding = 'ማዕረግ (Distinction)';
  } else if (gpa >= 3.0) {
    standing = 'Very Good Standing';
    amharicStanding = 'በጣም ጥሩ አፈጻጸም';
  } else if (gpa >= 2.0) {
    standing = 'Good Academic Standing';
    amharicStanding = 'ጥሩ አፈጻጸም';
  } else if (totalCreditHours > 0) {
    standing = 'Academic Warning';
    amharicStanding = 'የአካዳሚክ ማሳሰቢያ';
  }

  // 4. Behavioral Notes
  const studentNotes = behavioralNotes
    .filter((n) => n.studentId === student.id || n.studentName === `${student.firstName} ${student.lastName}`)
    .sort((a, b) => (b.date || b.createdAt || '').localeCompare(a.date || a.createdAt || ''));

  res.json({
    success: true,
    data: {
      student,
      academicClass,
      attendanceSummary: {
        totalSessions,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        attendanceRate,
      },
      attendanceHistory: studentAttendanceEntries,
      grades: {
        marks: studentMarks,
        totalCreditHours,
        earnedCreditHours,
        gpa,
        standing,
        amharicStanding,
      },
      behavioralNotes: studentNotes,
    },
  });
});

// Behavioral Notes for a student
router.get('/:id/behavioral-notes', async (req: Request, res: Response) => {
  const { id } = req.params;
  const student = students.find((s) => s.id === id);
  const studentName = student ? `${student.firstName} ${student.lastName}` : '';
  const notes = behavioralNotes
    .filter((n) => n.studentId === id || (studentName && n.studentName === studentName))
    .sort((a, b) => (b.date || b.createdAt || '').localeCompare(a.date || a.createdAt || ''));

  res.json({ success: true, data: notes });
});

// Add Behavioral Note
router.post('/:id/behavioral-notes', async (req: Request, res: Response) => {
  const { id } = req.params;
  const student = students.find((s) => s.id === id);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const newNote = {
    id: `note-${Date.now()}`,
    studentId: student.id,
    studentName: `${student.firstName} ${student.lastName}`,
    studentAmharicName: student.amharicName,
    title: req.body.title || 'Behavioral Observation',
    category: req.body.category || 'GENERAL',
    severity: req.body.severity || 'POSITIVE',
    content: req.body.content || '',
    recordedByUserId: req.body.recordedByUserId || 'usr-1',
    recordedByUserName: req.body.recordedByUserName || 'Academic Staff',
    recordedByUserRole: req.body.recordedByUserRole || 'STAFF',
    date: req.body.date || new Date().toISOString().split('T')[0],
    academicYear: req.body.academicYear || student.academicYear || '2025/2026',
    actionTaken: req.body.actionTaken || '',
    followUpRequired: Boolean(req.body.followUpRequired),
    createdAt: new Date().toISOString(),
  };

  behavioralNotes.unshift(newNote);
  await dbSaveDoc('behavioralNotes', newNote.id, newNote);

  // Audit Log
  const logEntry = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: newNote.recordedByUserId,
    userName: newNote.recordedByUserName,
    userRole: (newNote.recordedByUserRole as any) || 'TEACHER',
    action: 'BEHAVIORAL_NOTE_ADDED',
    details: `Added note for ${student.firstName} ${student.lastName} (${newNote.category}): "${newNote.title}"`,
    ip: '192.168.1.1',
  };
  auditLogs.unshift(logEntry);
  await dbSaveDoc('auditLogs', logEntry.id, logEntry);

  res.json({ success: true, data: newNote });
});

// Delete Behavioral Note
router.delete('/:id/behavioral-notes/:noteId', async (req: Request, res: Response) => {
  const { noteId } = req.params;
  const filtered = behavioralNotes.filter((n) => n.id !== noteId);
  setBehavioralNotes(filtered);
  await dbDeleteDoc('behavioralNotes', noteId);
  res.json({ success: true, message: 'Behavioral note deleted' });
});

// Create Student
router.post('/', async (req: Request, res: Response) => {
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

// Update Student
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const index = students.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }
  students[index] = { ...students[index], ...req.body };
  await dbSaveDoc('students', id, students[index]);
  res.json({ success: true, data: students[index] });
});

// Delete Student
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const filtered = students.filter((s) => s.id !== id);
  setStudents(filtered);
  await dbDeleteDoc('students', id);
  res.json({ success: true, message: 'Student removed' });
});

export default router;

