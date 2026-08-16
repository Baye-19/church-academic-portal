import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Course } from '../types';
import { filterAccessibleCourses } from '../utils/accessControl';
import { AllCoursesResultsTable } from './AllCoursesResultsTable';
import {
  Award,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  BarChart3,
} from 'lucide-react';

export const ResultsView: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'all_courses' | 'single_course'>('all_courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCourses().then((res) => {
      if (res.success && res.data.length > 0) {
        // Teacher sees their assigned courses or all if authorized
        const available = filterAccessibleCourses(res.data, user);

        setCourses(available);
        if (available.length > 0) {
          setSelectedCourseId(available[0].id);
        }
      }
    });
  }, [user]);

  useEffect(() => {
    if (selectedCourseId && viewMode === 'single_course') {
      setLoading(true);
      api.getResultAnalysis(selectedCourseId).then((res) => {
        if (res.success) {
          setAnalysis(res.data);
        }
        setLoading(false);
      });
    }
  }, [selectedCourseId, viewMode]);

  const handleExportCSV = () => {
    if (!analysis || !analysis.rankings) return;
    const headers = [
      'Rank',
      'Student ID',
      'Student Name',
      'Assignment',
      'Quiz',
      'Midterm',
      'Final',
      'Total',
      'Grade',
      'Grade Point',
    ];
    const rows = analysis.rankings.map((r: any) => [
      r.rank,
      r.studentCode,
      `"${r.studentName}"`,
      r.assignment,
      r.quiz,
      r.midterm,
      r.final,
      r.total,
      r.grade,
      r.gradePoint,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Result_Analysis_${selectedCourseId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#4A2715]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-[#F5A623]" />
            <span>{t('resultAnalysis')}</span>
          </h2>
          <p className="text-xs text-[#CBB39C] mt-1">
            Student academic results across all courses, performance analytics, and rankings.
          </p>
        </div>

        {/* View Mode Switcher Tabs */}
        <div className="flex bg-[#27140B] p-1 border border-[#5C321B] rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setViewMode('all_courses')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              viewMode === 'all_courses'
                ? 'bg-[#E5921A] text-[#1E0C04] shadow'
                : 'text-[#CBB39C] hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>All Courses Results Table</span>
          </button>

          <button
            onClick={() => setViewMode('single_course')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              viewMode === 'single_course'
                ? 'bg-[#E5921A] text-[#1E0C04] shadow'
                : 'text-[#CBB39C] hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Single Course Analytics</span>
          </button>
        </div>
      </div>

      {/* Main View Content */}
      {viewMode === 'all_courses' ? (
        <AllCoursesResultsTable />
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Single Course Controls Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-[#27140B] border border-[#522B17] rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#F7E5C8]">Select Course to Analyze:</span>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="px-3.5 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-xs font-bold text-[#F5A623] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50 shadow-lg truncate"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="px-3 py-2 bg-[#351C0F] hover:bg-[#442413] text-[#F7E5C8] font-semibold text-xs rounded-xl border border-[#5C321B] transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-[#F5A623]" />
                <span>{t('exportCSV')}</span>
              </button>

              <button
                onClick={handlePrintPDF}
                className="px-3 py-2 bg-[#351C0F] hover:bg-[#442413] text-[#F7E5C8] font-semibold text-xs rounded-xl border border-[#5C321B] transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-[#F5A623]" />
                <span>{t('printPDF')}</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-[#CBB39C] font-medium">
              Calculating result analysis & rankings...
            </div>
          ) : !analysis || !analysis.hasMarks ? (
            <div className="p-12 text-center bg-[#27140B] border border-[#522B17] rounded-2xl shadow-xl text-[#CBB39C]">
              <Award className="w-12 h-12 text-[#F5A623] mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Submitted Marks Available</h3>
              <p className="text-xs text-[#CBB39C] mt-1 max-w-md mx-auto">
                Marks for this course have not been submitted or analyzed yet. Enter marks in the Mark Entry menu to calculate rank & results.
              </p>
            </div>
          ) : (
        <div className="space-y-6">
          {/* Metrics Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-[#27140B] border border-[#522B17] rounded-2xl shadow-lg">
              <span className="text-[11px] font-semibold text-[#CBB39C] uppercase">{t('classAverage')}</span>
              <h3 className="text-2xl font-bold text-[#F5A623] mt-1">{analysis.classAverage}</h3>
              <span className="text-[10px] text-[#A68F7B]">Out of 100</span>
            </div>

            <div className="p-4 bg-[#27140B] border border-[#522B17] rounded-2xl shadow-lg">
              <span className="text-[11px] font-semibold text-[#CBB39C] uppercase">{t('highestScore')}</span>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-1">
                <span>{analysis.highest}</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </h3>
              <span className="text-[10px] text-[#A68F7B]">Top Mark</span>
            </div>

            <div className="p-4 bg-[#27140B] border border-[#522B17] rounded-2xl shadow-lg">
              <span className="text-[11px] font-semibold text-[#CBB39C] uppercase">{t('lowestScore')}</span>
              <h3 className="text-2xl font-bold text-amber-400 mt-1 flex items-center gap-1">
                <span>{analysis.lowest}</span>
                <TrendingDown className="w-4 h-4 text-amber-400" />
              </h3>
              <span className="text-[10px] text-[#A68F7B]">Lowest Mark</span>
            </div>

            <div className="p-4 bg-[#27140B] border border-[#522B17] rounded-2xl shadow-lg">
              <span className="text-[11px] font-semibold text-[#CBB39C] uppercase">{t('passRate')}</span>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>{analysis.passRate}%</span>
              </h3>
              <span className="text-[10px] text-[#A68F7B]">Passing Ratio</span>
            </div>

            <div className="p-4 bg-[#27140B] border border-[#522B17] rounded-2xl shadow-lg">
              <span className="text-[11px] font-semibold text-[#CBB39C] uppercase">{t('failRate')}</span>
              <h3 className="text-2xl font-bold text-rose-400 mt-1 flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                <span>{analysis.failRate}%</span>
              </h3>
              <span className="text-[10px] text-[#A68F7B]">Below Pass Limit</span>
            </div>
          </div>

          {/* Ranking Table */}
          <div className="bg-[#27140B] border border-[#522B17] rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 bg-[#180B05] border-b border-[#4A2715] font-bold text-white text-sm flex justify-between items-center">
              <span>{t('topPerformers')} & Class Rankings</span>
              <span className="text-xs text-[#CBB39C] font-normal">Total Students: {analysis.totalStudents}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#F7E5C8]">
                <thead className="bg-[#180B05] text-[#CBB39C] font-semibold uppercase tracking-wider border-b border-[#4A2715]">
                  <tr>
                    <th className="p-4">{t('rank')}</th>
                    <th className="p-4">{t('studentId')}</th>
                    <th className="p-4">{t('studentName')}</th>
                    <th className="p-4 text-center">Assignment</th>
                    <th className="p-4 text-center">Quiz</th>
                    <th className="p-4 text-center">Midterm</th>
                    <th className="p-4 text-center">Final Exam</th>
                    <th className="p-4 text-center font-bold text-[#F5A623]">{t('totalScore')}</th>
                    <th className="p-4 text-center font-bold text-[#F5A623]">{t('grade')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3A1E10]">
                  {analysis.rankings.map((r: any) => (
                    <tr key={r.id} className="hover:bg-[#351C0F]/60 transition">
                      <td className="p-4 font-bold text-sm">
                        {r.rank === 1 ? (
                          <span className="flex items-center gap-1 text-[#F5A623] font-bold">🥇 1st</span>
                        ) : r.rank === 2 ? (
                          <span className="flex items-center gap-1 text-slate-300 font-bold">🥈 2nd</span>
                        ) : r.rank === 3 ? (
                          <span className="flex items-center gap-1 text-amber-600 font-bold">🥉 3rd</span>
                        ) : (
                          <span className="text-[#CBB39C] font-semibold pl-2">#{r.rank}</span>
                        )}
                      </td>
                      <td className="p-4 font-mono font-bold text-[#F5A623]">{r.studentCode}</td>
                      <td className="p-4 font-semibold text-white">
                        {r.studentName}
                        {r.studentAmharicName && <div className="text-[10px] text-[#CBB39C]">{r.studentAmharicName}</div>}
                      </td>
                      <td className="p-4 text-center font-medium">{r.assignment}</td>
                      <td className="p-4 text-center font-medium">{r.quiz}</td>
                      <td className="p-4 text-center font-medium">{r.midterm}</td>
                      <td className="p-4 text-center font-medium">{r.final}</td>
                      <td className="p-4 text-center font-bold text-sm text-[#F5A623]">{r.total}</td>
                      <td className="p-4 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded ${
                          r.grade.startsWith('A') ? 'bg-amber-500/20 text-[#F5A623]' :
                          r.grade.startsWith('B') ? 'bg-blue-500/20 text-blue-300' : 'bg-orange-500/20 text-orange-300'
                        }`}>
                          {r.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
};
