import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  BehavioralFlagPriority,
  BehavioralFlagStatus,
  BehavioralFlagType,
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
  Flag,
  ShieldAlert,
  HelpCircle,
  Tag,
  CheckCheck,
  RotateCcw,
  Zap,
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
  const [behaviorFlagFilter, setBehaviorFlagFilter] = useState<'all' | 'active_flags' | 'warnings' | 'commendations' | 'resolved'>('all');

  // Behavioral Flag & Note Modals
  const [showAddFlagModal, setShowAddFlagModal] = useState(false);
  const [submittingFlag, setSubmittingFlag] = useState(false);
  const [flagFormMode, setFlagFormMode] = useState<'quick_flag' | 'detailed_note'>('quick_flag');
  
  const [flagForm, setFlagForm] = useState({
    title: '',
    flagType: 'ATTENDANCE_WARNING' as BehavioralFlagType,
    flagPriority: 'HIGH' as BehavioralFlagPriority,
    shortWarningNote: '',
    category: 'ATTENDANCE_PUNCTUALITY' as BehavioralNoteCategory,
    severity: 'WARNING' as BehavioralSeverity,
    content: '',
    actionTaken: '',
    followUpRequired: true,
    tagsInput: 'Tardiness, AttendanceAlert',
    date: new Date().toISOString().split('T')[0],
  });

  // Resolve Flag Dialog
  const [resolvingNote, setResolvingNote] = useState<BehavioralNote | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);

  // Check if staff has authorization to attach flags
  const isAuthorizedStaff = useMemo(() => {
    if (!user) return false;
    return ['ADMIN', 'DEPT_HEAD', 'COORDINATOR', 'TEACHER'].includes(user.role);
  }, [user]);

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

  // Active behavioral flags computation
  const activeBehavioralFlags = useMemo(() => {
    if (!profileData?.behavioralNotes) return [];
    return profileData.behavioralNotes.filter(
      (n) => n.isFlag && (n.flagStatus === 'ACTIVE' || n.flagStatus === 'UNDER_REVIEW' || (!n.flagStatus && (n.severity === 'WARNING' || n.severity === 'CRITICAL')))
    );
  }, [profileData]);

  const criticalFlagsCount = useMemo(() => {
    return activeBehavioralFlags.filter((f) => f.flagPriority === 'CRITICAL_URGENT' || f.severity === 'CRITICAL').length;
  }, [activeBehavioralFlags]);

  // Handle Quick Flag or Full Note Submission
  const handleSaveFlagOrNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagForm.title.trim() && !flagForm.shortWarningNote.trim() && !flagForm.content.trim()) {
      toast.warning(
        language === 'am' ? 'እባክዎ የማስጠንቀቂያ ወይም የማስታወሻ ጽሑፍ ይሙሉ!' : 'Please enter warning details or note content.'
      );
      return;
    }

    setSubmittingFlag(true);
    try {
      const tags = flagForm.tagsInput
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const title = flagForm.title.trim() || 
        (flagForm.flagType !== 'NONE' ? `Flag: ${flagForm.flagType.replace(/_/g, ' ')}` : 'Behavioral Observation');
      
      const shortWarningNote = flagForm.shortWarningNote.trim() || flagForm.content.slice(0, 120);
      const content = flagForm.content.trim() || shortWarningNote;

      const payload: Partial<BehavioralNote> = {
        title,
        isFlag: flagForm.flagType !== 'NONE' || flagForm.severity === 'WARNING' || flagForm.severity === 'CRITICAL',
        flagType: flagForm.flagType,
        flagPriority: flagForm.flagPriority,
        flagStatus: 'ACTIVE',
        shortWarningNote,
        category: flagForm.category,
        severity: flagForm.severity,
        content,
        actionTaken: flagForm.actionTaken,
        followUpRequired: flagForm.followUpRequired,
        tags,
        date: flagForm.date,
        recordedByUserId: user?.id || 'usr-1',
        recordedByUserName: user?.name || 'Academic Staff',
        recordedByUserRole: user?.role || 'TEACHER',
      };

      const res = await api.createStudentBehavioralNote(studentId, payload);
      if (res.success) {
        toast.success(
          payload.isFlag
            ? (language === 'am' ? 'የስነ-ምግባር ማስጠንቀቂያ/ማሳሰቢያ በተሳካ ሁኔታ ተያይዟል!' : 'Behavioral Flag attached successfully!')
            : (language === 'am' ? 'የስነ-ምግባር ማስታወሻው በተሳካ ሁኔታ ተመዝግቧል!' : 'Behavioral observation note recorded successfully!')
        );
        setShowAddFlagModal(false);
        // Reset form
        setFlagForm({
          title: '',
          flagType: 'ATTENDANCE_WARNING',
          flagPriority: 'HIGH',
          shortWarningNote: '',
          category: 'ATTENDANCE_PUNCTUALITY',
          severity: 'WARNING',
          content: '',
          actionTaken: '',
          followUpRequired: true,
          tagsInput: 'Tardiness, AttendanceAlert',
          date: new Date().toISOString().split('T')[0],
        });
        await loadProfile();
      } else {
        toast.error(
          language === 'am' ? 'ማስቀመጥ አልተቻለም።' : 'Failed to attach behavioral flag.'
        );
      }
    } catch (err) {
      console.error('Error attaching flag:', err);
      toast.error(language === 'am' ? 'ስህተት አጋጥሟል።' : 'Error attaching behavioral flag.');
    } finally {
      setSubmittingFlag(false);
    }
  };

  // Open Quick Flag Preset
  const handleOpenQuickPreset = (
    type: BehavioralFlagType,
    priority: BehavioralFlagPriority,
    category: BehavioralNoteCategory,
    severity: BehavioralSeverity,
    defaultTitle: string,
    defaultNote: string,
    defaultTags: string
  ) => {
    setFlagFormMode('quick_flag');
    setFlagForm({
      title: defaultTitle,
      flagType: type,
      flagPriority: priority,
      shortWarningNote: defaultNote,
      category,
      severity,
      content: defaultNote,
      actionTaken: '',
      followUpRequired: priority === 'HIGH' || priority === 'CRITICAL_URGENT',
      tagsInput: defaultTags,
      date: new Date().toISOString().split('T')[0],
    });
    setShowAddFlagModal(true);
  };

  // Handle Flag Status Update (Resolve or Reopen)
  const handleConfirmResolution = async () => {
    if (!resolvingNote) return;
    setIsSubmittingResolution(true);
    try {
      const res = await api.updateBehavioralFlagStatus(studentId, resolvingNote.id, {
        flagStatus: 'RESOLVED',
        resolutionNotes: resolutionNotes.trim() || 'Resolved after counseling & review.',
        resolvedByUserId: user?.id || 'usr-1',
        resolvedByUserName: user?.name || 'Academic Staff',
      });

      if (res.success) {
        toast.success(
          language === 'am' ? 'ማስጠንቀቂያው/ማሳሰቢያው ተፈትቷል ተብሎ ተዘግቷል!' : 'Behavioral flag marked as RESOLVED!'
        );
        setResolvingNote(null);
        setResolutionNotes('');
        await loadProfile();
      } else {
        toast.error(language === 'am' ? 'ማስተካከል አልተቻለም።' : 'Failed to update flag status.');
      }
    } catch (err) {
      console.error('Error resolving flag:', err);
      toast.error(language === 'am' ? 'ስህተት አጋጥሟል።' : 'Error resolving flag.');
    } finally {
      setIsSubmittingResolution(false);
    }
  };

  const handleReopenFlag = async (note: BehavioralNote) => {
    try {
      const res = await api.updateBehavioralFlagStatus(studentId, note.id, {
        flagStatus: 'ACTIVE',
        resolutionNotes: '',
      });

      if (res.success) {
        toast.info(
          language === 'am' ? 'ማስጠንቀቂያው እንደገና ንቁ ተደርጓል!' : 'Behavioral flag reopened as ACTIVE!'
        );
        await loadProfile();
      }
    } catch (err) {
      console.error('Error reopening flag:', err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (
      !confirm(
        language === 'am'
          ? 'ይህን የስነ-ምግባር ማስታወሻ/ማስጠንቀቂያ መሰረዝ ይፈልጋሉ?'
          : 'Are you sure you want to remove this behavioral note or flag?'
      )
    ) {
      return;
    }

    try {
      const res = await api.deleteStudentBehavioralNote(studentId, noteId);
      if (res.success) {
        toast.success(
          language === 'am' ? 'ተሰርዟል!' : 'Behavioral note/flag removed successfully!'
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
    let list = profileData.behavioralNotes;

    // Filter by Flag status tab
    if (behaviorFlagFilter === 'active_flags') {
      list = list.filter((n) => n.isFlag && (n.flagStatus === 'ACTIVE' || n.flagStatus === 'UNDER_REVIEW' || (!n.flagStatus && (n.severity === 'WARNING' || n.severity === 'CRITICAL'))));
    } else if (behaviorFlagFilter === 'warnings') {
      list = list.filter((n) => n.severity === 'WARNING' || n.severity === 'CRITICAL' || n.flagPriority === 'HIGH' || n.flagPriority === 'CRITICAL_URGENT');
    } else if (behaviorFlagFilter === 'commendations') {
      list = list.filter((n) => n.category === 'COMMENDATION' || n.flagType === 'MERIT_COMMENDATION' || n.severity === 'POSITIVE');
    } else if (behaviorFlagFilter === 'resolved') {
      list = list.filter((n) => n.flagStatus === 'RESOLVED');
    }

    // Secondary Category Filter
    if (behaviorCategoryFilter !== 'all') {
      list = list.filter((n) => n.category === behaviorCategoryFilter);
    }

    return list;
  }, [profileData, behaviorFlagFilter, behaviorCategoryFilter]);

  // Visual helper functions
  const getFlagTypeBadge = (flagType?: BehavioralFlagType) => {
    switch (flagType) {
      case 'ATTENDANCE_WARNING':
        return {
          labelEn: 'Attendance Warning',
          labelAm: 'የመገኘት ማሳሰቢያ',
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: <Clock className="w-3.5 h-3.5" />,
        };
      case 'ACADEMIC_ALERT':
        return {
          labelEn: 'Academic Difficulty',
          labelAm: 'የትምህርት ድጋፍ ጥሪ',
          bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          icon: <BookOpen className="w-3.5 h-3.5" />,
        };
      case 'DISCIPLINARY_ACTION':
        return {
          labelEn: 'Disciplinary Flag',
          labelAm: 'የስነ-ምግባር ማስጠንቀቂያ',
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
        };
      case 'PASTORAL_CARE':
        return {
          labelEn: 'Pastoral / Spiritual Care',
          labelAm: 'መንፈሳዊ ምክር እና ክትትል',
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          icon: <HeartHandshake className="w-3.5 h-3.5" />,
        };
      case 'SPECIAL_ATTENTION':
        return {
          labelEn: 'Special Attention',
          labelAm: 'ልዩ ትኩረት',
          bg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          icon: <HelpCircle className="w-3.5 h-3.5" />,
        };
      case 'MERIT_COMMENDATION':
        return {
          labelEn: 'Merit Commendation',
          labelAm: 'ምስጋና እና አርአያነት',
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: <Award className="w-3.5 h-3.5" />,
        };
      default:
        return {
          labelEn: 'General Flag',
          labelAm: 'ማስታወሻ',
          bg: 'bg-slate-700/50 text-slate-300 border-slate-600',
          icon: <Flag className="w-3.5 h-3.5" />,
        };
    }
  };

  const getPriorityBadge = (priority?: BehavioralFlagPriority, severity?: BehavioralSeverity) => {
    if (priority === 'CRITICAL_URGENT' || severity === 'CRITICAL') {
      return {
        label: language === 'am' ? 'አስቸኳይ / ወሳኝ' : 'Critical Urgent',
        className: 'bg-rose-600/30 text-rose-300 border-rose-500/50 animate-pulse',
      };
    }
    if (priority === 'HIGH' || severity === 'WARNING') {
      return {
        label: language === 'am' ? 'ከፍተኛ' : 'High Priority',
        className: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      };
    }
    if (priority === 'MEDIUM') {
      return {
        label: language === 'am' ? 'መካከለኛ' : 'Medium Priority',
        className: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      };
    }
    return {
      label: language === 'am' ? 'መደበኛ' : 'Standard / Low',
      className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    };
  };

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
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  {profileData?.student.status || 'ACTIVE'}
                </span>

                {/* Behavioral Flag Badge in Header */}
                {activeBehavioralFlags.length > 0 && (
                  <span
                    onClick={() => setActiveTab('behavior')}
                    className={`cursor-pointer px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 transition ${
                      criticalFlagsCount > 0
                        ? 'bg-rose-500/25 text-rose-300 border-rose-500/50 hover:bg-rose-500/35'
                        : 'bg-amber-500/25 text-amber-300 border-amber-500/50 hover:bg-amber-500/35'
                    }`}
                  >
                    <Flag className="w-3 h-3" />
                    <span>
                      {activeBehavioralFlags.length} {language === 'am' ? 'ንቁ ማስጠንቀቂያ' : 'Active Flag(s)'}
                    </span>
                  </span>
                )}
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

            {isAuthorizedStaff && (
              <button
                onClick={() => {
                  setFlagFormMode('quick_flag');
                  setShowAddFlagModal(true);
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-[#D98218] to-[#E65100] hover:from-[#F5A623] hover:to-[#FF6D00] text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-[#D98218]/20"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{language === 'am' ? 'ማስጠንቀቂያ / ማስታወሻ አያይዝ' : 'Attach Flag / Note'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-[#A68F7B] hover:text-white hover:bg-[#3D1E0F] rounded-xl transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ACTIVE BEHAVIORAL WARNING ALERT BANNER (If Active Flags Exist) */}
        {activeBehavioralFlags.length > 0 && (
          <div className="p-3.5 px-6 bg-gradient-to-r from-amber-950/70 via-rose-950/50 to-amber-950/70 border-b border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
              <div>
                <div className="font-bold text-amber-200 flex items-center gap-2">
                  <span>{language === 'am' ? 'ንቁ የስነ-ምግባር / የተሳትፎ ማሳሰቢያ አለ' : 'Active Behavioral Alert Attached'}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/30 text-amber-200 border border-amber-500/40">
                    {activeBehavioralFlags.length} {language === 'am' ? 'ማስታወሻ' : 'Active'}
                  </span>
                </div>
                <div className="text-[11px] text-amber-300/80 mt-0.5">
                  <strong className="text-white">"{activeBehavioralFlags[0].shortWarningNote || activeBehavioralFlags[0].title}"</strong>
                  <span className="mx-1.5">•</span>
                  <span>{activeBehavioralFlags[0].recordedByUserName}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('behavior')}
              className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded-lg font-bold text-xs transition self-end sm:self-center flex items-center gap-1.5 flex-shrink-0"
            >
              <span>{language === 'am' ? 'ዝርዝሩን ተመልከት' : 'View Flag Details'}</span>
              <Flag className="w-3 h-3" />
            </button>
          </div>
        )}

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
                    {language === 'am' ? 'አጠቃላይ የውጤት አማካይ' : 'Cumulative GPA'}
                  </div>
                  <div className="text-lg font-black text-white font-mono flex items-baseline gap-1">
                    <span>{profileData.grades.gpa.toFixed(2)}</span>
                    <span className="text-[10px] text-emerald-400 font-sans font-bold">
                      ({profileData.grades.standing})
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Attendance Rate */}
              <div className="p-3.5 bg-[#251208] border border-[#4A2412] rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#A68F7B] tracking-wider">
                    {language === 'am' ? 'የመገኘት ምጣኔ' : 'Attendance Rate'}
                  </div>
                  <div className="text-lg font-black text-white font-mono flex items-baseline gap-1">
                    <span>{profileData.attendanceSummary.attendanceRate}%</span>
                    <span className="text-[10px] text-[#A68F7B] font-sans">
                      ({profileData.attendanceSummary.presentCount}/{profileData.attendanceSummary.totalSessions})
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Earned Credits */}
              <div className="p-3.5 bg-[#251208] border border-[#4A2412] rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D98218]/10 border border-[#D98218]/20 flex items-center justify-center flex-shrink-0 text-[#F5A623]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#A68F7B] tracking-wider">
                    {language === 'am' ? 'የተወሰዱ ክሬዲቶች' : 'Credits Earned'}
                  </div>
                  <div className="text-lg font-black text-white font-mono">
                    {profileData.grades.earnedCreditHours} / {profileData.grades.totalCreditHours}
                  </div>
                </div>
              </div>

              {/* Card 4: Behavioral Standing & Flags */}
              <div
                onClick={() => setActiveTab('behavior')}
                className="p-3.5 bg-[#251208] border border-[#4A2412] hover:border-[#D98218] cursor-pointer rounded-2xl flex items-center gap-3 transition"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                    activeBehavioralFlags.length > 0
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                  }`}
                >
                  {activeBehavioralFlags.length > 0 ? (
                    <Flag className="w-5 h-5 text-amber-400" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#A68F7B] tracking-wider">
                    {language === 'am' ? 'የስነ-ምግባር ሁኔታ' : 'Conduct & Flags'}
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    {activeBehavioralFlags.length > 0 ? (
                      <span className="text-amber-400 font-mono font-bold">
                        {activeBehavioralFlags.length} {language === 'am' ? 'ንቁ ማስጠንቀቂያ' : 'Active Flag(s)'}
                      </span>
                    ) : (
                      <span className="text-emerald-400">
                        {language === 'am' ? 'ጥሩ ስነ-ምግባር' : 'Good Standing'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Tab Navigation Header */}
            <div className="px-6 bg-[#200E06] border-b border-[#4A2412] flex gap-2 print:hidden overflow-x-auto">
              <button
                onClick={() => setActiveTab('grades')}
                className={`py-3.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
                  activeTab === 'grades'
                    ? 'border-[#F5A623] text-[#F5A623]'
                    : 'border-transparent text-[#A68F7B] hover:text-[#FFF5EA]'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>{language === 'am' ? 'የውጤት ዝርዝር እና ሰነድ' : 'Academic Grades & Transcript'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#180B05] text-[#C2AA96] font-mono">
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
                <ClipboardList className="w-4 h-4" />
                <span>{language === 'am' ? 'የመገኘት ታሪክ' : 'Attendance Record'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#180B05] text-[#C2AA96] font-mono">
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
                <Flag className="w-4 h-4 text-[#F5A623]" />
                <span>{language === 'am' ? 'የስነ-ምግባር ማስጠንቀቂያ እና ማስታወሻዎች' : 'Behavioral Flags & Observations'}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    activeBehavioralFlags.length > 0
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-[#180B05] text-[#C2AA96]'
                  }`}
                >
                  {profileData.behavioralNotes?.length || 0}
                </span>
              </button>
            </div>

            {/* TAB CONTENT CONTAINER */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* TAB 1: ACADEMIC GRADES & TRANSCRIPT */}
              {activeTab === 'grades' && (
                <div className="space-y-4">
                  {/* Filter Toolbar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#FFF5EA] flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#F5A623]" />
                        <span>{language === 'am' ? 'የትምህርት ውጤቶች ሰንጠረዥ' : 'Course Grade Sheet'}</span>
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
                            <th className="p-3.5">{language === 'am' ? 'የትምህርት አይነት' : 'Course Title'}</th>
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
                              <td colSpan={10} className="p-8 text-center text-[#A68F7B] italic">
                                {language === 'am'
                                  ? 'በዚህ ሴሚስተር የተመዘገበ የውጤት መረጃ የለም።'
                                  : 'No course grade records found for the selected filter.'}
                              </td>
                            </tr>
                          ) : (
                            filteredMarks.map((m) => (
                              <tr key={m.id} className="hover:bg-[#351C0F]/60 transition">
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

              {/* TAB 3: BEHAVIORAL FLAGS & CONDUCT OBSERVATIONS */}
              {activeTab === 'behavior' && (
                <div className="space-y-5">
                  {/* Quick Action Flag Presets Bar (For Authorized Staff) */}
                  {isAuthorizedStaff && (
                    <div className="p-4 bg-gradient-to-r from-[#2B140A] via-[#35180C] to-[#2B140A] border border-[#522B17] rounded-2xl space-y-2.5">
                      <div className="flex justify-between items-center">
                        <div className="text-xs font-bold text-[#FFF5EA] flex items-center gap-2">
                          <Zap className="w-4 h-4 text-[#F5A623]" />
                          <span>{language === 'am' ? 'የፈጣን ማስጠንቀቂያ / ማሳሰቢያ አዝራሮች (Quick Flag Actions)' : 'Quick Behavioral Flag Actions'}</span>
                        </div>
                        <span className="text-[11px] text-[#C2AA96]">
                          {language === 'am' ? 'ለተማሪው ፈጣን ማሳሰቢያ ወዲያውኑ ያያይዙ' : 'Attach instant short warnings with 1-click'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                        {/* Preset 1: Attendance Warning */}
                        <button
                          onClick={() =>
                            handleOpenQuickPreset(
                              'ATTENDANCE_WARNING',
                              'HIGH',
                              'ATTENDANCE_PUNCTUALITY',
                              'WARNING',
                              'Attendance / Tardiness Warning',
                              'Student arrived excessively late or had unexcused absence. Please remind student to arrive on time.',
                              'Tardiness, AttendanceAlert'
                            )
                          }
                          className="p-2.5 bg-[#180B05] hover:bg-amber-950/40 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 rounded-xl text-xs font-semibold flex items-center gap-2 transition text-left shadow-sm"
                        >
                          <Clock className="w-4 h-4 flex-shrink-0 text-amber-400" />
                          <span className="truncate">{language === 'am' ? 'የመገኘት ማስጠንቀቂያ' : 'Attendance Warning'}</span>
                        </button>

                        {/* Preset 2: Academic Difficulty Alert */}
                        <button
                          onClick={() =>
                            handleOpenQuickPreset(
                              'ACADEMIC_ALERT',
                              'HIGH',
                              'ACADEMIC_EFFORT',
                              'WARNING',
                              'Academic Performance & Missing Assignment Alert',
                              'Student has missed coursework deadlines or requires extra tutorial assistance.',
                              'AcademicAlert, TutoringNeeded'
                            )
                          }
                          className="p-2.5 bg-[#180B05] hover:bg-orange-950/40 text-orange-300 border border-orange-500/30 hover:border-orange-500/60 rounded-xl text-xs font-semibold flex items-center gap-2 transition text-left shadow-sm"
                        >
                          <BookOpen className="w-4 h-4 flex-shrink-0 text-orange-400" />
                          <span className="truncate">{language === 'am' ? 'የትምህርት ድጋፍ ጥሪ' : 'Academic Alert'}</span>
                        </button>

                        {/* Preset 3: Disciplinary Warning */}
                        <button
                          onClick={() =>
                            handleOpenQuickPreset(
                              'DISCIPLINARY_ACTION',
                              'CRITICAL_URGENT',
                              'DISCIPLINARY',
                              'CRITICAL',
                              'Classroom Conduct / Disciplinary Advisory',
                              'Disruptive classroom behavior observed. Formal conference with parents or coordinator requested.',
                              'Discipline, ParentContact'
                            )
                          }
                          className="p-2.5 bg-[#180B05] hover:bg-rose-950/40 text-rose-300 border border-rose-500/30 hover:border-rose-500/60 rounded-xl text-xs font-semibold flex items-center gap-2 transition text-left shadow-sm"
                        >
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                          <span className="truncate">{language === 'am' ? 'የስነ-ምግባር ማሳሰቢያ' : 'Disciplinary Flag'}</span>
                        </button>

                        {/* Preset 4: Pastoral / Spiritual Care */}
                        <button
                          onClick={() =>
                            handleOpenQuickPreset(
                              'PASTORAL_CARE',
                              'MEDIUM',
                              'COUNSELING',
                              'NEUTRAL',
                              'Pastoral Care & Spiritual Guidance Needed',
                              'Student requested pastoral guidance regarding personal, spiritual, or family support.',
                              'PastoralCare, Counseling'
                            )
                          }
                          className="p-2.5 bg-[#180B05] hover:bg-purple-950/40 text-purple-300 border border-purple-500/30 hover:border-purple-500/60 rounded-xl text-xs font-semibold flex items-center gap-2 transition text-left shadow-sm"
                        >
                          <HeartHandshake className="w-4 h-4 flex-shrink-0 text-purple-400" />
                          <span className="truncate">{language === 'am' ? 'መንፈሳዊ ድጋፍ / ምክር' : 'Pastoral Care'}</span>
                        </button>

                        {/* Preset 5: Merit Commendation */}
                        <button
                          onClick={() =>
                            handleOpenQuickPreset(
                              'MERIT_COMMENDATION',
                              'LOW',
                              'COMMENDATION',
                              'POSITIVE',
                              'Outstanding Merit & Leadership Commendation',
                              'Demonstrated exemplary church participation, character excellence, or peer mentorship.',
                              'Commendation, RoleModel'
                            )
                          }
                          className="p-2.5 bg-[#180B05] hover:bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 rounded-xl text-xs font-semibold flex items-center gap-2 transition text-left shadow-sm"
                        >
                          <Award className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                          <span className="truncate">{language === 'am' ? 'ምስጋና እና አርአያነት' : 'Merit / Award'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Filter Chips & Custom Form Button */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => setBehaviorFlagFilter('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          behaviorFlagFilter === 'all'
                            ? 'bg-[#F5A623] text-slate-950 shadow-md'
                            : 'bg-[#251208] text-[#C2AA96] hover:text-white border border-[#4A2412]'
                        }`}
                      >
                        {language === 'am' ? 'ሁሉም ማስታወሻዎች' : 'All Records'} ({profileData.behavioralNotes?.length || 0})
                      </button>

                      <button
                        onClick={() => setBehaviorFlagFilter('active_flags')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          behaviorFlagFilter === 'active_flags'
                            ? 'bg-amber-500 text-slate-950 shadow-md'
                            : 'bg-[#251208] text-amber-300 hover:text-amber-200 border border-amber-500/30'
                        }`}
                      >
                        <Flag className="w-3 h-3" />
                        <span>{language === 'am' ? 'ንቁ ማስጠንቀቂያዎች' : 'Active Flags'}</span>
                        <span>({activeBehavioralFlags.length})</span>
                      </button>

                      <button
                        onClick={() => setBehaviorFlagFilter('warnings')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          behaviorFlagFilter === 'warnings'
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'bg-[#251208] text-rose-300 hover:text-rose-200 border border-rose-500/30'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>{language === 'am' ? 'ማስጠንቀቂያዎች' : 'Warnings'}</span>
                      </button>

                      <button
                        onClick={() => setBehaviorFlagFilter('commendations')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          behaviorFlagFilter === 'commendations'
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-[#251208] text-emerald-300 hover:text-emerald-200 border border-emerald-500/30'
                        }`}
                      >
                        <Award className="w-3 h-3" />
                        <span>{language === 'am' ? 'ምስጋናዎች' : 'Commendations'}</span>
                      </button>

                      <button
                        onClick={() => setBehaviorFlagFilter('resolved')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          behaviorFlagFilter === 'resolved'
                            ? 'bg-sky-600 text-white shadow-md'
                            : 'bg-[#251208] text-sky-300 hover:text-sky-200 border border-sky-500/30'
                        }`}
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>{language === 'am' ? 'የተፈቱ / የተዘጉ' : 'Resolved'}</span>
                      </button>
                    </div>

                    {isAuthorizedStaff && (
                      <button
                        onClick={() => {
                          setFlagFormMode('detailed_note');
                          setShowAddFlagModal(true);
                        }}
                        className="px-3.5 py-1.5 bg-[#D98218] hover:bg-[#F5A623] text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{language === 'am' ? 'ብጁ ማስታወሻ መዝግብ' : 'Custom Observation'}</span>
                      </button>
                    )}
                  </div>

                  {/* Flag / Note Cards Feed */}
                  <div className="space-y-3.5">
                    {filteredNotes.length === 0 ? (
                      <div className="p-12 text-center bg-[#251208] border border-[#4A2412] rounded-2xl text-[#A68F7B] space-y-2">
                        <Flag className="w-8 h-8 text-[#A68F7B]/40 mx-auto" />
                        <p className="font-semibold text-xs text-[#FFF5EA]">
                          {language === 'am'
                            ? 'በዚህ ማጣሪያ ምንም የስነ-ምግባር ማስታወሻ ወይም ማስጠንቀቂያ አልተገኘም።'
                            : 'No behavioral flags or notes match the current filter.'}
                        </p>
                        {isAuthorizedStaff && (
                          <p className="text-[11px] text-[#A68F7B]">
                            {language === 'am'
                              ? 'አዲስ ማስታወሻ ወይም ማስጠንቀቂያ ለማያያዝ ከላይ ያሉትን አዝራሮች ይጠቀሙ።'
                              : 'Use the quick actions above to attach a short warning or observation.'}
                          </p>
                        )}
                      </div>
                    ) : (
                      filteredNotes.map((note) => {
                        const catBadge = getCategoryBadge(note.category);
                        const flagBadge = getFlagTypeBadge(note.flagType);
                        const priorityBadge = getPriorityBadge(note.flagPriority, note.severity);
                        const isResolved = note.flagStatus === 'RESOLVED';
                        const isActiveFlag = note.isFlag && !isResolved;

                        return (
                          <div
                            key={note.id}
                            className={`p-4 sm:p-5 bg-[#251208] border rounded-2xl shadow-lg space-y-3.5 transition ${
                              isActiveFlag
                                ? note.flagPriority === 'CRITICAL_URGENT' || note.severity === 'CRITICAL'
                                  ? 'border-rose-500/50 bg-gradient-to-br from-[#251208] to-rose-950/20 shadow-rose-950/20'
                                  : 'border-amber-500/40 bg-gradient-to-br from-[#251208] to-amber-950/20'
                                : isResolved
                                ? 'border-sky-500/30 opacity-90'
                                : 'border-[#4A2412] hover:border-[#F5A623]/40'
                            }`}
                          >
                            {/* Card Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                {/* Flag or Category Indicator */}
                                {note.isFlag && note.flagType ? (
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${flagBadge.bg}`}
                                  >
                                    {flagBadge.icon}
                                    <span>{language === 'am' ? flagBadge.labelAm : flagBadge.labelEn}</span>
                                  </span>
                                ) : (
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${catBadge.bg}`}
                                  >
                                    {catBadge.icon}
                                    <span>{language === 'am' ? catBadge.labelAm : catBadge.labelEn}</span>
                                  </span>
                                )}

                                {/* Priority Badge */}
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${priorityBadge.className}`}
                                >
                                  {priorityBadge.label}
                                </span>

                                {/* Status Chip */}
                                {note.isFlag && (
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider flex items-center gap-1 ${
                                      isResolved
                                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                        : note.flagStatus === 'UNDER_REVIEW'
                                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    }`}
                                  >
                                    {isResolved ? (
                                      <>
                                        <CheckCheck className="w-3 h-3" />
                                        <span>{language === 'am' ? 'ተፈቷል' : 'Resolved'}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Flag className="w-3 h-3" />
                                        <span>{language === 'am' ? 'ንቁ ማሳሰቢያ' : 'Active Flag'}</span>
                                      </>
                                    )}
                                  </span>
                                )}

                                {note.followUpRequired && !isResolved && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{language === 'am' ? 'ክትትል ያስፈልጋል' : 'Follow-up Required'}</span>
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-xs text-[#A68F7B]">
                                <span className="font-mono">{note.date}</span>
                                <span>•</span>
                                <span className="text-[#D98218]">
                                  {formatEthiopianDate(note.date, language === 'am' ? 'am' : 'en', false)}
                                </span>

                                {isAuthorizedStaff && (
                                  <button
                                    onClick={() => handleDeleteNote(note.id)}
                                    title="Delete Flag / Note"
                                    className="p-1 text-[#A68F7B] hover:text-rose-400 rounded transition ml-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Short Warning Highlight Box (If present) */}
                            {note.shortWarningNote && (
                              <div
                                className={`p-3 rounded-xl text-xs font-semibold border flex items-start gap-2.5 ${
                                  isActiveFlag
                                    ? 'bg-amber-950/40 text-amber-200 border-amber-500/40'
                                    : isResolved
                                    ? 'bg-slate-900/50 text-slate-300 border-slate-700'
                                    : 'bg-emerald-950/40 text-emerald-200 border-emerald-500/40'
                                }`}
                              >
                                <Flag className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#F5A623]" />
                                <div>
                                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#F5A623] mb-0.5">
                                    {language === 'am' ? 'አጭር ማስጠንቀቂያ / ማሳሰቢያ' : 'Short Warning Note'}
                                  </div>
                                  <p className="leading-snug">{note.shortWarningNote}</p>
                                </div>
                              </div>
                            )}

                            {/* Note Title & Narrative */}
                            <div>
                              <h4 className="text-sm font-bold text-white mb-1">
                                {note.title}
                              </h4>
                              <p className="text-xs text-[#E8D7C5] leading-relaxed whitespace-pre-line">
                                {note.content}
                              </p>
                            </div>

                            {/* Tags Chips */}
                            {note.tags && note.tags.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                {note.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#180B05] text-[#C2AA96] border border-[#3D1E0F] flex items-center gap-1"
                                  >
                                    <Tag className="w-2.5 h-2.5 text-[#F5A623]" />
                                    <span>#{tag}</span>
                                  </span>
                                ))}
                              </div>
                            )}

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

                            {/* Resolution Notes Box (if resolved) */}
                            {isResolved && note.resolutionNotes && (
                              <div className="p-3 bg-sky-950/30 border border-sky-500/30 rounded-xl text-xs text-sky-200 flex items-start gap-2.5">
                                <CheckCheck className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="font-bold text-sky-300 flex items-center gap-2 mb-0.5">
                                    <span>{language === 'am' ? 'የመፍትሔ እና የውይይት ውጤት' : 'Resolution Memo'}</span>
                                    {note.resolvedByUserName && (
                                      <span className="text-[10px] text-sky-400/80 font-normal">
                                        (by {note.resolvedByUserName})
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-sky-200/90">{note.resolutionNotes}</p>
                                </div>
                              </div>
                            )}

                            {/* Footer Ribbon & Action Controls */}
                            <div className="pt-2 border-t border-[#3D1E0F] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px] text-[#A68F7B]">
                              <div>
                                <span>
                                  {language === 'am' ? 'የመዘገበው:' : 'Recorded by:'}{' '}
                                  <strong className="text-[#FFF5EA]">{note.recordedByUserName}</strong>{' '}
                                  ({note.recordedByUserRole || 'STAFF'})
                                </span>
                                <span className="mx-2">•</span>
                                <span>{note.academicYear}</span>
                              </div>

                              {/* Authorized Resolution Trigger Buttons */}
                              {isAuthorizedStaff && note.isFlag && (
                                <div className="flex items-center gap-2 self-end sm:self-center">
                                  {!isResolved ? (
                                    <button
                                      onClick={() => {
                                        setResolvingNote(note);
                                        setResolutionNotes('');
                                      }}
                                      className="px-3 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 hover:text-white border border-sky-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                                    >
                                      <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                                      <span>{language === 'am' ? 'ተፈቷል ብለህ ዝጋ' : 'Resolve Flag'}</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleReopenFlag(note)}
                                      className="px-2.5 py-1 bg-[#2B140A] hover:bg-[#3D1E0F] text-[#C2AA96] hover:text-white border border-[#522B17] rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                                    >
                                      <RotateCcw className="w-3 h-3" />
                                      <span>{language === 'am' ? 'እንደገና ክፈት' : 'Reopen Flag'}</span>
                                    </button>
                                  )}
                                </div>
                              )}
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
                ? 'የቅዱስ ጳውሎስ ሰንበት ትምህርት ቤት የተማሪዎች አካዳሚክ እና የስነ-ምግባር ማህደር'
                : 'Saint Paul Sunday School Academic & Behavioral Record'}
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

      {/* DIALOG 1: ATTACH BEHAVIORAL FLAG / SHORT WARNING MODAL */}
      {showAddFlagModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#1C0F08] border border-[#522B17] w-full max-w-lg rounded-2xl p-6 shadow-2xl text-white space-y-4 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-[#3D1E0F]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flag className="w-5 h-5 text-[#F5A623]" />
                <span>
                  {language === 'am'
                    ? 'የስነ-ምግባር ማስጠንቀቂያ ወይም ማስታወሻ አያይዝ'
                    : 'Attach Behavioral Flag / Short Warning'}
                </span>
              </h3>
              <button
                onClick={() => setShowAddFlagModal(false)}
                className="text-[#A68F7B] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Mode Selector */}
            <div className="grid grid-cols-2 p-1 bg-[#180B05] rounded-xl border border-[#4A2412]">
              <button
                type="button"
                onClick={() => setFlagFormMode('quick_flag')}
                className={`py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  flagFormMode === 'quick_flag'
                    ? 'bg-[#D98218] text-slate-950 shadow'
                    : 'text-[#C2AA96] hover:text-white'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{language === 'am' ? 'ፈጣን ማስጠንቀቂያ' : 'Quick Flag / Warning'}</span>
              </button>
              <button
                type="button"
                onClick={() => setFlagFormMode('detailed_note')}
                className={`py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  flagFormMode === 'detailed_note'
                    ? 'bg-[#D98218] text-slate-950 shadow'
                    : 'text-[#C2AA96] hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{language === 'am' ? 'ዝርዝር ማስታወሻ' : 'Detailed Observation'}</span>
              </button>
            </div>

            <form onSubmit={handleSaveFlagOrNote} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Flag Type */}
                <div>
                  <label className="block text-[#C2AA96] mb-1 font-semibold">
                    {language === 'am' ? 'የማስጠንቀቂያው አይነት (Flag Type)' : 'Behavioral Flag Type'}
                  </label>
                  <select
                    value={flagForm.flagType}
                    onChange={(e) => {
                      const type = e.target.value as BehavioralFlagType;
                      setFlagForm({
                        ...flagForm,
                        flagType: type,
                        category:
                          type === 'ATTENDANCE_WARNING'
                            ? 'ATTENDANCE_PUNCTUALITY'
                            : type === 'ACADEMIC_ALERT'
                            ? 'ACADEMIC_EFFORT'
                            : type === 'MERIT_COMMENDATION'
                            ? 'COMMENDATION'
                            : type === 'PASTORAL_CARE'
                            ? 'COUNSELING'
                            : 'DISCIPLINARY',
                        severity:
                          type === 'MERIT_COMMENDATION'
                            ? 'POSITIVE'
                            : type === 'DISCIPLINARY_ACTION'
                            ? 'CRITICAL'
                            : 'WARNING',
                      });
                    }}
                    className="w-full px-3 py-2 bg-[#251208] border border-[#4A2412] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  >
                    <option value="ATTENDANCE_WARNING">Attendance / Tardiness Warning (የመገኘት ማሳሰቢያ)</option>
                    <option value="ACADEMIC_ALERT">Academic Difficulty (የትምህርት ድጋፍ ጥሪ)</option>
                    <option value="DISCIPLINARY_ACTION">Disciplinary Advisory (የስነ-ምግባር እርምጃ)</option>
                    <option value="PASTORAL_CARE">Pastoral / Spiritual Care (መንፈሳዊ ምክር)</option>
                    <option value="SPECIAL_ATTENTION">Special Attention (ልዩ ትኩረት)</option>
                    <option value="MERIT_COMMENDATION">Merit Commendation (ምስጋና እና አርአያነት)</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-[#C2AA96] mb-1 font-semibold">
                    {language === 'am' ? 'የአስቸኳይነት ደረጃ (Priority)' : 'Priority / Severity'}
                  </label>
                  <select
                    value={flagForm.flagPriority}
                    onChange={(e) =>
                      setFlagForm({
                        ...flagForm,
                        flagPriority: e.target.value as BehavioralFlagPriority,
                        severity:
                          e.target.value === 'CRITICAL_URGENT'
                            ? 'CRITICAL'
                            : e.target.value === 'HIGH'
                            ? 'WARNING'
                            : 'POSITIVE',
                      })
                    }
                    className="w-full px-3 py-2 bg-[#251208] border border-[#4A2412] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  >
                    <option value="CRITICAL_URGENT">Critical Urgent (ከፍተኛ / አስቸኳይ)</option>
                    <option value="HIGH">High Priority (ከፍተኛ ትኩረት የሚሻ)</option>
                    <option value="MEDIUM">Medium Priority (መካከለኛ)</option>
                    <option value="LOW">Low / Commendation (መደበኛ / አበረታች)</option>
                  </select>
                </div>
              </div>

              {/* Short Warning Note (Headline) */}
              <div>
                <label className="block text-[#C2AA96] mb-1 font-semibold flex justify-between">
                  <span>{language === 'am' ? 'አጭር ማስጠንቀቂያ / ማሳሰቢያ (Headline Warning)' : 'Short Warning Note (1-2 sentences)'}</span>
                  <span className="text-[10px] text-[#A68F7B]">Required</span>
                </label>
                <input
                  type="text"
                  required
                  value={flagForm.shortWarningNote}
                  onChange={(e) =>
                    setFlagForm({
                      ...flagForm,
                      shortWarningNote: e.target.value,
                      title: flagForm.title || e.target.value,
                    })
                  }
                  placeholder="e.g. Consecutive Sunday morning tardiness. Parent follow-up recommended."
                  className="w-full px-3 py-2 bg-[#251208] border border-[#4A2412] rounded-xl text-white placeholder-[#A68F7B] focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                />
              </div>

              {/* Title / Topic */}
              <div>
                <label className="block text-[#C2AA96] mb-1 font-semibold">
                  {language === 'am' ? 'የማስታወሻው ርዕስ (Title)' : 'Flag / Observation Title'}
                </label>
                <input
                  type="text"
                  required
                  value={flagForm.title}
                  onChange={(e) => setFlagForm({ ...flagForm, title: e.target.value })}
                  placeholder="e.g. Tardiness Reminder / Missing Assignment"
                  className="w-full px-3 py-2 bg-[#251208] border border-[#4A2412] rounded-xl text-white placeholder-[#A68F7B] focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                />
              </div>

              {/* Detailed Narrative */}
              <div>
                <label className="block text-[#C2AA96] mb-1 font-semibold">
                  {language === 'am' ? 'ዝርዝር ማብራሪያ (Detailed Context)' : 'Detailed Context & Narrative'}
                </label>
                <textarea
                  rows={flagFormMode === 'detailed_note' ? 4 : 2}
                  value={flagForm.content}
                  onChange={(e) => setFlagForm({ ...flagForm, content: e.target.value })}
                  placeholder="Provide additional details regarding student behavior, class impact, or pastoral guidance..."
                  className="w-full px-3 py-2 bg-[#251208] border border-[#4A2412] rounded-xl text-white placeholder-[#A68F7B] focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                />
              </div>

              {/* Tags & Action Taken */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#C2AA96] mb-1 font-semibold">
                    {language === 'am' ? 'መለያ ቃላት (Tags - Comma separated)' : 'Tags (comma separated)'}
                  </label>
                  <input
                    type="text"
                    value={flagForm.tagsInput}
                    onChange={(e) => setFlagForm({ ...flagForm, tagsInput: e.target.value })}
                    placeholder="e.g. Tardiness, ParentNotice, AcademicAlert"
                    className="w-full px-3 py-2 bg-[#251208] border border-[#4A2412] rounded-xl text-white placeholder-[#A68F7B] focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-[#C2AA96] mb-1 font-semibold">
                    {language === 'am' ? 'የተወሰደ እርምጃ (Action Taken)' : 'Action Taken (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={flagForm.actionTaken}
                    onChange={(e) => setFlagForm({ ...flagForm, actionTaken: e.target.value })}
                    placeholder="e.g. Verbal counseling, parent phoned..."
                    className="w-full px-3 py-2 bg-[#251208] border border-[#4A2412] rounded-xl text-white placeholder-[#A68F7B] focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                <div>
                  <label className="block text-[#C2AA96] mb-1 font-semibold">
                    {language === 'am' ? 'የተመዘገበበት ቀን' : 'Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={flagForm.date}
                    onChange={(e) => setFlagForm({ ...flagForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#251208] border border-[#4A2412] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 text-[#C2AA96] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flagForm.followUpRequired}
                      onChange={(e) =>
                        setFlagForm({ ...flagForm, followUpRequired: e.target.checked })
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
                  onClick={() => setShowAddFlagModal(false)}
                  className="px-4 py-2 bg-[#2B140A] text-[#C2AA96] font-semibold rounded-xl hover:bg-[#3D1E0F] transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submittingFlag}
                  className="px-5 py-2 bg-gradient-to-r from-[#D98218] to-[#E65100] hover:from-[#F5A623] hover:to-[#FF6D00] disabled:opacity-50 text-slate-950 font-bold rounded-xl transition shadow flex items-center gap-1.5"
                >
                  <Flag className="w-4 h-4" />
                  <span>
                    {submittingFlag
                      ? (language === 'am' ? 'በማያያዝ ላይ...' : 'Attaching...')
                      : (language === 'am' ? 'ማስጠንቀቂያውን አያይዝ' : 'Attach Behavioral Flag')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG 2: RESOLVE FLAG MODAL */}
      {resolvingNote && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-[#1C0F08] border border-sky-500/40 w-full max-w-md rounded-2xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#3D1E0F]">
              <h3 className="text-base font-bold text-sky-200 flex items-center gap-2">
                <CheckCheck className="w-5 h-5 text-sky-400" />
                <span>{language === 'am' ? 'የስነ-ምግባር ማስጠንቀቂያን እንደተፈታ መዝግብ' : 'Resolve Behavioral Flag'}</span>
              </h3>
              <button
                onClick={() => setResolvingNote(null)}
                className="text-[#A68F7B] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#251208] border border-[#4A2412] rounded-xl text-xs space-y-1">
              <div className="font-bold text-white">{resolvingNote.title}</div>
              <div className="text-[11px] text-[#C2AA96] line-clamp-2">{resolvingNote.shortWarningNote || resolvingNote.content}</div>
              <div className="text-[10px] text-[#A68F7B]">
                {language === 'am' ? 'የመዘገበው:' : 'Reported by:'} {resolvingNote.recordedByUserName} ({resolvingNote.date})
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-[#C2AA96] font-semibold">
                {language === 'am' ? 'የመፍትሔ ማስታወሻ እና ውይይት (Resolution Memo)' : 'Resolution Notes & Outcome'}
              </label>
              <textarea
                required
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Describe outcome (e.g. Conducted conference with student and parent. Student agreed to timetable plan and improved attendance.)"
                className="w-full px-3 py-2 bg-[#251208] border border-[#4A2412] rounded-xl text-white placeholder-[#A68F7B] focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#3D1E0F] text-xs">
              <button
                type="button"
                onClick={() => setResolvingNote(null)}
                className="px-4 py-2 bg-[#2B140A] text-[#C2AA96] font-semibold rounded-xl hover:bg-[#3D1E0F] transition"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                disabled={isSubmittingResolution}
                onClick={handleConfirmResolution}
                className="px-5 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition shadow flex items-center gap-1.5"
              >
                <CheckCheck className="w-4 h-4" />
                <span>{isSubmittingResolution ? (language === 'am' ? 'በመዝገብ ላይ...' : 'Resolving...') : (language === 'am' ? 'ተፈቷል ብለህ አረጋግጥ' : 'Confirm Resolution')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
