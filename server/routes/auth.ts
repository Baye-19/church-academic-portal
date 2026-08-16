import { Router, Request, Response } from 'express';
import { users, students, courses, auditLogs } from '../store/state';
import { dbSaveDoc } from '../db/firebase';
import {
  hashPassword,
  comparePassword,
  generateToken,
  authenticateToken,
  AuthenticatedRequest,
} from '../utils/auth';

const router = Router();

// Helper to get fallback default password for role if missing
function getDefaultPasswordForRole(role: string): string {
  if (role === 'ADMIN') return 'Admin@123!';
  if (role === 'DEPT_HEAD') return 'Head@123!';
  if (role === 'TEACHER') return 'Teacher@123!';
  if (role === 'COORDINATOR') return 'Coordinator@123!';
  if (role === 'STUDENT') return 'Student@123!';
  return 'Amras@123!';
}

// 1. Login Route - Bcrypt Password Verification & Cryptographically Signed JWT Token Generation
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const inputEmail = (email || '').toLowerCase().trim();
  const inputPassword = (password || '').trim();

  if (!inputEmail) {
    return res.status(400).json({ success: false, message: 'Please provide your email address or ID.' });
  }
  if (!inputPassword) {
    return res.status(400).json({ success: false, message: 'Please provide your password.' });
  }

  // Find user by registered email (case-insensitive) or employee ID / alias
  let user = users.find((u) => {
    const userEmail = (u.email || '').toLowerCase().trim();
    const userEmpId = (u.employeeId || '').toLowerCase().trim();
    const userAlias = (u.emailAlias || '').toLowerCase().trim();
    return userEmail === inputEmail || userEmpId === inputEmail || (userAlias && userAlias === inputEmail);
  });

  // If not found in staff users, check if a registered student is logging in
  if (!user) {
    const studentMatch = students.find((s) => {
      const sEmail = (s.email || '').toLowerCase().trim();
      const sId = (s.studentId || '').toLowerCase().trim();
      return sEmail === inputEmail || sId === inputEmail;
    });

    if (studentMatch) {
      const studentHashedPass = await hashPassword('Student@123!');
      user = {
        id: studentMatch.id,
        name: `${studentMatch.firstName} ${studentMatch.lastName}`.trim(),
        amharicName: studentMatch.amharicName,
        email: studentMatch.email,
        password: studentHashedPass,
        phone: studentMatch.phone,
        employeeId: studentMatch.studentId,
        role: 'STUDENT',
        status: studentMatch.status || 'ACTIVE',
        department: studentMatch.className || 'Sunday School',
        classId: studentMatch.classId,
        className: studentMatch.className,
        section: studentMatch.section,
        createdAt: studentMatch.registeredDate || new Date().toISOString(),
      };
    }
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'No account registered with this email or ID. Please check your credentials or contact the administrator.',
    });
  }

  // Password comparison with bcrypt (supports legacy plaintext migration safely)
  const storedPassword = user.password || (await hashPassword(getDefaultPasswordForRole(user.role)));
  const isMatch = await comparePassword(inputPassword, storedPassword);

  if (!isMatch) {
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

  // If stored password was not a bcrypt hash or was missing, upgrade it immediately to bcrypt
  if (!user.password || !/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(user.password)) {
    user.password = await hashPassword(inputPassword);
    if (user.id && user.id.startsWith('usr-')) {
      await dbSaveDoc('users', user.id, user);
    }
  }

  // Cryptographically sign a secure JWT Token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    amharicName: user.amharicName,
  });

  // Audit Log
  const logObj = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'USER_LOGIN',
    details: `User ${user.email} (${user.role}) logged in successfully with cryptographically signed JWT`,
    ip: req.ip || '127.0.0.1',
  };
  auditLogs.unshift(logObj);
  dbSaveDoc('auditLogs', logObj.id, logObj);

  const { password: _pwd, ...safeUser } = user;

  res.json({
    success: true,
    user: safeUser,
    token,
    data: {
      user: safeUser,
      token,
    },
  });
});

// 2. Verify Session / Current User Profile Endpoint
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const tokenUser = req.user;
  if (!tokenUser) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const user = users.find((u) => u.id === tokenUser.id) || students.find((s) => s.id === tokenUser.id);
  if (!user) {
    return res.json({ success: true, user: tokenUser, data: tokenUser });
  }

  const { password: _pwd, ...safeUser } = user;
  res.json({ success: true, user: safeUser, data: safeUser });
});

// 3. Users List (Passwords stripped)
router.get('/users', (req: Request, res: Response) => {
  const safeUsers = users.map(({ password: _pwd, ...u }) => u);
  res.json({ success: true, data: safeUsers });
});

// 4. Create User (Hashes Password with bcrypt before storage, syncs course assignments)
router.post('/users', async (req: Request, res: Response) => {
  const cleanEmail = (req.body.email || '').toLowerCase().trim();
  const existingUser = users.find((u) => (u.email || '').toLowerCase().trim() === cleanEmail);
  if (cleanEmail && existingUser) {
    return res.status(400).json({ success: false, message: 'A user with this email address already exists.' });
  }

  const role = req.body.role || 'TEACHER';
  const plainPassword = req.body.password || getDefaultPasswordForRole(role);
  const hashedPassword = await hashPassword(plainPassword);

  const newUser = {
    id: `usr-${Date.now()}`,
    ...req.body,
    email: cleanEmail,
    password: hashedPassword,
    assignedClassIds: Array.isArray(req.body.assignedClassIds) ? req.body.assignedClassIds : [],
    assignedCourseIds: Array.isArray(req.body.assignedCourseIds) ? req.body.assignedCourseIds : [],
    canAccessAllClasses: Boolean(req.body.canAccessAllClasses),
    status: req.body.status || 'ACTIVE',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await dbSaveDoc('users', newUser.id, newUser);

  // Synchronize courses if assignedCourseIds are provided
  if (newUser.assignedCourseIds.length > 0) {
    for (const courseId of newUser.assignedCourseIds) {
      const course = courses.find((c) => c.id === courseId);
      if (course) {
        course.teacherId = newUser.id;
        course.teacherName = newUser.name;
        await dbSaveDoc('courses', course.id, course);
      }
    }
  }

  const { password: _pwd, ...safeUser } = newUser;
  res.json({ success: true, data: safeUser });
});

// 5. Update Profile & Assignments (Allows updating Name, Amharic Name, Email, Password, Phone, Department, Avatar, Assigned Classes, Assigned Courses, and All-Class Authority)
router.put('/users/:id/profile', async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const {
    name,
    amharicName,
    email,
    password,
    phone,
    department,
    avatar,
    role,
    status,
    employeeId,
    assignedClassIds,
    assignedCourseIds,
    canAccessAllClasses,
  } = req.body;

  if (email !== undefined && email.trim() !== '') {
    const cleanEmail = email.toLowerCase().trim();
    // Validate uniqueness if changing email
    const duplicate = users.find((u) => u.id !== id && (u.email || '').toLowerCase().trim() === cleanEmail);
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'This email address is already in use by another account.' });
    }
    user.email = cleanEmail;
  }

  // Hash new password using bcrypt before saving
  if (password !== undefined && password.trim() !== '') {
    user.password = await hashPassword(password.trim());
  }

  if (name !== undefined) user.name = name.trim();
  if (amharicName !== undefined) user.amharicName = amharicName.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (department !== undefined) user.department = department.trim();
  if (avatar !== undefined) user.avatar = avatar;
  if (role !== undefined) user.role = role;
  if (status !== undefined) user.status = status;
  if (employeeId !== undefined) user.employeeId = employeeId;
  if (assignedClassIds !== undefined) user.assignedClassIds = assignedClassIds;
  if (assignedCourseIds !== undefined) {
    user.assignedCourseIds = assignedCourseIds;
    // Update courses mapping
    for (const course of courses) {
      if (assignedCourseIds.includes(course.id)) {
        course.teacherId = user.id;
        course.teacherName = user.name;
        await dbSaveDoc('courses', course.id, course);
      } else if (course.teacherId === user.id) {
        // Only clear if was previously assigned to this teacher and now unselected
        course.teacherId = '';
        course.teacherName = '';
        await dbSaveDoc('courses', course.id, course);
      }
    }
  }
  if (canAccessAllClasses !== undefined) user.canAccessAllClasses = Boolean(canAccessAllClasses);

  await dbSaveDoc('users', user.id, user);

  // Log profile update in audit trail
  const logObj = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'PROFILE_UPDATE',
    details: `User ${user.name} (${user.role}) profile/assignments updated`,
    ip: req.ip || '127.0.0.1',
  };
  auditLogs.unshift(logObj);
  dbSaveDoc('auditLogs', logObj.id, logObj);

  const { password: _pwd, ...safeUser } = user;
  res.json({ success: true, data: safeUser });
});

// Alias for general user updates
router.put('/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  Object.assign(user, req.body);
  if (req.body.assignedCourseIds) {
    for (const course of courses) {
      if (req.body.assignedCourseIds.includes(course.id)) {
        course.teacherId = user.id;
        course.teacherName = user.name;
        await dbSaveDoc('courses', course.id, course);
      }
    }
  }
  await dbSaveDoc('users', user.id, user);
  const { password: _pwd, ...safeUser } = user;
  res.json({ success: true, data: safeUser });
});

export default router;
