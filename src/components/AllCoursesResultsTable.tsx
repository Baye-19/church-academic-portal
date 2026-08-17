import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AcademicClass, Course, Mark, Student } from '../types';
import { filterAccessibleClasses, filterAccessibleCourses, hasFullClassAccess } from '../utils/accessControl';
import {
  FileSpreadsheet,
  Search,
  Download,
  Award,
  BookOpen,
  CheckCircle2,
  Trophy,
  Users,
  GraduationCap,
} from 'lucide-react';

export const AllCoursesResultsTable: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  useEffect(() => {
    Promise.all([
      api.getCourses(),
      api.getClasses(),
      api.getMarks(),
      api.getStudents(),
    ]).then(([crsRes, clsRes, mrkRes, stdRes]) => {
      if (crsRes.success) setCourses(crsRes.data);
      if (clsRes.success) setClasses(clsRes.data);
      if (mrkRes.success) setMarks(mrkRes.data);
      if (stdRes.success) setStudents(stdRes.data);
      setLoading(false);
    });
  }, []);

  const accessibleCourses = filterAccessibleCourses(courses, user);
  const accessibleClasses = filterAccessibleClasses(classes, user, courses);

  // Map courses by ID
  const courseMap = new Map<string, Course>();
  accessibleCourses.forEach((c) => courseMap.set(c.id, c));

  // Determine active courses for selected class (or all accessible courses)
  const relevantCourses = accessibleCourses.filter((c) => {
    if (selectedClassId === 'ALL') return true;
    return c.classId === selectedClassId;
  });

  // Extract unique students and associate their marks across courses
  // Build student list either from students table or derived from marks
  const studentMap = new Map<
    string,
    {
      studentId: string;
      studentCode: string;
      studentName: string;
      studentAmharicName: string;
      classId: string;
      courseMarks: Map<string, Mark>; // courseId -> Mark
    }
  >();

  // Initialize from students API
  students.forEach((s) => {
    studentMap.set(s.id, {
      studentId: s.id,
      studentCode: s.studentId,
      studentName: `${s.firstName} ${s.lastName}`,
      studentAmharicName: s.amharicName || '',
      classId: s.classId || 'cls-1',
      courseMarks: new Map(),
    });
  });

  // Populate marks
  marks.forEach((m) => {
    let studentEntry = studentMap.get(m.studentId);
    if (!studentEntry) {
      // Find by studentCode fallback
      for (const entry of studentMap.values()) {
        if (entry.studentCode === m.studentCode) {
          studentEntry = entry;
          break;
        }
      }
    }

    if (!studentEntry) {
      studentEntry = {
        studentId: m.studentId,
        studentCode: m.studentCode,
        studentName: m.studentName,
        studentAmharicName: m.studentAmharicName || '',
        classId: courseMap.get(m.courseId)?.classId || 'cls-1',
        courseMarks: new Map(),
      };
      studentMap.set(m.studentId, studentEntry);
    }

    studentEntry.courseMarks.set(m.courseId, m);
  });

  // Convert map to array & compute metrics
  const allStudentRows = Array.from(studentMap.values()).map((s) => {
    const marksList = Array.from(s.courseMarks.values());
    const totalScoreSum = marksList.reduce((acc, m) => acc + (m.total || 0), 0);
    const courseCount = marksList.length;
    const averageScore = courseCount > 0 ? totalScoreSum / courseCount : 0;

    // Overall Status
    let overallStatus = 'DRAFT';
    if (marksList.some((m) => m.status === 'APPROVED')) {
      overallStatus = 'APPROVED';
    } else if (marksList.some((m) => m.status === 'SUBMITTED')) {
      overallStatus = 'SUBMITTED';
    }

    return {
      ...s,
      totalScoreSum,
      courseCount,
      averageScore,
      overallStatus,
    };
  });

  // Filter students based on UI selections
  const filteredStudents = allStudentRows.filter((s) => {
    // Match Class
    if (selectedClassId !== 'ALL' && s.classId !== selectedClassId) return false;

    // Match Status
    if (selectedStatus !== 'ALL' && s.overallStatus !== selectedStatus) return false;

    // Match Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName =
        s.studentName.toLowerCase().includes(q) ||
        s.studentAmharicName.includes(q) ||
        s.studentCode.toLowerCase().includes(q);
      if (!matchesName) return false;
    }

    return true;
  });

  // Compute Class Rank by sorting students descending by Average Score / Total Score within their class!
  // We group students by classId to determine exact class ranks
  const classRankMap = new Map<string, number>(); // studentId -> rank number

  // Group filtered students by classId
  const studentsByClass = new Map<string, typeof filteredStudents>();
  filteredStudents.forEach((s) => {
    if (!studentsByClass.has(s.classId)) studentsByClass.set(s.classId, []);
    studentsByClass.get(s.classId)!.push(s);
  });

  // Calculate ranks per class
  studentsByClass.forEach((classList) => {
    classList.sort((a, b) => b.averageScore - a.averageScore || b.totalScoreSum - a.totalScoreSum);
    classList.forEach((student, index) => {
      classRankMap.set(student.studentId, index + 1);
    });
  });

  // Final sorted list according to Class Rank
  const rankedStudentRows = [...filteredStudents].sort((a, b) => {
    const rankA = classRankMap.get(a.studentId) || 999;
    const rankB = classRankMap.get(b.studentId) || 999;
    return rankA - rankB;
  });

  // Summary Metrics
  const totalStudentsCount = rankedStudentRows.length;
  const overallClassAverage =
    totalStudentsCount > 0
      ? (
          rankedStudentRows.reduce((acc, s) => acc + s.averageScore, 0) /
          totalStudentsCount
        ).toFixed(1)
      : '0';

  const passedStudentsCount = rankedStudentRows.filter((s) => s.averageScore >= 50).length;
  const overallPassRate =
    totalStudentsCount > 0
      ? ((passedStudentsCount / totalStudentsCount) * 100).toFixed(1)
      : '0';

  // Export CSV Matrix Function
  const handleExportCSV = () => {
    if (rankedStudentRows.length === 0) return;

    const courseHeaders = relevantCourses.map((c) => `"${c.title}" Grade`);
    const headers = [
      'Class Rank',
      'No.',
      'Student Name',
      'Amharic Name',
      'Class ID',
      ...courseHeaders,
      'Cumulative Average Score',
      'Total Score Sum',
      'Overall Status',
    ];

    const rows = rankedStudentRows.map((s, idx) => {
      const rank = classRankMap.get(s.studentId) || '-';
      const courseGrades = relevantCourses.map((c) => {
        const mark = s.courseMarks.get(c.id);
        return mark ? `"${mark.grade} (${mark.total})"` : '"-"';
      });

      return [
        rank,
        idx + 1,
        `"${s.studentName}"`,
        `"${s.studentAmharicName}"`,
        s.classId,
        ...courseGrades,
        s.averageScore.toFixed(1),
        s.totalScoreSum,
        s.overallStatus,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Class_Master_Results_Matrix_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* KPI Cards Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 bg-[#27140B] border border-[#522B17] rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#CBB39C] uppercase tracking-wider">Total Enrolled Students</span>
            <h3 className="text-lg sm:text-2xl font-extrabold text-[#F5A623] mt-0.5">{totalStudentsCount}</h3>
            <span className="text-[10px] text-[#A68F7B]">In Active Analysis</span>
          </div>
          <div className="p-2.5 bg-[#180B05] border border-[#522B17] rounded-lg text-[#F5A623] shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-[#27140B] border border-[#522B17] rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#CBB39C] uppercase tracking-wider">Evaluated Courses</span>
            <h3 className="text-lg sm:text-2xl font-extrabold text-white mt-0.5">{relevantCourses.length}</h3>
            <span className="text-[10px] text-[#A68F7B]">Curriculum Subjects</span>
          </div>
          <div className="p-2.5 bg-[#180B05] border border-[#522B17] rounded-lg text-[#F5A623] shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-[#27140B] border border-[#522B17] rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#CBB39C] uppercase tracking-wider">Class Cumulative Avg</span>
            <h3 className="text-lg sm:text-2xl font-extrabold text-emerald-400 mt-0.5">{overallClassAverage}%</h3>
            <span className="text-[10px] text-[#A68F7B]">All Subjects Combined</span>
          </div>
          <div className="p-2.5 bg-[#180B05] border border-[#522B17] rounded-lg text-emerald-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-[#27140B] border border-[#522B17] rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#CBB39C] uppercase tracking-wider">Class Pass Rate</span>
            <h3 className="text-lg sm:text-2xl font-extrabold text-emerald-400 mt-0.5">{overallPassRate}%</h3>
            <span className="text-[10px] text-[#A68F7B]">Average ≥ 50 Marks</span>
          </div>
          <div className="p-2.5 bg-[#180B05] border border-[#522B17] rounded-lg text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-[#27140B] border border-[#522B17] rounded-2xl shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#CBB39C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-xs text-white placeholder-[#8C7362] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
            />
          </div>

          {/* Filter Dropdowns & Export */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Filter by Class Level */}
            <div className="flex items-center gap-1.5 bg-[#180B05] border border-[#5C321B] px-3 py-1.5 rounded-xl">
              <GraduationCap className="w-3.5 h-3.5 text-[#F5A623]" />
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#F5A623] focus:outline-none"
              >
                <option value="ALL">
                  {accessibleClasses.length === classes.length ? 'All Classes' : `All Assigned (${accessibleClasses.length})`}
                </option>
                {accessibleClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.amharicName})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-xs font-semibold text-[#F7E5C8] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="DRAFT">Draft</option>
            </select>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-[#351C0F] hover:bg-[#442413] text-[#F7E5C8] font-bold text-xs rounded-xl border border-[#5C321B] transition flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-4 h-4 text-[#F5A623]" />
              <span>Export Master Matrix CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Student Results & Class Rank Matrix Table */}
      <div className="bg-[#27140B] border border-[#522B17] rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 bg-[#180B05] border-b border-[#4A2715] flex justify-between items-center">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#F5A623]" />
            <span>Master Student Results & Class Ranking Directory</span>
          </h3>
          <span className="text-xs text-[#CBB39C]">
            Showing <strong>{rankedStudentRows.length}</strong> students across <strong>{relevantCourses.length}</strong> courses
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[#CBB39C]">
            Calculating overall class ranks and course matrix...
          </div>
        ) : rankedStudentRows.length === 0 ? (
          <div className="p-12 text-center text-[#CBB39C]">
            <FileSpreadsheet className="w-10 h-10 text-[#F5A623] mx-auto mb-2 opacity-60" />
            <h4 className="font-bold text-white text-sm">No Student Results Found</h4>
            <p className="text-xs text-[#CBB39C] mt-1">
              No result records match your search or filter selections.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#F7E5C8]">
              {/* Header Row: Course Titles Across Top Columns */}
              <thead className="bg-[#180B05] text-[#CBB39C] font-semibold uppercase tracking-wider border-b border-[#4A2715]">
                <tr>
                  <th className="p-3.5 text-center font-bold text-[#F5A623]">Class Rank</th>
                  <th className="p-3.5 text-center w-12">No.</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5 text-center">Class</th>

                  {/* Dynamic Course Columns across top */}
                  {relevantCourses.map((c) => (
                    <th key={c.id} className="p-3.5 text-center bg-[#210E06]">
                      <div className="font-extrabold text-[#F5A623] text-xs truncate max-w-[130px] mx-auto">{c.title}</div>
                      {c.amharicTitle && (
                        <div className="text-[10px] text-[#CBB39C] normal-case font-normal truncate max-w-[130px] mx-auto">
                          {c.amharicTitle}
                        </div>
                      )}
                    </th>
                  ))}

                  <th className="p-3.5 text-center font-bold text-emerald-400 bg-[#180B05]">
                    Cumulative Avg
                  </th>
                  <th className="p-3.5 text-center font-bold text-[#F5A623]">
                    Total Marks
                  </th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>

              {/* Student Rows */}
              <tbody className="divide-y divide-[#3A1E10]">
                {rankedStudentRows.map((student, idx) => {
                  const rank = classRankMap.get(student.studentId) || 0;

                  return (
                    <tr key={student.studentId} className="hover:bg-[#351C0F]/60 transition">
                      {/* Class Rank Badge */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-xs font-black shadow-md ${
                            rank === 1
                              ? 'bg-amber-500 text-black border border-amber-300'
                              : rank === 2
                              ? 'bg-slate-300 text-black border border-white'
                              : rank === 3
                              ? 'bg-amber-700 text-white border border-amber-500'
                              : 'bg-[#180B05] text-[#F7E5C8] border border-[#522B17]'
                          }`}
                        >
                          {rank === 1 && <Trophy className="w-3 h-3 text-black" />}
                          {rank === 2 && <Trophy className="w-3 h-3 text-slate-800" />}
                          {rank === 3 && <Trophy className="w-3 h-3 text-amber-200" />}
                          <span>{rank > 0 ? `#${rank}` : '-'}</span>
                        </span>
                      </td>

                      {/* Student Number starting from 1 */}
                      <td className="p-3.5 font-mono font-bold text-[#F5A623] text-center">
                        {idx + 1}
                      </td>

                      {/* Student Full Name */}
                      <td className="p-3.5 font-semibold text-white">
                        <div>{student.studentName}</div>
                        {student.studentAmharicName && (
                          <div className="text-[10px] text-[#CBB39C] font-normal">
                            {student.studentAmharicName}
                          </div>
                        )}
                      </td>

                      {/* Class */}
                      <td className="p-3.5 text-center font-semibold text-[#CBB39C]">
                        <span className="px-2 py-0.5 bg-[#180B05] border border-[#522B17] rounded text-[11px]">
                          {student.classId}
                        </span>
                      </td>

                      {/* Grade Cells for Each Course Column */}
                      {relevantCourses.map((c) => {
                        const mark = student.courseMarks.get(c.id);

                        return (
                          <td key={c.id} className="p-3.5 text-center bg-[#210E06]/40 border-x border-[#3A1E10]/40">
                            {mark ? (
                              <div className="flex flex-col items-center justify-center gap-0.5">
                                <span
                                  className={`px-2.5 py-0.5 rounded text-xs font-extrabold ${
                                    mark.grade.startsWith('A')
                                      ? 'bg-amber-500/20 text-[#F5A623] border border-amber-500/30'
                                      : mark.grade.startsWith('B')
                                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                      : mark.grade.startsWith('C')
                                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  }`}
                                >
                                  {mark.grade}
                                </span>
                                <span className="text-[10px] font-mono text-[#CBB39C]">
                                  {mark.total} / 100
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-[#8C7362] font-mono">-</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Cumulative Average */}
                      <td className="p-3.5 text-center font-black text-sm text-emerald-400 bg-[#180B05]/60">
                        {student.averageScore.toFixed(1)}%
                      </td>

                      {/* Total Score Sum */}
                      <td className="p-3.5 text-center font-bold text-xs text-[#F5A623]">
                        {student.totalScoreSum}
                      </td>

                      {/* Overall Status Badge */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            student.overallStatus === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : student.overallStatus === 'SUBMITTED'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                          }`}
                        >
                          {student.overallStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
