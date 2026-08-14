import React, { useState, useMemo } from 'react';
import { AcademicClass, AttendanceRecord, AttendanceStatus, Student, User } from '../types';
import { formatEthiopianDate, gregorianToEthiopian } from '../utils/ethiopianCalendar';
import { exportAttendanceToWord, exportAttendanceHistoryToWord } from '../utils/wordExport';
import {
  FileText,
  Calendar,
  Download,
  X,
  CheckCircle2,
  Clock,
  Filter,
  Check,
  AlertCircle,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  classes: AcademicClass[];
  selectedClassId: string;
  onClassChange?: (classId: string) => void;
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  currentSelectedDate: string;
  currentSheetEntries: Record<string, { status: AttendanceStatus; remark?: string }>;
  currentUser: User | null;
  appLanguage?: 'en' | 'am';
}

export const AttendanceDownloadModal: React.FC<Props> = ({
  isOpen,
  onClose,
  classes,
  selectedClassId,
  onClassChange,
  students,
  attendanceRecords,
  currentSelectedDate,
  currentSheetEntries,
  currentUser,
  appLanguage = 'am',
}) => {
  if (!isOpen) return null;

  const [classId, setClassId] = useState<string>(selectedClassId);
  const [downloadMode, setDownloadMode] = useState<'single' | 'range'>('single');
  const [targetDate, setTargetDate] = useState<string>(currentSelectedDate);
  const [docLanguage, setDocLanguage] = useState<'am' | 'en'>(appLanguage);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Date range states
  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const [startDate, setStartDate] = useState<string>(firstDayOfMonth);
  const [endDate, setEndDate] = useState<string>(todayStr);

  const selectedClass = classes.find((c) => c.id === classId) || classes[0];

  // Students for chosen class, sorted alphabetically
  const classStudents = useMemo(() => {
    return students
      .filter((s) => s.classId === classId || (selectedClass && s.className === selectedClass.name))
      .sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.trim().toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.trim().toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [students, classId, selectedClass]);

  // Saved records for this class
  const classHistory = useMemo(() => {
    return attendanceRecords
      .filter((r) => r.classId === classId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [attendanceRecords, classId]);

  // Check if targetDate has a saved record
  const matchingSavedRecord = useMemo(() => {
    return classHistory.find((r) => r.date === targetDate);
  }, [classHistory, targetDate]);

  // Filtered records for date range mode
  const rangeRecords = useMemo(() => {
    return classHistory
      .filter((r) => r.date >= startDate && r.date <= endDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [classHistory, startDate, endDate]);

  // Ethiopian date previews
  const targetEthDate = formatEthiopianDate(targetDate, docLanguage, true);
  const startEthDate = formatEthiopianDate(startDate, docLanguage, true);
  const endEthDate = formatEthiopianDate(endDate, docLanguage, true);

  const handleDownload = async () => {
    if (!selectedClass || isExporting) return;
    setIsExporting(true);

    try {
      if (downloadMode === 'single') {
        // Case 1: Downloading for current active sheet date
        if (targetDate === currentSelectedDate && !matchingSavedRecord) {
          const entries = classStudents.map((std) => ({
            studentCode: std.studentId,
            studentName: `${std.firstName} ${std.lastName}`,
            studentAmharicName: std.amharicName,
            status: currentSheetEntries[std.id]?.status || ('PRESENT' as AttendanceStatus),
            remark: currentSheetEntries[std.id]?.remark || '',
          }));

          const pCount = entries.filter((e) => e.status === 'PRESENT').length;
          const aCount = entries.filter((e) => e.status === 'ABSENT').length;
          const lCount = entries.filter((e) => e.status === 'LATE').length;
          const eCount = entries.filter((e) => e.status === 'EXCUSED').length;
          const total = entries.length;
          const rate = total > 0 ? Math.round(((pCount + lCount) / total) * 100) : 0;

          await exportAttendanceToWord({
            className: selectedClass.name,
            classAmharicName: selectedClass.amharicName,
            date: targetDate,
            recordedBy: currentUser?.name || 'Class Teacher',
            entries,
            summary: {
              total,
              present: pCount,
              absent: aCount,
              late: lCount,
              excused: eCount,
              rate,
            },
            language: docLanguage,
          });
        } else if (matchingSavedRecord) {
          // Case 2: Downloading a previously saved historical record
          const pCount = matchingSavedRecord.entries.filter((e) => e.status === 'PRESENT').length;
          const aCount = matchingSavedRecord.entries.filter((e) => e.status === 'ABSENT').length;
          const lCount = matchingSavedRecord.entries.filter((e) => e.status === 'LATE').length;
          const eCount = matchingSavedRecord.entries.filter((e) => e.status === 'EXCUSED').length;
          const total = matchingSavedRecord.entries.length;
          const rate = total > 0 ? Math.round(((pCount + lCount) / total) * 100) : 0;

          await exportAttendanceToWord({
            className: selectedClass.name,
            classAmharicName: selectedClass.amharicName,
            date: targetDate,
            recordedBy: matchingSavedRecord.takenByUserName || currentUser?.name || 'Teacher',
            entries: matchingSavedRecord.entries.map((e) => ({
              studentCode: e.studentCode,
              studentName: e.studentName,
              studentAmharicName: e.studentAmharicName,
              status: e.status,
              remark: e.remark,
            })),
            summary: {
              total,
              present: pCount,
              absent: aCount,
              late: lCount,
              excused: eCount,
              rate,
            },
            language: docLanguage,
          });
        } else {
          // Case 3: Downloading for any other date that has no saved logs yet (Blank / Ready Register)
          const entries = classStudents.map((std) => ({
            studentCode: std.studentId,
            studentName: `${std.firstName} ${std.lastName}`,
            studentAmharicName: std.amharicName,
            status: 'PRESENT' as AttendanceStatus,
            remark: '',
          }));

          await exportAttendanceToWord({
            className: selectedClass.name,
            classAmharicName: selectedClass.amharicName,
            date: targetDate,
            recordedBy: currentUser?.name || 'Class Teacher',
            entries,
            summary: {
              total: entries.length,
              present: entries.length,
              absent: 0,
              late: 0,
              excused: 0,
              rate: 100,
            },
            language: docLanguage,
          });
        }
      } else {
        // Multi-Day Date Range Download
        if (rangeRecords.length === 0) {
          alert('No attendance sessions found in the selected date range.');
          setIsExporting(false);
          return;
        }

        await exportAttendanceHistoryToWord({
          className: selectedClass.name,
          classAmharicName: selectedClass.amharicName,
          historyRecords: rangeRecords,
          language: docLanguage,
        });
      }

      onClose();
    } catch (err) {
      console.error('Error generating Word document:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-[#1E0E06] border border-[#F5A623]/40 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#27140B] border-b border-[#4A2715] flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#F5A623]/20 border border-[#F5A623]/50 rounded-xl text-[#F5A623]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {appLanguage === 'am' ? 'የመገኘት ሰነድ ማውረጃ (Word .docx)' : 'Download Attendance Document (.docx)'}
              </h3>
              <p className="text-xs text-[#CBB39C]">
                {appLanguage === 'am'
                  ? 'የሚፈልጉትን ቀን ወይም የቀናት ክልል መርጠው በ Word (.docx) ያውርዱ'
                  : 'Select the exact date or date range you want to export into Word (.docx)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#CBB39C] hover:text-white hover:bg-[#351909] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* Class Selector & Mode Switch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#CBB39C] mb-1.5">
                {appLanguage === 'am' ? 'ክፍል / Class' : 'Target Class'}
              </label>
              <select
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value);
                  if (onClassChange) onClassChange(e.target.value);
                }}
                className="w-full px-3 py-2 bg-[#27140B] border border-[#5C321B] rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id} className="bg-[#1E0E06]">
                    {cls.name} ({cls.amharicName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#CBB39C] mb-1.5">
                {appLanguage === 'am' ? 'የሰነድ ቋንቋ / Document Language' : 'Document Language'}
              </label>
              <div className="flex bg-[#27140B] border border-[#5C321B] rounded-xl p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setDocLanguage('am')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                    docLanguage === 'am'
                      ? 'bg-[#E5921A] text-[#1E0C04] shadow'
                      : 'text-[#CBB39C] hover:text-white'
                  }`}
                >
                  አማርኛ (Amharic)
                </button>
                <button
                  type="button"
                  onClick={() => setDocLanguage('en')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                    docLanguage === 'en'
                      ? 'bg-[#E5921A] text-[#1E0C04] shadow'
                      : 'text-[#CBB39C] hover:text-white'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>

          {/* Export Mode Tabs */}
          <div className="flex bg-[#120703] border border-[#4A2715] p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setDownloadMode('single')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                downloadMode === 'single'
                  ? 'bg-[#F5A623] text-[#180B05] shadow'
                  : 'text-[#CBB39C] hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{appLanguage === 'am' ? 'የአንድ ቀን መዝገብ (Single Date)' : 'Specific Date Register'}</span>
            </button>
            <button
              type="button"
              onClick={() => setDownloadMode('range')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                downloadMode === 'range'
                  ? 'bg-[#F5A623] text-[#180B05] shadow'
                  : 'text-[#CBB39C] hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{appLanguage === 'am' ? 'የቀናት ክልል ታሪክ (Date Range)' : 'Date Range Report'}</span>
            </button>
          </div>

          {/* MODE 1: SINGLE DATE PICKER */}
          {downloadMode === 'single' ? (
            <div className="space-y-4 bg-[#27140B] border border-[#522B17] rounded-xl p-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#F5A623]" />
                    <span>{appLanguage === 'am' ? 'የሚወርደውን ቀን ይምረጡ / Select Date to Download:' : 'Select Target Date:'}</span>
                  </span>
                  <span className="text-[11px] text-[#F5A623] font-mono">
                    🇪🇹 {targetEthDate}
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-[#180B05] border border-[#5C321B] rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                  />
                  {targetDate !== todayStr && (
                    <button
                      type="button"
                      onClick={() => setTargetDate(todayStr)}
                      className="px-3 py-2.5 bg-[#351909] hover:bg-[#4A240E] text-[#F5A623] border border-[#F5A623]/40 rounded-xl text-xs font-bold transition"
                    >
                      {appLanguage === 'am' ? 'ዛሬ' : 'Today'}
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Date Selector Chips from Recorded History */}
              {classHistory.length > 0 && (
                <div>
                  <span className="block text-[11px] font-bold text-[#CBB39C] mb-1.5">
                    {appLanguage === 'am' ? 'ቀደም ሲል የተመዘገቡ ቀናት (Quick Pick):' : 'Saved Attendance Dates (Quick Select):'}
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {classHistory.map((rec) => {
                      const isSelected = rec.date === targetDate;
                      const eth = formatEthiopianDate(rec.date, docLanguage, true);
                      return (
                        <button
                          key={rec.id}
                          type="button"
                          onClick={() => setTargetDate(rec.date)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#F5A623] text-[#1E0C04] font-bold shadow'
                              : 'bg-[#180B05] text-[#CBB39C] hover:text-white border border-[#4A2715]'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{rec.date}</span>
                          <span className="text-[10px] opacity-75">({eth})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Status Badge for Target Date */}
              <div className="p-3 bg-[#180B05] border border-[#4A2715] rounded-xl text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#CBB39C]">Selected Class & Roster:</span>
                  <span className="font-bold text-white">
                    {selectedClass.name} ({classStudents.length} Students)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#CBB39C]">Status for {targetDate}:</span>
                  {matchingSavedRecord ? (
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Saved Record Found ({matchingSavedRecord.entries.length} students)</span>
                    </span>
                  ) : targetDate === currentSelectedDate ? (
                    <span className="font-bold text-[#F5A623] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Current Active Sheet</span>
                    </span>
                  ) : (
                    <span className="font-bold text-blue-400 flex items-center gap-1">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Official Register Template (Alphabetical)</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* MODE 2: DATE RANGE PICKER */
            <div className="space-y-4 bg-[#27140B] border border-[#522B17] rounded-xl p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white mb-1 flex items-center justify-between">
                    <span>{appLanguage === 'am' ? 'የመጀመሪያ ቀን (From):' : 'Start Date:'}</span>
                    <span className="text-[10px] text-[#F5A623]">{startEthDate}</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1 flex items-center justify-between">
                    <span>{appLanguage === 'am' ? 'የመጨረሻ ቀን (To):' : 'End Date:'}</span>
                    <span className="text-[10px] text-[#F5A623]">{endEthDate}</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>
              </div>

              {/* Quick Range Presets */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStartDate(firstDayOfMonth);
                    setEndDate(todayStr);
                  }}
                  className="px-2.5 py-1 bg-[#180B05] hover:bg-[#351909] text-[#CBB39C] hover:text-white border border-[#4A2715] rounded-lg transition text-[11px]"
                >
                  This Month
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 7);
                    setStartDate(d.toISOString().split('T')[0]);
                    setEndDate(todayStr);
                  }}
                  className="px-2.5 py-1 bg-[#180B05] hover:bg-[#351909] text-[#CBB39C] hover:text-white border border-[#4A2715] rounded-lg transition text-[11px]"
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 30);
                    setStartDate(d.toISOString().split('T')[0]);
                    setEndDate(todayStr);
                  }}
                  className="px-2.5 py-1 bg-[#180B05] hover:bg-[#351909] text-[#CBB39C] hover:text-white border border-[#4A2715] rounded-lg transition text-[11px]"
                >
                  Last 30 Days
                </button>
                {classHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const dates = classHistory.map((r) => r.date).sort();
                      setStartDate(dates[0]);
                      setEndDate(dates[dates.length - 1]);
                    }}
                    className="px-2.5 py-1 bg-[#180B05] hover:bg-[#351909] text-[#CBB39C] hover:text-white border border-[#4A2715] rounded-lg transition text-[11px]"
                  >
                    All Recorded Time
                  </button>
                )}
              </div>

              {/* Range Match Count */}
              <div className="p-3 bg-[#180B05] border border-[#4A2715] rounded-xl text-xs flex justify-between items-center">
                <span className="text-[#CBB39C]">Matching Recorded Sessions:</span>
                <span className="font-bold text-[#F5A623]">
                  {rangeRecords.length} session{rangeRecords.length === 1 ? '' : 's'} found
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#27140B] border-t border-[#4A2715] flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs text-[#CBB39C] text-center sm:text-left">
            <span className="font-semibold text-white">
              {downloadMode === 'single' ? `Date: ${targetDate}` : `${startDate} → ${endDate}`}
            </span>{' '}
            • {selectedClass.name}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 bg-[#180B05] hover:bg-[#351909] text-[#CBB39C] hover:text-white border border-[#522B17] rounded-xl text-xs font-bold transition"
            >
              {appLanguage === 'am' ? 'ሰርዝ' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting || (downloadMode === 'range' && rangeRecords.length === 0)}
              className="flex-1 sm:flex-none px-5 py-2 bg-gradient-to-r from-[#E5921A] to-[#F5A623] hover:from-[#F5A623] hover:to-[#FBB03B] text-[#1E0C04] font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                {isExporting
                  ? appLanguage === 'am'
                    ? 'በማዘጋጀት ላይ...'
                    : 'Generating Word File...'
                  : appLanguage === 'am'
                  ? 'በ Word (.docx) አውርድ'
                  : 'Download Word (.docx)'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
