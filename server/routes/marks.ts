import { Router, Request, Response } from 'express';
import { marks, submissionReviews, courses, academicClasses, auditLogs, notifications, calculateGrade } from '../store/state';
import { dbSaveDoc } from '../db/firebase';

const router = Router();

// Get Marks
router.get('/marks', (req: Request, res: Response) => {
  const { courseId } = req.query;
  if (courseId) {
    const filtered = marks.filter((m) => m.courseId === courseId);
    return res.json({ success: true, data: filtered });
  }
  res.json({ success: true, data: marks });
});

// Save Marks
router.post('/marks/save', async (req: Request, res: Response) => {
  const { courseId, entries, isSubmit, teacherId, teacherName, statusOverride } = req.body;

  // Determine existing course mark status
  const existingCourseMarks = marks.filter((m) => m.courseId === courseId);
  const existingStatus = existingCourseMarks.length > 0 ? existingCourseMarks[0].status : 'DRAFT';

  // Compute final status:
  // 1. Explicit statusOverride (e.g. 'APPROVED', 'DRAFT', 'SUBMITTED')
  // 2. If existing was APPROVED and not explicitly resubmitting, keep APPROVED
  // 3. Otherwise SUBMITTED if isSubmit, else DRAFT
  let resolvedStatus = 'DRAFT';
  if (statusOverride) {
    resolvedStatus = statusOverride;
  } else if (existingStatus === 'APPROVED') {
    resolvedStatus = 'APPROVED';
  } else if (isSubmit) {
    resolvedStatus = 'SUBMITTED';
  }

  for (const entry of entries) {
    let total = Number(entry.assignment || 0) + Number(entry.quiz || 0) + Number(entry.midterm || 0) + Number(entry.final || 0);
    if (entry.customMarks && typeof entry.customMarks === 'object') {
      Object.values(entry.customMarks).forEach((val: any) => {
        total += Number(val || 0);
      });
    }

    const { grade, point } = calculateGrade(total);

    const markObj = {
      id: entry.id || `mrk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      studentId: entry.studentId,
      studentCode: entry.studentCode,
      studentName: entry.studentName,
      studentAmharicName: entry.studentAmharicName,
      courseId,
      assignment: Number(entry.assignment || 0),
      quiz: Number(entry.quiz || 0),
      midterm: Number(entry.midterm || 0),
      final: Number(entry.final || 0),
      customMarks: entry.customMarks || {},
      total,
      grade,
      gradePoint: point,
      status: resolvedStatus,
    };

    const existingIdx = marks.findIndex((m) => m.studentId === entry.studentId && m.courseId === courseId);
    if (existingIdx !== -1) {
      marks[existingIdx] = { ...marks[existingIdx], ...markObj };
    } else {
      marks.push(markObj);
    }
    await dbSaveDoc('marks', markObj.id, markObj);
  }

  // Update submission review stats if SUBMITTED or APPROVED
  if (isSubmit || resolvedStatus === 'APPROVED' || resolvedStatus === 'SUBMITTED') {
    const courseObj = courses.find((c) => c.id === courseId);
    const courseMarks = marks.filter((m) => m.courseId === courseId);
    const avgScore = courseMarks.length > 0 ? courseMarks.reduce((acc, curr) => acc + curr.total, 0) / courseMarks.length : 0;
    const passCount = courseMarks.filter((m) => m.total >= 50).length;
    const passRate = courseMarks.length > 0 ? (passCount / courseMarks.length) * 100 : 0;

    const subObj = {
      id: `sub-${courseId}`,
      courseId,
      courseCode: courseObj?.code || 'CS101',
      courseTitle: courseObj?.title || 'Course',
      teacherId: teacherId || courseObj?.teacherId || 'usr-3',
      teacherName: teacherName || courseObj?.teacherName || 'Teacher',
      coordinatorId: courseObj?.coordinatorId || 'usr-5',
      coordinatorName: courseObj?.coordinatorName || 'Coordinator',
      studentCount: entries.length,
      submittedAt: new Date().toISOString(),
      status: resolvedStatus === 'APPROVED' ? 'APPROVED' : 'SUBMITTED',
      averageScore: Number(avgScore.toFixed(2)),
      passRate: Number(passRate.toFixed(1)),
      ...(resolvedStatus === 'APPROVED' ? { reviewedAt: new Date().toISOString() } : {}),
    };

    const subIndex = submissionReviews.findIndex((s) => s.courseId === courseId);
    if (subIndex !== -1) {
      submissionReviews[subIndex] = { ...submissionReviews[subIndex], ...subObj };
    } else {
      submissionReviews.push(subObj);
    }
    await dbSaveDoc('submissionReviews', subObj.id, subObj);

    // Audit Log
    const logObj = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: teacherId || 'usr-1',
      userName: teacherName || 'Admin / Teacher',
      userRole: resolvedStatus === 'APPROVED' ? 'ADMIN' : 'TEACHER',
      action: resolvedStatus === 'APPROVED' ? 'MARKS_UPDATED_BY_ADMIN' : 'MARKS_SUBMITTED',
      details: `${resolvedStatus === 'APPROVED' ? 'Admin updated student marks' : 'Submitted marks'} for ${courseObj?.code} (${entries.length} students)`,
      ip: req.ip || '127.0.0.1',
    };
    auditLogs.unshift(logObj);
    await dbSaveDoc('auditLogs', logObj.id, logObj);

    if (resolvedStatus === 'SUBMITTED') {
      const classObj = academicClasses.find((cls) => cls.id === courseObj?.classId);
      notifications.unshift({
        id: `notif-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: courseObj?.coordinatorId || 'usr-5',
        title: 'New Grade Submission for Review',
        message: `${teacherName || 'Teacher'} submitted grade list for ${courseObj?.code} (${classObj?.name || 'Class'}). Please review and approve.`,
        read: false,
        type: 'info',
      });
    }
  }

  res.json({
    success: true,
    status: resolvedStatus,
    message:
      resolvedStatus === 'APPROVED'
        ? 'Approved student marks successfully updated'
        : isSubmit
        ? 'Marks submitted for review'
        : 'Draft marks saved successfully',
  });
});

// Result Analysis
router.get('/results/course/:courseId', (req: Request, res: Response) => {
  const { courseId } = req.params;
  const courseMarks = marks.filter((m) => m.courseId === courseId);
  const totalStudents = courseMarks.length;

  if (totalStudents === 0) {
    return res.json({
      success: true,
      data: {
        totalStudents: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passCount: 0,
        failCount: 0,
        passRate: 0,
        gradeDistribution: [],
      },
    });
  }

  const scores = courseMarks.map((m) => m.total);
  const averageScore = scores.reduce((a, b) => a + b, 0) / totalStudents;
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);
  const passCount = scores.filter((s) => s >= 50).length;
  const failCount = totalStudents - passCount;
  const passRate = (passCount / totalStudents) * 100;

  const gradeCounts: { [key: string]: number } = {};
  courseMarks.forEach((m) => {
    gradeCounts[m.grade] = (gradeCounts[m.grade] || 0) + 1;
  });

  const gradeDistribution = Object.keys(gradeCounts).map((g) => ({
    grade: g,
    count: gradeCounts[g],
  }));

  res.json({
    success: true,
    data: {
      totalStudents,
      averageScore: Number(averageScore.toFixed(2)),
      highestScore,
      lowestScore,
      passCount,
      failCount,
      passRate: Number(passRate.toFixed(1)),
      gradeDistribution,
    },
  });
});

// Submissions
router.get('/submissions', (req: Request, res: Response) => {
  res.json({ success: true, data: submissionReviews });
});

// Unlock Marks for a Course (revert APPROVED / SUBMITTED to DRAFT so it is editable)
router.post('/marks/:courseId/unlock', async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { userId, userName } = req.body;

  let count = 0;
  for (const m of marks) {
    if (m.courseId === courseId) {
      m.status = 'DRAFT';
      delete m.rejectionReason;
      await dbSaveDoc('marks', m.id, m);
      count++;
    }
  }

  // Update submission review record if exists
  const subIdx = submissionReviews.findIndex((s) => s.courseId === courseId);
  if (subIdx !== -1) {
    submissionReviews[subIdx].status = 'DRAFT';
    await dbSaveDoc('submissionReviews', submissionReviews[subIdx].id, submissionReviews[subIdx]);
  }

  const courseObj = courses.find((c) => c.id === courseId);
  const logObj = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: userId || 'usr-1',
    userName: userName || 'Admin',
    userRole: 'ADMIN',
    action: 'MARKS_UNLOCKED',
    details: `Unlocked marks for ${courseObj?.code || courseId} to editable DRAFT status (${count} records)`,
    ip: req.ip || '127.0.0.1',
  };
  auditLogs.unshift(logObj);
  await dbSaveDoc('auditLogs', logObj.id, logObj);

  res.json({
    success: true,
    status: 'DRAFT',
    message: `Marks for ${courseObj?.code || courseId} unlocked and set to editable draft state`,
  });
});

// Unlock All Marks globally
router.post('/marks/unlock-all', async (req: Request, res: Response) => {
  for (const m of marks) {
    m.status = 'DRAFT';
    delete m.rejectionReason;
    await dbSaveDoc('marks', m.id, m);
  }
  for (const s of submissionReviews) {
    s.status = 'DRAFT';
    await dbSaveDoc('submissionReviews', s.id, s);
  }
  res.json({ success: true, message: 'All student marks unlocked and made editable.' });
});

// Approve Submission
router.post('/submissions/:id/approve', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reviewerId, reviewerName } = req.body;
  const sub = submissionReviews.find((s) => s.id === id);

  if (sub) {
    sub.status = 'APPROVED';
    sub.reviewedAt = new Date().toISOString();
    await dbSaveDoc('submissionReviews', sub.id, sub);

    for (const m of marks) {
      if (m.courseId === sub.courseId) {
        m.status = 'APPROVED';
        await dbSaveDoc('marks', m.id, m);
      }
    }

    const logObj = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: reviewerId || 'usr-5',
      userName: reviewerName || 'Coordinator',
      userRole: 'COORDINATOR',
      action: 'MARKS_APPROVED',
      details: `Approved marks for ${sub.courseCode}`,
      ip: req.ip || '127.0.0.1',
    };
    auditLogs.unshift(logObj);
    await dbSaveDoc('auditLogs', logObj.id, logObj);

    notifications.unshift({
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: sub.teacherId,
      title: 'Grade Submission Approved',
      message: `Your submitted marks for ${sub.courseCode} have been reviewed and approved.`,
      read: false,
      type: 'success',
    });
  }

  res.json({ success: true, message: 'Submission approved' });
});

// Reject Submission
router.post('/submissions/:id/reject', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reviewerId, reviewerName, reason } = req.body;
  const sub = submissionReviews.find((s) => s.id === id);

  if (sub) {
    sub.status = 'REJECTED';
    sub.rejectionReason = reason;
    sub.reviewedAt = new Date().toISOString();
    await dbSaveDoc('submissionReviews', sub.id, sub);

    for (const m of marks) {
      if (m.courseId === sub.courseId) {
        m.status = 'REJECTED';
        m.rejectionReason = reason;
        await dbSaveDoc('marks', m.id, m);
      }
    }

    const logObj = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: reviewerId || 'usr-5',
      userName: reviewerName || 'Coordinator',
      userRole: 'COORDINATOR',
      action: 'MARKS_REJECTED',
      details: `Rejected marks for ${sub.courseCode}. Reason: ${reason}`,
      ip: req.ip || '127.0.0.1',
    };
    auditLogs.unshift(logObj);
    await dbSaveDoc('auditLogs', logObj.id, logObj);

    notifications.unshift({
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: sub.teacherId,
      title: 'Grade Submission Returned for Revision',
      message: `Your submitted marks for ${sub.courseCode} were rejected. Reason: ${reason}`,
      read: false,
      type: 'warning',
    });
  }

  res.json({ success: true, message: 'Submission returned for revision' });
});

export default router;
