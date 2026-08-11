import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Course, DayOfWeek, ScheduleItem, User } from '../types';
import { Calendar, Plus, AlertTriangle, Trash2, Clock, MapPin, Edit3, ShieldAlert } from 'lucide-react';

export const SchedulesView: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSched, setEditingSched] = useState<ScheduleItem | null>(null);
  const [conflictError, setConflictError] = useState('');

  const canEditSchedule =
    user?.role === 'ADMIN' || user?.role === 'COORDINATOR' || user?.role === 'DEPT_HEAD';

  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const [formData, setFormData] = useState({
    courseId: '',
    classId: 'cls-1',
    section: 'A',
    teacherId: '',
    day: 'Monday' as DayOfWeek,
    startTime: '08:30',
    endTime: '10:30',
    room: 'Lab 101',
  });

  const loadData = () => {
    Promise.all([api.getSchedules(), api.getCourses(), api.getUsers()]).then(
      ([schRes, crsRes, usrRes]) => {
        if (schRes.success) setSchedules(schRes.data);
        if (crsRes.success) setCourses(crsRes.data);
        if (usrRes.success) {
          setTeachers(usrRes.data.filter((u) => u.role === 'TEACHER'));
        }
      }
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingSched(null);
    setConflictError('');
    setFormData({
      courseId: courses[0]?.id || '',
      classId: 'cls-1',
      section: 'A',
      teacherId: teachers[0]?.id || '',
      day: 'Monday',
      startTime: '08:30',
      endTime: '10:30',
      room: 'Room 101',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (sched: ScheduleItem) => {
    setEditingSched(sched);
    setConflictError('');
    setFormData({
      courseId: sched.courseId,
      classId: sched.classId || 'cls-1',
      section: sched.section || 'A',
      teacherId: sched.teacherId,
      day: sched.day,
      startTime: sched.startTime,
      endTime: sched.endTime,
      room: sched.room,
    });
    setShowModal(true);
  };

  const handleSubmitSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError('');

    const courseObj = courses.find((c) => c.id === formData.courseId);
    const teacherObj = teachers.find((t) => t.id === formData.teacherId);

    const payload = {
      ...formData,
      courseCode: courseObj ? courseObj.code : 'CS',
      courseTitle: courseObj ? courseObj.title : 'Course',
      className: formData.classId,
      teacherName: teacherObj ? teacherObj.name : 'Instructor',
    };

    let res;
    if (editingSched) {
      res = await api.updateSchedule(editingSched.id, payload);
    } else {
      res = await api.createSchedule(payload);
    }

    if (res.success) {
      setShowModal(false);
      loadData();
    } else {
      setConflictError(res.message || 'Schedule conflict detected.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this schedule slot?')) {
      await api.deleteSchedule(id);
      loadData();
    }
  };

  // Teachers see filtered timetable for their courses/classes
  const visibleSchedules =
    user?.role === 'TEACHER'
      ? schedules.filter((s) => s.teacherId === user.id || s.teacherName === user.name)
      : schedules;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#4A2715]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#F5A623]" />
            <span>{t('scheduleTitle')}</span>
          </h2>
          <p className="text-xs text-[#CBB39C] mt-1">
            Weekly class timetable, classroom allocations, and instructor schedule management.
          </p>
        </div>

        {canEditSchedule ? (
          <button
            onClick={handleOpenAdd}
            className="w-full sm:w-auto px-4 py-2 bg-[#E5921A] hover:bg-[#FBB03B] text-[#1E0C04] font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addSchedule')}</span>
          </button>
        ) : (
          <div className="px-3 py-1.5 bg-[#27140B] border border-[#522B17] rounded-xl text-[11px] text-[#F5A623] flex items-center gap-1.5 font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Schedule Managed by Academic Admin & Coordinators</span>
          </div>
        )}
      </div>

      {/* Weekly Timetable Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {days.map((day) => {
          const daySchedules = visibleSchedules.filter((s) => s.day === day);

          return (
            <div
              key={day}
              className="bg-[#27140B] border border-[#522B17] rounded-2xl shadow-xl overflow-hidden flex flex-col"
            >
              <div className="p-3 bg-[#180B05] border-b border-[#4A2715] font-bold text-xs text-center text-[#F5A623] uppercase tracking-wider">
                {day}
              </div>

              <div className="p-3 space-y-3 flex-1 min-h-[220px]">
                {daySchedules.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[11px] text-[#A68F7B] italic text-center p-4">
                    No classes
                  </div>
                ) : (
                  daySchedules.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 bg-[#180B05] border border-[#4A2715] hover:border-[#F5A623]/60 transition rounded-xl space-y-2 relative group"
                    >
                      {/* Action buttons for Admin/Coordinators */}
                      {canEditSchedule && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1 text-[#F5A623] hover:text-white transition rounded"
                            title="Edit Schedule"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1 text-rose-400 hover:text-rose-200 transition rounded"
                            title="Delete Schedule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#F5A623]">
                        <Clock className="w-3 h-3" />
                        <span>
                          {s.startTime} - {s.endTime}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-white">
                        {s.courseCode}: {s.courseTitle}
                      </h4>

                      <div className="text-[11px] text-[#CBB39C] flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 text-white">
                          <MapPin className="w-3 h-3 text-[#F5A623]" /> {s.room}
                        </span>
                        <span>
                          Instructor:{' '}
                          <strong className="text-[#F7E5C8]">{s.teacherName}</strong>
                        </span>
                        <span>
                          Class: {s.className} (Sec {s.section})
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#27140B] border border-[#522B17] w-full max-w-lg rounded-2xl p-6 shadow-2xl text-white space-y-4">
            <h3 className="text-lg font-bold text-[#F5A623] flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{editingSched ? 'Edit Class Schedule' : t('addSchedule')}</span>
            </h3>

            {conflictError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{conflictError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitSchedule} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#CBB39C] mb-1 font-semibold">Course</label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                >
                  <option value="">Select Course...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#CBB39C] mb-1 font-semibold">Instructor</label>
                  <select
                    required
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  >
                    <option value="">Select Instructor...</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#CBB39C] mb-1 font-semibold">{t('day')}</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#CBB39C] mb-1 font-semibold">{t('startTime')}</label>
                  <input
                    type="text"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="08:30"
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  />
                </div>
                <div>
                  <label className="block text-[#CBB39C] mb-1 font-semibold">{t('endTime')}</label>
                  <input
                    type="text"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    placeholder="10:30"
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  />
                </div>
                <div>
                  <label className="block text-[#CBB39C] mb-1 font-semibold">{t('room')}</label>
                  <input
                    type="text"
                    required
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="Lab 101"
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#4A2715]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-[#351C0F] text-[#CBB39C] font-semibold rounded-xl hover:bg-[#442413]"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E5921A] hover:bg-[#FBB03B] text-[#1E0C04] font-bold rounded-xl shadow-lg"
                >
                  {editingSched ? 'Update Schedule' : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
