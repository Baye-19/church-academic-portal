import { Router, Request, Response } from 'express';
import { students, setStudents } from '../store/state';
import { dbSaveDoc, dbDeleteDoc } from '../db/firebase';

const router = Router();

// Students List
router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, data: students });
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
