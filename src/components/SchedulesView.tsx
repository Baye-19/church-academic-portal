import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { AcademicClass, Course, DayOfWeek, ScheduleItem, User } from '../types';
import { Calendar, Plus, AlertTriangle, Trash2, Clock, MapPin, Edit3, ShieldAlert, ShieldCheck, CheckSquare, Filter } from 'lucide-react';
import { formatTimeStringToEthiopian } from '../utils/ethiopianCalendar';
import { filterAccessibleClasses, getAccessibleClassIds, hasFullClassAccess } from '../utils/accessControl';

export const SchedulesView: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const toast = useToast();

  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingSched, setEditingSched] = useState<ScheduleItem | null>(null);
  const [conflictError, setConflictError] = useState('');

  const canEditSchedule =
    user?.role === 'ADMIN' || user?.role === 'COORDINATOR' || user?.role === 'DEPT_HEAD';

  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const dayLabels: Record<DayOfWeek, { en: string; am: string }> = {
    Monday: { en: 'Monday', am: 'ሰኞ' },
    Tuesday: { en: 'Tuesday', am: 'ማክሰኞ' },
    Wednesday: { en: 'Wednesday', am: 'ረቡዕ' },
    Thursday: { en: 'Thursday', am: 'ሐሙስ' },
    Friday: { en: 'Friday', am: 'አርብ' },
    Saturday: { en: 'Saturday', am: 'ቅዳሜ' },
    Sunday: { en: 'Sunday', am: 'እሑድ' },
  };

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
    Promise.all([api.getSchedules(), api.getCourses(), api.getUsers(), api.getClasses()]).then(
      ([schRes, crsRes, usrRes, clsRes]) => {
        if (schRes.success) setSchedules(schRes.data);
        if (crsRes.success) setCourses(crsRes.data);
        if (clsRes.success) setClasses(clsRes.data);
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
    const firstCourse = courses[0];
    const initialClassId = firstCourse?.classId || classes[0]?.id || 'cls-1';
    const targetClass = classes.find((c) => c.id === initialClassId);
    setFormData({
      courseId: firstCourse?.id || '',
      classId: initialClassId,
      section: targetClass?.sections[0] || 'A',
      teacherId: firstCourse?.teacherId || teachers[0]?.id || '',
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

  const handleCourseChangeInModal = (courseId: string) => {
    const courseObj = courses.find((c) => c.id === courseId);
    if (courseObj) {
      const clsObj = classes.find((c) => c.id === courseObj.classId || c.name === courseObj.classId);
      setFormData((prev) => ({
        ...prev,
        courseId,
        classId: courseObj.classId,
        section: clsObj?.sections[0] || prev.section,
        teacherId: courseObj.teacherId || prev.teacherId,
      }));
    } else {
      setFormData((prev) => ({ ...prev, courseId }));
    }
  };

  const handleSubmitSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError('');

    const courseObj = courses.find((c) => c.id === formData.courseId);
    const teacherObj = teachers.find((t) => t.id === formData.teacherId);
    const classObj = classes.find((c) => c.id === formData.classId || c.name === formData.classId);

    const payload = {
      ...formData,
      courseCode: courseObj ? courseObj.title : 'Course',
      courseTitle: courseObj ? courseObj.title : 'Course',
      className: classObj ? classObj.name : formData.classId,
      teacherName: teacherObj ? teacherObj.name : 'Instructor',
    };

    let res;
    if (editingSched) {
      res = await api.updateSchedule(editingSched.id, payload);
      if (res.success) {
        toast.success(
          language === 'am'
            ? `የ ${payload.courseTitle} የጊዜ ሰሌዳ ተሻሽሏል!`
            : `Schedule for ${payload.courseTitle} updated successfully!`
        );
      }
    } else {
      res = await api.createSchedule(payload);
      if (res.success) {
        toast.success(
          language === 'am'
            ? `አዲስ የክፍለ-ጊዜ ሰሌዳ ለ ${payload.courseTitle} ተመዝግቧል!`
            : `Schedule slot for ${payload.courseTitle} added successfully!`
        );
      }
    }

    if (res.success) {
      setShowModal(false);
      loadData();
    } else {
      const errMsg = res.message || (language === 'am' ? 'የጊዜ ሰሌዳ ግጭት ተፈጥሯል።' : 'Schedule conflict detected.');
      setConflictError(errMsg);
      toast.error(errMsg);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(language === 'am' ? 'ይህን የክፍለ ጊዜ ሰሌዳ መሰረዝ ይፈልጋሉ?' : 'Are you sure you want to delete this schedule slot?')) {
      const res = await api.deleteSchedule(id);
      if (res.success) {
        toast.success(
          language === 'am' ? 'የጊዜ ሰሌዳው በተሳካ ሁኔታ ተሰርዟል!' : 'Schedule slot deleted successfully!'
        );
      } else {
        toast.error(language === 'am' ? 'የጊዜ ሰሌዳውን መሰረዝ አልተቻለም።' : 'Failed to delete schedule slot.');
      }
      loadData();
    }
  };

  const [currentNow, setCurrentNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dayOfWeekNames: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = dayOfWeekNames[currentNow.getDay()];
  const currentHourMin = `${String(currentNow.getHours()).padStart(2, '0')}:${String(currentNow.getMinutes()).padStart(2, '0')}`;

  const visibleClasses = filterAccessibleClasses(classes, user, courses);
  const accessibleClassIds = getAccessibleClassIds(user, courses, classes);
  const accessibleCourseIds = new Set(user?.assignedCourseIds || []);

  // Role filtering: Teachers only see their assigned courses/classes; Admins, Dept Heads, and Coordinators have access to all 8 classes
  const roleFilteredSchedules =
    user?.role === 'TEACHER' && !hasFullClassAccess(user)
      ? schedules.filter((s) => {
          if (s.courseId && accessibleCourseIds.has(s.courseId)) return true;
          if (s.classId && accessibleClassIds.has(s.classId)) return true;
          if (accessibleCourseIds.size === 0 && accessibleClassIds.size === 0) {
            return s.teacherId === user.id;
          }
          return false;
        })
      : schedules;

  const visibleSchedules =
    selectedClassFilter === 'ALL'
      ? roleFilteredSchedules
      : roleFilteredSchedules.filter((s) => s.classId === selectedClassFilter || s.className === selectedClassFilter);

  // Find active ongoing class
  const activeClassNow = visibleSchedules.find(
    (s) => s.day === todayDayName && currentHourMin >= s.startTime && currentHourMin <= s.endTime
  );

  // Find next upcoming class today
  const nextClassToday = visibleSchedules
    .filter((s) => s.day === todayDayName && s.startTime > currentHourMin)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

  // Find total assigned classes
  const assignedClassesCount = new Set(visibleSchedules.map((s) => s.className)).size;
  const currentFormClass = classes.find((c) => c.id === formData.classId || c.name === formData.classId);

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
            {user?.role === 'TEACHER'
              ? `Personal teaching timetable for ${user.name} (${assignedClassesCount} classes assigned)`
              : 'Weekly class timetable, classroom allocations, and instructor schedule management.'}
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

      {/* Teacher Entry Time Assistant Banner */}
      {user?.role === 'TEACHER' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Active Class or Next Class Status */}
          {activeClassNow ? (
            <div className="p-4 rounded-2xl bg-emerald-950/70 border-2 border-emerald-500/70 text-white shadow-xl flex items-center gap-3.5 animate-pulse">
              <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase rounded tracking-wider">
                    {language === 'am' ? 'አሁን ክፍል ውስጥ መገኘት ያለብዎት' : 'In Session Now • Enter Class'}
                  </span>
                  <span className="text-xs text-emerald-300 font-bold">{activeClassNow.className}</span>
                </div>
                <h4 className="font-bold text-sm text-white mt-1">
                  {activeClassNow.courseTitle}
                </h4>
                <div className="text-xs text-emerald-200/90 mt-0.5 flex flex-wrap items-center gap-2">
                  <span>📍 {activeClassNow.room}</span>
                  <span>•</span>
                  <span>⏰ {activeClassNow.startTime} - {activeClassNow.endTime} ({formatTimeStringToEthiopian(activeClassNow.startTime, language)})</span>
                </div>
              </div>
            </div>
          ) : nextClassToday ? (
            <div className="p-4 rounded-2xl bg-[#27140B] border border-[#F5A623]/60 text-white shadow-xl flex items-center gap-3.5">
              <div className="p-3 bg-[#F5A623]/20 text-[#F5A623] rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#F5A623] text-[#1E0C04] text-[10px] font-black uppercase rounded tracking-wider">
                    {language === 'am' ? 'ቀጣይ ክፍል ዛሬ' : 'Next Entry Today'}
                  </span>
                  <span className="text-xs text-[#FBB03B] font-bold">{nextClassToday.className} (Sec {nextClassToday.section})</span>
                </div>
                <h4 className="font-bold text-sm text-white mt-1">
                  {nextClassToday.courseTitle}
                </h4>
                <div className="text-xs text-[#CBB39C] mt-0.5 flex flex-wrap items-center gap-2">
                  <span>📍 {nextClassToday.room}</span>
                  <span>•</span>
                  <span>⏰ {nextClassToday.startTime} - {nextClassToday.endTime} ({formatTimeStringToEthiopian(nextClassToday.startTime, language)})</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#27140B] border border-[#522B17] text-white shadow-xl flex items-center gap-3.5">
              <div className="p-3 bg-[#180B05] text-[#A68F7B] rounded-xl">
                <CheckSquare className="w-6 h-6 text-[#F5A623]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#F5A623]">
                  {language === 'am' ? 'ዛሬ ቀሪ ክፍል የለዎትም' : 'No More Scheduled Classes for Today'}
                </span>
                <p className="text-xs text-[#CBB39C] mt-0.5">
                  {language === 'am'
                    ? `ለዛሬ (${dayLabels[todayDayName].am}) የታቀዱ ክፍሎች ተጠናቀዋል ወይም የሉም።`
                    : `All scheduled teaching sessions for today (${todayDayName}) are done.`}
                </p>
              </div>
            </div>
          )}

          {/* Quick Stats on assigned courses and weekly schedule */}
          <div className="p-4 rounded-2xl bg-[#27140B] border border-[#522B17] text-white shadow-xl flex items-center justify-between">
            <div className="space-y-1 text-xs">
              <div className="text-[#A68F7B] font-medium">{language === 'am' ? 'የተመደቡበት የትምህርት ክፍለ ጊዜያት' : 'Weekly Assigned Teaching Slots'}</div>
              <div className="text-lg font-bold text-[#F5A623]">{visibleSchedules.length} {language === 'am' ? 'ክፍለ ጊዜያት በሳምንት' : 'Slots per week'}</div>
              <div className="text-[11px] text-[#CBB39C]">
                {language === 'am' ? 'የዛሬ ቀን:' : 'Today:'} <strong className="text-white">{dayLabels[todayDayName].am} ({todayDayName})</strong>
              </div>
            </div>
            <div className="text-right">
              <div className="px-3 py-1 bg-[#180B05] border border-[#522B17] rounded-xl text-xs font-mono text-[#F7E5C8]">
                {formatTimeStringToEthiopian(currentHourMin, language)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Class Level Selector Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#27140B] p-3 sm:p-4 border border-[#522B17] rounded-2xl shadow-lg">
        <div className="flex items-center gap-2 text-xs text-[#CBB39C]">
          <Filter className="w-4 h-4 text-[#F5A623]" />
          <span className="font-semibold">
            {language === 'am' ? 'የክፍል ማጣሪያ:' : 'Class Filter:'}
          </span>
          {!hasFullClassAccess(user) && user?.role === 'TEACHER' && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E5921A]/20 text-[#F5A623] border border-[#E5921A]/30">
              {language === 'am' ? 'የተመደቡ ብቻ' : 'Assigned Only'}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setSelectedClassFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              selectedClassFilter === 'ALL'
                ? 'bg-[#E5921A] text-[#1E0C04] border-[#F5A623]'
                : 'bg-[#180B05] text-[#CBB39C] border-[#522B17] hover:text-white'
            }`}
          >
            {language === 'am' ? `ሁሉም ክፍሎች (${visibleClasses.length})` : `All Classes (${visibleClasses.length})`}
          </button>
          {visibleClasses.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setSelectedClassFilter(cls.id)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                selectedClassFilter === cls.id
                  ? 'bg-[#E5921A] text-[#1E0C04] border-[#F5A623]'
                  : 'bg-[#180B05] text-[#CBB39C] border-[#522B17] hover:text-white'
              }`}
            >
              {cls.name}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Timetable Grid - 7 Days (Mon - Sun) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
        {days.map((day) => {
          const daySchedules = visibleSchedules.filter((s) => s.day === day);

          return (
            <div
              key={day}
              className={`bg-[#27140B] border rounded-2xl shadow-xl overflow-hidden flex flex-col ${
                day === 'Sunday' ? 'border-[#F5A623]/40 ring-1 ring-[#F5A623]/20' : 'border-[#522B17]'
              }`}
            >
              <div className={`p-3 border-b font-bold text-xs text-center uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                day === 'Sunday'
                  ? 'bg-[#351909] border-[#F5A623]/40 text-[#FBB03B]'
                  : 'bg-[#180B05] border-[#4A2715] text-[#F5A623]'
              }`}>
                <span>{language === 'am' ? dayLabels[day].am : dayLabels[day].en}</span>
                {day === 'Sunday' && <span className="text-[10px] text-[#F5A623] font-normal">({language === 'am' ? 'ሰንበት' : 'Sun'})</span>}
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

                      <div className="flex flex-col gap-0.5 text-[10px] font-bold text-[#F5A623]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          <span>{s.startTime} - {s.endTime}</span>
                        </div>
                        <div className="text-[10px] text-[#F7E5C8]/80 font-normal pl-4">
                          {formatTimeStringToEthiopian(s.startTime, language)} - {formatTimeStringToEthiopian(s.endTime, language)}
                        </div>
                      </div>

                      <h4 className="font-bold text-xs text-white">
                        {s.courseTitle}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#CBB39C] mb-1 font-semibold">Course</label>
                  <select
                    required
                    value={formData.courseId}
                    onChange={(e) => handleCourseChangeInModal(e.target.value)}
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  >
                    <option value="">Select Course...</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} {c.amharicTitle ? `(${c.amharicTitle})` : ''} — {c.classId}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#CBB39C] mb-1 font-semibold">Class & Section</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={formData.classId}
                      onChange={(e) => {
                        const targetCls = classes.find((c) => c.id === e.target.value);
                        setFormData({
                          ...formData,
                          classId: e.target.value,
                          section: targetCls?.sections[0] || 'A',
                        });
                      }}
                      className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                    >
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                    >
                      {(currentFormClass?.sections || ['A', 'B', 'C']).map((sec) => (
                        <option key={sec} value={sec}>
                          Sec {sec}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
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
                        {d} ({dayLabels[d].am})
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
