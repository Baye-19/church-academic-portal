import { Router, Request, Response } from 'express';
import { attendanceRecords, auditLogs } from '../store/state';
import { dbSaveDoc } from '../db/firebase';

const router = Router();

// Get Attendance
router.get('/', (req: Request, res: Response) => {
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

// Save Attendance
router.post('/', async (req: Request, res: Response) => {
  const { classId, className, section, date, takenByUserId, takenByUserName, entries } = req.body;

  const existingIdx = attendanceRecords.findIndex((a) => a.classId === classId && a.date === date);

  const recordObj = {
    id: existingIdx !== -1 ? attendanceRecords[existingIdx].id : `att-${Date.now()}`,
    classId,
    className: className || 'Class',
    section: section || 'A',
    date: date || new Date().toISOString().split('T')[0],
    takenByUserId: takenByUserId || 'usr-1',
    takenByUserName: takenByUserName || 'User',
    entries: entries || [],
    createdAt: new Date().toISOString(),
  };

  if (existingIdx !== -1) {
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
    userName: takenByUserName || 'User',
    userRole: 'ADMIN',
    action: 'ATTENDANCE_TAKEN',
    details: `Recorded attendance for ${className} on ${date} (${entries.length} students)`,
    ip: req.ip || '127.0.0.1',
  };
  auditLogs.unshift(logObj);
  await dbSaveDoc('auditLogs', logObj.id, logObj);

  res.json({ success: true, data: recordObj });
});

export default router;
