import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { AcademicClass, Course, User } from '../types';
import { getCurrentAcademicYear } from '../utils/academicYear';
import { filterAccessibleClasses, filterAccessibleCourses, hasFullClassAccess } from '../utils/accessControl';
import { BookOpen, Plus, Search, CheckCircle2, UserCheck, Pencil, ShieldCheck, ShieldAlert } from 'lucide-react';

export const CoursesView: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const toast = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // New Course Form State
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    amharicTitle: '',
    creditHours: 3,
    classId: 'cls-1',
    semester: 'Semester I' as any,
    academicYear: getCurrentAcademicYear(),
    teacherId: '',
    coordinatorId: user?.role === 'COORDINATOR' ? user.id : '',
    maxAssignment: 15,
    maxQuiz: 10,
    maxMidterm: 25,
    maxFinal: 50,
  });

  // Edit Course Form State
  const [editFormData, setEditFormData] = useState({
    code: '',
    title: '',
    amharicTitle: '',
    creditHours: 3,
    classId: 'cls-1',
    semester: 'Semester I' as any,
    academicYear: getCurrentAcademicYear(),
    teacherId: '',
    coordinatorId: '',
    maxAssignment: 15,
    maxQuiz: 10,
    maxMidterm: 25,
    maxFinal: 50,
  });

  const loadData = () => {
    Promise.all([api.getCourses(), api.getUsers(), api.getClasses()]).then(([crsRes, usrRes, clsRes]) => {
      if (crsRes.success) setCourses(crsRes.data);
      if (usrRes.success) setUsers(usrRes.data);
      if (clsRes.success) setClasses(clsRes.data);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const teachers = users.filter((u) => u.role === 'TEACHER');
  const coordinators = users.filter((u) => u.role === 'COORDINATOR' || u.role === 'DEPT_HEAD');
  const canManageCourses = user?.role === 'ADMIN' || user?.role === 'COORDINATOR' || user?.role === 'DEPT_HEAD';

  // For TEACHER role: Filter courses based on teacher assignments or all-class authority
  const roleFilteredCourses = filterAccessibleCourses(courses, user);
  const visibleClasses = filterAccessibleClasses(classes, user, courses);

  const classFilteredCourses =
    selectedClassFilter === 'ALL'
      ? roleFilteredCourses
      : roleFilteredCourses.filter((c) => c.classId === selectedClassFilter);

  const filteredCourses = classFilteredCourses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.amharicTitle.includes(search)
  );

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = teachers.find((t) => t.id === formData.teacherId);
    const coordinator = coordinators.find((c) => c.id === formData.coordinatorId);

    const payload = {
      ...formData,
      teacherName: teacher ? teacher.name : '',
      coordinatorName: coordinator ? coordinator.name : '',
    };

    const res = await api.createCourse(payload);
    if (res.success) {
      toast.success(
        language === 'am'
          ? `የትምህርት አይነት "${payload.code} - ${payload.amharicTitle || payload.title}" በተሳካ ሁኔታ ተፈጥሯል!`
          : `Course "${payload.code} - ${payload.title}" created successfully!`
      );
      setShowAddModal(false);
      loadData();
    } else {
      toast.error(language === 'am' ? 'የትምህርት አይነት መፍጠር አልተቻለም።' : 'Failed to create course.');
    }
  };

  const handleStartEdit = (course: Course) => {
    setEditingCourse(course);
    setEditFormData({
      code: course.code,
      title: course.title,
      amharicTitle: course.amharicTitle,
      creditHours: course.creditHours,
      classId: course.classId,
      semester: course.semester,
      academicYear: course.academicYear || getCurrentAcademicYear(),
      teacherId: course.teacherId || '',
      coordinatorId: course.coordinatorId || '',
      maxAssignment: course.maxAssignment,
      maxQuiz: course.maxQuiz,
      maxMidterm: course.maxMidterm,
      maxFinal: course.maxFinal,
    });
    setShowEditModal(true);
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    const teacher = teachers.find((t) => t.id === editFormData.teacherId);
    const coordinator = coordinators.find((c) => c.id === editFormData.coordinatorId);

    const payload = {
      ...editFormData,
      teacherName: teacher ? teacher.name : editFormData.teacherId ? editingCourse.teacherName : '',
      coordinatorName: coordinator ? coordinator.name : editFormData.coordinatorId ? editingCourse.coordinatorName : '',
    };

    const res = await api.updateCourse(editingCourse.id, payload);
    if (res.success) {
      toast.success(
        language === 'am'
          ? `የትምህርት አይነት "${payload.code}" መረጃ ተሻሽሏል!`
          : `Course "${payload.code}" updated successfully!`
      );
      setShowEditModal(false);
      setEditingCourse(null);
      loadData();
    } else {
      toast.error(language === 'am' ? 'የትምህርት አይነት ማሻሻል አልተቻለም።' : 'Failed to update course.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#4A2715]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#F5A623]" />
            <span>{t('courses')} Management</span>
          </h2>
          <p className="text-xs text-[#CBB39C] mt-1">
            Manage academic course offerings, credit hours, assigned instructors, and assessment mark limits.
          </p>
        </div>

        {(user?.role === 'ADMIN' || user?.role === 'COORDINATOR' || user?.role === 'DEPT_HEAD') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#E5921A] hover:bg-[#FBB03B] text-[#1E0C04] font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addNewCourse')}</span>
          </button>
        )}
      </div>

      {/* Teacher Role-Based Access Banner */}
      {user?.role === 'TEACHER' && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
          hasFullClassAccess(user)
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/40 border-amber-500/30 text-[#F5A623]'
        }`}>
          <div className="flex items-center gap-2.5">
            {hasFullClassAccess(user) ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-[#F5A623] shrink-0" />
            )}
            <div>
              <span className="font-bold">
                {hasFullClassAccess(user)
                  ? language === 'am'
                    ? 'የሁሉም ኮርሶች እና ክፍሎች ሙሉ ፈቃድ'
                    : 'Full Course & Class Access Granted'
                  : language === 'am'
                  ? `የተመደቡባቸው ኮርሶች ብቻ (${roleFilteredCourses.length} ኮርሶች)`
                  : `Assigned Courses Only (${roleFilteredCourses.length} courses)`}
              </span>
              <p className="text-[11px] opacity-80 mt-0.5">
                {hasFullClassAccess(user)
                  ? language === 'am'
                    ? 'አስተዳዳሪው ሁሉንም ኮርሶች እንዲያስተዳድሩ ሙሉ ፈቃድ ሰጥቶዎታል'
                    : 'Administrator has granted you authority to view and manage all courses.'
                  : language === 'am'
                  ? 'የተመደቡባቸውን ኮርሶች ብቻ ማየት ይችላሉ። ተጨማሪ ኮርስ ለማስተማር አስተዳዳሪውን ያነጋግሩ።'
                  : 'You can only access courses assigned to you. Contact admin for additional course assignments.'}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-black/40 rounded-lg text-[10px] font-mono font-bold shrink-0">
            {roleFilteredCourses.length} / {courses.length} Courses
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="space-y-3 bg-[#27140B] p-4 border border-[#522B17] rounded-2xl shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#A68F7B] absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search')}
              className="w-full pl-9 pr-4 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-xs text-white placeholder-[#A68F7B] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
            />
          </div>

          <div className="text-xs text-[#CBB39C] font-medium">
            Showing <span className="text-[#F5A623] font-bold">{filteredCourses.length}</span> active courses
          </div>
        </div>

        {/* Class Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#3A1E10]">
          <span className="text-[11px] text-[#A68F7B] mr-1 font-semibold">Filter Class:</span>
          <button
            onClick={() => setSelectedClassFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
              selectedClassFilter === 'ALL'
                ? 'bg-[#E5921A] text-[#1E0C04] border-[#F5A623]'
                : 'bg-[#180B05] text-[#CBB39C] border-[#522B17] hover:text-white'
            }`}
          >
            {visibleClasses.length === classes.length ? `All Classes (${classes.length})` : `All Assigned (${visibleClasses.length})`}
          </button>
          {visibleClasses.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setSelectedClassFilter(cls.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
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

      {/* Course Cards Table */}
      <div className="bg-[#27140B] border border-[#522B17] rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#F7E5C8]">
            <thead className="bg-[#180B05] text-[#CBB39C] font-semibold uppercase tracking-wider border-b border-[#4A2715]">
              <tr>
                <th className="p-4">{t('courseCode')}</th>
                <th className="p-4">{t('courseTitle')}</th>
                <th className="p-4">{t('classLevel')}</th>
                <th className="p-4">{t('semester')}</th>
                <th className="p-4">{t('assignedTeacher')}</th>
                <th className="p-4">{t('assignedCoordinator')}</th>
                <th className="p-4">{t('maxMarksSplit')}</th>
                {canManageCourses && <th className="p-4 text-center">{t('edit')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A1E10]">
              {filteredCourses.map((c) => {
                const isMyCourse = user?.role === 'TEACHER' && (c.teacherId === user.id || c.teacherName === user.name);
                const classObj = classes.find((cls) => cls.id === c.classId || cls.name === c.classId);

                return (
                  <tr key={c.id} className={`hover:bg-[#351C0F]/60 transition ${isMyCourse ? 'bg-[#351C0F]/40' : ''}`}>
                    <td className="p-4 font-bold text-[#F5A623]">
                      <div className="flex items-center gap-1.5">
                        <span>{c.code}</span>
                        {isMyCourse && (
                          <span className="px-1.5 py-0.5 bg-[#F5A623] text-[#1E0C04] text-[9px] font-extrabold rounded uppercase tracking-wider">
                            Your Course
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{c.title}</div>
                      <div className="text-[#CBB39C] text-[11px]">{c.amharicTitle}</div>
                    </td>
                    <td className="p-4 font-medium text-[#F7E5C8]">{classObj ? classObj.name : c.classId}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-amber-500/10 text-[#F5A623] border border-amber-500/20 text-[11px] font-semibold rounded-lg">
                        {c.semester}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-white flex items-center gap-1">
                      {c.teacherName || '—'}
                      {isMyCourse && <CheckCircle2 className="w-3.5 h-3.5 text-[#F5A623]" />}
                    </td>
                    <td className="p-4 font-medium text-[#CBB39C]">{c.coordinatorName || '—'}</td>
                    <td className="p-4 text-[11px] font-mono text-[#F5A623]">
                      A:{c.maxAssignment} | Q:{c.maxQuiz} | M:{c.maxMidterm} | F:{c.maxFinal} = 100
                    </td>
                    {canManageCourses && (
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleStartEdit(c)}
                          className="p-1.5 bg-[#351C0F] hover:bg-[#E5921A] text-[#F5A623] hover:text-[#1E0C04] rounded-lg transition border border-[#5C321B]"
                          title={t('editCourse')}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#27140B] border border-[#522B17] w-full max-w-xl rounded-2xl p-6 shadow-2xl text-white space-y-4">
            <h3 className="text-lg font-bold text-[#F5A623] flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span>{t('addNewCourse')}</span>
            </h3>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#CBB39C] mb-1">{t('courseCode')}</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. CS301"
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  />
                </div>
                <div>
                  <label className="block text-[#CBB39C] mb-1">{t('creditHours')}</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={formData.creditHours}
                    onChange={(e) => setFormData({ ...formData, creditHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#CBB39C] mb-1">{t('courseTitle')} (English)</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Christian Ethics & History"
                  className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                />
              </div>

              <div>
                <label className="block text-[#CBB39C] mb-1">{t('courseAmharicTitle')} (አማርኛ)</label>
                <input
                  type="text"
                  required
                  value={formData.amharicTitle}
                  onChange={(e) => setFormData({ ...formData, amharicTitle: e.target.value })}
                  placeholder="e.g. ክርስቲያናዊ ስነ-ምግባር እና ታሪክ"
                  className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#CBB39C] mb-1">{t('classLevel')}</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.amharicName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#CBB39C] mb-1">{t('semester')}</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  >
                    <option value="Semester I">Semester I</option>
                    <option value="Semester II">Semester II</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#CBB39C] mb-1">{t('assignedTeacher')}</label>
                  <select
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
                  <label className="block text-[#CBB39C] mb-1">{t('assignedCoordinator')}</label>
                  <select
                    value={formData.coordinatorId}
                    onChange={(e) => setFormData({ ...formData, coordinatorId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  >
                    <option value="">Select Coordinator...</option>
                    {coordinators.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-[#4A2715]">
                <label className="block text-[#CBB39C] font-semibold mb-2">Max Marks Breakdown (Must sum to 100)</label>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <span className="text-[10px] text-[#A68F7B]">Assignment</span>
                    <input
                      type="number"
                      value={formData.maxAssignment}
                      onChange={(e) => setFormData({ ...formData, maxAssignment: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-[#180B05] border border-[#5C321B] rounded-lg text-center text-white font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A68F7B]">Quiz</span>
                    <input
                      type="number"
                      value={formData.maxQuiz}
                      onChange={(e) => setFormData({ ...formData, maxQuiz: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-[#180B05] border border-[#5C321B] rounded-lg text-center text-white font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A68F7B]">Midterm</span>
                    <input
                      type="number"
                      value={formData.maxMidterm}
                      onChange={(e) => setFormData({ ...formData, maxMidterm: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-[#180B05] border border-[#5C321B] rounded-lg text-center text-white font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A68F7B]">Final Exam</span>
                    <input
                      type="number"
                      value={formData.maxFinal}
                      onChange={(e) => setFormData({ ...formData, maxFinal: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-[#180B05] border border-[#5C321B] rounded-lg text-center text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#4A2715]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#351C0F] text-[#CBB39C] font-semibold rounded-xl hover:bg-[#442413]"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E5921A] hover:bg-[#FBB03B] text-[#1E0C04] font-bold rounded-xl shadow-lg"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && editingCourse && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#27140B] border border-[#522B17] w-full max-w-xl rounded-2xl p-6 shadow-2xl text-white space-y-4">
            <h3 className="text-lg font-bold text-[#F5A623] flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              <span>{t('editCourse')} ({editingCourse.code})</span>
            </h3>

            <form onSubmit={handleUpdateCourse} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#CBB39C] mb-1">{t('courseCode')}</label>
                  <input
                    type="text"
                    required
                    value={editFormData.code}
                    onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  />
                </div>
                <div>
                  <label className="block text-[#CBB39C] mb-1">{t('creditHours')}</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={editFormData.creditHours}
                    onChange={(e) => setEditFormData({ ...editFormData, creditHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#CBB39C] mb-1">{t('courseTitle')} (English)</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  placeholder="e.g. Christian Ethics & History"
                  className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                />
              </div>

              <div>
                <label className="block text-[#CBB39C] mb-1">{t('courseAmharicTitle')} (አማርኛ)</label>
                <input
                  type="text"
                  required
                  value={editFormData.amharicTitle}
                  onChange={(e) => setEditFormData({ ...editFormData, amharicTitle: e.target.value })}
                  placeholder="e.g. ክርስቲያናዊ ስነ-ምግባር እና ታሪክ"
                  className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#CBB39C] mb-1">{t('classLevel')}</label>
                  <select
                    value={editFormData.classId}
                    onChange={(e) => setEditFormData({ ...editFormData, classId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.amharicName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#CBB39C] mb-1">{t('semester')}</label>
                  <select
                    value={editFormData.semester}
                    onChange={(e) => setEditFormData({ ...editFormData, semester: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  >
                    <option value="Semester I">Semester I</option>
                    <option value="Semester II">Semester II</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#CBB39C] mb-1">{t('assignedTeacher')}</label>
                  <select
                    value={editFormData.teacherId}
                    onChange={(e) => setEditFormData({ ...editFormData, teacherId: e.target.value })}
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
                  <label className="block text-[#CBB39C] mb-1">{t('assignedCoordinator')}</label>
                  <select
                    value={editFormData.coordinatorId}
                    onChange={(e) => setEditFormData({ ...editFormData, coordinatorId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  >
                    <option value="">Select Coordinator...</option>
                    {coordinators.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-[#4A2715]">
                <label className="block text-[#CBB39C] font-semibold mb-2">Max Marks Breakdown (Must sum to 100)</label>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <span className="text-[10px] text-[#A68F7B]">Assignment</span>
                    <input
                      type="number"
                      value={editFormData.maxAssignment}
                      onChange={(e) => setEditFormData({ ...editFormData, maxAssignment: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-[#180B05] border border-[#5C321B] rounded-lg text-center text-white font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A68F7B]">Quiz</span>
                    <input
                      type="number"
                      value={editFormData.maxQuiz}
                      onChange={(e) => setEditFormData({ ...editFormData, maxQuiz: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-[#180B05] border border-[#5C321B] rounded-lg text-center text-white font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A68F7B]">Midterm</span>
                    <input
                      type="number"
                      value={editFormData.maxMidterm}
                      onChange={(e) => setEditFormData({ ...editFormData, maxMidterm: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-[#180B05] border border-[#5C321B] rounded-lg text-center text-white font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A68F7B]">Final Exam</span>
                    <input
                      type="number"
                      value={editFormData.maxFinal}
                      onChange={(e) => setEditFormData({ ...editFormData, maxFinal: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-[#180B05] border border-[#5C321B] rounded-lg text-center text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#4A2715]">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCourse(null);
                  }}
                  className="px-4 py-2 bg-[#351C0F] text-[#CBB39C] font-semibold rounded-xl hover:bg-[#442413]"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E5921A] hover:bg-[#FBB03B] text-[#1E0C04] font-bold rounded-xl shadow-lg"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
