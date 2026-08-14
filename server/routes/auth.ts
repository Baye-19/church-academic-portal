import { Router, Request, Response } from 'express';
import { users, auditLogs } from '../store/state';
import { dbSaveDoc } from '../db/firebase';

const router = Router();

// Helper to get fallback default password for role if missing
function getDefaultPasswordForRole(role: string, userId?: string): string {
  if (role === 'ADMIN') return 'Admin@123!';
  if (role === 'DEPT_HEAD') return 'Head@123!';
  if (role === 'TEACHER') return 'Teacher@123!';
  if (role === 'COORDINATOR') return 'Coordinator@123!';
  return 'Amras@123!';
}

// Login Route - Strictly matches registered email and password
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const inputEmail = (email || '').toLowerCase().trim();
  const inputPassword = (password || '').trim();

  if (!inputEmail) {
    return res.status(400).json({ success: false, message: 'Please provide your email address.' });
  }
  if (!inputPassword) {
    return res.status(400).json({ success: false, message: 'Please provide your password.' });
  }

  // Find user by exact registered email (case-insensitive) or employee ID
  const user = users.find((u) => {
    const userEmail = (u.email || '').toLowerCase().trim();
    const userEmpId = (u.employeeId || '').toLowerCase().trim();
    return userEmail === inputEmail || userEmpId === inputEmail;
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'No account registered with this email address. Please check your email or contact the administrator.',
    });
  }

  // Determine expected password for user
  const expectedPassword = user.password || getDefaultPasswordForRole(user.role, user.id);

  if (inputPassword !== expectedPassword) {
    return res.status(401).json({
      success: false,
      message: 'Incorrect password. Please verify your credentials and try again.',
    });
  }

  // Check account status
  if (user.status && user.status !== 'ACTIVE') {
    return res.status(403).json({
      success: false,
      message: 'Your account is currently inactive or suspended. Please contact the administrator.',
    });
  }

  // Ensure password is saved in user object if it was defaulted
  if (!user.password) {
    user.password = expectedPassword;
    dbSaveDoc('users', user.id, user);
  }

  // Audit Log
  const logObj = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'USER_LOGIN',
    details: `User ${user.email} (${user.role}) logged in successfully`,
    ip: req.ip || '127.0.0.1',
  };
  auditLogs.unshift(logObj);
  dbSaveDoc('auditLogs', logObj.id, logObj);

  const { password: _pwd, ...safeUser } = user;

  res.json({
    success: true,
    user: safeUser,
    token: `jwt-auth-token-${user.id}-${Date.now()}`,
    data: {
      user: safeUser,
      token: `jwt-auth-token-${user.id}-${Date.now()}`,
    },
  });
});

// Users List
router.get('/users', (req: Request, res: Response) => {
  const safeUsers = users.map(({ password: _pwd, ...u }) => u);
  res.json({ success: true, data: safeUsers });
});

// Create User
router.post('/users', async (req: Request, res: Response) => {
  const cleanEmail = (req.body.email || '').toLowerCase().trim();
  const existingUser = users.find((u) => (u.email || '').toLowerCase().trim() === cleanEmail);
  if (cleanEmail && existingUser) {
    return res.status(400).json({ success: false, message: 'A user with this email address already exists.' });
  }

  const role = req.body.role || 'TEACHER';
  const defaultPassword = getDefaultPasswordForRole(role);

  const newUser = {
    id: `usr-${Date.now()}`,
    ...req.body,
    email: cleanEmail,
    password: req.body.password || defaultPassword,
    status: req.body.status || 'ACTIVE',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await dbSaveDoc('users', newUser.id, newUser);

  const { password: _pwd, ...safeUser } = newUser;
  res.json({ success: true, data: safeUser });
});

// Update Profile (Allows updating Name, Amharic Name, Email, Password, Phone, Department, Avatar)
router.put('/users/:id/profile', async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const { name, amharicName, email, password, phone, department, avatar } = req.body;

  if (email !== undefined && email.trim() !== '') {
    const cleanEmail = email.toLowerCase().trim();
    // Validate uniqueness if changing email
    const duplicate = users.find((u) => u.id !== id && (u.email || '').toLowerCase().trim() === cleanEmail);
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'This email address is already in use by another account.' });
    }
    user.email = cleanEmail;
  }

  if (password !== undefined && password.trim() !== '') {
    user.password = password.trim();
  }

  if (name !== undefined) user.name = name.trim();
  if (amharicName !== undefined) user.amharicName = amharicName.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (department !== undefined) user.department = department.trim();
  if (avatar !== undefined) user.avatar = avatar;

  await dbSaveDoc('users', user.id, user);

  // Log profile update in audit trail
  const logObj = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'PROFILE_UPDATE',
    details: `User ${user.name} updated account profile (email: ${user.email})`,
    ip: req.ip || '127.0.0.1',
  };
  auditLogs.unshift(logObj);
  dbSaveDoc('auditLogs', logObj.id, logObj);

  const { password: _pwd, ...safeUser } = user;
  res.json({ success: true, data: safeUser });
});

export default router;
