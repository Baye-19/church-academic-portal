import { Router, Request, Response } from 'express';
import { auditLogs, notifications } from '../store/state';

const router = Router();

// Audit Logs
router.get('/audit-logs', (req: Request, res: Response) => {
  res.json({ success: true, data: auditLogs });
});

// Notifications
router.get('/notifications', (req: Request, res: Response) => {
  const { userId } = req.query;
  if (userId) {
    const filtered = notifications.filter((n) => n.userId === userId);
    return res.json({ success: true, data: filtered });
  }
  res.json({ success: true, data: notifications });
});

router.post('/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const notif = notifications.find((n) => n.id === id);
  if (notif) {
    notif.read = true;
  }
  res.json({ success: true });
});

export default router;
