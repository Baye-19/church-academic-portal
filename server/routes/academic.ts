import { Router, Request, Response } from 'express';
import { academicClasses, defaultEightClasses, academicYears, courses, schedules, students, academicCalendarEvents, defaultAcademicCalendarEvents } from '../store/state';
import { dbSaveDoc, dbDeleteDoc } from '../db/firebase';

const router = Router();

// Academic Classes
router.get('/classes', async (req: Request, res: Response) => {
  if (academicClasses.length < 8) {
    const existingClassIds = new Set(academicClasses.map((c: any) => c.id));
    for (const defClass of defaultEightClasses) {
      if (!existingClassIds.has(defClass.id)) {
        academicClasses.push(defClass);
        await dbSaveDoc('academicClasses', defClass.id, defClass);
      }
    }
    academicClasses.sort((a: any, b: any) => (a.level || 0) - (b.level || 0));
  }
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

// Academic Calendar Events
router.get('/academic-calendar', async (req: Request, res: Response) => {
  const { academicYear, semester, type } = req.query;

  // Ensure default events are seeded if empty
  if (academicCalendarEvents.length === 0) {
    for (const defEvt of defaultAcademicCalendarEvents) {
      academicCalendarEvents.push(defEvt);
      await dbSaveDoc('academicCalendarEvents', defEvt.id, defEvt);
    }
  }

  let filtered = [...academicCalendarEvents];

  if (academicYear && typeof academicYear === 'string' && academicYear !== 'ALL') {
    filtered = filtered.filter((e) => e.academicYear === academicYear || e.academicYear === 'ALL');
  }

  if (semester && typeof semester === 'string' && semester !== 'All') {
    filtered = filtered.filter((e) => !e.semester || e.semester === 'All' || e.semester === semester);
  }

  if (type && typeof type === 'string' && type !== 'ALL') {
    filtered = filtered.filter((e) => e.type === type);
  }

  // Sort by start date ascending
  filtered.sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));

  res.json({ success: true, data: filtered });
});

router.post('/academic-calendar', async (req: Request, res: Response) => {
  const {
    title,
    amharicTitle,
    type,
    startDate,
    endDate,
    academicYear,
    semester,
    description,
    amharicDescription,
    location,
    targetAudience,
    isImportant,
    color,
    createdBy,
  } = req.body;

  if (!title || !startDate || !type) {
    return res.status(400).json({ success: false, message: 'Title, start date, and event type are required.' });
  }

  const newEvent = {
    id: `evt-${Date.now()}`,
    title,
    amharicTitle: amharicTitle || title,
    type: type || 'ACADEMIC_MILESTONE',
    startDate,
    endDate: endDate || startDate,
    academicYear: academicYear || '2026/2027',
    semester: semester || 'All',
    description: description || '',
    amharicDescription: amharicDescription || description || '',
    location: location || '',
    targetAudience: targetAudience || 'ALL',
    isImportant: Boolean(isImportant),
    color: color || '',
    createdBy: createdBy || 'Admin',
    createdAt: new Date().toISOString(),
  };

  academicCalendarEvents.push(newEvent);
  await dbSaveDoc('academicCalendarEvents', newEvent.id, newEvent);

  res.json({ success: true, data: newEvent });
});

router.put('/academic-calendar/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const index = academicCalendarEvents.findIndex((e) => e.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Academic event not found' });
  }

  academicCalendarEvents[index] = {
    ...academicCalendarEvents[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  await dbSaveDoc('academicCalendarEvents', id, academicCalendarEvents[index]);

  res.json({ success: true, data: academicCalendarEvents[index] });
});

router.delete('/academic-calendar/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const index = academicCalendarEvents.findIndex((e) => e.id === id);
  if (index !== -1) {
    academicCalendarEvents.splice(index, 1);
  }
  await dbDeleteDoc('academicCalendarEvents', id);

  res.json({ success: true, message: 'Academic event removed successfully' });
});

export default router;
