import { Router, Request, Response } from 'express';
import { academicClasses, academicYears, courses, schedules, students } from '../store/state';
import { dbSaveDoc, dbDeleteDoc } from '../db/firebase';

const router = Router();

// Academic Classes
router.get('/classes', (req: Request, res: Response) => {
  res.json({ success: true, data: academicClasses });
});

router.post('/classes', async (req: Request, res: Response) => {
  const { name, amharicName, level, academicYear, sections, semesters } = req.body;
  const newClass = {
    id: `cls-${Date.now()}`,
    name: name || `Class ${academicClasses.length + 1}`,
    amharicName: amharicName || `ደረጃ ${academicClasses.length + 1}`,
    level: level || academicClasses.length + 1,
    academicYear: academicYear || '2025/2026',
    sections: Array.isArray(sections) && sections.length > 0 ? sections : ['A', 'B'],
    semesters: Array.isArray(semesters) && semesters.length > 0 ? semesters : ['Semester I', 'Semester II'],
  };
  academicClasses.push(newClass);
  await dbSaveDoc('academicClasses', newClass.id, newClass);
  res.json({ success: true, data: newClass });
});

router.put('/classes/:id', async (req: Request, res: Response) => {
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

// Academic Years
router.get('/academic-years', (req: Request, res: Response) => {
  res.json({ success: true, data: academicYears });
});

router.post('/academic-years', async (req: Request, res: Response) => {
  const { year } = req.body;
  if (year && !academicYears.includes(year)) {
    academicYears.push(year);
    await dbSaveDoc('academicYears', year, { id: year, year });
  }
  res.json({ success: true, data: academicYears });
});

// Courses
router.get('/courses', (req: Request, res: Response) => {
  res.json({ success: true, data: courses });
});

router.post('/courses', async (req: Request, res: Response) => {
  const newCourse = {
    id: `crs-${Date.now()}`,
    ...req.body,
    status: 'ACTIVE',
  };
  courses.push(newCourse);
  await dbSaveDoc('courses', newCourse.id, newCourse);
  res.json({ success: true, data: newCourse });
});

router.put('/courses/:id', async (req: Request, res: Response) => {
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

// Schedules
router.get('/schedules', (req: Request, res: Response) => {
  res.json({ success: true, data: schedules });
});

router.post('/schedules', async (req: Request, res: Response) => {
  const newSched = req.body;

  // Conflict Detection
  const conflict = schedules.find((s) => {
    if (s.id === newSched.id) return false;
    const sameDay = s.day === newSched.day;
    if (!sameDay) return false;

    const teacherConflict = s.teacherId === newSched.teacherId;
    const roomConflict = s.room && newSched.room && s.room.toLowerCase() === newSched.room.toLowerCase();

    if (!teacherConflict && !roomConflict) return false;

    const parseMinutes = (tStr: string) => {
      const [h, m] = (tStr || '00:00').split(':').map(Number);
      return h * 60 + m;
    };

    const sStart = parseMinutes(s.startTime);
    const sEnd = parseMinutes(s.endTime);
    const nStart = parseMinutes(newSched.startTime);
    const nEnd = parseMinutes(newSched.endTime);

    return Math.max(sStart, nStart) < Math.min(sEnd, nEnd);
  });

  if (conflict) {
    const isTeacher = conflict.teacherId === newSched.teacherId;
    return res.status(400).json({
      success: false,
      message: isTeacher
        ? `Schedule conflict: Instructor ${conflict.teacherName} is already assigned to ${conflict.courseCode} in ${conflict.room} on ${conflict.day} (${conflict.startTime}-${conflict.endTime})`
        : `Schedule conflict: Room ${conflict.room} is already booked for ${conflict.courseCode} on ${conflict.day} (${conflict.startTime}-${conflict.endTime})`,
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

router.put('/schedules/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const index = schedules.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Schedule item not found' });
  }

  const newSched = req.body;

  // Conflict Detection
  const conflict = schedules.find((s) => {
    if (s.id === id) return false;
    const sameDay = s.day === newSched.day;
    if (!sameDay) return false;

    const teacherConflict = s.teacherId === newSched.teacherId;
    const roomConflict = s.room && newSched.room && s.room.toLowerCase() === newSched.room.toLowerCase();

    if (!teacherConflict && !roomConflict) return false;

    const parseMinutes = (tStr: string) => {
      const [h, m] = (tStr || '00:00').split(':').map(Number);
      return h * 60 + m;
    };

    const sStart = parseMinutes(s.startTime);
    const sEnd = parseMinutes(s.endTime);
    const nStart = parseMinutes(newSched.startTime);
    const nEnd = parseMinutes(newSched.endTime);

    return Math.max(sStart, nStart) < Math.min(sEnd, nEnd);
  });

  if (conflict) {
    const isTeacher = conflict.teacherId === newSched.teacherId;
    return res.status(400).json({
      success: false,
      message: isTeacher
        ? `Schedule conflict: Instructor ${conflict.teacherName} is already assigned to ${conflict.courseCode} in ${conflict.room} on ${conflict.day} (${conflict.startTime}-${conflict.endTime})`
        : `Schedule conflict: Room ${conflict.room} is already booked for ${conflict.courseCode} on ${conflict.day} (${conflict.startTime}-${conflict.endTime})`,
    });
  }

  schedules[index] = {
    ...schedules[index],
    ...newSched,
  };
  await dbSaveDoc('schedules', id, schedules[index]);

  res.json({ success: true, data: schedules[index] });
});

router.delete('/schedules/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = schedules.findIndex((s) => s.id === id);
  if (idx !== -1) {
    schedules.splice(idx, 1);
  }
  await dbDeleteDoc('schedules', id);
  res.json({ success: true, message: 'Schedule removed' });
});

export default router;
