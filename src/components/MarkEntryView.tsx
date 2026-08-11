import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Course, Student, AssessmentColumn } from '../types';
import {
  FileSpreadsheet,
  Save,
  Send,
  AlertTriangle,
  Lock,
  CheckCircle2,
  TrendingUp,
  Sliders,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

export const MarkEntryView: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const isAdminOrDeptHead = user?.role === 'ADMIN' || user?.role === 'DEPT_HEAD';

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [markEntries, setMarkEntries] = useState<Record<string, any>>({});
  const [courseStatus, setCourseStatus] = useState<string>('DRAFT');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Column Configuration Modal State for Admin / Dept Head
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [tempColumns, setTempColumns] = useState<AssessmentColumn[]>([]);

  useEffect(() => {
    Promise.all([api.getCourses(), api.getStudents()]).then(([crsRes, stdRes]) => {
      if (crsRes.success && crsRes.data.length > 0) {
        // Teachers ONLY see courses they teach!
        const available =
          user?.role === 'TEACHER'
            ? crsRes.data.filter(
                (c) => c.teacherId === user.id || c.teacherName === user.name
              )
            : crsRes.data;

        setCourses(available);
        if (available.length > 0) {
          setSelectedCourseId(available[0].id);
        }
      }
      if (stdRes.success) {
        setStudents(stdRes.data);
      }
    });
  }, [user]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  // Helper to resolve active assessment columns for selected course
  const activeColumns: AssessmentColumn[] = selectedCourse?.assessmentColumns?.length
    ? selectedCourse.assessmentColumns
    : [
        { id: 'assignment', name: 'Assignment', maxMark: selectedCourse?.maxAssignment || 15 },
        { id: 'quiz', name: 'Quiz', maxMark: selectedCourse?.maxQuiz || 10 },
        { id: 'midterm', name: 'Midterm', maxMark: selectedCourse?.maxMidterm || 25 },
        { id: 'final', name: 'Final Exam', maxMark: selectedCourse?.maxFinal || 50 },
      ];

  useEffect(() => {
    if (selectedCourseId) {
      api.getMarks(selectedCourseId).then((res) => {
        if (res.success && res.data) {
          const entryMap: Record<string, any> = {};
          let statusFound = 'DRAFT';
          let reasonFound = '';

          const courseStudents = students.filter(
            (s) => !selectedCourse || s.classId === selectedCourse.classId
          );

          courseStudents.forEach((std) => {
            const existing = res.data.find((m) => m.studentId === std.id);
            if (existing) {
              entryMap[std.id] = {
                assignment: existing.assignment || 0,
                quiz: existing.quiz || 0,
                midterm: existing.midterm || 0,
                final: existing.final || 0,
                customMarks: existing.customMarks || {},
              };
              statusFound = existing.status;
              if (existing.rejectionReason) reasonFound = existing.rejectionReason;
            } else {
              entryMap[std.id] = { assignment: 0, quiz: 0, midterm: 0, final: 0, customMarks: {} };
            }
          });

          setMarkEntries(entryMap);
          setCourseStatus(statusFound);
          setRejectionReason(reasonFound);
        }
      });
    }
  }, [selectedCourseId, students]);

  if (!selectedCourse) {
    return (
      <div className="p-12 text-center bg-[#27140B] border border-[#522B17] rounded-2xl shadow-xl m-6 text-[#F7E5C8]">
        <FileSpreadsheet className="w-12 h-12 text-[#F5A623] mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">No Assigned Courses Found</h3>
        <p className="text-xs text-[#CBB39C] mt-1 max-w-md mx-auto">
          {user?.role === 'TEACHER'
            ? 'You are currently not assigned to teach any courses. Please contact the Academic Admin or Department Head.'
            : 'Please select or add a course to start entering student marks.'}
        </p>
      </div>
    );
  }

  const courseStudents = students.filter((s) => s.classId === selectedCourse.classId);

  // Maximum total possible score across all active columns
  const maxTotalScore = activeColumns.reduce((acc, col) => acc + Number(col.maxMark || 0), 0);

  const getStudentColumnValue = (entry: any, colId: string): number => {
    if (colId === 'assignment') return Number(entry?.assignment || 0);
    if (colId === 'quiz') return Number(entry?.quiz || 0);
    if (colId === 'midterm') return Number(entry?.midterm || 0);
    if (colId === 'final') return Number(entry?.final || 0);
    return Number(entry?.customMarks?.[colId] || 0);
  };

  // Real-time Rank Map Calculation across all students in class
  const studentTotals = courseStudents.map((std) => {
    const entry = markEntries[std.id] || { assignment: 0, quiz: 0, midterm: 0, final: 0, customMarks: {} };
    let total = 0;
    activeColumns.forEach((col) => {
      total += getStudentColumnValue(entry, col.id);
    });
    return { stdId: std.id, total };
  });

  const sortedTotals = [...studentTotals].sort((a, b) => b.total - a.total);

  const rankMap: Record<string, number> = {};
  let currentRank = 1;
  sortedTotals.forEach((item, index) => {
    if (index > 0 && item.total < sortedTotals[index - 1].total) {
      currentRank = index + 1;
    }
    rankMap[item.stdId] = currentRank;
  });

  // Calculate Overall Class Summary Metrics
  const totalsList = studentTotals.map((s) => s.total);
  const classAvg = totalsList.length > 0 ? (totalsList.reduce((a, b) => a + b, 0) / totalsList.length).toFixed(1) : '0';
  const highestScore = totalsList.length > 0 ? Math.max(...totalsList) : 0;
  const lowestScore = totalsList.length > 0 ? Math.min(...totalsList) : 0;

  const calculateTotalAndGrade = (entry: any) => {
    let total = 0;
    activeColumns.forEach((col) => {
      total += getStudentColumnValue(entry, col.id);
    });

    let grade = 'F';
    let point = 0.0;

    if (total >= 90) {
      grade = 'A+';
      point = 4.0;
    } else if (total >= 85) {
      grade = 'A';
      point = 4.0;
    } else if (total >= 80) {
      grade = 'B+';
      point = 3.5;
    } else if (total >= 75) {
      grade = 'B';
      point = 3.0;
    } else if (total >= 70) {
      grade = 'C+';
      point = 2.5;
    } else if (total >= 65) {
      grade = 'C';
      point = 2.0;
    } else if (total >= 50) {
      grade = 'D';
      point = 1.0;
    }

    return { total, grade, point };
  };

  const handleCellChange = (studentId: string, colId: string, value: string) => {
    const num = Math.max(0, Number(value) || 0);
    setMarkEntries((prev) => {
      const currentEntry = prev[studentId] || { assignment: 0, quiz: 0, midterm: 0, final: 0, customMarks: {} };
      if (['assignment', 'quiz', 'midterm', 'final'].includes(colId)) {
        return {
          ...prev,
          [studentId]: {
            ...currentEntry,
            [colId]: num,
          },
        };
      } else {
        return {
          ...prev,
          [studentId]: {
            ...currentEntry,
            customMarks: {
              ...(currentEntry.customMarks || {}),
              [colId]: num,
            },
          },
        };
      }
    });
  };

  // Open Column Editor Modal for Admin & Dept Head
  const handleOpenColumnModal = () => {
    setTempColumns(JSON.parse(JSON.stringify(activeColumns)));
    setShowColumnModal(true);
  };

  const handleAddTempColumn = () => {
    const newCol: AssessmentColumn = {
      id: `col-${Date.now()}`,
      name: `Custom Assessment ${tempColumns.length + 1}`,
      maxMark: 10,
    };
    setTempColumns([...tempColumns, newCol]);
  };

  const handleRemoveTempColumn = (index: number) => {
    if (tempColumns.length <= 1) return;
    setTempColumns(tempColumns.filter((_, idx) => idx !== index));
  };

  const handleSaveColumns = async () => {
    if (!selectedCourse) return;
    setSaving(true);

    const res = await api.updateCourse(selectedCourse.id, {
      assessmentColumns: tempColumns,
    });

    setSaving(false);
    if (res.success) {
      setCourses((prev) =>
        prev.map((c) => (c.id === selectedCourse.id ? { ...c, assessmentColumns: tempColumns } : c))
      );
      setShowColumnModal(false);
      setMessage({
        type: 'success',
        text: 'Mark columns structure updated successfully!',
      });
    } else {
      setMessage({ type: 'danger', text: 'Failed to update mark columns structure.' });
    }
  };

  // Marks are ONLY locked when explicitly APPROVED by Admin / Coordinator
  const isLocked = courseStatus === 'APPROVED';

  const handleSave = async (isSubmit: boolean) => {
    setSaving(true);
    setMessage(null);

    const entriesArray = courseStudents.map((std) => {
      const entry = markEntries[std.id] || { assignment: 0, quiz: 0, midterm: 0, final: 0, customMarks: {} };
      return {
        studentId: std.id,
        studentCode: std.studentId,
        studentName: `${std.firstName} ${std.lastName}`,
        studentAmharicName: std.amharicName,
        assignment: entry.assignment || 0,
        quiz: entry.quiz || 0,
        midterm: entry.midterm || 0,
        final: entry.final || 0,
        customMarks: entry.customMarks || {},
      };
    });

    const res = await api.saveMarks(
      selectedCourseId,
      entriesArray,
      isSubmit,
      user?.id,
      user?.name
    );

    setSaving(false);
    if (res.success) {
      setMessage({
        type: 'success',
        text: isSubmit
          ? (t('amharic') === 'አማርኛ' ? 'ውጤቱ ለአስተዳዳሪው እና ለአስተባባሪው ገምጋሚ በተሳካ ሁኔታ ተልኳል! የአስተዳዳሪው ማረጋገጫ እስኪሰጥ ድረስ ማስተካከል ይቻላል::' : 'Student results submitted successfully to Admin & Coordinators! Marks remain editable until Admin locks approval.')
          : 'Draft saved successfully!',
      });
      if (isSubmit) setCourseStatus('SUBMITTED');
    } else {
      setMessage({ type: 'danger', text: 'Failed to save student marks.' });
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#4A2715]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-[#F5A623]" />
            <span>{t('markEntryTitle')}</span>
          </h2>
          <p className="text-xs text-[#CBB39C] mt-1">{t('markEntryDesc')}</p>
        </div>

        {/* Course Selection Dropdown & Column Editor for Admin / Dept Head */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {isAdminOrDeptHead && (
            <button
              onClick={handleOpenColumnModal}
              className="px-3.5 py-2 bg-[#351C0F] hover:bg-[#442413] text-[#F5A623] border border-[#5C321B] rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
              title="Configure column headers (Quiz->Test) or Add extra columns"
            >
              <Sliders className="w-4 h-4 text-[#F5A623]" />
              <span>Configure / Add Columns</span>
            </button>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-semibold text-[#F7E5C8] hidden sm:inline whitespace-nowrap">{t('selectCourse')}:</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 bg-[#27140B] border border-[#5C321B] rounded-xl text-xs font-bold text-[#F5A623] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50 shadow-lg truncate"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Real-time Performance Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3 sm:p-3.5 bg-[#27140B] border border-[#522B17] rounded-xl shadow-lg">
          <span className="text-[10px] font-bold text-[#CBB39C] uppercase tracking-wider">{t('classAverage')}</span>
          <h3 className="text-base sm:text-xl font-bold text-[#F5A623] mt-0.5">{classAvg} / {maxTotalScore}</h3>
          <span className="text-[10px] text-[#A68F7B]">Calculated Real-Time</span>
        </div>

        <div className="p-3 sm:p-3.5 bg-[#27140B] border border-[#522B17] rounded-xl shadow-lg">
          <span className="text-[10px] font-bold text-[#CBB39C] uppercase tracking-wider">{t('highestScore')}</span>
          <h3 className="text-base sm:text-xl font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
            <span>{highestScore}</span>
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </h3>
          <span className="text-[10px] text-[#A68F7B]">Top Mark Achieved</span>
        </div>

        <div className="p-3 sm:p-3.5 bg-[#27140B] border border-[#522B17] rounded-xl shadow-lg">
          <span className="text-[10px] font-bold text-[#CBB39C] uppercase tracking-wider">{t('lowestScore')}</span>
          <h3 className="text-base sm:text-xl font-bold text-amber-400 mt-0.5">{lowestScore}</h3>
          <span className="text-[10px] text-[#A68F7B]">Minimum Score</span>
        </div>

        <div className="p-3 sm:p-3.5 bg-[#27140B] border border-[#522B17] rounded-xl shadow-lg">
          <span className="text-[10px] font-bold text-[#CBB39C] uppercase tracking-wider">Total Students</span>
          <h3 className="text-base sm:text-xl font-bold text-white mt-0.5">{courseStudents.length}</h3>
          <span className="text-[10px] text-[#A68F7B]">Enrolled in {selectedCourse.classId}</span>
        </div>
      </div>

      {/* Submission Status Banners */}
      {courseStatus === 'REJECTED' && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-300 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <div className="font-bold text-rose-200">Revision Requested by Academic Coordinator / Admin</div>
            <p className="mt-0.5">{rejectionReason || 'Please review and adjust student marks before resubmitting.'}</p>
          </div>
        </div>
      )}

      {courseStatus === 'APPROVED' && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-[#F5A623] text-xs font-semibold">
          <Lock className="w-5 h-5 text-[#F5A623] shrink-0" />
          <span>Marks have been APPROVED and officially LOCKED by the Academic Admin / Coordinator. Editing is now locked.</span>
        </div>
      )}

      {(courseStatus === 'SUBMITTED' || courseStatus === 'UNDER_REVIEW') && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center gap-3 text-blue-300 text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
          <span>
            Student marks SUBMITTED to Admin for review. Marks remain editable until the Admin officially approves and locks the course.
          </span>
        </div>
      )}

      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-amber-500/20 border-amber-500/40 text-[#F5A623]'
              : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Spreadsheet Table Container */}
      <div className="bg-[#27140B] border border-[#522B17] rounded-2xl shadow-2xl overflow-hidden">
        {/* Table Toolbar Bar */}
        <div className="p-4 bg-[#180B05] border-b border-[#4A2715] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#F5A623] text-sm">{selectedCourse.code}:</span>
            <span className="font-semibold text-white">{selectedCourse.title}</span>
            <span className="text-[#CBB39C]">({selectedCourse.classId} • {selectedCourse.semester})</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[#CBB39C] hidden md:block font-mono text-[11px]">
              Active Columns ({activeColumns.length}): {activeColumns.map((c) => `${c.name} (${c.maxMark})`).join(' | ')}
            </div>
            {isAdminOrDeptHead && (
              <button
                onClick={handleOpenColumnModal}
                className="px-2.5 py-1 bg-[#27140B] hover:bg-[#351C0F] text-[#F5A623] border border-[#522B17] rounded-lg text-[11px] font-bold transition flex items-center gap-1"
              >
                <Sliders className="w-3 h-3" />
                <span>Edit Headers / Add Column</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Editable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#F7E5C8] border-collapse">
            <thead className="bg-[#180B05] text-[#CBB39C] font-semibold uppercase tracking-wider border-b border-[#4A2715]">
              <tr>
                <th className="p-3 text-center min-w-[70px] text-[#F5A623]">Rank</th>
                <th className="p-3 min-w-[110px]">{t('studentId')}</th>
                <th className="p-3 min-w-[170px]">{t('studentName')}</th>

                {/* Dynamic Assessment Columns Headers */}
                {activeColumns.map((col) => (
                  <th key={col.id} className="p-3 min-w-[120px] text-center">
                    <div className="flex items-center justify-center gap-1 text-white">
                      <span>{col.name} ({col.maxMark})</span>
                    </div>
                  </th>
                ))}

                <th className="p-3 min-w-[100px] text-center bg-[#180B05] font-bold text-[#F5A623]">
                  {t('totalScore')}
                </th>
                <th className="p-3 min-w-[80px] text-center bg-[#180B05] font-bold text-[#F5A623]">
                  {t('grade')}
                </th>
                <th className="p-3 min-w-[90px] text-center bg-[#180B05] font-bold text-[#F5A623]">
                  {t('gradePoint')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A1E10]">
              {courseStudents.map((std) => {
                const entry = markEntries[std.id] || { assignment: 0, quiz: 0, midterm: 0, final: 0, customMarks: {} };
                const { total, grade, point } = calculateTotalAndGrade(entry);
                const rank = rankMap[std.id] || 1;

                return (
                  <tr key={std.id} className="hover:bg-[#351C0F]/60 transition">
                    {/* Student Rank */}
                    <td className="p-3 text-center font-bold">
                      {rank === 1 ? (
                        <span className="text-[#F5A623] flex items-center justify-center gap-0.5">🥇 1st</span>
                      ) : rank === 2 ? (
                        <span className="text-slate-300 flex items-center justify-center gap-0.5">🥈 2nd</span>
                      ) : rank === 3 ? (
                        <span className="text-amber-600 flex items-center justify-center gap-0.5">🥉 3rd</span>
                      ) : (
                        <span className="text-[#CBB39C]">#{rank}</span>
                      )}
                    </td>

                    {/* Student ID */}
                    <td className="p-3 font-mono font-bold text-[#F5A623]">{std.studentId}</td>

                    {/* Student Name */}
                    <td className="p-3 font-semibold text-white">
                      <div>{std.firstName} {std.lastName}</div>
                      <div className="text-[10px] text-[#CBB39C] font-normal">{std.amharicName}</div>
                    </td>

                    {/* Dynamic Columns Editable Cells */}
                    {activeColumns.map((col) => {
                      const val = getStudentColumnValue(entry, col.id);
                      const isInvalid = val > col.maxMark;

                      return (
                        <td key={col.id} className="p-2 text-center">
                          <input
                            type="number"
                            disabled={isLocked}
                            min="0"
                            max={col.maxMark}
                            value={val}
                            onChange={(e) => handleCellChange(std.id, col.id, e.target.value)}
                            className={`w-20 px-2 py-1.5 bg-[#180B05] text-center font-bold rounded-lg text-xs border transition ${
                              isInvalid
                                ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                                : 'border-[#5C321B] focus:border-[#F5A623] text-white'
                            }`}
                          />
                        </td>
                      );
                    })}

                    {/* Calculated Total */}
                    <td className="p-3 text-center font-bold text-sm text-white bg-[#180B05]/40">
                      {total}
                    </td>

                    {/* Calculated Grade */}
                    <td className="p-3 text-center font-bold text-xs bg-[#180B05]/40">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          grade.startsWith('A')
                            ? 'bg-amber-500/20 text-[#F5A623]'
                            : grade.startsWith('B')
                            ? 'bg-blue-500/20 text-blue-300'
                            : grade.startsWith('C')
                            ? 'bg-orange-500/20 text-orange-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {grade}
                      </span>
                    </td>

                    {/* Calculated Grade Point */}
                    <td className="p-3 text-center font-semibold text-[#CBB39C] bg-[#180B05]/40">
                      {point.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Buttons Footer */}
        {!isLocked && (
          <div className="p-4 bg-[#180B05] border-t border-[#4A2715] flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs text-[#CBB39C]">
              Totals, Grades, and Class Ranks calculate automatically as you edit marks.
            </span>

            <div className="flex gap-3">
              <button
                disabled={saving}
                onClick={() => handleSave(false)}
                className="px-4 py-2 bg-[#351C0F] hover:bg-[#442413] text-[#F7E5C8] font-semibold text-xs rounded-xl shadow transition flex items-center gap-1.5"
              >
                <Save className="w-4 h-4 text-[#F5A623]" />
                <span>
                  {user?.role === 'TEACHER'
                    ? t('saveDraft')
                    : (t('amharic') === 'አማርኛ' ? 'ውጤት መዝግብ / አስቀምጥ' : 'Save Changes')}
                </span>
              </button>

              {user?.role === 'TEACHER' ? (
                <button
                  disabled={saving}
                  onClick={() => handleSave(true)}
                  className="px-5 py-2 bg-[#E5921A] hover:bg-[#FBB03B] text-[#1E0C04] font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {t('amharic') === 'አማርኛ' ? 'ውጤቱን ለአስተዳዳሪው ላክ' : 'Submit Results to Admin / Coordinator'}
                  </span>
                </button>
              ) : (
                <button
                  disabled={saving}
                  onClick={() => handleSave(true)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {t('amharic') === 'አማርኛ' ? 'ውጤት አጽድቅ እና አስቀምጥ' : 'Save & Approve Marks'}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Admin / Dept Head Column Configuration Modal */}
      {showColumnModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#27140B] border border-[#522B17] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-xs text-[#F7E5C8] relative">
            <button
              onClick={() => setShowColumnModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#4A2715] pb-3">
              <Sliders className="w-5 h-5 text-[#F5A623]" />
              <span>Configure Mark Columns ({selectedCourse.code})</span>
            </h3>

            <p className="text-xs text-[#CBB39C]">
              Admin & Dept Head can edit column names (e.g. change Quiz to Test), update maximum mark limits, or add new mark columns for this course.
            </p>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {tempColumns.map((col, idx) => (
                <div key={col.id || idx} className="p-3 bg-[#180B05] border border-[#5C321B] rounded-xl flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] text-[#CBB39C] mb-1 font-semibold">Column Name #{idx + 1}</label>
                    <input
                      type="text"
                      required
                      value={col.name}
                      onChange={(e) => {
                        const updated = [...tempColumns];
                        updated[idx].name = e.target.value;
                        setTempColumns(updated);
                      }}
                      placeholder="e.g. Test, Quiz, Attendance"
                      className="w-full px-3 py-1.5 bg-[#27140B] border border-[#5C321B] rounded-lg text-white font-bold focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                    />
                  </div>

                  <div className="w-28">
                    <label className="block text-[10px] text-[#CBB39C] mb-1 font-semibold">Max Mark</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={col.maxMark}
                      onChange={(e) => {
                        const updated = [...tempColumns];
                        updated[idx].maxMark = Math.max(1, Number(e.target.value) || 0);
                        setTempColumns(updated);
                      }}
                      className="w-full px-3 py-1.5 bg-[#27140B] border border-[#5C321B] rounded-lg text-white text-center font-bold focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                    />
                  </div>

                  {tempColumns.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTempColumn(idx)}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition mt-4"
                      title="Remove Column"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-[#4A2715]">
              <button
                type="button"
                onClick={handleAddTempColumn}
                className="px-3.5 py-2 bg-[#351C0F] hover:bg-[#442413] text-[#F5A623] font-bold rounded-xl border border-[#5C321B] transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Assessment Column</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowColumnModal(false)}
                  className="px-4 py-2 bg-[#180B05] hover:bg-[#351C0F] text-[#CBB39C] font-semibold rounded-xl border border-[#522B17]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveColumns}
                  className="px-5 py-2 bg-[#E5921A] hover:bg-[#FBB03B] text-[#1E0C04] font-bold rounded-xl shadow-lg transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Structure</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
