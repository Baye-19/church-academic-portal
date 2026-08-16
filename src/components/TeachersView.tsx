import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { AcademicClass, Course, User } from '../types';
import {
  UserCheck,
  Plus,
  Search,
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
  BookOpen,
  GraduationCap,
  Edit3,
  Check,
  CheckSquare,
  Square,
  KeyRound,
  X,
} from 'lucide-react';

export const TeachersView: React.FC = () => {
  const { t, language } = useLanguage();
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);

  // Form State for Registration & Edit
  const [formData, setFormData] = useState({
    name: '',
    amharicName: '',
    email: '',
    phone: '',
    employeeId: '',
    role: 'TEACHER' as any,
    department: 'ህጻናት እና አዳጊ',
    assignedClassIds: [] as string[],
    assignedCourseIds: [] as string[],
    canAccessAllClasses: false,
  });

  const loadData = () => {
    Promise.all([api.getUsers(), api.getClasses(), api.getCourses()]).then(([usrRes, clsRes, crsRes]) => {
      if (usrRes.success) setUsers(usrRes.data);
      if (clsRes.success) setClasses(clsRes.data);
      if (crsRes.success) setCourses(crsRes.data);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const teachers = users.filter(
    (u) =>
      (u.role === 'TEACHER' || u.role === 'COORDINATOR') &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        (u.amharicName && u.amharicName.toLowerCase().includes(search.toLowerCase())) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.employeeId.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      amharicName: '',
      email: '',
      phone: '',
      employeeId: `TCH-${Math.floor(300 + Math.random() * 600)}`,
      role: 'TEACHER',
      department: 'ህጻናት እና አዳጊ',
      assignedClassIds: [],
      assignedCourseIds: [],
      canAccessAllClasses: false,
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (teacher: User) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name || '',
      amharicName: teacher.amharicName || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      employeeId: teacher.employeeId || '',
      role: teacher.role,
      department: teacher.department || 'ህጻናት እና አዳጊ',
      assignedClassIds: teacher.assignedClassIds || [],
      assignedCourseIds: teacher.assignedCourseIds || [],
      canAccessAllClasses: Boolean(teacher.canAccessAllClasses),
    });
    setShowAddModal(true);
  };

  const toggleClassAssignment = (classId: string) => {
    setFormData((prev) => {
      const exists = prev.assignedClassIds.includes(classId);
      const updatedClasses = exists
        ? prev.assignedClassIds.filter((id) => id !== classId)
        : [...prev.assignedClassIds, classId];

      // If a class is deselected, also prune assigned courses belonging to that class
      const updatedCourses = exists
        ? prev.assignedCourseIds.filter((cId) => {
            const crs = courses.find((c) => c.id === cId);
            return crs ? crs.classId !== classId : true;
          })
        : prev.assignedCourseIds;

      return { ...prev, assignedClassIds: updatedClasses, assignedCourseIds: updatedCourses };
    });
  };

  const toggleCourseAssignment = (courseId: string) => {
    setFormData((prev) => {
      const exists = prev.assignedCourseIds.includes(courseId);
      const updatedCourses = exists
        ? prev.assignedCourseIds.filter((id) => id !== courseId)
        : [...prev.assignedCourseIds, courseId];

      // If a course is selected, ensure its class is in assignedClassIds
      const crs = courses.find((c) => c.id === courseId);
      const updatedClasses = [...prev.assignedClassIds];
      if (!exists && crs && crs.classId && !updatedClasses.includes(crs.classId)) {
        updatedClasses.push(crs.classId);
      }

      return { ...prev, assignedCourseIds: updatedCourses, assignedClassIds: updatedClasses };
    });
  };

  const handleSelectAllClasses = () => {
    if (formData.assignedClassIds.length === classes.length) {
      setFormData((prev) => ({ ...prev, assignedClassIds: [] }));
    } else {
      setFormData((prev) => ({ ...prev, assignedClassIds: classes.map((c) => c.id) }));
    }
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      // Update existing teacher
      const res = await api.updateUser(editingTeacher.id, formData);
      if (res.success) {
        toast.success(
          language === 'am'
            ? `የመምህር ${formData.amharicName || formData.name} መረጃ እና የክፍል ምደባ በተሳካ ሁኔታ ተሻሽሏል!`
            : `Updated assignments & profile for "${formData.name}" successfully!`
        );
        setShowAddModal(false);
        loadData();
      } else {
        toast.error(language === 'am' ? 'የመምህር መረጃ ማሻሻል አልተቻለም።' : 'Failed to update teacher.');
      }
    } else {
      // Register new teacher
      const payload = {
        ...formData,
        employeeId: formData.employeeId || `TCH-${Math.floor(300 + Math.random() * 600)}`,
      };
      const res = await api.createUser(payload);
      if (res.success) {
        toast.success(
          language === 'am'
            ? `መምህር ${formData.amharicName || formData.name} በተመደቡበት ክፍል እና ኮርስ በተሳካ ሁኔታ ተመዝግቧል!`
            : `Faculty member "${formData.name}" registered and assigned successfully!`
        );
        setShowAddModal(false);
        loadData();
      } else {
        toast.error(language === 'am' ? 'መምህር መመዝገብ አልተቻለም።' : 'Failed to register faculty member.');
      }
    }
  };

  // Filter courses available for the currently selected assigned classes in the modal
  const modalAvailableCourses = courses.filter((c) =>
    formData.assignedClassIds.length === 0 || formData.assignedClassIds.includes(c.classId)
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#522B17]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-serif">
            <UserCheck className="w-6 h-6 text-[#F5A623]" />
            <span>{t('teachers')} & Class Assignments</span>
          </h2>
          <p className="text-xs text-[#CBB39C] mt-1">
            {language === 'am'
              ? 'የሰንበት ት/ቤት መምህራን ምዝገባ፣ የተመደቡባቸው ክፍሎች እና የሥልጣን/ፈቃድ አስተዳደር'
              : 'Faculty registration, specifically assigned classes, courses, and access authority permissions.'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#E5921A] hover:bg-[#FBB03B] font-bold text-[#1E0C04] text-xs rounded-xl shadow-lg transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addNewTeacher')}</span>
        </button>
      </div>

      {/* Search & Stats Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-[#27140B] p-4 border border-[#522B17] rounded-2xl shadow-lg gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#CBB39C] absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            className="w-full pl-9 pr-4 py-2 bg-[#1E0C04] border border-[#522B17] rounded-xl text-xs text-white placeholder-[#8C6D58] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
          />
        </div>

        <div className="text-xs text-[#CBB39C] font-medium flex items-center gap-4">
          <div>
            Total Faculty: <span className="text-[#F5A623] font-bold">{teachers.length}</span>
          </div>
          <div className="hidden sm:block text-[#522B17]">|</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>RBAC Active</span>
          </div>
        </div>
      </div>

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {teachers.map((tch) => {
          // Resolve assigned classes strictly from assignedClassIds or explicit assignedCourseIds
          const teacherClasses = classes.filter(
            (c) =>
              (tch.assignedClassIds && tch.assignedClassIds.includes(c.id)) ||
              (tch.assignedCourseIds &&
                courses.some((crs) => tch.assignedCourseIds?.includes(crs.id) && crs.classId === c.id))
          );

          // Resolve assigned courses strictly from assignedCourseIds or assignedClassIds
          const teacherCourses = courses.filter((crs) => {
            if (tch.assignedCourseIds && tch.assignedCourseIds.length > 0) {
              return tch.assignedCourseIds.includes(crs.id);
            }
            if (tch.assignedClassIds && tch.assignedClassIds.length > 0) {
              return tch.assignedClassIds.includes(crs.classId);
            }
            return crs.teacherId === tch.id;
          });

          return (
            <div
              key={tch.id}
              className="p-5 bg-[#27140B] border border-[#522B17] rounded-2xl shadow-xl flex flex-col justify-between space-y-4 hover:border-[#F5A623]/50 transition group"
            >
              <div>
                <div className="flex justify-between items-start">
                  {tch.employeeId ? (
                    <span className="px-2.5 py-1 bg-[#1E0C04] text-[#F5A623] border border-[#522B17] text-[11px] font-mono font-bold rounded-lg">
                      {tch.employeeId}
                    </span>
                  ) : (
                    <div />
                  )}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      tch.role === 'COORDINATOR'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-amber-500/20 text-[#F5A623] border border-amber-500/30'
                    }`}
                  >
                    {tch.role}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-base text-white font-serif">{tch.name}</h3>
                  {tch.amharicName && <p className="text-xs text-[#F5A623] font-medium">{tch.amharicName}</p>}
                </div>

                {/* Authority & Access Status Badge */}
                <div className="mt-3 pt-3 border-t border-[#3D1F11] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#CBB39C] flex items-center gap-1 font-medium">
                      <KeyRound className="w-3 h-3 text-[#F5A623]" />
                      {language === 'am' ? 'የክፍል ፈቃድ/ሥልጣን:' : 'Access Authority:'}
                    </span>
                    {tch.canAccessAllClasses ? (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        {language === 'am' ? 'የሁሉም ክፍሎች ፈቃድ' : 'All Classes'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded-full flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        {language === 'am' ? 'የተመደበበት ብቻ' : 'Assigned Only'}
                      </span>
                    )}
                  </div>

                  {/* Assigned Classes List */}
                  <div>
                    <div className="text-[11px] text-[#CBB39C] mb-1 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-[#F5A623]" />
                      <span>{language === 'am' ? 'የተመደቡባቸው ክፍሎች:' : 'Assigned Classes:'}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {tch.canAccessAllClasses ? (
                        <span className="px-2 py-0.5 bg-[#351C0F] text-emerald-300 border border-[#522B17] text-[10px] font-medium rounded">
                          {language === 'am' ? 'ሁሉንም 8 ክፍሎች ማግኘት ይችላል' : 'Full access to all 8 classes'}
                        </span>
                      ) : teacherClasses.length > 0 ? (
                        teacherClasses.map((cls) => (
                          <span
                            key={cls.id}
                            className="px-2 py-0.5 bg-[#351C0F] text-[#F5A623] border border-[#522B17] text-[10px] font-medium rounded"
                          >
                            {cls.name} ({cls.amharicName})
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-red-400 italic">
                          {language === 'am' ? 'ክፍል አልተመደበም (Unassigned)' : 'No classes assigned'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Assigned Courses List */}
                  <div>
                    <div className="text-[11px] text-[#CBB39C] mb-1 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-[#F5A623]" />
                      <span>{language === 'am' ? 'የሚያስተምሯቸው ኮርሶች:' : 'Assigned Courses:'}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {teacherCourses.length > 0 ? (
                        teacherCourses.map((crs) => (
                          <span
                            key={crs.id}
                            className="px-2 py-0.5 bg-[#1E0C04] text-[#CBB39C] border border-[#522B17] text-[10px] rounded"
                            title={crs.title}
                          >
                            {crs.code} - {crs.amharicTitle || crs.title}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-[#8C6D58] italic">
                          {language === 'am' ? 'ኮርስ አልተመደበም' : 'No courses assigned'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info & Edit Button */}
              <div className="border-t border-[#3D1F11] pt-3 space-y-3">
                <div className="space-y-1 text-xs text-[#CBB39C]">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#8C6D58]" />
                    <span className="truncate">{tch.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#8C6D58]" />
                    <span>{tch.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#3D1F11]">
                  <span className="text-[11px] text-[#8C6D58]">
                    Status: <strong className="text-emerald-400">{tch.status}</strong>
                  </span>
                  <button
                    onClick={() => handleOpenEdit(tch)}
                    className="px-3 py-1.5 bg-[#351C0F] hover:bg-[#4E2713] text-[#F5A623] hover:text-white border border-[#522B17] text-xs font-semibold rounded-lg shadow transition flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{language === 'am' ? 'ክፍል/ፈቃድ ቀይር' : 'Edit Assignment'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Teacher Modal with Class & Course Assignment */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-[#27140B] border border-[#522B17] w-full max-w-2xl rounded-2xl p-5 sm:p-6 shadow-2xl text-white space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#522B17]">
              <h3 className="text-lg font-bold flex items-center gap-2 font-serif text-white">
                <UserCheck className="w-5 h-5 text-[#F5A623]" />
                <span>
                  {editingTeacher
                    ? language === 'am'
                      ? `የመምህር ${editingTeacher.name} ምደባ እና መረጃ ማስተካከያ`
                      : `Edit Assignment for ${editingTeacher.name}`
                    : t('addNewTeacher')}
                </span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#CBB39C] hover:text-white p-1 rounded-lg hover:bg-[#351C0F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#CBB39C] mb-1 font-semibold">
                    {t('fullName')} (English) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Instructor Solomon Haile"
                    className="w-full px-3 py-2 bg-[#1E0C04] border border-[#522B17] rounded-lg text-white placeholder-[#8C6D58] focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-[#CBB39C] mb-1 font-semibold">
                    {t('amharicName')} (አማርኛ) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.amharicName}
                    onChange={(e) => setFormData({ ...formData, amharicName: e.target.value })}
                    placeholder="e.g. መምህር ሰለሞን ሀይሌ"
                    className="w-full px-3 py-2 bg-[#1E0C04] border border-[#522B17] rounded-lg text-white placeholder-[#8C6D58] focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#CBB39C] mb-1 font-semibold">{t('role')}</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#1E0C04] border border-[#522B17] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  >
                    <option value="TEACHER">TEACHER (መምህር)</option>
                    <option value="COORDINATOR">COORDINATOR (አስተባባሪ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#CBB39C] mb-1 font-semibold">
                    {t('email')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="solomon@amras.edu"
                    className="w-full px-3 py-2 bg-[#1E0C04] border border-[#522B17] rounded-lg text-white placeholder-[#8C6D58] focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-[#CBB39C] mb-1 font-semibold">{t('phone')}</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+251 911 000000"
                    className="w-full px-3 py-2 bg-[#1E0C04] border border-[#522B17] rounded-lg text-white placeholder-[#8C6D58] focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>
              </div>

              {/* Specific Class Assignment Section */}
              <div className="bg-[#1E0C04] p-4 rounded-xl border border-[#522B17] space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-2 border-b border-[#3D1F11]">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-[#F5A623]" />
                      <span>{language === 'am' ? 'የተመደቡበት ክፍል (Assigned Class)' : 'Assign to Academic Class'}</span>
                    </h4>
                    <p className="text-[11px] text-[#CBB39C] mt-0.5">
                      {language === 'am'
                        ? 'መምህሩ እንዲያስተዳድሯቸው የተፈቀዱላቸውን ክፍሎች ይምረጡ'
                        : 'Select which classes this teacher is allowed to view, grade, and record attendance for.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSelectAllClasses}
                    className="px-2.5 py-1 bg-[#351C0F] hover:bg-[#4E2713] text-[#F5A623] text-[11px] font-semibold rounded-lg border border-[#522B17] transition self-start sm:self-auto"
                  >
                    {formData.assignedClassIds.length === classes.length
                      ? language === 'am'
                        ? 'ሁሉንም አትምረጥ'
                        : 'Deselect All'
                      : language === 'am'
                      ? 'ሁሉንም 8 ክፍሎች ምረጥ'
                      : 'Select All 8 Classes'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {classes.map((cls) => {
                    const isSelected = formData.assignedClassIds.includes(cls.id);
                    return (
                      <button
                        type="button"
                        key={cls.id}
                        onClick={() => toggleClassAssignment(cls.id)}
                        className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#E5921A]/20 border-[#F5A623] text-white shadow-md'
                            : 'bg-[#27140B] border-[#3D1F11] text-[#CBB39C] hover:border-[#522B17]'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs text-white">{cls.name}</div>
                          <div className="text-[10px] text-[#F5A623] font-medium">{cls.amharicName}</div>
                        </div>
                        {isSelected ? (
                          <div className="w-4 h-4 rounded bg-[#F5A623] text-[#1E0C04] flex items-center justify-center font-bold">
                            <Check className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded border border-[#522B17]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specific Course Assignment Section */}
              <div className="bg-[#1E0C04] p-4 rounded-xl border border-[#522B17] space-y-3">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#F5A623]" />
                    <span>{language === 'am' ? 'የተመደቡበት ኮርስ (Assigned Course)' : 'Assign to Courses'}</span>
                  </h4>
                  <p className="text-[11px] text-[#CBB39C] mt-0.5">
                    {language === 'am'
                      ? 'መምህሩ የሚያስተምሯቸውን ኮርሶች ምልክት ያድርጉ'
                      : 'Assign specific courses to this teacher for mark entry and curriculum delivery.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {modalAvailableCourses.length > 0 ? (
                    modalAvailableCourses.map((crs) => {
                      const isSelected = formData.assignedCourseIds.includes(crs.id);
                      const parentClass = classes.find((c) => c.id === crs.classId);
                      return (
                        <button
                          type="button"
                          key={crs.id}
                          onClick={() => toggleCourseAssignment(crs.id)}
                          className={`p-2 rounded-xl border text-left transition flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#E5921A]/20 border-[#F5A623] text-white'
                              : 'bg-[#27140B] border-[#3D1F11] text-[#CBB39C] hover:border-[#522B17]'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="font-bold text-xs text-white truncate">
                              {crs.code} - {crs.title}
                            </div>
                            <div className="text-[10px] text-[#F5A623] truncate">
                              {crs.amharicTitle || crs.title} • {parentClass ? parentClass.name : ''}
                            </div>
                          </div>
                          {isSelected ? (
                            <div className="w-4 h-4 flex-shrink-0 rounded bg-[#F5A623] text-[#1E0C04] flex items-center justify-center font-bold">
                              <Check className="w-3 h-3" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 flex-shrink-0 rounded border border-[#522B17]" />
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center p-3 text-[#8C6D58] italic col-span-2">
                      {language === 'am'
                        ? 'በተመረጡት ክፍሎች ስር ምንም ኮርሶች አልተገኙም። እባክዎ አስቀድመው ክፍል ይምረጡ።'
                        : 'No courses found for selected classes. Please select class above first.'}
                    </div>
                  )}
                </div>
              </div>

              {/* All-Class Access Authority Override Switch */}
              <div className="bg-[#351C0F] p-4 rounded-xl border border-[#522B17] flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#F5A623]" />
                    <span className="font-bold text-white text-xs">
                      {language === 'am'
                        ? 'የሁሉንም ክፍሎች ሙሉ ፈቃድ/ሥልጣን ስጥ (Grant All-Class Authority)'
                        : 'Grant Authority to Access All Classes'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#CBB39C]">
                    {language === 'am'
                      ? 'ይህ አማራጭ ሲበራ፣ መምህሩ ከተመደቡበት ክፍል በተጨማሪ ሁሉንም 8 ክፍሎች፣ ተማሪዎች እና የውጤት መረጃዎች ያለገደብ ማየት ይችላሉ።'
                      : 'Allows this teacher to access and view all 8 classes, student records, and courses across the school without restriction.'}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={formData.canAccessAllClasses}
                    onChange={(e) => setFormData({ ...formData, canAccessAllClasses: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#1E0C04] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#522B17] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#522B17]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-[#351C0F] text-[#CBB39C] font-bold rounded-xl hover:bg-[#4E2713] transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#E5921A] hover:bg-[#FBB03B] text-[#1E0C04] font-bold rounded-xl shadow-lg transition"
                >
                  {editingTeacher ? (language === 'am' ? 'ምደባውን አስቀምጥ' : 'Save Changes') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
