import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { AcademicCalendarEvent, CalendarEventType } from '../types';
import {
  Calendar as CalendarIcon,
  Plus,
  Filter,
  Search,
  Download,
  Printer,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  BookOpen,
  Sparkles,
  CalendarDays,
  ListFilter,
  X,
  FileText,
} from 'lucide-react';
import { formatEthiopianDate, gregorianToEthiopian } from '../utils/ethiopianCalendar';
import { exportAcademicCalendarToWord } from '../utils/wordExport';

export const AcademicCalendarView: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const toast = useToast();

  const [events, setEvents] = useState<AcademicCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [academicYears, setAcademicYears] = useState<string[]>(['2025/2026', '2026/2027', '2027/2028']);

  // Filters & View State
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('agenda');
  const [selectedYear, setSelectedYear] = useState<string>('2026/2027');
  const [selectedSemester, setSelectedSemester] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Modal States
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AcademicCalendarEvent | null>(null);
  const [selectedEventDetails, setSelectedEventDetails] = useState<AcademicCalendarEvent | null>(null);
  const [exportingWord, setExportingWord] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<AcademicCalendarEvent>>({
    title: '',
    amharicTitle: '',
    type: 'EXAM',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    academicYear: '2026/2027',
    semester: 'Semester I',
    description: '',
    amharicDescription: '',
    location: '',
    targetAudience: 'ALL',
    isImportant: false,
  });

  const canManageEvents = user?.role === 'ADMIN' || user?.role === 'DEPT_HEAD' || user?.role === 'COORDINATOR';

  const loadEvents = async () => {
    setLoading(true);
    try {
      const [eventsRes, yearsRes] = await Promise.all([
        api.getAcademicCalendarEvents(),
        api.getAcademicYears(),
      ]);
      if (eventsRes.success && eventsRes.data) {
        setEvents(eventsRes.data);
      }
      if (yearsRes.success && yearsRes.data && yearsRes.data.length > 0) {
        setAcademicYears(yearsRes.data);
      }
    } catch (err) {
      console.error('Failed to load academic calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Category Badges & Color Definitions
  const categoryConfig: Record<
    CalendarEventType,
    { labelEn: string; labelAm: string; bg: string; text: string; border: string; dot: string; icon: any }
  > = {
    EXAM: {
      labelEn: 'Exam Week',
      labelAm: 'የፈተና ሳምንት',
      bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      text: 'text-rose-400',
      border: 'border-rose-500/40',
      dot: 'bg-rose-500',
      icon: BookOpen,
    },
    HOLIDAY: {
      labelEn: 'Holiday & Feast',
      labelAm: 'በዓል እና ዕረፍት',
      bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      text: 'text-emerald-400',
      border: 'border-emerald-500/40',
      dot: 'bg-emerald-500',
      icon: Sparkles,
    },
    REGISTRATION: {
      labelEn: 'Registration & Deadline',
      labelAm: 'የምዝገባ ጊዜ',
      bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      text: 'text-amber-400',
      border: 'border-amber-500/40',
      dot: 'bg-amber-500',
      icon: Users,
    },
    ACADEMIC_MILESTONE: {
      labelEn: 'Academic Milestone',
      labelAm: 'የትምህርት ክንውን',
      bg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      text: 'text-blue-400',
      border: 'border-blue-500/40',
      dot: 'bg-blue-500',
      icon: CheckCircle2,
    },
    MEETING: {
      labelEn: 'Staff & Assemblies',
      labelAm: 'ስብሰባ እና ውይይት',
      bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      text: 'text-purple-400',
      border: 'border-purple-500/40',
      dot: 'bg-purple-500',
      icon: Users,
    },
    SPECIAL_EVENT: {
      labelEn: 'Special Celebration',
      labelAm: 'ልዩ መርሐ ግብር',
      bg: 'bg-amber-400/10 text-amber-200 border-amber-400/30',
      text: 'text-amber-300',
      border: 'border-amber-400/40',
      dot: 'bg-amber-400',
      icon: Sparkles,
    },
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Academic year filter
      if (selectedYear !== 'ALL' && ev.academicYear && ev.academicYear !== 'ALL' && ev.academicYear !== selectedYear) {
        return false;
      }
      // Semester filter
      if (selectedSemester !== 'All' && ev.semester && ev.semester !== 'All' && ev.semester !== selectedSemester) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'ALL' && ev.type !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (ev.title || '').toLowerCase().includes(q);
        const matchAmharic = (ev.amharicTitle || '').includes(q);
        const matchDesc = (ev.description || '').toLowerCase().includes(q);
        const matchLoc = (ev.location || '').toLowerCase().includes(q);
        if (!matchTitle && !matchAmharic && !matchDesc && !matchLoc) {
          return false;
        }
      }
      return true;
    });
  }, [events, selectedYear, selectedSemester, selectedCategory, searchQuery]);

  // Next Upcoming Milestone (closest future or today)
  const nextMilestone = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = events
      .filter((e) => (e.endDate || e.startDate) >= todayStr)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [events]);

  const calculateDaysRemaining = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Grouped Timeline Categories
  const timelineGroups = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = filteredEvents.filter((e) => (e.endDate || e.startDate) >= todayStr);
    const past = filteredEvents.filter((e) => (e.endDate || e.startDate) < todayStr);

    return {
      upcoming,
      past,
    };
  }, [filteredEvents]);

  // Modal Handlers
  const handleOpenAdd = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      amharicTitle: '',
      type: 'EXAM',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      academicYear: selectedYear !== 'ALL' ? selectedYear : '2026/2027',
      semester: selectedSemester !== 'All' ? (selectedSemester as any) : 'Semester I',
      description: '',
      amharicDescription: '',
      location: 'Sunday School Auditorium',
      targetAudience: 'ALL',
      isImportant: false,
    });
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (event: AcademicCalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      ...event,
      endDate: event.endDate || event.startDate,
    });
    setShowAddEditModal(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate || !formData.type) {
      toast.warning(
        language === 'am'
          ? 'እባክዎ የክስተቱን ርዕስ፣ መጀመሪያ ቀን እና ምድብ ይሙሉ!'
          : 'Please fill out the event title, start date, and category.'
      );
      return;
    }

    try {
      if (editingEvent) {
        const res = await api.updateAcademicCalendarEvent(editingEvent.id, formData);
        if (res.success) {
          toast.success(
            language === 'am'
              ? `የቀን መቁጠሪያ ክስተት "${formData.amharicTitle || formData.title}" ተሻሽሏል!`
              : `Academic event "${formData.title}" updated successfully!`
          );
          await loadEvents();
          setShowAddEditModal(false);
        } else {
          toast.error(language === 'am' ? 'ክስተቱን ማሻሻል አልተቻለም።' : 'Failed to update academic event.');
        }
      } else {
        const res = await api.createAcademicCalendarEvent(formData);
        if (res.success) {
          toast.success(
            language === 'am'
              ? `አዲስ የቀን መቁጠሪያ ክስተት "${formData.amharicTitle || formData.title}" ተመዝግቧል!`
              : `Academic event "${formData.title}" created successfully!`
          );
          await loadEvents();
          setShowAddEditModal(false);
        } else {
          toast.error(language === 'am' ? 'ክስተቱን መመዝገብ አልተቻለም።' : 'Failed to create academic event.');
        }
      }
    } catch (err) {
      console.error('Failed to save academic calendar event:', err);
      toast.error(language === 'am' ? 'የክስተት ማስቀመጥ ስህተት አጋጥሟል።' : 'Error saving academic event.');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm(t('deleteEventConfirm'))) {
      try {
        const res = await api.deleteAcademicCalendarEvent(id);
        if (res.success) {
          toast.success(
            language === 'am' ? 'ክስተቱ በተሳካ ሁኔታ ተሰርዟል!' : 'Calendar event deleted successfully!'
          );
          await loadEvents();
          if (selectedEventDetails?.id === id) {
            setSelectedEventDetails(null);
          }
        } else {
          toast.error(language === 'am' ? 'ክስተቱን መሰረዝ አልተቻለም።' : 'Failed to delete calendar event.');
        }
      } catch (err) {
        console.error('Failed to delete event:', err);
        toast.error(language === 'am' ? 'ስህተት አጋጥሟል።' : 'Failed to delete event.');
      }
    }
  };

  const handleExportDocx = async () => {
    setExportingWord(true);
    try {
      await exportAcademicCalendarToWord(filteredEvents, selectedYear, selectedCategory);
      toast.success(
        language === 'am'
          ? 'የአካዳሚክ ካላንደር ዎርድ ሰነድ በተሳካ ሁኔታ ዳውንሎድ ተደርጓል!'
          : 'Academic Calendar Word document downloaded successfully!'
      );
    } catch (err) {
      console.error('Word export failed:', err);
      toast.error(language === 'am' ? 'ወደ ዎርድ ማውረድ አልተቻለም።' : 'Export to Word failed.');
    } finally {
      setExportingWord(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Title (EN)', 'Title (AM)', 'Category', 'Start Date', 'End Date', 'Ethiopian Start', 'Academic Year', 'Semester', 'Audience', 'Location', 'Description'];
    const rows = filteredEvents.map((e) => [
      `"${e.title}"`,
      `"${e.amharicTitle || ''}"`,
      `"${e.type}"`,
      `"${e.startDate}"`,
      `"${e.endDate || e.startDate}"`,
      `"${formatEthiopianDate(e.startDate, 'am')}"`,
      `"${e.academicYear}"`,
      `"${e.semester || 'All'}"`,
      `"${e.targetAudience || 'ALL'}"`,
      `"${e.location || ''}"`,
      `"${(e.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Academic_Calendar_${selectedYear.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Month Grid View Generators
  const monthYear = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return { year, month, firstDay, totalDays };
  }, [currentDate]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div id="academic-calendar-view" className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header Card */}
      <div className="bg-[#27140B]/90 border border-[#4A2612] rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#F5A623]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#D97706] flex items-center justify-center text-[#27140B] shadow-lg shadow-[#F5A623]/20">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#FDF8F3] tracking-tight">
                  {t('academicCalendarTitle')}
                </h1>
                <p className="text-sm text-[#CBB39C]">
                  {t('academicCalendarSubtitle')}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {canManageEvents && (
              <button
                id="btn-add-calendar-event"
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#F5A623] to-[#E09015] hover:from-[#E09015] hover:to-[#C67D0B] text-[#27140B] font-semibold text-sm rounded-xl transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{t('addEvent')}</span>
              </button>
            )}

            <button
              id="btn-export-calendar-word"
              onClick={handleExportDocx}
              disabled={exportingWord || filteredEvents.length === 0}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-[#3B1D0E] hover:bg-[#4A2612] border border-[#5C3018] text-[#FDF8F3] text-sm font-medium rounded-xl transition-all disabled:opacity-50"
              title="Download Word Document (.docx)"
            >
              <FileText className="w-4 h-4 text-[#F5A623]" />
              <span>{exportingWord ? 'Exporting...' : 'Word (.docx)'}</span>
            </button>

            <button
              id="btn-export-calendar-csv"
              onClick={handleExportCSV}
              disabled={filteredEvents.length === 0}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-[#3B1D0E] hover:bg-[#4A2612] border border-[#5C3018] text-[#FDF8F3] text-sm font-medium rounded-xl transition-all disabled:opacity-50"
              title="Export CSV"
            >
              <Download className="w-4 h-4 text-[#CBB39C]" />
              <span>CSV</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#1D0C05] p-1 rounded-xl border border-[#4A2612]">
              <button
                id="btn-toggle-agenda-view"
                onClick={() => setViewMode('agenda')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'agenda'
                    ? 'bg-[#F5A623] text-[#27140B] shadow'
                    : 'text-[#CBB39C] hover:text-[#FDF8F3]'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>{t('agendaView')}</span>
              </button>
              <button
                id="btn-toggle-month-view"
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'month'
                    ? 'bg-[#F5A623] text-[#27140B] shadow'
                    : 'text-[#CBB39C] hover:text-[#FDF8F3]'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{t('monthView')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Next Milestone Highlight Banner */}
        {nextMilestone && (
          <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-[#38180A]/90 via-[#45200D]/90 to-[#38180A]/90 border border-[#F5A623]/30 shadow-inner flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F5A623]/20 border border-[#F5A623]/40 flex items-center justify-center shrink-0 text-[#F5A623]">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#F5A623]">
                    {t('upcomingMilestone')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/30">
                    {calculateDaysRemaining(nextMilestone.startDate) === 0
                      ? t('today')
                      : calculateDaysRemaining(nextMilestone.startDate) > 0
                      ? t('daysRemaining', { days: calculateDaysRemaining(nextMilestone.startDate) })
                      : t('pastEvent')}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#FDF8F3] mt-0.5">
                  {language === 'am' && nextMilestone.amharicTitle ? nextMilestone.amharicTitle : nextMilestone.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-[#CBB39C] mt-1 flex-wrap">
                  <span className="flex items-center gap-1 font-medium text-[#F5A623]">
                    📅 {formatEthiopianDate(nextMilestone.startDate, language === 'am' ? 'am' : 'en')}
                  </span>
                  <span>•</span>
                  <span>Gregorian: {nextMilestone.startDate}</span>
                  {nextMilestone.location && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#F5A623]" />
                        {nextMilestone.location}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedEventDetails(nextMilestone)}
              className="px-3.5 py-2 rounded-lg bg-[#F5A623]/10 hover:bg-[#F5A623]/20 border border-[#F5A623]/30 text-[#F5A623] text-xs font-semibold transition-all whitespace-nowrap self-start md:self-center"
            >
              {t('viewDetails')} →
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#27140B]/80 border border-[#4A2612] rounded-xl p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#CBB39C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-calendar"
            type="text"
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1D0C05] border border-[#4A2612] focus:border-[#F5A623] text-sm text-[#FDF8F3] placeholder-[#8C705D] pl-10 pr-4 py-2.5 rounded-xl outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C705D] hover:text-[#FDF8F3]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Academic Year */}
          <div className="flex items-center gap-1.5 bg-[#1D0C05] border border-[#4A2612] px-3 py-1.5 rounded-xl">
            <span className="text-xs text-[#8C705D] font-medium">{t('academicYear')}:</span>
            <select
              id="select-calendar-academic-year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-xs text-[#FDF8F3] font-semibold outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#27140B] text-[#FDF8F3]">All Years</option>
              {academicYears.map((yr) => (
                <option key={yr} value={yr} className="bg-[#27140B] text-[#FDF8F3]">
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div className="flex items-center gap-1.5 bg-[#1D0C05] border border-[#4A2612] px-3 py-1.5 rounded-xl">
            <span className="text-xs text-[#8C705D] font-medium">{t('semester')}:</span>
            <select
              id="select-calendar-semester"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="bg-transparent text-xs text-[#FDF8F3] font-semibold outline-none cursor-pointer"
            >
              <option value="All" className="bg-[#27140B] text-[#FDF8F3]">{t('allSemesters')}</option>
              <option value="Semester I" className="bg-[#27140B] text-[#FDF8F3]">{t('semester1')}</option>
              <option value="Semester II" className="bg-[#27140B] text-[#FDF8F3]">{t('semester2')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
            selectedCategory === 'ALL'
              ? 'bg-[#F5A623] text-[#27140B] border-[#F5A623] shadow-md shadow-[#F5A623]/20'
              : 'bg-[#27140B]/80 text-[#CBB39C] border-[#4A2612] hover:border-[#6B371A]'
          }`}
        >
          {t('allCategories')} ({events.length})
        </button>
        {(['EXAM', 'HOLIDAY', 'REGISTRATION', 'ACADEMIC_MILESTONE', 'MEETING', 'SPECIAL_EVENT'] as CalendarEventType[]).map((cat) => {
          const cfg = categoryConfig[cat];
          const count = events.filter((e) => e.type === cat).length;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
                isSelected
                  ? `${cfg.bg} ${cfg.border} font-bold shadow-md`
                  : 'bg-[#27140B]/80 text-[#CBB39C] border-[#4A2612] hover:border-[#6B371A]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              <span>{language === 'am' ? cfg.labelAm : cfg.labelEn}</span>
              <span className="opacity-70 text-[10px]">({count})</span>
            </button>
          );
        })}
      </div>

      {/* MAIN VIEW AREA */}
      {loading ? (
        <div className="bg-[#27140B]/60 border border-[#4A2612] rounded-2xl p-12 text-center">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-[#F5A623] border-t-transparent rounded-full mb-3" />
          <p className="text-[#CBB39C] text-sm font-medium">Loading academic calendar...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-[#27140B]/60 border border-[#4A2612] rounded-2xl p-12 text-center space-y-3">
          <CalendarIcon className="w-12 h-12 text-[#8C705D] mx-auto opacity-50" />
          <h3 className="text-lg font-bold text-[#FDF8F3]">{t('noEventsFound')}</h3>
          <p className="text-sm text-[#CBB39C]">Try adjusting your search query or filters.</p>
          {canManageEvents && (
            <button
              onClick={handleOpenAdd}
              className="mt-2 px-4 py-2 bg-[#F5A623] text-[#27140B] font-semibold text-xs rounded-xl"
            >
              {t('addEvent')}
            </button>
          )}
        </div>
      ) : viewMode === 'agenda' ? (
        /* TIMELINE / AGENDA VIEW */
        <div className="space-y-6">
          {/* Upcoming Section */}
          {timelineGroups.upcoming.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-[#4A2612] pb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h2 className="text-base font-bold text-[#FDF8F3] uppercase tracking-wider">
                  Upcoming Events & Deadlines ({timelineGroups.upcoming.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {timelineGroups.upcoming.map((ev) => {
                  const cfg = categoryConfig[ev.type] || categoryConfig.ACADEMIC_MILESTONE;
                  const CatIcon = cfg.icon;
                  const daysLeft = calculateDaysRemaining(ev.startDate);
                  const isToday = daysLeft === 0;

                  return (
                    <div
                      key={ev.id}
                      id={`event-card-${ev.id}`}
                      onClick={() => setSelectedEventDetails(ev)}
                      className={`bg-[#27140B]/90 hover:bg-[#32190E] border ${
                        ev.isImportant ? 'border-[#F5A623]/60 shadow-lg shadow-[#F5A623]/5' : 'border-[#4A2612]'
                      } rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between group relative overflow-hidden`}
                    >
                      {/* Priority Tag indicator */}
                      {ev.isImportant && (
                        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
                          <div className="bg-[#F5A623] text-[#27140B] text-[9px] font-extrabold uppercase py-0.5 text-center transform rotate-45 translate-x-4 translate-y-2 shadow">
                            Key
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        {/* Top Category Badge & Days Left */}
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${cfg.bg} ${cfg.border}`}
                          >
                            <CatIcon className="w-3.5 h-3.5" />
                            <span>{language === 'am' ? cfg.labelAm : cfg.labelEn}</span>
                          </span>

                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                              isToday
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                                : daysLeft <= 7
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-[#1D0C05] text-[#CBB39C] border border-[#4A2612]'
                            }`}
                          >
                            {isToday ? t('today') : t('daysRemaining', { days: daysLeft })}
                          </span>
                        </div>

                        {/* Title */}
                        <div>
                          <h3 className="text-base font-bold text-[#FDF8F3] group-hover:text-[#F5A623] transition-colors line-clamp-2">
                            {language === 'am' && ev.amharicTitle ? ev.amharicTitle : ev.title}
                          </h3>
                          {ev.amharicTitle && language !== 'am' && (
                            <p className="text-xs text-[#A89078] font-amharic mt-0.5">{ev.amharicTitle}</p>
                          )}
                          {language === 'am' && ev.title && (
                            <p className="text-xs text-[#A89078] italic mt-0.5">{ev.title}</p>
                          )}
                        </div>

                        {/* Dates */}
                        <div className="space-y-1.5 bg-[#1D0C05]/80 p-2.5 rounded-xl border border-[#4A2612]/60 text-xs">
                          <div className="flex items-center gap-1.5 text-[#F5A623] font-semibold">
                            <span>🇪🇹</span>
                            <span>{formatEthiopianDate(ev.startDate, language === 'am' ? 'am' : 'en')}</span>
                            {ev.endDate && ev.endDate !== ev.startDate && (
                              <span> - {formatEthiopianDate(ev.endDate, language === 'am' ? 'am' : 'en')}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[#8C705D]">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            <span>
                              {ev.startDate}
                              {ev.endDate && ev.endDate !== ev.startDate ? ` → ${ev.endDate}` : ''}
                            </span>
                          </div>
                        </div>

                        {/* Description / snippet */}
                        {(ev.amharicDescription || ev.description) && (
                          <p className="text-xs text-[#CBB39C] line-clamp-2">
                            {language === 'am' && ev.amharicDescription ? ev.amharicDescription : ev.description}
                          </p>
                        )}
                      </div>

                      {/* Footer Info & Actions */}
                      <div className="pt-3 mt-3 border-t border-[#4A2612] flex items-center justify-between text-xs text-[#8C705D]">
                        <div className="flex items-center gap-2 flex-wrap">
                          {ev.location && (
                            <span className="flex items-center gap-1 truncate max-w-[130px]">
                              <MapPin className="w-3 h-3 text-[#F5A623]" />
                              <span className="truncate">{ev.location}</span>
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded bg-[#1D0C05] text-[10px] font-semibold text-[#CBB39C]">
                            {ev.targetAudience || 'ALL'}
                          </span>
                        </div>

                        {canManageEvents && (
                          <div
                            className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              id={`btn-edit-event-${ev.id}`}
                              onClick={() => handleOpenEdit(ev)}
                              className="p-1.5 rounded-lg hover:bg-[#4A2612] text-[#CBB39C] hover:text-[#F5A623]"
                              title="Edit Event"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`btn-delete-event-${ev.id}`}
                              onClick={() => handleDeleteEvent(ev.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-950 text-[#CBB39C] hover:text-rose-400"
                              title="Delete Event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past Events Section */}
          {timelineGroups.past.length > 0 && (
            <div className="space-y-3 pt-6">
              <div className="flex items-center gap-2 border-b border-[#4A2612] pb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-stone-500" />
                <h2 className="text-base font-bold text-[#A89078] uppercase tracking-wider">
                  Past Recorded Milestones ({timelineGroups.past.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-80 hover:opacity-100 transition-opacity">
                {timelineGroups.past.map((ev) => {
                  const cfg = categoryConfig[ev.type] || categoryConfig.ACADEMIC_MILESTONE;
                  const CatIcon = cfg.icon;

                  return (
                    <div
                      key={ev.id}
                      id={`event-card-past-${ev.id}`}
                      onClick={() => setSelectedEventDetails(ev)}
                      className="bg-[#27140B]/60 hover:bg-[#2F170D] border border-[#4A2612]/70 rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${cfg.bg}`}
                          >
                            <CatIcon className="w-3 h-3" />
                            <span>{language === 'am' ? cfg.labelAm : cfg.labelEn}</span>
                          </span>
                          <span className="text-[10px] text-[#8C705D] uppercase font-bold">{t('pastEvent')}</span>
                        </div>

                        <h4 className="text-sm font-bold text-[#FDF8F3]">
                          {language === 'am' && ev.amharicTitle ? ev.amharicTitle : ev.title}
                        </h4>

                        <div className="text-xs text-[#CBB39C] flex items-center gap-1.5">
                          <span>📅 {formatEthiopianDate(ev.startDate, language === 'am' ? 'am' : 'en')}</span>
                        </div>
                      </div>

                      <div className="pt-2.5 mt-2.5 border-t border-[#4A2612]/60 flex items-center justify-between text-xs text-[#8C705D]">
                        <span>Year: {ev.academicYear}</span>
                        {canManageEvents && (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenEdit(ev)}
                              className="p-1 rounded hover:text-[#F5A623]"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(ev.id)}
                              className="p-1 rounded hover:text-rose-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* MONTH GRID VIEW */
        <div className="bg-[#27140B]/90 border border-[#4A2612] rounded-2xl p-6 shadow-xl space-y-4">
          {/* Month Navigator Header */}
          <div className="flex items-center justify-between border-b border-[#4A2612] pb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-[#FDF8F3]">
                {monthNames[monthYear.month]} {monthYear.year}
              </h2>
              {/* Ethiopian date equivalent of current month */}
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20">
                {formatEthiopianDate(new Date(monthYear.year, monthYear.month, 15), 'am')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentDate(new Date(monthYear.year, monthYear.month - 1, 1))}
                className="p-2 rounded-xl bg-[#1D0C05] hover:bg-[#3B1D0E] border border-[#4A2612] text-[#FDF8F3] transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 rounded-xl bg-[#1D0C05] hover:bg-[#3B1D0E] border border-[#4A2612] text-xs font-semibold text-[#FDF8F3] transition-all"
              >
                {t('today')}
              </button>
              <button
                onClick={() => setCurrentDate(new Date(monthYear.year, monthYear.month + 1, 1))}
                className="p-2 rounded-xl bg-[#1D0C05] hover:bg-[#3B1D0E] border border-[#4A2612] text-[#FDF8F3] transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[#CBB39C] uppercase tracking-wider py-2">
            <div>Sun / እሑድ</div>
            <div>Mon / ሰኞ</div>
            <div>Tue / ማክሰኞ</div>
            <div>Wed / ረቡዕ</div>
            <div>Thu / ሐሙስ</div>
            <div>Fri / አርብ</div>
            <div>Sat / ቅዳሜ</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots for start of month */}
            {Array.from({ length: monthYear.firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] p-2 rounded-xl bg-[#1D0C05]/30 border border-[#3A1E0E]/30 opacity-40" />
            ))}

            {/* Month Days */}
            {Array.from({ length: monthYear.totalDays }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateObj = new Date(monthYear.year, monthYear.month, dayNum);
              const dateStr = `${monthYear.year}-${String(monthYear.month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const ethDate = gregorianToEthiopian(dateObj);

              const todayStr = new Date().toISOString().split('T')[0];
              const isToday = dateStr === todayStr;

              // Events on this day
              const dayEvents = filteredEvents.filter((ev) => {
                const s = ev.startDate;
                const e = ev.endDate || ev.startDate;
                return dateStr >= s && dateStr <= e;
              });

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    if (dayEvents.length > 0) {
                      setSelectedEventDetails(dayEvents[0]);
                    }
                  }}
                  className={`min-h-[110px] p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                    isToday
                      ? 'bg-[#3A1E0E] border-[#F5A623] shadow-md shadow-[#F5A623]/10'
                      : dayEvents.length > 0
                      ? 'bg-[#27140B] hover:bg-[#341B0F] border-[#4A2612] cursor-pointer'
                      : 'bg-[#1D0C05]/70 border-[#3A1E0E]/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday ? 'w-6 h-6 rounded-full bg-[#F5A623] text-[#27140B] flex items-center justify-center' : 'text-[#FDF8F3]'
                      }`}
                    >
                      {dayNum}
                    </span>
                    <span className="text-[10px] font-amharic text-[#F5A623] font-semibold" title="Ethiopian Date">
                      {ethDate.day} {ethDate.monthNameAm.slice(0, 3)}
                    </span>
                  </div>

                  {/* Day Events Chips */}
                  <div className="space-y-1 mt-1.5">
                    {dayEvents.slice(0, 2).map((ev) => {
                      const cfg = categoryConfig[ev.type] || categoryConfig.ACADEMIC_MILESTONE;
                      return (
                        <div
                          key={ev.id}
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded truncate border ${cfg.bg} ${cfg.border}`}
                          title={ev.title}
                        >
                          {language === 'am' && ev.amharicTitle ? ev.amharicTitle : ev.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] font-bold text-[#F5A623] pl-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EVENT DETAIL MODAL */}
      {selectedEventDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#27140B] border border-[#4A2612] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-5 p-6 relative">
            <button
              onClick={() => setSelectedEventDetails(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#3B1D0E] text-[#CBB39C] hover:text-[#FDF8F3] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header / Type */}
            <div className="space-y-2 pr-8">
              <div className="flex items-center gap-2 flex-wrap">
                {(() => {
                  const cfg = categoryConfig[selectedEventDetails.type] || categoryConfig.ACADEMIC_MILESTONE;
                  const CatIcon = cfg.icon;
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${cfg.bg} ${cfg.border}`}>
                      <CatIcon className="w-4 h-4" />
                      <span>{language === 'am' ? cfg.labelAm : cfg.labelEn}</span>
                    </span>
                  );
                })()}

                {selectedEventDetails.isImportant && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-[#F5A623] text-[#27140B]">
                    HIGH PRIORITY
                  </span>
                )}

                <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#1D0C05] text-[#CBB39C] border border-[#4A2612]">
                  {selectedEventDetails.academicYear} • {selectedEventDetails.semester || 'All'}
                </span>
              </div>

              <h2 className="text-xl font-bold text-[#FDF8F3]">
                {selectedEventDetails.amharicTitle || selectedEventDetails.title}
              </h2>
              {selectedEventDetails.amharicTitle && selectedEventDetails.title !== selectedEventDetails.amharicTitle && (
                <p className="text-sm text-[#CBB39C] italic">{selectedEventDetails.title}</p>
              )}
            </div>

            {/* Details Box */}
            <div className="bg-[#1D0C05] rounded-2xl p-4 border border-[#4A2612] space-y-3 text-sm">
              <div className="flex items-center gap-2 text-[#F5A623] font-semibold">
                <span>🇪🇹</span>
                <span>
                  {formatEthiopianDate(selectedEventDetails.startDate, 'am', true)}
                  {selectedEventDetails.endDate && selectedEventDetails.endDate !== selectedEventDetails.startDate && (
                    ` — ${formatEthiopianDate(selectedEventDetails.endDate, 'am', true)}`
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[#CBB39C] text-xs">
                <CalendarIcon className="w-4 h-4 text-[#8C705D]" />
                <span>
                  Gregorian: {selectedEventDetails.startDate}
                  {selectedEventDetails.endDate && selectedEventDetails.endDate !== selectedEventDetails.startDate
                    ? ` to ${selectedEventDetails.endDate}`
                    : ''}
                </span>
              </div>

              {selectedEventDetails.location && (
                <div className="flex items-center gap-2 text-[#CBB39C] text-xs">
                  <MapPin className="w-4 h-4 text-[#F5A623]" />
                  <span>Venue: {selectedEventDetails.location}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-[#CBB39C] text-xs">
                <Users className="w-4 h-4 text-[#F5A623]" />
                <span>Target: {selectedEventDetails.targetAudience || 'ALL SUNDAY SCHOOL'}</span>
              </div>
            </div>

            {/* Descriptions */}
            {(selectedEventDetails.amharicDescription || selectedEventDetails.description) && (
              <div className="space-y-2 bg-[#341B0F]/40 p-4 rounded-2xl border border-[#4A2612]/60">
                <h4 className="text-xs font-bold text-[#F5A623] uppercase tracking-wider">
                  Event Description & Guidelines
                </h4>
                {selectedEventDetails.amharicDescription && (
                  <p className="text-sm text-[#FDF8F3] font-amharic leading-relaxed">
                    {selectedEventDetails.amharicDescription}
                  </p>
                )}
                {selectedEventDetails.description && (
                  <p className="text-xs text-[#CBB39C] leading-relaxed">
                    {selectedEventDetails.description}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              {canManageEvents ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const ev = selectedEventDetails;
                      setSelectedEventDetails(null);
                      handleOpenEdit(ev);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3B1D0E] hover:bg-[#4A2612] border border-[#5C3018] text-[#F5A623] text-xs font-bold transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{t('edit')}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteEvent(selectedEventDetails.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-950 border border-rose-800/40 text-rose-300 text-xs font-bold transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('delete')}</span>
                  </button>
                </div>
              ) : (
                <div />
              )}

              <button
                onClick={() => setSelectedEventDetails(null)}
                className="px-5 py-2 bg-[#F5A623] text-[#27140B] font-bold text-xs rounded-xl hover:bg-[#E09015] transition-all"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT EVENT MODAL */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-[#27140B] border border-[#4A2612] rounded-3xl w-full max-w-xl shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#4A2612] pb-3">
              <h2 className="text-lg font-bold text-[#FDF8F3] flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#F5A623]" />
                <span>{editingEvent ? t('editEvent') : t('addEvent')}</span>
              </h2>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="text-[#CBB39C] hover:text-[#FDF8F3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              {/* Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#CBB39C] font-semibold">{t('eventTitle')} *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Semester Final Examination"
                    className="w-full bg-[#1D0C05] border border-[#4A2612] focus:border-[#F5A623] text-[#FDF8F3] p-2.5 rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#CBB39C] font-semibold">{t('eventAmharicTitle')}</label>
                  <input
                    type="text"
                    value={formData.amharicTitle || ''}
                    onChange={(e) => setFormData({ ...formData, amharicTitle: e.target.value })}
                    placeholder="ምሳሌ፡ የማጠቃለያ ፈተና ሳምንት"
                    className="w-full bg-[#1D0C05] border border-[#4A2612] focus:border-[#F5A623] text-[#FDF8F3] p-2.5 rounded-xl outline-none font-amharic"
                  />
                </div>
              </div>

              {/* Type, Year, Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[#CBB39C] font-semibold">{t('eventType')} *</label>
                  <select
                    value={formData.type || 'EXAM'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CalendarEventType })}
                    className="w-full bg-[#1D0C05] border border-[#4A2612] text-[#FDF8F3] p-2.5 rounded-xl outline-none"
                  >
                    <option value="EXAM">Exam Week / ፈተና</option>
                    <option value="HOLIDAY">Holiday & Feast / በዓል</option>
                    <option value="REGISTRATION">Registration / ምዝገባ</option>
                    <option value="ACADEMIC_MILESTONE">Academic Milestone / ክንውን</option>
                    <option value="MEETING">Staff / Assembly / ስብሰባ</option>
                    <option value="SPECIAL_EVENT">Special Celebration / ልዩ</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#CBB39C] font-semibold">{t('academicYear')}</label>
                  <select
                    value={formData.academicYear || '2026/2027'}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full bg-[#1D0C05] border border-[#4A2612] text-[#FDF8F3] p-2.5 rounded-xl outline-none"
                  >
                    {academicYears.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#CBB39C] font-semibold">{t('semester')}</label>
                  <select
                    value={formData.semester || 'All'}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value as any })}
                    className="w-full bg-[#1D0C05] border border-[#4A2612] text-[#FDF8F3] p-2.5 rounded-xl outline-none"
                  >
                    <option value="All">All Semesters</option>
                    <option value="Semester I">Semester I</option>
                    <option value="Semester II">Semester II</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#CBB39C] font-semibold">{t('startDate')} *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-[#1D0C05] border border-[#4A2612] focus:border-[#F5A623] text-[#FDF8F3] p-2.5 rounded-xl outline-none"
                  />
                  {formData.startDate && (
                    <p className="text-[11px] text-[#F5A623] font-semibold">
                      🇪🇹 {formatEthiopianDate(formData.startDate, 'am')}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[#CBB39C] font-semibold">{t('endDate')}</label>
                  <input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-[#1D0C05] border border-[#4A2612] focus:border-[#F5A623] text-[#FDF8F3] p-2.5 rounded-xl outline-none"
                  />
                  {formData.endDate && (
                    <p className="text-[11px] text-[#F5A623] font-semibold">
                      🇪🇹 {formatEthiopianDate(formData.endDate, 'am')}
                    </p>
                  )}
                </div>
              </div>

              {/* Location & Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#CBB39C] font-semibold">{t('locationVenue')}</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Auditorium / Classrooms"
                    className="w-full bg-[#1D0C05] border border-[#4A2612] text-[#FDF8F3] p-2.5 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#CBB39C] font-semibold">{t('targetAudience')}</label>
                  <select
                    value={formData.targetAudience || 'ALL'}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                    className="w-full bg-[#1D0C05] border border-[#4A2612] text-[#FDF8F3] p-2.5 rounded-xl outline-none"
                  >
                    <option value="ALL">{t('audienceAll')}</option>
                    <option value="STUDENTS">{t('audienceStudents')}</option>
                    <option value="TEACHERS">{t('audienceTeachers')}</option>
                    <option value="PARENTS">{t('audienceParents')}</option>
                    <option value="ADMIN">{t('audienceAdmin')}</option>
                  </select>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-1">
                <label className="text-[#CBB39C] font-semibold">{t('eventDescription')}</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed guidelines, instructions, or notes..."
                  className="w-full bg-[#1D0C05] border border-[#4A2612] text-[#FDF8F3] p-2.5 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#CBB39C] font-semibold">{t('eventAmharicDescription')}</label>
                <textarea
                  rows={2}
                  value={formData.amharicDescription || ''}
                  onChange={(e) => setFormData({ ...formData, amharicDescription: e.target.value })}
                  placeholder="ዝርዝር መግለጫ በአማርኛ..."
                  className="w-full bg-[#1D0C05] border border-[#4A2612] text-[#FDF8F3] p-2.5 rounded-xl outline-none font-amharic"
                />
              </div>

              {/* High Priority Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={Boolean(formData.isImportant)}
                  onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                  className="w-4 h-4 rounded border-[#4A2612] text-[#F5A623] focus:ring-[#F5A623] bg-[#1D0C05]"
                />
                <span className="text-[#FDF8F3] font-semibold">{t('markAsImportant')}</span>
              </label>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#4A2612]">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1D0C05] hover:bg-[#3A1E0E] text-[#CBB39C] font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#F5A623] to-[#E09015] text-[#27140B] font-bold shadow-md active:scale-95"
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
