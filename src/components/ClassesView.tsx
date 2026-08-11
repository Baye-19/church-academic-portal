import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { AcademicClass, Course, Student } from '../types';
import { getCurrentAcademicYear } from '../utils/academicYear';
import {
  GraduationCap,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronRight,
  Plus,
  PlusCircle,
  CalendarRange,
  Edit3,
  X,
  CheckCircle2,
  Calendar,
  Users,
  UserPlus,
} from 'lucide-react';

export const ClassesView: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [expandedClassId, setExpandedClassId] = useState<string | null>('cls-1');

  // Modal States
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddSemesterModal, setShowAddSemesterModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [editingClass, setEditingClass] = useState<AcademicClass | null>(null);
  const [targetClassForStudent, setTargetClassForStudent] = useState<AcademicClass | null>(null);

  // Form States for New/Edit Class
  const [classNameInput, setClassNameInput] = useState('');
  const [classAmharicInput, setClassAmharicInput] = useState('');
  const [classLevelInput, setClassLevelInput] = useState<number>(1);
  const [classYearInput, setClassYearInput] = useState(getCurrentAcademicYear());
  const [classSectionsInput, setClassSectionsInput] = useState('A, B');
  const [classSemestersInput, setClassSemestersInput] = useState('Semester I, Semester II');

  // Form States for Add Student
  const [studentFormData, setStudentFormData] = useState({
    firstName: '',
    lastName: '',
    amharicName: '',
    gender: 'Male' as 'Male' | 'Female',
    email: '',
    phone: '',
    section: 'A',
  });

  // Form States for Add Semester
  const [selectedClassForSemester, setSelectedClassForSemester] = useState('');
  const [newSemesterName, setNewSemesterName] = useState('');

  // Form States for Academic Year
  const [newYearInput, setNewYearInput] = useState('');

  // Alert Message
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const isAdminOrHead = user?.role === 'ADMIN' || user?.role === 'DEPT_HEAD';
  const canAddStudents = user?.role === 'ADMIN' || user?.role === 'DEPT_HEAD' || user?.role === 'COORDINATOR' || user?.role === 'TEACHER';

  const loadData = () => {
    Promise.all([
      api.getClasses(),
      api.getCourses(),
      api.getAcademicYears(),
      api.getStudents(),
    ]).then(([clsRes, crsRes, yrRes, stdRes]) => {
      if (clsRes.success) setClasses(clsRes.data);
      if (crsRes.success) setCourses(crsRes.data);
      if (yrRes.success && yrRes.data) setAcademicYears(yrRes.data);
      if (stdRes.success) setStudents(stdRes.data);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedClassId(expandedClassId === id ? null : id);
  };

  const handleOpenAddStudent = (cls: AcademicClass, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTargetClassForStudent(cls);
    setStudentFormData({
      firstName: '',
      lastName: '',
      amharicName: '',
      gender: 'Male',
      email: '',
      phone: '',
      section: cls.sections[0] || 'A',
    });
    setShowAddStudentModal(true);
  };

  const handleSaveStudentToClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClassForStudent) return;

    const payload = {
      ...studentFormData,
      classId: targetClassForStudent.id,
      className: targetClassForStudent.name,
      academicYear: targetClassForStudent.academicYear || getCurrentAcademicYear(),
    };

    const res = await api.createStudent(payload);
    if (res.success) {
      setAlertMessage(
        `Registered student ${studentFormData.firstName} ${studentFormData.lastName} (${studentFormData.amharicName}) under ${targetClassForStudent.name}!`
      );
      setShowAddStudentModal(false);
      loadData();
      setTimeout(() => setAlertMessage(null), 4000);
    }
  };

  // Open Create Class Modal
  const handleOpenAddClass = () => {
    setEditingClass(null);
    setClassNameInput(`Class ${classes.length + 1}`);
    setClassAmharicInput(`ደረጃ ${classes.length + 1}`);
    setClassLevelInput(classes.length + 1);
    setClassYearInput(academicYears[0] || '2025/2026');
    setClassSectionsInput('A, B');
    setClassSemestersInput('Semester I, Semester II');
    setShowAddClassModal(true);
  };

  // Open Edit Class Modal
  const handleOpenEditClass = (cls: AcademicClass, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClass(cls);
    setClassNameInput(cls.name);
    setClassAmharicInput(cls.amharicName);
    setClassLevelInput(cls.level);
    setClassYearInput(cls.academicYear);
    setClassSectionsInput(cls.sections.join(', '));
    setClassSemestersInput((cls.semesters || ['Semester I', 'Semester II']).join(', '));
    setShowAddClassModal(true);
  };

  // Save Class (Create or Edit)
  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const sectionsArray = classSectionsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const semestersArray = classSemestersInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const classData = {
      name: classNameInput,
      amharicName: classAmharicInput,
      level: Number(classLevelInput),
      academicYear: classYearInput,
      sections: sectionsArray.length > 0 ? sectionsArray : ['A'],
      semesters: semestersArray.length > 0 ? semestersArray : ['Semester I', 'Semester II'],
    };

    if (editingClass) {
      const res = await api.updateClass(editingClass.id, classData);
      if (res.success) {
        setAlertMessage(`Updated ${classData.name} successfully!`);
      }
    } else {
      const res = await api.createClass(classData);
      if (res.success) {
        setAlertMessage(`Added new ${classData.name} successfully!`);
      }
    }

    setShowAddClassModal(false);
    loadData();
    setTimeout(() => setAlertMessage(null), 4000);
  };

  // Add Semester to Class
  const handleSaveSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassForSemester || !newSemesterName.trim()) return;

    const targetCls = classes.find((c) => c.id === selectedClassForSemester);
    if (!targetCls) return;

    const currentSemesters = targetCls.semesters || ['Semester I', 'Semester II'];
    if (currentSemesters.includes(newSemesterName.trim())) {
      alert('Semester already exists for this class!');
      return;
    }

    const updatedSemesters = [...currentSemesters, newSemesterName.trim()];
    const res = await api.updateClass(targetCls.id, { semesters: updatedSemesters });

    if (res.success) {
      setAlertMessage(`Added "${newSemesterName}" to ${targetCls.name}!`);
      setShowAddSemesterModal(false);
      setNewSemesterName('');
      loadData();
      setTimeout(() => setAlertMessage(null), 4000);
    }
  };

  // Add New Academic Year
  const handleSaveAcademicYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearInput.trim()) return;

    const res = await api.addAcademicYear(newYearInput.trim());
    if (res.success) {
      setAlertMessage(`Academic Year ${newYearInput.trim()} created!`);
      setNewYearInput('');
      loadData();
      setTimeout(() => setAlertMessage(null), 4000);
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Alert Notification */}
      {alertMessage && (
        <div className="p-3.5 bg-amber-500/20 border border-amber-500/40 text-[#F5A623] text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{alertMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#4A2715]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-[#F5A623]" />
            <span>{t('classList')} & Semesters Management</span>
          </h2>
          <p className="text-xs text-[#CBB39C] mt-1">
            Configure academic levels, section allocations, semesters, and academic years.
          </p>
        </div>

        {/* Admin Action Buttons */}
        {isAdminOrHead && (
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleOpenAddClass}
              className="px-3.5 py-2 bg-[#E5921A] hover:bg-[#FBB03B] text-[#1E0C04] font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Class</span>
            </button>

            <button
              onClick={() => {
                if (classes.length > 0) setSelectedClassForSemester(classes[0].id);
                setShowAddSemesterModal(true);
              }}
              className="px-3.5 py-2 bg-[#351C0F] hover:bg-[#442413] text-[#F7E5C8] font-bold text-xs rounded-xl border border-[#5C321B] shadow-lg transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-[#F5A623]" />
              <span>Add Semester</span>
            </button>

            <button
              onClick={() => setShowYearModal(true)}
              className="px-3.5 py-2 bg-[#351C0F] hover:bg-[#442413] text-[#F7E5C8] font-bold text-xs rounded-xl border border-[#5C321B] shadow-lg transition flex items-center gap-1.5"
            >
              <CalendarRange className="w-4 h-4 text-emerald-400" />
              <span>Manage Academic Years</span>
            </button>
          </div>
        )}
      </div>

      {/* Academic Classes Accordion List */}
      <div className="grid grid-cols-1 gap-4">
        {classes.map((cls) => {
          const classCourses = courses.filter((c) => c.classId === cls.id);
          const classStudents = students.filter((s) => s.classId === cls.id || s.className === cls.name);
          const configuredSemesters = cls.semesters || ['Semester I', 'Semester II'];
          const isExpanded = expandedClassId === cls.id;

          return (
            <div
              key={cls.id}
              className={`bg-[#27140B] border transition rounded-2xl overflow-hidden shadow-lg ${
                isExpanded ? 'border-[#F5A623] ring-1 ring-[#F5A623]/20' : 'border-[#522B17] hover:border-[#6E3B1F]'
              }`}
            >
              {/* Class Header Bar */}
              <div
                onClick={() => toggleExpand(cls.id)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer bg-[#27140B] hover:bg-[#351C0F] transition"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 bg-[#180B05] text-[#F5A623] border border-[#522B17] rounded-xl font-bold text-base sm:text-lg w-10 sm:w-12 text-center shrink-0">
                    {cls.level}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <h3 className="font-bold text-base text-white">{cls.name}</h3>
                      <span className="text-sm font-semibold text-emerald-400">({cls.amharicName})</span>
                      <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-semibold rounded">
                        AY {cls.academicYear}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-blue-400" />
                        Sections: {cls.sections.join(', ')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        Semesters: {configuredSemesters.join(' • ')}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        Courses: {classCourses.length}
                      </span>
                      <span className="flex items-center gap-1 text-[#F5A623] font-semibold">
                        <Users className="w-3.5 h-3.5" />
                        Students: {classStudents.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {canAddStudents && (
                    <button
                      onClick={(e) => handleOpenAddStudent(cls, e)}
                      className="px-3 py-1.5 rounded-xl bg-[#E5921A] hover:bg-[#FBB03B] text-[#1E0C04] border border-[#522B17] transition text-xs font-bold flex items-center gap-1 shadow"
                      title="Add Student to this Class"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">+ Add Student</span>
                    </button>
                  )}

                  {isAdminOrHead && (
                    <button
                      onClick={(e) => handleOpenEditClass(cls, e)}
                      className="p-2 rounded-xl bg-[#180B05] hover:bg-[#351C0F] text-[#F5A623] border border-[#522B17] transition text-xs font-bold flex items-center gap-1"
                      title="Edit Class Parameters"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                  )}

                  <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Breakdown & Roster */}
              {isExpanded && (
                <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800 space-y-6">
                  {configuredSemesters.map((sem, sIdx) => {
                    const semCourses = classCourses.filter((c) => c.semester === sem);
                    const colorClasses =
                      sIdx % 3 === 0
                        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        : sIdx % 3 === 1
                        ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
                        : 'text-amber-400 border-amber-500/30 bg-amber-500/10';

                    return (
                      <div key={sem}>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#F5A623]" />
                          <span>{sem} Courses</span>
                          <span className="text-[10px] text-slate-500 font-normal">({semCourses.length} subjects)</span>
                        </h4>

                        {semCourses.length === 0 ? (
                          <div className="p-3 bg-slate-850/50 border border-slate-800 rounded-xl text-xs text-slate-500 italic">
                            No courses assigned for {sem} in this level yet.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {semCourses.map((c) => (
                              <div
                                key={c.id}
                                className="p-4 bg-slate-850 border border-slate-800 rounded-xl flex justify-between items-center"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 border text-[10px] font-bold rounded ${colorClasses}`}>
                                      {c.code}
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium">
                                      {c.creditHours} Credits
                                    </span>
                                  </div>
                                  <h5 className="font-semibold text-slate-200 text-sm mt-1">{c.title}</h5>
                                  <p className="text-xs text-slate-400">{c.amharicTitle}</p>
                                </div>
                                <div className="text-right text-xs">
                                  <div className="text-slate-300 font-medium">
                                    {c.teacherName || 'Unassigned'}
                                  </div>
                                  <div className="text-slate-500 text-[10px]">Instructor</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Registered Students Roster Section */}
                  <div className="pt-4 border-t border-slate-800">
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#F5A623]" />
                        <span>Registered Students Roster ({classStudents.length})</span>
                      </h4>
                      {canAddStudents && (
                        <button
                          onClick={(e) => handleOpenAddStudent(cls, e)}
                          className="px-3 py-1.5 bg-[#E5921A] hover:bg-[#FBB03B] text-[#1E0C04] font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>+ Add Student to {cls.name}</span>
                        </button>
                      )}
                    </div>

                    {classStudents.length === 0 ? (
                      <div className="p-4 bg-slate-850/50 border border-slate-800 rounded-xl text-xs text-slate-400 text-center">
                        No students registered under {cls.name} yet.{' '}
                        {canAddStudents && (
                          <button
                            onClick={(e) => handleOpenAddStudent(cls, e)}
                            className="text-[#F5A623] underline font-bold hover:text-white ml-1"
                          >
                            Click to register student
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {classStudents.map((std) => (
                          <div
                            key={std.id}
                            className="p-3 bg-slate-850 border border-slate-800 rounded-xl text-xs flex justify-between items-center"
                          >
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span className="text-[#F5A623]">
                                  {std.firstName} {std.lastName}
                                </span>
                                {std.amharicName && (
                                  <span className="text-slate-400 text-[11px]">({std.amharicName})</span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                ID: {std.studentId} • Sec: {std.section} • {std.gender}
                              </div>
                            </div>
                            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold uppercase">
                              Active
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal 1: Add or Edit Class */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#27140B] border border-[#522B17] rounded-2xl p-6 w-full max-w-lg shadow-2xl relative text-xs text-[#F7E5C8]">
            <button
              onClick={() => setShowAddClassModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#F5A623]" />
              <span>{editingClass ? `Edit Class: ${editingClass.name}` : 'Create New Academic Class'}</span>
            </h3>

            <form onSubmit={handleSaveClass} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#CBB39C] mb-1">Class Name (English)</label>
                  <input
                    type="text"
                    required
                    value={classNameInput}
                    onChange={(e) => setClassNameInput(e.target.value)}
                    placeholder="e.g. Class 9"
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#CBB39C] mb-1">Amharic Name</label>
                  <input
                    type="text"
                    required
                    value={classAmharicInput}
                    onChange={(e) => setClassAmharicInput(e.target.value)}
                    placeholder="e.g. ደረጃ 9"
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-emerald-400 font-semibold focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#CBB39C] mb-1">Level Number</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={classLevelInput}
                    onChange={(e) => setClassLevelInput(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#CBB39C] mb-1">Academic Year</label>
                  <select
                    value={classYearInput}
                    onChange={(e) => setClassYearInput(e.target.value)}
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-[#F5A623] font-bold focus:outline-none"
                  >
                    {academicYears.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#CBB39C] mb-1">
                  Sections (Comma Separated)
                </label>
                <input
                  type="text"
                  required
                  value={classSectionsInput}
                  onChange={(e) => setClassSectionsInput(e.target.value)}
                  placeholder="e.g. A, B, C"
                  className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#CBB39C] mb-1">
                  Configured Semesters (Comma Separated)
                </label>
                <input
                  type="text"
                  required
                  value={classSemestersInput}
                  onChange={(e) => setClassSemestersInput(e.target.value)}
                  placeholder="e.g. Semester I, Semester II, Semester III"
                  className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 bg-[#351C0F] hover:bg-[#442413] text-[#F7E5C8] font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E5921A] hover:bg-[#FBB03B] text-[#1E0C04] font-bold rounded-xl shadow"
                >
                  {editingClass ? 'Save Changes' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Semester */}
      {showAddSemesterModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#27140B] border border-[#522B17] rounded-2xl p-6 w-full max-w-md shadow-2xl relative text-xs text-[#F7E5C8]">
            <button
              onClick={() => setShowAddSemesterModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#F5A623]" />
              <span>Add New Semester to Class</span>
            </h3>

            <form onSubmit={handleSaveSemester} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#CBB39C] mb-1">Select Target Class</label>
                <select
                  value={selectedClassForSemester}
                  onChange={(e) => setSelectedClassForSemester(e.target.value)}
                  className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-[#F5A623] font-bold focus:outline-none"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.amharicName}) — {cls.academicYear}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#CBB39C] mb-1">Semester Name / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Semester III, Summer Semester, Term 3"
                  value={newSemesterName}
                  onChange={(e) => setNewSemesterName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddSemesterModal(false)}
                  className="px-4 py-2 bg-[#351C0F] hover:bg-[#442413] text-[#F7E5C8] font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E5921A] hover:bg-[#FBB03B] text-[#1E0C04] font-bold rounded-xl shadow"
                >
                  Add Semester
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Manage Academic Years */}
      {showYearModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#27140B] border border-[#522B17] rounded-2xl p-6 w-full max-w-md shadow-2xl relative text-xs text-[#F7E5C8]">
            <button
              onClick={() => setShowYearModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <CalendarRange className="w-5 h-5 text-emerald-400" />
              <span>Academic Years Management</span>
            </h3>

            <div className="space-y-4">
              <div>
                <span className="block text-[11px] font-semibold text-[#CBB39C] mb-2">Existing Academic Years:</span>
                <div className="flex flex-wrap gap-2">
                  {academicYears.map((yr) => (
                    <span
                      key={yr}
                      className="px-3 py-1 bg-[#180B05] border border-[#5C321B] text-[#F5A623] font-mono font-bold rounded-lg"
                    >
                      {yr}
                    </span>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveAcademicYear} className="space-y-3 pt-2 border-t border-[#4A2715]">
                <label className="block text-[11px] font-semibold text-white">Add New Academic Year</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026/2027"
                    value={newYearInput}
                    onChange={(e) => setNewYearInput(e.target.value)}
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shrink-0"
                  >
                    Add Year
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Register Student to Class */}
      {showAddStudentModal && targetClassForStudent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#27140B] border border-[#522B17] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs text-[#F7E5C8] relative">
            <button
              onClick={() => setShowAddStudentModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#4A2715] pb-3">
              <UserPlus className="w-5 h-5 text-[#F5A623]" />
              <span>Register Student under {targetClassForStudent.name}</span>
            </h3>

            <form onSubmit={handleSaveStudentToClass} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#CBB39C] mb-1">First Name (English)</label>
                  <input
                    type="text"
                    required
                    value={studentFormData.firstName}
                    onChange={(e) => setStudentFormData({ ...studentFormData, firstName: e.target.value })}
                    placeholder="e.g. Samuel"
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  />
                </div>
                <div>
                  <label className="block text-[#CBB39C] mb-1">Last Name (English)</label>
                  <input
                    type="text"
                    required
                    value={studentFormData.lastName}
                    onChange={(e) => setStudentFormData({ ...studentFormData, lastName: e.target.value })}
                    placeholder="e.g. Yohannes"
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#CBB39C] mb-1">Full Name (አማርኛ)</label>
                <input
                  type="text"
                  required
                  value={studentFormData.amharicName}
                  onChange={(e) => setStudentFormData({ ...studentFormData, amharicName: e.target.value })}
                  placeholder="ምሳሌ: ሳሙኤል ዮሐንስ"
                  className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#CBB39C] mb-1">Gender</label>
                  <select
                    value={studentFormData.gender}
                    onChange={(e) => setStudentFormData({ ...studentFormData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  >
                    <option value="Male">Male (ወንድ)</option>
                    <option value="Female">Female (ሴት)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#CBB39C] mb-1">Section</label>
                  <select
                    value={studentFormData.section}
                    onChange={(e) => setStudentFormData({ ...studentFormData, section: e.target.value })}
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  >
                    {targetClassForStudent.sections.map((sec) => (
                      <option key={sec} value={sec}>
                        Section {sec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#CBB39C] mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={studentFormData.phone}
                    onChange={(e) => setStudentFormData({ ...studentFormData, phone: e.target.value })}
                    placeholder="09..."
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  />
                </div>
                <div>
                  <label className="block text-[#CBB39C] mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={studentFormData.email}
                    onChange={(e) => setStudentFormData({ ...studentFormData, email: e.target.value })}
                    placeholder="student@gmail.com"
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-[#4A2715]">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 bg-[#180B05] hover:bg-[#351C0F] text-[#CBB39C] font-semibold rounded-xl border border-[#522B17]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E5921A] hover:bg-[#FBB03B] text-[#1E0C04] font-bold rounded-xl shadow-lg transition flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Student</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
