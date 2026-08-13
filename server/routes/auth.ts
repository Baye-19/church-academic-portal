import { Router, Request, Response } from 'express';
import { users, auditLogs } from '../store/state';
import { dbSaveDoc } from '../db/firebase';

const router = Router();

// Login Route
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials or email not found' });
  }

  // Audit Log
  const logObj = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'USER_LOGIN',
    details: `User ${user.email} logged in successfully`,
    ip: req.ip || '127.0.0.1',
  };
  auditLogs.unshift(logObj);
  dbSaveDoc('auditLogs', logObj.id, logObj);

  res.json({
    success: true,
    data: {
      user,
      token: `mock-jwt-token-${user.id}`,
    },
  });
});

// Users List
router.get('/users', (req: Request, res: Response) => {
  res.json({ success: true, data: users });
});

// Create User
router.post('/users', async (req: Request, res: Response) => {
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

// Update Profile
router.put('/users/:id/profile', async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const { name, amharicName, phone, department, avatar } = req.body;
  if (name !== undefined) user.name = name;
  if (amharicName !== undefined) user.amharicName = amharicName;
  if (phone !== undefined) user.phone = phone;
  if (department !== undefined) user.department = department;
  if (avatar !== undefined) user.avatar = avatar;

  await dbSaveDoc('users', user.id, user);
  res.json({ success: true, data: user });
});

export default router;
