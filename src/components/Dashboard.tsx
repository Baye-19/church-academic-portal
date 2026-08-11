import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Course, ScheduleItem, SubmissionReview } from '../types';
import { getCurrentAcademicYear } from '../utils/academicYear';
import {
  Users,
  UserCheck,
  BookOpen,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Calendar,
} from 'lucide-react';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [courses, setCourses] = useState<Course[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionReview[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getCourses(),
      api.getSchedules(),
      api.getSubmissions(),
      api.getAuditLogs(),
    ]).then(([crsRes, schRes, subRes, logRes]) => {
      if (crsRes.success) setCourses(crsRes.data);
      if (schRes.success) setSchedules(schRes.data);
      if (subRes.success) setSubmissions(subRes.data);
      if (logRes.success) setAuditLogs(logRes.data);
      setLoading(false);
    });
  }, []);

  const pendingSubmissions = submissions.filter((s) => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW');
  const myCourses = courses.filter((c) => c.teacherId === user?.id || c.teacherName === user?.name);
  const mySchedule = schedules.filter((s) => s.teacherId === user?.id || s.teacherName === user?.name);

  if (loading) {
    return (
      <div className="p-8 text-center text-[#CBB39C] font-medium">
        Loading Sunday School dashboard metrics...
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-[#27140B] p-4 sm:p-6 rounded-2xl border border-[#522B17] shadow-xl flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F5A623] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-ping" />
            <span>Academic Year {getCurrentAcademicYear()} • Haymete Abrham Sunday School</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-serif">
            {t('welcomeBack')}, {language === 'am' && user?.amharicName ? user.amharicName : user?.name}!
          </h2>
          <p className="text-xs text-[#CBB39C] mt-1">
            {t('departmentName')} — Logged in as <span className="font-bold text-[#F5A623]">{user?.role}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('attendance')}
            className="px-4 py-2 bg-[#351C0F] hover:bg-[#442413] text-[#F5A623] border border-[#522B17] font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>{language === 'am' ? 'የተማሪዎች መገኘት' : 'Attendance'}</span>
          </button>

          {user?.role === 'TEACHER' && (
            <button
              onClick={() => setActiveTab('markEntry')}
              className="px-4 py-2 bg-[#E5921A] hover:bg-[#FBB03B] text-[#1E0C04] font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>{t('markEntry')}</span>
            </button>
          )}

          {(user?.role === 'ADMIN' || user?.role === 'COORDINATOR' || user?.role === 'DEPT_HEAD') && (
            <button
              onClick={() => setActiveTab('reviewQueue')}
              className="px-4 py-2 bg-[#E5921A] hover:bg-[#FBB03B] text-[#1E0C04] font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{t('reviewQueue')} ({pendingSubmissions.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#27140B] border border-[#522B17] rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#CBB39C] uppercase tracking-wider">{t('totalClasses')}</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">8</h3>
            <span className="text-[10px] text-[#F5A623] font-semibold">Active Sunday School Level 1-8</span>
          </div>
          <div className="p-3 bg-[#180B05] border border-[#522B17] rounded-xl text-[#F5A623]">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-[#27140B] border border-[#522B17] rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#CBB39C] uppercase tracking-wider">{t('activeCourses')}</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {user?.role === 'TEACHER' ? myCourses.length : courses.length}
            </h3>
            <span className="text-[10px] text-[#F5A623] font-semibold">
              {user?.role === 'TEACHER' ? 'Your Teaching Courses' : 'Across All Departments'}
            </span>
          </div>
          <div className="p-3 bg-[#180B05] border border-[#522B17] rounded-xl text-[#F5A623]">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-[#27140B] border border-[#522B17] rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#CBB39C] uppercase tracking-wider">{t('totalStudents')}</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">280</h3>
            <span className="text-[10px] text-[#F5A623] font-semibold">Registered Students</span>
          </div>
          <div className="p-3 bg-[#180B05] border border-[#522B17] rounded-xl text-[#F5A623]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-[#27140B] border border-[#522B17] rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#CBB39C] uppercase tracking-wider">{t('approvalQueue')}</span>
            <h3 className="text-2xl font-extrabold text-[#F5A623] mt-1">{pendingSubmissions.length}</h3>
            <span className="text-[10px] text-[#A68F7B]">Pending Admin Approvals</span>
          </div>
          <div className="p-3 bg-[#180B05] border border-[#522B17] rounded-xl text-[#F5A623]">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Assigned Courses or Pending Submissions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Teacher Courses Card or Pending Reviews */}
          <div className="bg-[#27140B] border border-[#522B17] rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 bg-[#180B05] border-b border-[#4A2715] flex justify-between items-center">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#F5A623]" />
                <span>
                  {user?.role === 'TEACHER' ? 'Your Assigned Sunday School Courses' : 'Active Course List'}
                </span>
              </h3>
              <button
                onClick={() => setActiveTab('courses')}
                className="text-xs text-[#F5A623] hover:underline font-semibold"
              >
                View All →
              </button>
            </div>

            <div className="p-4 divide-y divide-[#3A1E10]">
              {(user?.role === 'TEACHER' ? myCourses : courses.slice(0, 5)).map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="text-[#F5A623] font-mono">{c.code}</span>
                      <span>{c.title}</span>
                    </div>
                    <div className="text-[11px] text-[#CBB39C] mt-0.5">
                      {c.amharicTitle} • {c.classId}
                    </div>
                  </div>

                  {user?.role === 'TEACHER' ? (
                    <button
                      onClick={() => setActiveTab('markEntry')}
                      className="px-3 py-1.5 bg-[#E5921A] hover:bg-[#FBB03B] text-[#1E0C04] font-bold rounded-lg shadow transition"
                    >
                      Enter Marks
                    </button>
                  ) : (
                    <span className="text-[#CBB39C] font-semibold">{c.teacherName || 'Assigned'}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timetable Schedule Quick View */}
          <div className="bg-[#27140B] border border-[#522B17] rounded-2xl shadow-xl p-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#4A2715] mb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#F5A623]" />
                <span>Upcoming Class Timetable</span>
              </h3>
              <button
                onClick={() => setActiveTab('schedules')}
                className="text-xs text-[#F5A623] hover:underline font-semibold"
              >
                Full Schedule →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {(user?.role === 'TEACHER' ? mySchedule : schedules.slice(0, 4)).map((s) => (
                <div key={s.id} className="p-3 bg-[#180B05] border border-[#4A2715] rounded-xl space-y-1">
                  <div className="flex justify-between font-bold text-[#F5A623]">
                    <span>{s.day}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {s.startTime}-{s.endTime}
                    </span>
                  </div>
                  <div className="font-semibold text-white">{s.courseCode}: {s.courseTitle}</div>
                  <div className="text-[11px] text-[#CBB39C]">Room: {s.room} • {s.teacherName}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Audit Log / Quick Actions */}
        <div className="space-y-6">
          <div className="bg-[#27140B] border border-[#522B17] rounded-2xl shadow-xl p-4">
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2 border-b border-[#4A2715] pb-2">
              <Award className="w-4 h-4 text-[#F5A623]" />
              <span>System Quick Actions</span>
            </h3>

            <div className="space-y-2 text-xs">
              {user?.role === 'TEACHER' && (
                <button
                  onClick={() => setActiveTab('markEntry')}
                  className="w-full p-3 bg-[#180B05] hover:bg-[#351C0F] border border-[#522B17] rounded-xl text-left font-semibold text-white flex items-center justify-between transition"
                >
                  <span>Enter & Calculate Marks</span>
                  <BookOpen className="w-4 h-4 text-[#F5A623]" />
                </button>
              )}

              <button
                onClick={() => setActiveTab('results')}
                className="w-full p-3 bg-[#180B05] hover:bg-[#351C0F] border border-[#522B17] rounded-xl text-left font-semibold text-white flex items-center justify-between transition"
              >
                <span>View Result Rankings</span>
                <Award className="w-4 h-4 text-[#F5A623]" />
              </button>

              <button
                onClick={() => setActiveTab('schedules')}
                className="w-full p-3 bg-[#180B05] hover:bg-[#351C0F] border border-[#522B17] rounded-xl text-left font-semibold text-white flex items-center justify-between transition"
              >
                <span>Class Timetable</span>
                <Calendar className="w-4 h-4 text-[#F5A623]" />
              </button>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-[#27140B] border border-[#522B17] rounded-2xl shadow-xl p-4">
            <h3 className="font-bold text-white text-sm mb-3 border-b border-[#4A2715] pb-2">
              Recent Activity Logs
            </h3>

            <div className="space-y-3 text-xs">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="pb-2 border-b border-[#3A1E10] last:border-0">
                  <div className="font-semibold text-[#F7E5C8]">{log.action}</div>
                  <div className="text-[10px] text-[#A68F7B] mt-0.5">{log.userName} • {log.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
