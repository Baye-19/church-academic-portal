import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { AcademicClass, AttendanceRecord, AttendanceStatus, Student } from '../types';
import { formatEthiopianDate, formatEthiopianDateTime } from '../utils/ethiopianCalendar';
import { exportAttendanceToWord, exportAttendanceHistoryToWord } from '../utils/wordExport';
import {
  UserCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  History,
  Users,
  CheckCheck,
  Search,
  FileText,
  Download,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('cls-1');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Automatically keep date synced with current live system date
  useEffect(() => {
    const today = getTodayString();
    setSelectedDate(today);

    // Periodically update if day changes (e.g., midnight transition)
    const timer = setInterval(() => {
      const nowToday = getTodayString();
      setSelectedDate((prev) => (prev !== nowToday ? nowToday : prev));
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  const [activeTab, setActiveTab] = useState<'take' | 'history'>('take');
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Local state for current attendance sheet being taken
  // Map of studentId -> { status: AttendanceStatus, remark: string }
  const [sheetEntries, setSheetEntries] = useState<
    Record<string, { status: AttendanceStatus; remark: string }>
  >({});

  useEffect(() => {
    Promise.all([api.getClasses(), api.getStudents(), api.getAttendance(), api.getCourses()]).then(
      ([clsRes, stdRes, attRes, crsRes]) => {
        if (clsRes.success && clsRes.data.length > 0) {
          let availableClasses = clsRes.data;
          if (user?.role === 'TEACHER' && crsRes.success) {
            const myCourses = crsRes.data.filter(
              (c) => c.teacherId === user.id || c.teacherName === user.name
            );
            const myClassIds = new Set(myCourses.map((c) => c.classId));
            const filtered = clsRes.data.filter((c) => myClassIds.has(c.id));
            if (filtered.length > 0) {
              availableClasses = filtered;
            }
          }

          setClasses(availableClasses);
          if (!selectedClassId && availableClasses.length > 0) {
            setSelectedClassId(availableClasses[0].id);
          }
        }
        if (stdRes.success) {
          setStudents(stdRes.data);
        }
        if (attRes.success) {
          setAttendanceRecords(attRes.data);
        }
      }
    );
  }, [user]);

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // Filter students for the selected class level (ordered alphabetically)
  const classStudents = students
    .filter((s) => s.classId === selectedClassId || (selectedClass && s.className === selectedClass.name))
    .sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.trim().toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });

  // Load existing attendance for selectedClassId + selectedDate if it exists
  useEffect(() => {
    if (selectedClassId && selectedDate) {
      api.getAttendance(selectedClassId, selectedDate).then((res) => {
        if (res.success && res.data.length > 0) {
          const rec = res.data[0];
          const entryMap: Record<string, { status: AttendanceStatus; remark: string }> = {};
          rec.entries.forEach((e) => {
            entryMap[e.studentId] = {
              status: e.status,
              remark: e.remark || '',
            };
          });
          // Ensure newly registered students get default status while existing stay unchanged
          classStudents.forEach((std) => {
            if (!entryMap[std.id]) {
              entryMap[std.id] = { status: 'PRESENT', remark: '' };
            }
          });
          setSheetEntries(entryMap);
        } else {
          // Default all to PRESENT if taking for the first time
          const defaultMap: Record<string, { status: AttendanceStatus; remark: string }> = {};
          classStudents.forEach((std) => {
            defaultMap[std.id] = { status: 'PRESENT', remark: '' };
          });
          setSheetEntries(defaultMap);
        }
      });
    }
  }, [selectedClassId, selectedDate, students]);

  // Handle status toggle for a student
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setSheetEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { remark: '' }),
        status,
      },
    }));
  };

  const handleRemarkChange = (studentId: string, remark: string) => {
    setSheetEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'PRESENT' }),
        remark,
      },
    }));
  };

  // Bulk actions
  const handleMarkAll = (status: AttendanceStatus) => {
    const updatedMap: Record<string, { status: AttendanceStatus; remark: string }> = {};
    classStudents.forEach((std) => {
      updatedMap[std.id] = {
        status,
        remark: sheetEntries[std.id]?.remark || '',
      };
    });
    setSheetEntries(updatedMap);
  };

  // Statistics for current sheet
  const filteredStudents = classStudents.filter((std) => {
    const fullName = `${std.firstName} ${std.lastName} ${std.amharicName || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || std.studentId.toLowerCase().includes(searchQuery.toLowerCase());
  });

  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;

  classStudents.forEach((std) => {
    const st = sheetEntries[std.id]?.status || 'PRESENT';
    if (st === 'PRESENT') presentCount++;
    else if (st === 'ABSENT') absentCount++;
    else if (st === 'LATE') lateCount++;
    else if (st === 'EXCUSED') excusedCount++;
  });

  const totalStudents = classStudents.length;
  const attendanceRate = totalStudents > 0 ? Math.round(((presentCount + lateCount) / totalStudents) * 100) : 0;

  // Save Attendance Sheet
  const handleSaveAttendance = async () => {
    if (!selectedClass) return;
    setSaving(true);
    setMessage(null);

    const entries = classStudents.map((std) => ({
      studentId: std.id,
      studentCode: std.studentId,
      studentName: `${std.firstName} ${std.lastName}`,
      studentAmharicName: std.amharicName,
      status: sheetEntries[std.id]?.status || 'PRESENT',
      remark: sheetEntries[std.id]?.remark || '',
    }));

    const res = await api.saveAttendance({
      classId: selectedClass.id,
      className: selectedClass.name,
      section: 'A',
      date: selectedDate,
      takenByUserId: user?.id || 'usr-1',
      takenByUserName: user?.name || 'User',
      entries,
    });

    setSaving(false);
    if (res.success) {
      setMessage({
        type: 'success',
        text: t('amharic') === 'አማርኛ'
          ? 'የተማሪዎች መገኘት መረጃ በተሳካ ሁኔታ ተመዝግቧል!'
          : 'Student attendance saved successfully!',
      });
      // Refresh historical attendance list
      api.getAttendance().then((attRes) => {
        if (attRes.success) setAttendanceRecords(attRes.data);
      });
    } else {
      setMessage({
        type: 'danger',
        text: 'Failed to save attendance records.',
      });
    }
  };

  // Download Current Sheet as Word (.docx)
  const handleDownloadCurrentWordDoc = () => {
    if (!selectedClass) return;
    const entries = classStudents.map((std) => ({
      studentCode: std.studentId,
      studentName: `${std.firstName} ${std.lastName}`,
      studentAmharicName: std.amharicName,
      status: sheetEntries[std.id]?.status || 'PRESENT',
      remark: sheetEntries[std.id]?.remark || '',
    }));

    exportAttendanceToWord({
      className: selectedClass.name,
      classAmharicName: selectedClass.amharicName,
      date: selectedDate,
      recordedBy: user?.name || 'Class Teacher',
      entries,
      summary: {
        total: totalStudents,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        excused: excusedCount,
        rate: attendanceRate,
      },
      language: t('amharic') === 'አማርኛ' ? 'am' : 'en',
    });
  };

  // Download Single History Record as Word (.docx)
  const handleDownloadHistoryLogWordDoc = (rec: AttendanceRecord) => {
    if (!selectedClass) return;
    const pCount = rec.entries.filter((e) => e.status === 'PRESENT').length;
    const aCount = rec.entries.filter((e) => e.status === 'ABSENT').length;
    const lCount = rec.entries.filter((e) => e.status === 'LATE').length;
    const eCount = rec.entries.filter((e) => e.status === 'EXCUSED').length;
    const total = rec.entries.length;
    const rate = total > 0 ? Math.round(((pCount + lCount) / total) * 100) : 0;

    exportAttendanceToWord({
      className: selectedClass.name,
      classAmharicName: selectedClass.amharicName,
      date: rec.date,
      recordedBy: rec.takenByUserName || user?.name || 'Teacher',
      entries: rec.entries.map((e) => ({
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
      language: t('amharic') === 'አማርኛ' ? 'am' : 'en',
    });
  };

  // Download All History Logs as Word (.docx)
  const handleDownloadAllHistoryWordDoc = () => {
    if (!selectedClass || historyForClass.length === 0) return;
    exportAttendanceHistoryToWord({
      className: selectedClass.name,
      classAmharicName: selectedClass.amharicName,
      historyRecords: historyForClass,
      language: t('amharic') === 'አማርኛ' ? 'am' : 'en',
    });
  };

  // Historical Attendance Filtered for selectedClass
  const historyForClass = attendanceRecords.filter((a) => a.classId === selectedClassId);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 text-[#F7E5C8]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#4A2715]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#F5A623]" />
            <span>{t('amharic') === 'አማርኛ' ? 'የተማሪዎች መገኘት መከታተያ' : 'Student Attendance Tracking'}</span>
          </h2>
          <p className="text-xs text-[#CBB39C] mt-1">
            {t('amharic') === 'አማርኛ'
              ? 'የክፍል ተማሪዎችን ዕለታዊ የመገኘት ሁኔታ መከታተያ እና መመዝገቢያ'
              : 'Track daily student attendance, absences, and historical statistics per class level.'}
          </p>
        </div>

        {/* Controls: Class Selector & Date Picker */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-[#27140B] border border-[#5C321B] rounded-xl px-3 py-1.5 shadow">
            <Users className="w-4 h-4 text-[#F5A623]" />
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id} className="bg-[#27140B] text-white">
                  {cls.name} ({cls.amharicName})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#27140B] border border-[#5C321B] rounded-xl px-3 py-1.5 shadow">
            <Calendar className="w-4 h-4 text-[#F5A623]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none"
            />
            {selectedDate !== getTodayString() && (
              <button
                type="button"
                onClick={() => setSelectedDate(getTodayString())}
                className="ml-1 px-2 py-0.5 bg-[#E5921A] hover:bg-[#FBB03B] text-[#1E0C04] font-bold text-[10px] rounded transition"
                title="Reset to Today's Live Date"
              >
                {t('amharic') === 'አማርኛ' ? 'ዛሬ' : 'Today'}
              </button>
            )}
          </div>
          {/* Ethiopian Date Badge */}
          <div className="flex items-center gap-1.5 bg-[#351909] border border-[#F5A623]/40 rounded-xl px-3 py-1.5 text-xs text-[#FBB03B] font-bold shadow">
            <span>🇪🇹 {formatEthiopianDate(selectedDate, t('amharic') === 'አማርኛ' ? 'am' : 'en', true)}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#4A2715] pb-2">
        <button
          onClick={() => setActiveTab('take')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'take'
              ? 'bg-[#E5921A] text-[#1E0C04] shadow-lg'
              : 'bg-[#27140B] text-[#CBB39C] hover:text-white border border-[#522B17]'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>{t('amharic') === 'አማርኛ' ? 'መገኘት መዝግብ' : 'Mark Attendance'}</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-[#E5921A] text-[#1E0C04] shadow-lg'
              : 'bg-[#27140B] text-[#CBB39C] hover:text-white border border-[#522B17]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>
            {t('amharic') === 'አማርኛ' ? 'የመገኘት ታሪክ እና ሪፖርት' : 'Attendance History & Logs'} ({historyForClass.length})
          </span>
        </button>
      </div>

      {activeTab === 'take' ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Summary Statistics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-[#27140B] border border-[#522B17] rounded-xl shadow">
              <span className="text-[10px] font-bold text-[#CBB39C] uppercase">Total Enrolled</span>
              <h3 className="text-lg font-bold text-white mt-0.5">{totalStudents}</h3>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl shadow">
              <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Present</span>
              </span>
              <h3 className="text-lg font-bold text-emerald-400 mt-0.5">{presentCount}</h3>
            </div>

            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl shadow">
              <span className="text-[10px] font-bold text-rose-400 uppercase flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                <span>Absent</span>
              </span>
              <h3 className="text-lg font-bold text-rose-400 mt-0.5">{absentCount}</h3>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl shadow">
              <span className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Late</span>
              </span>
              <h3 className="text-lg font-bold text-amber-400 mt-0.5">{lateCount}</h3>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl shadow">
              <span className="text-[10px] font-bold text-blue-400 uppercase flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Excused</span>
              </span>
              <h3 className="text-lg font-bold text-blue-400 mt-0.5">{excusedCount}</h3>
            </div>

            <div className="p-3 bg-[#27140B] border border-[#522B17] rounded-xl shadow">
              <span className="text-[10px] font-bold text-[#F5A623] uppercase">Attendance %</span>
              <h3 className="text-lg font-bold text-[#F5A623] mt-0.5">{attendanceRate}%</h3>
            </div>
          </div>

          {message && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{message.text}</span>
            </div>
          )}

          {/* Table Toolbar & Search */}
          <div className="bg-[#27140B] border border-[#522B17] rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 bg-[#180B05] border-b border-[#4A2715] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#CBB39C] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student..."
                  className="w-full pl-9 pr-3 py-1.5 bg-[#27140B] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                />
              </div>

              {/* Quick Bulk Actions & Word Export */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[#CBB39C] font-semibold hidden sm:inline">Bulk Actions:</span>
                <button
                  type="button"
                  onClick={() => handleMarkAll('PRESENT')}
                  className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark All Present</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll('ABSENT')}
                  className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Mark All Absent</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCurrentWordDoc}
                  disabled={classStudents.length === 0}
                  className="px-3 py-1 bg-[#351909] hover:bg-[#4A240E] text-[#F7E5C8] border border-[#F5A623]/50 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
                  title="Download Current Attendance Sheet as Microsoft Word .docx"
                >
                  <FileText className="w-3.5 h-3.5 text-[#F5A623]" />
                  <span>{t('exportWord')}</span>
                </button>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#F7E5C8] border-collapse">
                <thead className="bg-[#180B05] text-[#CBB39C] font-semibold uppercase tracking-wider border-b border-[#4A2715]">
                  <tr>
                    <th className="p-3 text-center min-w-[50px]">#</th>
                    <th className="p-3 min-w-[120px]">Student ID</th>
                    <th className="p-3 min-w-[180px]">Student Name</th>
                    <th className="p-3 min-w-[320px] text-center">Attendance Status</th>
                    <th className="p-3 min-w-[180px]">Remarks / Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3A1E10]">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-xs text-[#CBB39C]">
                        No registered students found for {selectedClass?.name || 'this class'}.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((std, idx) => {
                      const currentStatus = sheetEntries[std.id]?.status || 'PRESENT';
                      const currentRemark = sheetEntries[std.id]?.remark || '';

                      return (
                        <tr key={std.id} className="hover:bg-[#351C0F]/60 transition">
                          <td className="p-3 text-center text-[#CBB39C] font-mono">{idx + 1}</td>
                          <td className="p-3 font-mono font-bold text-[#F5A623]">{std.studentId}</td>
                          <td className="p-3 font-semibold text-white">
                            <div>{std.firstName} {std.lastName}</div>
                            <div className="text-[10px] text-[#CBB39C]">{std.amharicName}</div>
                          </td>

                          {/* Interactive Status Selector Buttons */}
                          <td className="p-3 text-center">
                            <div className="inline-flex flex-wrap items-center justify-center gap-1.5 p-1 bg-[#180B05] rounded-xl border border-[#522B17]">
                              <button
                                type="button"
                                onClick={() => handleStatusChange(std.id, 'PRESENT')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 ${
                                  currentStatus === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow'
                                    : 'text-[#CBB39C] hover:text-white'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Present</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStatusChange(std.id, 'ABSENT')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 ${
                                  currentStatus === 'ABSENT'
                                    ? 'bg-rose-600 text-white shadow'
                                    : 'text-[#CBB39C] hover:text-white'
                                }`}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Absent</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStatusChange(std.id, 'LATE')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 ${
                                  currentStatus === 'LATE'
                                    ? 'bg-amber-600 text-white shadow'
                                    : 'text-[#CBB39C] hover:text-white'
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Late</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStatusChange(std.id, 'EXCUSED')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 ${
                                  currentStatus === 'EXCUSED'
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'text-[#CBB39C] hover:text-white'
                                }`}
                              >
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Excused</span>
                              </button>
                            </div>
                          </td>

                          {/* Remarks */}
                          <td className="p-3">
                            <input
                              type="text"
                              value={currentRemark}
                              onChange={(e) => handleRemarkChange(std.id, e.target.value)}
                              placeholder="e.g., Medical leave, Permitted..."
                              className="w-full px-2.5 py-1 bg-[#180B05] border border-[#5C321B] rounded-lg text-xs text-white focus:outline-none focus:border-[#F5A623]"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Save Action & Word Export */}
            <div className="p-4 bg-[#180B05] border-t border-[#4A2715] flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-xs text-[#CBB39C]">
                {t('amharic') === 'አማርኛ' ? 'ቀን' : 'Date'}: <strong className="text-white">{formatEthiopianDate(selectedDate, t('amharic') === 'አማርኛ' ? 'am' : 'en', true)}</strong> ({selectedDate}) • {t('amharic') === 'አማርኛ' ? 'ክፍል' : 'Class'}: <strong className="text-[#F5A623]">{selectedClass?.name}</strong>
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadCurrentWordDoc}
                  disabled={classStudents.length === 0}
                  className="px-4 py-2.5 bg-[#351909] hover:bg-[#4A240E] text-[#F7E5C8] border border-[#5C321B] hover:border-[#F5A623] font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-[#F5A623]" />
                  <span>{t('exportWord')}</span>
                </button>

                <button
                  type="button"
                  disabled={saving || classStudents.length === 0}
                  onClick={handleSaveAttendance}
                  className="px-6 py-2.5 bg-[#E5921A] hover:bg-[#FBB03B] text-[#1E0C04] font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Attendance Record</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Historical Attendance Tab */
        <div className="space-y-4">
          <div className="bg-[#27140B] border border-[#522B17] rounded-2xl shadow-xl p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#4A2715] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-[#F5A623]" />
                <span>Historical Attendance Logs ({selectedClass?.name})</span>
              </h3>

              {historyForClass.length > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadAllHistoryWordDoc}
                  className="px-3 py-1.5 bg-[#351909] hover:bg-[#4A240E] text-[#F7E5C8] border border-[#F5A623]/50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5 text-[#F5A623]" />
                  <span>{t('amharic') === 'አማርኛ' ? 'ሁሉንም በ Word (.docx) አውርድ' : 'Download All History (.docx)'}</span>
                </button>
              )}
            </div>

            {historyForClass.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#CBB39C] bg-[#180B05]/50 border border-[#522B17] rounded-xl">
                No historical attendance records saved for {selectedClass?.name} yet.
              </div>
            ) : (
              <div className="space-y-3">
                {historyForClass.map((rec) => {
                  const pCount = rec.entries.filter((e) => e.status === 'PRESENT').length;
                  const aCount = rec.entries.filter((e) => e.status === 'ABSENT').length;
                  const lCount = rec.entries.filter((e) => e.status === 'LATE').length;
                  const eCount = rec.entries.filter((e) => e.status === 'EXCUSED').length;
                  const rate = rec.entries.length > 0 ? Math.round(((pCount + lCount) / rec.entries.length) * 100) : 0;

                  return (
                    <div
                      key={rec.id}
                      className="p-4 bg-[#180B05] border border-[#5C321B] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                    >
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#F5A623]" />
                          <span>{t('amharic') === 'አማርኛ' ? 'ቀን' : 'Date'}: {formatEthiopianDate(rec.date, t('amharic') === 'አማርኛ' ? 'am' : 'en', true)}</span>
                          <span className="text-[11px] text-[#CBB39C] font-normal">
                            ({rec.date} • {t('amharic') === 'አማርኛ' ? 'የመዘገበው' : 'Taken by'}: {rec.takenByUserName})
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                          <span className="text-emerald-400 font-semibold">Present: {pCount}</span>
                          <span className="text-rose-400 font-semibold">Absent: {aCount}</span>
                          <span className="text-amber-400 font-semibold">Late: {lCount}</span>
                          <span className="text-blue-400 font-semibold">Excused: {eCount}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-[#27140B] text-[#F5A623] border border-[#522B17] rounded-lg font-bold text-xs">
                          Rate: {rate}%
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDownloadHistoryLogWordDoc(rec)}
                          className="px-3 py-1.5 bg-[#27140B] hover:bg-[#351909] text-[#F7E5C8] border border-[#5C321B] hover:border-[#F5A623] rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
                          title="Download this date log as Microsoft Word .docx"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#F5A623]" />
                          <span>Word (.docx)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
