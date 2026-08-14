import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  BehavioralNote,
  BehavioralNoteCategory,
  BehavioralSeverity,
  StudentProfileData,
} from '../types';
import { formatEthiopianDate } from '../utils/ethiopianCalendar';
import {
  X,
  User,
  GraduationCap,
  Calendar,
  ClipboardList,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Plus,
  Trash2,
  FileText,
  Printer,
  ShieldCheck,
  TrendingUp,
  BookOpen,
  Phone,
  Mail,
  Filter,
  Check,
  Sparkles,
  HeartHandshake,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';

interface StudentProfileModalProps {
  studentId: string;
  onClose: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  studentId,
  onClose,
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<StudentProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<'grades' | 'attendance' | 'behavior'>('grades');

  // Filters for sub-tabs
  const [gradeSemesterFilter, setGradeSemesterFilter] = useState<string>('all');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<string>('all');
  const [behaviorCategoryFilter, setBehaviorCategoryFilter] = useState<string>('all');

  // Add Behavioral Note Modal
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);
  const [noteForm, setNoteForm] = useState({
    title: '',
    category: 'SPIRITUAL_GROWTH' as BehavioralNoteCategory,
    severity: 'POSITIVE' as BehavioralSeverity,
    content: '',
    actionTaken: '',
    followUpRequired: false,
    date: new Date().toISOString().split('T')[0],
  });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await api.getStudentProfile(studentId);
      if (res.success && res.data) {
        setProfileData(res.data);
      } else {
        toast.error(
          language === 'am' ? 'የተማሪውን መረጃ ማግኘት አልተቻለም።' : 'Failed to fetch student profile.'
        );
      }
    } catch (err) {
      console.error('Error fetching student profile:', err);
      toast.error(language === 'am' ? 'የተማሪ መረጃ መጫን አልተሳካም።' : 'Error loading student profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      loadProfile();
    }
  }, [studentId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.title.trim() || !noteForm.content.trim()) {
      toast.warning(
        language === 'am' ? 'እባክዎ ርዕስ እና ዝርዝር ማስታወሻ ይሙሉ!' : 'Please enter title and content.'
      );
      return;
    }

    setSubmittingNote(true);
    try {
      const payload: Partial<BehavioralNote> = {
        ...noteForm,
        recordedByUserId: user?.id || 'usr-1',
        recordedByUserName: user?.name || 'Academic Staff',
        recordedByUserRole: user?.role || 'TEACHER',
      };

      const res = await api.createStudentBehavioralNote(studentId, payload);
      if (res.success) {
        toast.success(
          language === 'am'
            ? 'የስነ-ምግባር እና ክትትል ማስታወሻው በተሳካ ሁኔታ ተመዝግቧል!'
            : 'Behavioral observation note recorded successfully!'
        );
        setShowAddNoteModal(false);
        setNoteForm({
          title: '',
          category: 'SPIRITUAL_GROWTH',
          severity: 'POSITIVE',
          content: '',
          actionTaken: '',
          followUpRequired: false,
          date: new Date().toISOString().split('T')[0],
        });
        await loadProfile();
      } else {
        toast.error(
          language === 'am' ? 'ማስታወሻውን ማስቀመጥ አልተቻለም።' : 'Failed to save note.'
        );
      }
    } catch (err) {
      console.error('Error saving note:', err);
      toast.error(language === 'am' ? 'ስህተት አጋጥሟል።' : 'Error saving behavioral note.');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (
      !confirm(
        language === 'am'
          ? 'ይህን የስነ-ምግባር ማስታወሻ መሰረዝ ይፈልጋሉ?'
          : 'Are you sure you want to remove this behavioral note?'
      )
    ) {
      return;
    }

    try {
      const res = await api.deleteStudentBehavioralNote(studentId, noteId);
      if (res.success) {
        toast.success(
          language === 'am' ? 'ማስታወሻው ተሰርዟል!' : 'Behavioral note removed successfully!'
        );
        await loadProfile();
      } else {
        toast.error(language === 'am' ? 'መሰረዝ አልተቻለም።' : 'Failed to delete note.');
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
      toast.error(language === 'am' ? 'ስህተት አጋጥሟል።' : 'Error deleting note.');
    }
  };

  const handlePrintSummary = () => {
    window.print();
  };

  // Filtered lists
  const filteredMarks = useMemo(() => {
    if (!profileData?.grades.marks) return [];
    if (gradeSemesterFilter === 'all') return profileData.grades.marks;
    return profileData.grades.marks.filter((m) => m.semester === gradeSemesterFilter);
  }, [profileData, gradeSemesterFilter]);

  const filteredAttendance = useMemo(() => {
    if (!profileData?.attendanceHistory) return [];
    if (attendanceStatusFilter === 'all') return profileData.attendanceHistory;
    return profileData.attendanceHistory.filter((a) => a.status === attendanceStatusFilter);
  }, [profileData, attendanceStatusFilter]);

  const filteredNotes = useMemo(() => {
    if (!profileData?.behavioralNotes) return [];
    if (behaviorCategoryFilter === 'all') return profileData.behavioralNotes;
    return profileData.behavioralNotes.filter((n) => n.category === behaviorCategoryFilter);
  }, [profileData, behaviorCategoryFilter]);

  const getCategoryBadge = (category: BehavioralNoteCategory) => {
    switch (category) {
      case 'COMMENDATION':
        return {
          labelEn: 'Commendation',
          labelAm: 'ምስጋና እና አርአያነት',
          bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          icon: <Award className="w-3.5 h-3.5" />,
        };
      case 'SPIRITUAL_GROWTH':
        return {
          labelEn: 'Spiritual Growth',
          labelAm: 'መንፈሳዊ ተሳትፎ',
          bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
          icon: <Sparkles className="w-3.5 h-3.5" />,
        };
      case 'ACADEMIC_EFFORT':
        return {
          labelEn: 'Academic Effort',
          labelAm: 'የትምህርት ትጋት',
          bg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
          icon: <BookOpen className="w-3.5 h-3.5" />,
        };
      case 'ATTENDANCE_PUNCTUALITY':
        return {
          labelEn: 'Punctuality',
          labelAm: 'ሰዓት አክባሪነት',
          bg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
          icon: <Clock className="w-3.5 h-3.5" />,
        };
      case 'DISCIPLINARY':
        return {
          labelEn: 'Disciplinary',
          labelAm: 'የስነ-ምግባር ማሳሰቢያ',
          bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
        };
      case 'COUNSELING':
        return {
          labelEn: 'Counseling',
          labelAm: 'ምክር / ወላጅ ግንኙነት',
          bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
          icon: <HeartHandshake className="w-3.5 h-3.5" />,
        };
      default:
        return {
          labelEn: 'General Note',
          labelAm: 'አጠቃላይ ማስታወሻ',
          bg: 'bg-slate-700/50 text-slate-300 border-slate-600',
          icon: <MessageSquare className="w-3.5 h-3.5" />,
        };
    }
  };

  const getSeverityBadge = (severity: BehavioralSeverity) => {
    switch (severity) {
      case 'POSITIVE':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'WARNING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return {
          label: language === 'am' ? 'ተገኝቷል' : 'Present',
          className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
        };
      case 'LATE':
        return {
          label: language === 'am' ? 'ዘግይቷል' : 'Late',
          className: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          icon: <Clock className="w-3 h-3 text-amber-400" />,
        };
      case 'EXCUSED':
        return {
          label: language === 'am' ? 'ፈቃድ' : 'Excused',
          className: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
          icon: <AlertCircle className="w-3 h-3 text-sky-400" />,
        };
      case 'ABSENT':
      default:
        return {
          label: language === 'am' ? 'ቀሪ' : 'Absent',
          className: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          icon: <XCircle className="w-3 h-3 text-rose-400" />,
        };
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (grade.startsWith('B')) return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    if (grade.startsWith('C')) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (grade.startsWith('D')) return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-5xl bg-[#1C0F08] border border-[#522B17] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Header Ribbon / Student Identification Banner */}
        <div className="relative p-6 bg-gradient-to-r from-[#2B140A] via-[#3B1C0D] to-[#2B140A] border-b border-[#522B17] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D98218] to-[#964B00] p-0.5 shadow-lg shadow-black/40 flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full rounded-[14px] bg-[#180B05] flex items-center justify-center text-xl font-black text-[#F5A623]">
                {profileData?.student.firstName?.charAt(0) || 'S'}
                {profileData?.student.lastName?.charAt(0) || 'T'}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-[#FFF5EA]">
                  {profileData ? `${profileData.student.firstName} ${profileData.student.lastName}` : 'Loading...'}
                </h2>
                <span className="text-sm font-medium text-[#D98218]">
                  {profileData?.student.amharicName}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30">
                  {profileData?.student.studentId}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  {profileData?.student.status || 'ACTIVE'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[#C2AA96]">
                <span className="flex items-center gap-1 font-semibold text-[#FFF5EA]">
                  <GraduationCap className="w-3.5 h-3.5 text-[#F5A623]" />
                  {profileData?.student.className} (Sec {profileData?.student.section})
                </span>
                <span>•</span>
                <span>{profileData?.student.academicYear}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#A68F7B]" />
                  {profileData?.student.phone || 'No phone recorded'}
                </span>
                {profileData?.student.email && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Mail className="w-3 h-3 text-[#A68F7B]" />
                      {profileData.student.email}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end print:hidden">
            <button
              onClick={handlePrintSummary}
              title="Print Summary Profile"
              className="px-3.5 py-2 bg-[#2B140A] hover:bg-[#3D1E0F] text-[#E8D7C5] border border-[#522B17] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-[#F5A623]" />
              <span className="hidden sm:inline">{language === 'am' ? 'አትም / Print' : 'Print'}</span>
            </button>

            <button
              onClick={() => setShowAddNoteModal(true)}
              className="px-3.5 py-2 bg-[#D98218] hover:bg-[#F5A623] text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-[#D98218]/20"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'am' ? 'ማስታወሻ መዝግብ' : 'Add Note'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-[#A68F7B] hover:text-white hover:bg-[#3D1E0F] rounded-xl transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-3 border-[#F5A623]/20 border-t-[#F5A623] rounded-full animate-spin" />
            <p className="text-xs text-[#C2AA96] animate-pulse">
              {language === 'am' ? 'የተማሪው መረጃ እየተጫነ ነው...' : 'Loading comprehensive student profile...'}
            </p>
          </div>
        ) : profileData ? (
          <>
            {/* KPI Performance Highlights Bar */}
            <div className="p-4 sm:p-6 bg-[#180B05] border-b border-[#3D1E0F] grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: GPA / Academic Standing */}
              <div className="p-3.5 bg-[#251208] border border-[#4A2412] rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#A68F7B] tracking-wider">
                    {language === 'am' ? 'የውጤት አማካይ (GPA)' : 'Cumulative GPA'}
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-lg font-black text-white">
                      {profileData.grades.gpa.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-[#A68F7B]">/ 4.00</span>
                  </div>
                  <div className="text-[10px] font-medium text-emerald-400 truncate">
                    {language === 'am' ? profileData.grades.amharicStanding : profileData.grades.standing}
                  </div>
                </div>
              </div>

              {/* Card 2: Attendance Rate */}
              <div className="p-3.5 bg-[#251208] border border-[#4A2412] rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 text-cyan-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#A68F7B] tracking-wider">
                    {language === 'am' ? 'የመገኘት ምጣኔ' : 'Attendance Rate'}
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-lg font-black text-cyan-300">
                      {profileData.attendanceSummary.attendanceRate}%
                    </span>
                    <span className="text-[10px] text-[#A68F7B]">
                      ({profileData.attendanceSummary.presentCount}/{profileData.attendanceSummary.totalSessions})
                    </span>
                  </div>
                  <div className="text-[10px] font-medium text-[#C2AA96]">
                    {profileData.attendanceSummary.lateCount} {language === 'am' ? 'ዘግይቷል' : 'Late'} • {profileData.attendanceSummary.absentCount} {language === 'am' ? 'ቀሪ' : 'Absent'}
                  </div>
                </div>
              </div>

              {/* Card 3: Enrolled Courses & Credits */}
              <div className="p-3.5 bg-[#251208] border border-[#4A2412] rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5A623]/10 border border-[#F5A623]/20 flex items-center justify-center flex-shrink-0 text-[#F5A623]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#A68F7B] tracking-wider">
                    {language === 'am' ? 'የተመዘገቡ ኮርሶች' : 'Courses & Credits'}
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-lg font-black text-white">
                      {profileData.grades.marks.length}
                    </span>
                    <span className="text-[10px] text-[#A68F7B]">
                      {language === 'am' ? 'ኮርሶች' : 'Courses'}
                    </span>
                  </div>
                  <div className="text-[10px] font-medium text-[#C2AA96]">
                    {profileData.grades.totalCreditHours} {language === 'am' ? 'የክሬዲት ሰዓት' : 'Total Credits'}
                  </div>
                </div>
              </div>

              {/* Card 4: Conduct & Behavioral Notes */}
              <div className="p-3.5 bg-[#251208] border border-[#4A2412] rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#A68F7B] tracking-wider">
                    {language === 'am' ? 'የስነ-ምግባር መዝገብ' : 'Behavioral Notes'}
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-lg font-black text-purple-300">
                      {profileData.behavioralNotes.length}
                    </span>
                    <span className="text-[10px] text-[#A68F7B]">
                      {language === 'am' ? 'ማስታወሻዎች' : 'Entries'}
                    </span>
                  </div>
                  <div className="text-[10px] font-medium text-emerald-400">
                    {profileData.behavioralNotes.filter((n) => n.severity === 'POSITIVE').length} {language === 'am' ? 'አዎንታዊ ምስጋና' : 'Positive'}
                  </div>
                </div>
              </div>
            </div>

            {/* Drill-down Sub-Navigation Tabs */}
            <div className="px-6 border-b border-[#3D1E0F] bg-[#180B05] flex items-center gap-2 overflow-x-auto print:hidden">
              <button
                onClick={() => setActiveTab('grades')}
                className={`py-3.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
                  activeTab === 'grades'
                    ? 'border-[#F5A623] text-[#F5A623]'
                    : 'border-transparent text-[#A68F7B] hover:text-[#FFF5EA]'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>{language === 'am' ? 'የትምህርት ውጤቶች እና ትራንስክሪፕት' : 'Grades & Academic Transcript'}</span>
                <span className="px-1.5 py-0.2 bg-[#2B140A] text-[10px] rounded-full">
                  {profileData.grades.marks.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('attendance')}
                className={`py-3.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
                  activeTab === 'attendance'
                    ? 'border-[#F5A623] text-[#F5A623]'
                    : 'border-transparent text-[#A68F7B] hover:text-[#FFF5EA]'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>{language === 'am' ? 'የቀን መቁጠሪያ የመገኘት ታሪክ' : 'Historical Attendance Log'}</span>
                <span className="px-1.5 py-0.2 bg-[#2B140A] text-[10px] rounded-full">
                  {profileData.attendanceHistory.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('behavior')}
                className={`py-3.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
                  activeTab === 'behavior'
                    ? 'border-[#F5A623] text-[#F5A623]'
                    : 'border-transparent text-[#A68F7B] hover:text-[#FFF5EA]'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>{language === 'am' ? 'የስነ-ምግባር እና ክትትል ማስታወሻዎች' : 'Behavioral & Conduct Notes'}</span>
                <span className="px-1.5 py-0.2 bg-[#2B140A] text-[10px] rounded-full">
                  {profileData.behavioralNotes.length}
                </span>
              </button>
            </div>

            {/* Tab Contents Area */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
              {/* TAB 1: ACADEMIC GRADES & TRANSCRIPT */}
              {activeTab === 'grades' && (
                <div className="space-y-4">
                  {/* Filter & Semester Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#FFF5EA] flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#F5A623]" />
                        <span>{language === 'am' ? 'የተመዘገቡ ኮርሶች የውጤት ዝርዝር' : 'Registered Course Assessments'}</span>
                      </h3>
                      <p className="text-[11px] text-[#A68F7B]">
                        {language === 'am'
                          ? 'የአሳይመንት፣ የፈተና እና የማጠቃለያ ውጤቶች ዝርዝር'
                          : 'Breakdown of assignments, quizzes, midterms, and final exam marks.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Filter className="w-3.5 h-3.5 text-[#A68F7B]" />
                      <select
                        value={gradeSemesterFilter}
                        onChange={(e) => setGradeSemesterFilter(e.target.value)}
                        className="px-3 py-1.5 bg-[#251208] border border-[#4A2412] text-[#FFF5EA] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                      >
                        <option value="all">{language === 'am' ? 'ሁሉም ሴሚስተር' : 'All Semesters'}</option>
                        <option value="Semester I">{language === 'am' ? 'ሴሚስተር 1' : 'Semester I'}</option>
                        <option value="Semester II">{language === 'am' ? 'ሴሚስተር 2' : 'Semester II'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Grades Table */}
                  <div className="bg-[#251208] border border-[#4A2412] rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-[#E8D7C5]">
                        <thead className="bg-[#180B05] text-[#A68F7B] font-bold uppercase tracking-wider border-b border-[#4A2412] text-[10px]">
                          <tr>
                            <th className="p-3.5">{language === 'am' ? 'የኮርስ ኮድ' : 'Code'}</th>
                            <th className="p-3.5">{language === 'am' ? 'የኮርስ ስም' : 'Course Title'}</th>
                            <th className="p-3.5 text-center">{language === 'am' ? 'ክሬዲት' : 'Cr.'}</th>
                            <th className="p-3.5 text-center">{language === 'am' ? 'አሳይመንት' : 'Assign'}</th>
                            <th className="p-3.5 text-center">{language === 'am' ? 'ኩዊዝ' : 'Quiz'}</th>
                            <th className="p-3.5 text-center">{language === 'am' ? 'ሚድተርም' : 'Midterm'}</th>
                            <th className="p-3.5 text-center">{language === 'am' ? 'ማጠቃለያ' : 'Final'}</th>
                            <th className="p-3.5 text-center">{language === 'am' ? 'ድምር' : 'Total'}</th>
                            <th className="p-3.5 text-center">{language === 'am' ? 'ደረጃ' : 'Grade'}</th>
                            <th className="p-3.5 text-center">{language === 'am' ? 'ነጥብ' : 'Point'}</th>
                            <th className="p-3.5 text-center">{language === 'am' ? 'ሁኔታ' : 'Status'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3D1E0F]">
                          {filteredMarks.length === 0 ? (
                            <tr>
                              <td colSpan={11} className="p-8 text-center text-[#A68F7B] italic">
                                {language === 'am'
                                  ? 'በዚህ ሴሚስተር የተመዘገበ የውጤት መረጃ የለም።'
                                  : 'No course grade records found for the selected filter.'}
                              </td>
                            </tr>
                          ) : (
                            filteredMarks.map((m) => (
                              <tr key={m.id} className="hover:bg-[#351C0F]/60 transition">
                                <td className="p-3.5 font-mono font-bold text-[#F5A623]">
                                  {m.courseCode}
                                </td>
                                <td className="p-3.5">
                                  <div className="font-semibold text-white">
                                    {m.courseTitle}
                                  </div>
                                  <div className="text-[11px] text-[#A68F7B]">
                                    {m.courseAmharicTitle} • <span className="italic">{m.teacherName}</span>
                                  </div>
                                </td>
                                <td className="p-3.5 text-center font-bold text-[#FFF5EA]">
                                  {m.creditHours || 3}
                                </td>
                                <td className="p-3.5 text-center text-[#C2AA96] font-mono">
                                  {m.assignment ?? '-'}
                                </td>
                                <td className="p-3.5 text-center text-[#C2AA96] font-mono">
                                  {m.quiz ?? '-'}
                                </td>
                                <td className="p-3.5 text-center text-[#C2AA96] font-mono">
                                  {m.midterm ?? '-'}
                                </td>
                                <td className="p-3.5 text-center text-[#C2AA96] font-mono">
                                  {m.final ?? '-'}
                                </td>
                                <td className="p-3.5 text-center">
                                  <span className="font-black text-white font-mono text-sm">
                                    {m.total}
                                  </span>
                                  <span className="text-[10px] text-[#A68F7B]">/100</span>
                                </td>
                                <td className="p-3.5 text-center">
                                  <span
                                    className={`px-2.5 py-1 rounded-lg text-xs font-black border ${getGradeColor(
                                      m.grade
                                    )}`}
                                  >
                                    {m.grade}
                                  </span>
                                </td>
                                <td className="p-3.5 text-center font-mono font-bold text-[#FFF5EA]">
                                  {m.gradePoint?.toFixed(1) || '0.0'}
                                </td>
                                <td className="p-3.5 text-center">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                      m.status === 'APPROVED'
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        : m.status === 'SUBMITTED'
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                        : 'bg-slate-700/50 text-slate-300'
                                    }`}
                                  >
                                    {m.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Academic Summary Footer Card */}
                    <div className="p-4 bg-[#180B05] border-t border-[#4A2412] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                      <div className="text-[#A68F7B]">
                        {language === 'am'
                          ? 'የተማሪው የትምህርት ጥራት እና ውጤት በሰንበት ትምህርት ቤት አካዳሚክ ቦርድ የተረጋገጠ ነው።'
                          : 'Official assessment transcript recorded in Sunday School Academic Database.'}
                      </div>

                      <div className="flex items-center gap-6">
                        <div>
                          <span className="text-[#A68F7B] mr-2">
                            {language === 'am' ? 'የተወሰዱ ክሬዲቶች:' : 'Total Credits:'}
                          </span>
                          <strong className="text-white font-mono">
                            {profileData.grades.totalCreditHours}
                          </strong>
                        </div>

                        <div>
                          <span className="text-[#A68F7B] mr-2">
                            {language === 'am' ? 'አጠቃላይ የውጤት አማካይ:' : 'Cumulative GPA:'}
                          </span>
                          <strong className="text-lg font-black text-[#F5A623] font-mono">
                            {profileData.grades.gpa.toFixed(2)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: HISTORICAL ATTENDANCE */}
              {activeTab === 'attendance' && (
                <div className="space-y-4">
                  {/* Status Metrics Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-[#251208] border border-emerald-500/20 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-emerald-400">
                          {language === 'am' ? 'የተገኙበት (Present)' : 'Present Sessions'}
                        </div>
                        <div className="text-lg font-black text-white font-mono">
                          {profileData.attendanceSummary.presentCount}
                        </div>
                      </div>
                      <CheckCircle2 className="w-6 h-6 text-emerald-400/50" />
                    </div>

                    <div className="p-3 bg-[#251208] border border-amber-500/20 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-amber-400">
                          {language === 'am' ? 'የዘገዩበት (Late)' : 'Late Arrivals'}
                        </div>
                        <div className="text-lg font-black text-white font-mono">
                          {profileData.attendanceSummary.lateCount}
                        </div>
                      </div>
                      <Clock className="w-6 h-6 text-amber-400/50" />
                    </div>

                    <div className="p-3 bg-[#251208] border border-sky-500/20 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-sky-400">
                          {language === 'am' ? 'በፈቃድ (Excused)' : 'Excused Absences'}
                        </div>
                        <div className="text-lg font-black text-white font-mono">
                          {profileData.attendanceSummary.excusedCount}
                        </div>
                      </div>
                      <AlertCircle className="w-6 h-6 text-sky-400/50" />
                    </div>

                    <div className="p-3 bg-[#251208] border border-rose-500/20 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-rose-400">
                          {language === 'am' ? 'ቀሪ (Unexcused)' : 'Unexcused Absences'}
                        </div>
                        <div className="text-lg font-black text-white font-mono">
                          {profileData.attendanceSummary.absentCount}
                        </div>
                      </div>
                      <XCircle className="w-6 h-6 text-rose-400/50" />
                    </div>
                  </div>

                  {/* Attendance Log Table */}
                  <div className="bg-[#251208] border border-[#4A2412] rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 bg-[#180B05] border-b border-[#4A2412] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="text-xs font-bold text-[#FFF5EA] flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#F5A623]" />
                        <span>{language === 'am' ? 'የዕለት ተዕለት የመገኘት መዝገብ' : 'Daily Class Attendance Log'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Filter className="w-3.5 h-3.5 text-[#A68F7B]" />
                        <select
                          value={attendanceStatusFilter}
                          onChange={(e) => setAttendanceStatusFilter(e.target.value)}
                          className="px-3 py-1 bg-[#251208] border border-[#4A2412] text-[#FFF5EA] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                        >
                          <option value="all">{language === 'am' ? 'ሁሉም ሁኔታ' : 'All Statuses'}</option>
                          <option value="PRESENT">{language === 'am' ? 'ተገኝቷል (Present)' : 'Present'}</option>
                          <option value="LATE">{language === 'am' ? 'ዘግይቷል (Late)' : 'Late'}</option>
                          <option value="EXCUSED">{language === 'am' ? 'ፈቃድ (Excused)' : 'Excused'}</option>
                          <option value="ABSENT">{language === 'am' ? 'ቀሪ (Absent)' : 'Absent'}</option>
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-[#E8D7C5]">
                        <thead className="bg-[#180B05]/60 text-[#A68F7B] font-bold uppercase tracking-wider border-b border-[#4A2412] text-[10px]">
                          <tr>
                            <th className="p-3.5">{language === 'am' ? 'ቀን (Gregorian)' : 'Date'}</th>
                            <th className="p-3.5">{language === 'am' ? 'የኢትዮጵያ ቀን' : 'Ethiopian Date'}</th>
                            <th className="p-3.5">{language === 'am' ? 'የክፍል ደረጃ / ሴክሽን' : 'Class & Sec'}</th>
                            <th className="p-3.5">{language === 'am' ? 'የመገኘት ሁኔታ' : 'Status'}</th>
                            <th className="p-3.5">{language === 'am' ? 'አስተያየት / ምክንያት' : 'Remark / Note'}</th>
                            <th className="p-3.5">{language === 'am' ? 'የመዘገበው መምህር' : 'Recorded By'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3D1E0F]">
                          {filteredAttendance.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-[#A68F7B] italic">
                                {language === 'am'
                                  ? 'ምንም የመገኘት መረጃ አልተገኘም።'
                                  : 'No attendance records match the selected filter.'}
                              </td>
                            </tr>
                          ) : (
                            filteredAttendance.map((att) => {
                              const badge = getStatusBadge(att.status);
                              return (
                                <tr key={att.id} className="hover:bg-[#351C0F]/60 transition">
                                  <td className="p-3.5 font-mono text-[#FFF5EA]">
                                    {att.date}
                                  </td>
                                  <td className="p-3.5 text-[#D98218] font-medium">
                                    {formatEthiopianDate(att.date, language === 'am' ? 'am' : 'en', true)}
                                  </td>
                                  <td className="p-3.5 text-[#C2AA96]">
                                    {att.className} (Sec {att.section})
                                  </td>
                                  <td className="p-3.5">
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.className}`}
                                    >
                                      {badge.icon}
                                      <span>{badge.label}</span>
                                    </span>
                                  </td>
                                  <td className="p-3.5 text-[#C2AA96]">
                                    {att.remark ? (
                                      <span className="italic">"{att.remark}"</span>
                                    ) : (
                                      <span className="text-[#A68F7B]">-</span>
                                    )}
                                  </td>
                                  <td className="p-3.5 text-[#A68F7B] text-[11px]">
                                    {att.takenByUserName}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: BEHAVIORAL & CONDUCT NOTES */}
              {activeTab === 'behavior' && (
                <div className="space-y-4">
                  {/* Category Filter and Add Note CTA */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#FFF5EA] flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
                        <span>{language === 'am' ? 'የስነ-ምግባር እና ክትትል ማህደር' : 'Character & Conduct Observations'}</span>
                      </h3>
                      <p className="text-[11px] text-[#A68F7B]">
                        {language === 'am'
                          ? 'የመምህራን፣ የአስተባባሪዎች እና የዲፓርትመንት ኃላፊዎች አስተያየቶች'
                          : 'Recorded observations by instructors, coordinators, and counselors.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={behaviorCategoryFilter}
                        onChange={(e) => setBehaviorCategoryFilter(e.target.value)}
                        className="px-3 py-1.5 bg-[#251208] border border-[#4A2412] text-[#FFF5EA] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                      >
                        <option value="all">{language === 'am' ? 'ሁሉም ምድቦች' : 'All Categories'}</option>
                        <option value="COMMENDATION">{language === 'am' ? 'ምስጋና እና አርአያነት' : 'Commendation'}</option>
                        <option value="SPIRITUAL_GROWTH">{language === 'am' ? 'መንፈሳዊ ተሳትፎ' : 'Spiritual Growth'}</option>
                        <option value="ACADEMIC_EFFORT">{language === 'am' ? 'የትምህርት ትጋት' : 'Academic Effort'}</option>
                        <option value="ATTENDANCE_PUNCTUALITY">{language === 'am' ? 'ሰዓት አክባሪነት' : 'Punctuality'}</option>
                        <option value="DISCIPLINARY">{language === 'am' ? 'የስነ-ምግባር ማሳሰቢያ' : 'Disciplinary'}</option>
                        <option value="COUNSELING">{language === 'am' ? 'ምክር እና ድጋፍ' : 'Counseling'}</option>
                      </select>

                      <button
                        onClick={() => setShowAddNoteModal(true)}
                        className="px-3 py-1.5 bg-[#D98218] hover:bg-[#F5A623] text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 transition shadow"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{language === 'am' ? 'አዲስ ማስታወሻ' : 'New Note'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Notes Cards List */}
                  <div className="space-y-3">
                    {filteredNotes.length === 0 ? (
                      <div className="p-12 text-center bg-[#251208] border border-[#4A2412] rounded-2xl text-[#A68F7B] space-y-2">
                        <Award className="w-8 h-8 text-[#A68F7B]/40 mx-auto" />
                        <p className="font-semibold text-xs text-[#FFF5EA]">
                          {language === 'am'
                            ? 'ምንም የስነ-ምግባር ማስታወሻ አልተመዘገበም።'
                            : 'No behavioral notes recorded for this student.'}
                        </p>
                        <p className="text-[11px] text-[#A68F7B]">
                          {language === 'am'
                            ? 'የመጀመሪያውን ማስታወሻ ለመመዝገብ "አዲስ ማስታወሻ" የሚለውን ይጫኑ።'
                            : 'Click "New Note" above to record a behavioral observation.'}
                        </p>
                      </div>
                    ) : (
                      filteredNotes.map((note) => {
                        const catBadge = getCategoryBadge(note.category);
                        return (
                          <div
                            key={note.id}
                            className="p-4 sm:p-5 bg-[#251208] border border-[#4A2412] rounded-2xl shadow-lg space-y-3 hover:border-[#F5A623]/40 transition"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${catBadge.bg}`}
                                >
                                  {catBadge.icon}
                                  <span>
                                    {language === 'am' ? catBadge.labelAm : catBadge.labelEn}
                                  </span>
                                </span>

                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${getSeverityBadge(
                                    note.severity
                                  )}`}
                                >
                                  {note.severity}
                                </span>

                                {note.followUpRequired && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{language === 'am' ? 'ክትትል ያስፈልጋል' : 'Follow-up Needed'}</span>
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-xs text-[#A68F7B]">
                                <span className="font-mono">{note.date}</span>
                                <span>•</span>
                                <span className="text-[#D98218]">
                                  {formatEthiopianDate(note.date, language === 'am' ? 'am' : 'en', false)}
                                </span>

                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  title="Delete Note"
                                  className="p-1 text-[#A68F7B] hover:text-rose-400 rounded transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Note Title & Content */}
                            <div>
                              <h4 className="text-sm font-bold text-white mb-1">
                                {note.title}
                              </h4>
                              <p className="text-xs text-[#E8D7C5] leading-relaxed whitespace-pre-line">
                                {note.content}
                              </p>
                            </div>

                            {/* Action Taken if present */}
                            {note.actionTaken && (
                              <div className="p-2.5 bg-[#180B05] border border-[#3D1E0F] rounded-xl text-xs text-[#C2AA96] flex items-start gap-2">
                                <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <strong className="text-emerald-400 mr-1">
                                    {language === 'am' ? 'የተወሰደ እርምጃ / ውሳኔ:' : 'Action Taken:'}
                                  </strong>
                                  <span>{note.actionTaken}</span>
                                </div>
                              </div>
                            )}

                            {/* Author Footer */}
                            <div className="pt-2 border-t border-[#3D1E0F] flex justify-between items-center text-[11px] text-[#A68F7B]">
                              <span>
                                {language === 'am' ? 'የመዘገበው:' : 'Recorded by:'}{' '}
                                <strong className="text-[#FFF5EA]">{note.recordedByUserName}</strong>{' '}
                                ({note.recordedByUserRole || 'STAFF'})
                              </span>
                              <span>{note.academicYear}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}

        {/* Modal Footer */}
        <div className="p-4 bg-[#180B05] border-t border-[#3D1E0F] flex justify-between items-center text-xs print:hidden">
          <div className="text-[#A68F7B] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
            <span>
              {language === 'am'
                ? 'የቅዱስ ጳውሎስ ሰንበት ትምህርት ቤት የተማሪዎች አካዳሚክ ማህደር'
                : 'Saint Paul Sunday School Academic & Pastoral Record'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2B140A] hover:bg-[#3D1E0F] text-[#FFF5EA] font-bold rounded-xl border border-[#522B17] transition"
          >
            {language === 'am' ? 'ዝጋ (Close)' : 'Close'}
          </button>
        </div>
      </div>

      {/* Add Behavioral Note Dialog Modal */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#1C0F08] border border-[#522B17] w-full max-w-lg rounded-2xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#3D1E0F]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-[#F5A623]" />
                <span>{language === 'am' ? 'አዲስ የስነ-ምግባር እና ክትትል ማስታወሻ መዝግብ' : 'Record Behavioral Observation'}</span>
              </h3>
              <button
                onClick={() => setShowAddNoteModal(false)}
                className="text-[#A68F7B] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#C2AA96] mb-1 font-semibold">
                    {language === 'am' ? 'የማስታወሻው ምድብ' : 'Category'}
                  </label>
                  <select
                    value={noteForm.category}
                    onChange={(e) =>
                      setNoteForm({
                        ...noteForm,
                        category: e.target.value as BehavioralNoteCategory,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#251208] border border-[#4A2412] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  >
                    <option value="SPIRITUAL_GROWTH">Spiritual Growth (መንፈሳዊ ተሳትፎ)</option>
                    <option value="COMMENDATION">Commendation (ምስጋና እና አርአያነት)</option>
                    <option value="ACADEMIC_EFFORT">Academic Effort (የትምህርት ትጋት)</option>
                    <option value="ATTENDANCE_PUNCTUALITY">Punctuality (ሰዓት አክባሪነት)</option>
                    <option value="DISCIPLINARY">Disciplinary Advisory (የስነ-ምግባር ማሳሰቢያ)</option>
                    <option value="COUNSELING">Counseling & Guidance (ምክር እና ድጋፍ)</option>
                    <option value="GENERAL">General Note (አጠቃላይ ማስታወሻ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#C2AA96] mb-1 font-semibold">
                    {language === 'am' ? 'ደረጃ / ክብደት' : 'Severity / Impact'}
                  </label>
                  <select
                    value={noteForm.severity}
                    onChange={(e) =>
                      setNoteForm({
                        ...noteForm,
                        severity: e.target.value as BehavioralSeverity,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#251208] border border-[#4A2412] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  >
                    <option value="POSITIVE">Positive (አዎንታዊ / አበረታች)</option>
                    <option value="NEUTRAL">Neutral (ገለልተኛ / ተራ ምልከታ)</option>
                    <option value="WARNING">Warning (ማስጠንቀቂያ / ማሳሰቢያ)</option>
                    <option value="CRITICAL">Critical (ከፍተኛ ትኩረት የሚሻ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#C2AA96] mb-1 font-semibold">
                  {language === 'am' ? 'የማስታወሻው አጭር ርዕስ' : 'Observation Title'}
                </label>
                <input
                  type="text"
                  required
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  placeholder="e.g. Outstanding Choir Leadership / Punctuality Reminder"
                  className="w-full px-3 py-2 bg-[#251208] border border-[#4A2412] rounded-xl text-white placeholder-[#A68F7B] focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                />
              </div>

              <div>
                <label className="block text-[#C2AA96] mb-1 font-semibold">
                  {language === 'am' ? 'ዝርዝር ማብራሪያ እና ምልከታ' : 'Detailed Narrative & Feedback'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  placeholder="Provide specific context, achievements, or areas for pastoral guidance..."
                  className="w-full px-3 py-2 bg-[#251208] border border-[#4A2412] rounded-xl text-white placeholder-[#A68F7B] focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                />
              </div>

              <div>
                <label className="block text-[#C2AA96] mb-1 font-semibold">
                  {language === 'am' ? 'የተወሰደ እርምጃ (አማራጭ)' : 'Action Taken / Recommendation (Optional)'}
                </label>
                <input
                  type="text"
                  value={noteForm.actionTaken}
                  onChange={(e) => setNoteForm({ ...noteForm, actionTaken: e.target.value })}
                  placeholder="e.g. Discussed with parent, assigned peer mentor..."
                  className="w-full px-3 py-2 bg-[#251208] border border-[#4A2412] rounded-xl text-white placeholder-[#A68F7B] focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-[#C2AA96] mb-1 font-semibold">
                    {language === 'am' ? 'የተመዘገበበት ቀን' : 'Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={noteForm.date}
                    onChange={(e) => setNoteForm({ ...noteForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#251208] border border-[#4A2412] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 text-[#C2AA96] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noteForm.followUpRequired}
                      onChange={(e) =>
                        setNoteForm({ ...noteForm, followUpRequired: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-[#D98218] focus:ring-[#F5A623] bg-[#251208] border-[#4A2412]"
                    />
                    <span>{language === 'am' ? 'የቀጣይ ክትትል ያስፈልገዋል' : 'Requires Follow-up'}</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#3D1E0F]">
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="px-4 py-2 bg-[#2B140A] text-[#C2AA96] font-semibold rounded-xl hover:bg-[#3D1E0F] transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submittingNote}
                  className="px-5 py-2 bg-[#D98218] hover:bg-[#F5A623] disabled:opacity-50 text-slate-950 font-bold rounded-xl transition shadow"
                >
                  {submittingNote ? (language === 'am' ? 'በማስቀመጥ ላይ...' : 'Saving...') : (language === 'am' ? 'መዝግብ' : 'Save Note')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
