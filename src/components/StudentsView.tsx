import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { AcademicClass, Student } from '../types';
import { getCurrentAcademicYear } from '../utils/academicYear';
import { Users, Plus, Search, Filter, ChevronLeft, ChevronRight, Eye, FileText, UserCheck } from 'lucide-react';
import { StudentProfileModal } from './StudentProfileModal';

export const StudentsView: React.FC = () => {
  const { t, language } = useLanguage();
  const toast = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudentIdForProfile, setSelectedStudentIdForProfile] = useState<string | null>(null);

  const PAGE_SIZE = 10;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    amharicName: '',
    gender: 'Male' as any,
    email: '',
    phone: '',
    classId: 'cls-1',
    section: 'A',
    academicYear: getCurrentAcademicYear(),
  });

  const loadData = () => {
    Promise.all([api.getStudents(), api.getClasses()]).then(([stdRes, clsRes]) => {
      if (stdRes.success) setStudents(stdRes.data);
      if (clsRes.success) setClasses(clsRes.data);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStudents = students
    .filter((s) => {
      const matchesSearch =
        s.firstName.toLowerCase().includes(search.toLowerCase()) ||
        s.lastName.toLowerCase().includes(search.toLowerCase()) ||
        s.studentId.toLowerCase().includes(search.toLowerCase()) ||
        s.amharicName.includes(search);
      const matchesClass = selectedClass === 'all' || s.classId === selectedClass;
      return matchesSearch && matchesClass;
    })
    .sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.trim().toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });

  const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const clsObj = classes.find((c) => c.id === formData.classId);
    const payload = {
      ...formData,
      email: formData.email || `student_${Date.now()}@school.internal`,
      className: clsObj ? clsObj.name : 'Class 1',
    };

    const res = await api.createStudent(payload);
    if (res.success) {
      toast.success(
        language === 'am'
          ? `ተማሪ ${formData.amharicName || `${formData.firstName} ${formData.lastName}`} በተሳካ ሁኔታ ተመዝግቧል!`
          : `Student ${formData.firstName} ${formData.lastName} registered successfully!`
      );
      setShowAddModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        amharicName: '',
        gender: 'Male' as any,
        email: '',
        phone: '',
        classId: 'cls-1',
        section: 'A',
        academicYear: getCurrentAcademicYear(),
      });
      loadData();
    } else {
      toast.error(
        language === 'am' ? 'ተማሪውን መመዝገብ አልተቻለም። እባክዎ እንደገና ይሞክሩ።' : 'Failed to register student. Please try again.'
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>{t('students')} Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registered student database, academic class levels, sections, individual attendance, grades, and behavioral notes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-semibold text-white text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('registerStudent')}</span>
        </button>
      </div>

      {/* Search and Class Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-850 p-4 border border-slate-800 rounded-2xl shadow-lg">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t('search')}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="all">All Academic Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.amharicName})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Found <span className="text-emerald-400 font-bold">{filteredStudents.length}</span> students
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">{t('studentId')}</th>
                <th className="p-4">{t('studentName')}</th>
                <th className="p-4">{t('gender')}</th>
                <th className="p-4">{t('classLevel')}</th>
                <th className="p-4">{t('section')}</th>
                <th className="p-4">{t('phone')}</th>
                <th className="p-4">{t('status')}</th>
                <th className="p-4 text-center">{language === 'am' ? 'የተማሪ ማህደር' : 'Profile / History'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500 italic">
                    No students match the current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((std) => (
                  <tr
                    key={std.id}
                    className="hover:bg-slate-800/60 transition group cursor-pointer"
                    onClick={() => setSelectedStudentIdForProfile(std.id)}
                  >
                    <td className="p-4 font-mono font-bold text-emerald-400">{std.studentId}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-100 group-hover:text-emerald-300 transition">
                        {std.firstName} {std.lastName}
                      </div>
                      <div className="text-slate-400 text-[11px]">{std.amharicName}</div>
                    </td>
                    <td className="p-4 font-medium text-slate-300">{std.gender}</td>
                    <td className="p-4 font-semibold text-slate-200">{std.className}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 font-bold rounded">
                        Sec {std.section}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{std.phone}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded">
                        {std.status}
                      </span>
                    </td>
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedStudentIdForProfile(std.id)}
                        className="px-3 py-1.5 bg-[#2B140A] hover:bg-[#D98218] text-[#F5A623] hover:text-slate-950 border border-[#522B17] hover:border-[#D98218] rounded-xl text-xs font-bold transition flex items-center gap-1.5 mx-auto shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{language === 'am' ? 'ሙሉ ማህደር' : 'View Profile'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>
            Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong>
          </span>

          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg flex items-center gap-1 font-semibold"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg flex items-center gap-1 font-semibold"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Drill-Down Student Profile Modal */}
      {selectedStudentIdForProfile && (
        <StudentProfileModal
          studentId={selectedStudentIdForProfile}
          onClose={() => setSelectedStudentIdForProfile(null)}
        />
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-850 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl text-white space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>{t('registerStudent')}</span>
            </h3>

            <form onSubmit={handleRegisterStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">First Name (English)</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Abebe"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Last Name (English)</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Kebede"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">{t('amharicName')} (አማርኛ)</label>
                <input
                  type="text"
                  required
                  value={formData.amharicName}
                  onChange={(e) => setFormData({ ...formData, amharicName: e.target.value })}
                  placeholder="አበበ ከበደ"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">{t('gender')}</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">{t('classLevel')}</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">{t('section')}</label>
                  <input
                    type="text"
                    required
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    placeholder="A"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">{t('phone')}</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+251 922 000000"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-600"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500"
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
