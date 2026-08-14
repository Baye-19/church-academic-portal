import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { AttendanceRecord, AttendanceStatus } from '../types';
import { formatEthiopianDate, gregorianToEthiopian } from '../utils/ethiopianCalendar';
import { TrendingUp, BarChart3, CheckCircle2, XCircle, Clock, AlertCircle, Calendar } from 'lucide-react';

interface CurrentSheetStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  rate: number;
}

interface Props {
  records: AttendanceRecord[];
  selectedClassId: string;
  className: string;
  selectedDate: string;
  currentSheetStats: CurrentSheetStats;
  language?: 'en' | 'am';
}

export const AttendanceMonthlyProgressChart: React.FC<Props> = ({
  records,
  selectedClassId,
  className,
  selectedDate,
  currentSheetStats,
  language = 'am',
}) => {
  const [chartType, setChartType] = useState<'percentage' | 'counts'>('percentage');

  // Extract available months from records + selectedDate
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    if (selectedDate) {
      monthSet.add(selectedDate.substring(0, 7));
    }
    records
      .filter((r) => r.classId === selectedClassId)
      .forEach((r) => {
        if (r.date && r.date.length >= 7) {
          monthSet.add(r.date.substring(0, 7));
        }
      });

    return Array.from(monthSet).sort().reverse();
  }, [records, selectedClassId, selectedDate]);

  const [activeMonth, setActiveMonth] = useState<string>(
    selectedDate ? selectedDate.substring(0, 7) : new Date().toISOString().substring(0, 7)
  );

  // Keep activeMonth in sync when selectedDate changes month
  React.useEffect(() => {
    if (selectedDate && selectedDate.substring(0, 7) !== activeMonth) {
      setActiveMonth(selectedDate.substring(0, 7));
    }
  }, [selectedDate]);

  // Aggregate daily records for the active month
  const monthlyData = useMemo(() => {
    // Collect all records in this month for selected class
    const monthRecords = records.filter(
      (r) => r.classId === selectedClassId && r.date && r.date.startsWith(activeMonth)
    );

    // Group by date
    const dateMap = new Map<
      string,
      {
        date: string;
        present: number;
        absent: number;
        late: number;
        excused: number;
        total: number;
      }
    >();

    monthRecords.forEach((rec) => {
      let present = 0;
      let absent = 0;
      let late = 0;
      let excused = 0;

      rec.entries.forEach((e) => {
        if (e.status === 'PRESENT') present++;
        else if (e.status === 'ABSENT') absent++;
        else if (e.status === 'LATE') late++;
        else if (e.status === 'EXCUSED') excused++;
      });

      const total = rec.entries.length || present + absent + late + excused;
      dateMap.set(rec.date, {
        date: rec.date,
        present,
        absent,
        late,
        excused,
        total,
      });
    });

    // If selectedDate falls in the activeMonth and has students in live sheet, update/add it
    if (
      selectedDate &&
      selectedDate.startsWith(activeMonth) &&
      currentSheetStats.total > 0
    ) {
      dateMap.set(selectedDate, {
        date: selectedDate,
        present: currentSheetStats.present,
        absent: currentSheetStats.absent,
        late: currentSheetStats.late,
        excused: currentSheetStats.excused,
        total: currentSheetStats.total,
      });
    }

    // Convert map to sorted array
    const sortedDays = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    return sortedDays.map((d) => {
      const eth = gregorianToEthiopian(d.date);
      const ethLabel = language === 'am' ? `${eth.monthNameAm} ${eth.day}` : `${eth.monthNameEn} ${eth.day}`;
      const shortGreg = d.date.substring(5); // MM-DD

      const totalStudents = d.total || 1;
      // Present %: percentage of students present (and on-time)
      const presentPct = Math.round((d.present / totalStudents) * 100);
      // Absent %: percentage of students absent
      const absentPct = Math.round((d.absent / totalStudents) * 100);
      // Late %
      const latePct = Math.round((d.late / totalStudents) * 100);
      // Excused %
      const excusedPct = Math.round((d.excused / totalStudents) * 100);
      // Overall effective attendance % (present + late)
      const effectiveAttendanceRate = Math.round(((d.present + d.late) / totalStudents) * 100);

      return {
        date: d.date,
        shortDate: shortGreg,
        ethLabel,
        displayLabel: `${shortGreg} (${eth.day})`,
        present: d.present,
        absent: d.absent,
        late: d.late,
        excused: d.excused,
        total: d.total,
        presentPct,
        absentPct,
        latePct,
        excusedPct,
        effectiveAttendanceRate,
      };
    });
  }, [records, selectedClassId, activeMonth, selectedDate, currentSheetStats, language]);

  // Overall monthly averages
  const monthlySummary = useMemo(() => {
    if (monthlyData.length === 0) {
      return {
        avgPresentPct: 0,
        avgAbsentPct: 0,
        avgLatePct: 0,
        avgExcusedPct: 0,
        avgAttendanceRate: 0,
        totalSessions: 0,
        totalPresentCount: 0,
        totalAbsentCount: 0,
      };
    }

    let sumPresent = 0;
    let sumAbsent = 0;
    let sumLate = 0;
    let sumExcused = 0;
    let sumTotal = 0;

    monthlyData.forEach((d) => {
      sumPresent += d.present;
      sumAbsent += d.absent;
      sumLate += d.late;
      sumExcused += d.excused;
      sumTotal += d.total;
    });

    const totalHeadCount = sumTotal || 1;
    const avgPresentPct = Math.round((sumPresent / totalHeadCount) * 100);
    const avgAbsentPct = Math.round((sumAbsent / totalHeadCount) * 100);
    const avgLatePct = Math.round((sumLate / totalHeadCount) * 100);
    const avgExcusedPct = Math.round((sumExcused / totalHeadCount) * 100);
    const avgAttendanceRate = Math.round(((sumPresent + sumLate) / totalHeadCount) * 100);

    return {
      avgPresentPct,
      avgAbsentPct,
      avgLatePct,
      avgExcusedPct,
      avgAttendanceRate,
      totalSessions: monthlyData.length,
      totalPresentCount: sumPresent,
      totalAbsentCount: sumAbsent,
    };
  }, [monthlyData]);

  // Ethiopian month title for active month
  const activeMonthEthName = useMemo(() => {
    if (!activeMonth) return '';
    const sampleDate = `${activeMonth}-15`;
    const eth = gregorianToEthiopian(sampleDate);
    return language === 'am' ? `${eth.monthNameAm} ${eth.year}` : `${eth.monthNameEn} ${eth.year}`;
  }, [activeMonth, language]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#180B05] border border-[#F5A623] rounded-xl p-3.5 shadow-2xl text-xs text-[#F7E5C8] space-y-2 min-w-[200px]">
          <div className="border-b border-[#4A2715] pb-1.5 flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#F5A623]" />
              <span>{data.date}</span>
            </span>
            <span className="text-[#F5A623] font-bold text-[11px]">{data.ethLabel}</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Present / ተገኝቷል:</span>
              </span>
              <span className="font-bold text-emerald-400">
                {data.presentPct}% ({data.present}/{data.total})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <XCircle className="w-3.5 h-3.5" />
                <span>Absent / ቀርቷል:</span>
              </span>
              <span className="font-bold text-rose-400">
                {data.absentPct}% ({data.absent}/{data.total})
              </span>
            </div>

            {data.late > 0 && (
              <div className="flex items-center justify-between text-amber-400">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Late / ዘግይቷል:</span>
                </span>
                <span className="font-bold">
                  {data.latePct}% ({data.late})
                </span>
              </div>
            )}

            {data.excused > 0 && (
              <div className="flex items-center justify-between text-blue-400">
                <span className="flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Excused / ፈቃድ:</span>
                </span>
                <span className="font-bold">
                  {data.excusedPct}% ({data.excused})
                </span>
              </div>
            )}

            <div className="pt-1.5 border-t border-[#4A2715] flex items-center justify-between text-[11px]">
              <span className="text-[#CBB39C]">Effective Attendance:</span>
              <span className="font-bold text-[#F5A623]">{data.effectiveAttendanceRate}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#27140B] border border-[#522B17] rounded-2xl shadow-xl p-4 sm:p-5 space-y-4">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#4A2715] pb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#F5A623]" />
            <span>
              {language === 'am'
                ? 'የወርሃዊ የተማሪዎች መገኘት ግስጋሴ ገበታ'
                : 'Monthly Attendance Progress & Trends'}
            </span>
          </h3>
          <p className="text-xs text-[#CBB39C] mt-0.5">
            {language === 'am'
              ? `${className} — ${activeMonthEthName} (${activeMonth}) የተማሪዎች የመገኘት vs የመቅረት ንጽጽር`
              : `${className} — Present vs Absent percentage progression for ${activeMonthEthName} (${activeMonth})`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          {/* Month Selector */}
          <div className="flex items-center gap-1 bg-[#180B05] border border-[#5C321B] rounded-xl px-2.5 py-1 text-xs text-white">
            <Calendar className="w-3.5 h-3.5 text-[#F5A623]" />
            <select
              value={activeMonth}
              onChange={(e) => setActiveMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              {availableMonths.map((m) => {
                const sampleEth = gregorianToEthiopian(`${m}-15`);
                const label =
                  language === 'am'
                    ? `${sampleEth.monthNameAm} ${sampleEth.year} (${m})`
                    : `${sampleEth.monthNameEn} ${sampleEth.year} (${m})`;
                return (
                  <option key={m} value={m} className="bg-[#180B05] text-white">
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Toggle Type */}
          <div className="flex items-center bg-[#180B05] border border-[#5C321B] rounded-xl p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setChartType('percentage')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                chartType === 'percentage'
                  ? 'bg-[#E5921A] text-[#1E0C04] shadow'
                  : 'text-[#CBB39C] hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>% Rate</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('counts')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                chartType === 'counts'
                  ? 'bg-[#E5921A] text-[#1E0C04] shadow'
                  : 'text-[#CBB39C] hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Headcount</span>
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Summary Statistics & Cumulative Progress Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-[#180B05] border border-emerald-500/30 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Avg Present %</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-bold">
              {monthlySummary.avgPresentPct >= 80 ? 'Good' : 'Needs Focus'}
            </span>
          </div>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">
            {monthlySummary.avgPresentPct}%
          </div>
          <div className="text-[10px] text-[#CBB39C] mt-0.5">
            {monthlySummary.totalPresentCount} total attendances
          </div>
        </div>

        <div className="p-3 bg-[#180B05] border border-rose-500/30 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-rose-400 flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              <span>Avg Absent %</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.2 bg-rose-500/20 text-rose-300 rounded font-bold">
              {monthlySummary.avgAbsentPct <= 15 ? 'Low' : 'Attention'}
            </span>
          </div>
          <div className="text-xl font-extrabold text-rose-400 mt-1">
            {monthlySummary.avgAbsentPct}%
          </div>
          <div className="text-[10px] text-[#CBB39C] mt-0.5">
            {monthlySummary.totalAbsentCount} total absences
          </div>
        </div>

        <div className="p-3 bg-[#180B05] border border-[#5C321B] rounded-xl">
          <span className="text-[10px] font-bold uppercase text-[#F5A623] flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Attendance Rate</span>
          </span>
          <div className="text-xl font-extrabold text-[#F5A623] mt-1">
            {monthlySummary.avgAttendanceRate}%
          </div>
          <div className="text-[10px] text-[#CBB39C] mt-0.5">
            (Present + Late combined)
          </div>
        </div>

        <div className="p-3 bg-[#180B05] border border-[#5C321B] rounded-xl">
          <span className="text-[10px] font-bold uppercase text-[#CBB39C] flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#F5A623]" />
            <span>Logged Sessions</span>
          </span>
          <div className="text-xl font-extrabold text-white mt-1">
            {monthlySummary.totalSessions} <span className="text-xs font-normal text-[#CBB39C]">days</span>
          </div>
          <div className="text-[10px] text-[#CBB39C] mt-0.5">
            {activeMonthEthName}
          </div>
        </div>
      </div>

      {/* Visual Monthly Progress Proportion Bar */}
      <div className="space-y-1.5 bg-[#180B05] p-3 rounded-xl border border-[#5C321B]">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-emerald-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Present: {monthlySummary.avgPresentPct}%</span>
          </span>
          {monthlySummary.avgLatePct > 0 && (
            <span className="text-amber-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>Late: {monthlySummary.avgLatePct}%</span>
            </span>
          )}
          <span className="text-rose-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Absent: {monthlySummary.avgAbsentPct}%</span>
          </span>
        </div>

        <div className="w-full h-3 bg-[#27140B] rounded-full overflow-hidden flex border border-[#5C321B]">
          <div
            style={{ width: `${monthlySummary.avgPresentPct}%` }}
            className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full transition-all duration-500"
            title={`Present: ${monthlySummary.avgPresentPct}%`}
          />
          {monthlySummary.avgLatePct > 0 && (
            <div
              style={{ width: `${monthlySummary.avgLatePct}%` }}
              className="bg-amber-500 h-full transition-all duration-500"
              title={`Late: ${monthlySummary.avgLatePct}%`}
            />
          )}
          {monthlySummary.avgExcusedPct > 0 && (
            <div
              style={{ width: `${monthlySummary.avgExcusedPct}%` }}
              className="bg-blue-500 h-full transition-all duration-500"
              title={`Excused: ${monthlySummary.avgExcusedPct}%`}
            />
          )}
          <div
            style={{ width: `${monthlySummary.avgAbsentPct}%` }}
            className="bg-gradient-to-r from-rose-500 to-rose-600 h-full transition-all duration-500"
            title={`Absent: ${monthlySummary.avgAbsentPct}%`}
          />
        </div>
      </div>

      {/* Main Interactive Recharts Area / Bar Chart */}
      <div className="h-64 sm:h-72 w-full pt-2">
        {monthlyData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-xs text-[#CBB39C] bg-[#180B05]/60 rounded-xl border border-[#522B17]">
            <Calendar className="w-8 h-8 text-[#5C321B] mb-2" />
            <span>No attendance sessions logged for this month yet.</span>
            <span className="text-[11px] text-[#F5A623] mt-1">
              Mark today&apos;s attendance below to start tracking visual trends!
            </span>
          </div>
        ) : chartType === 'percentage' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#4A2715" vertical={false} opacity={0.6} />
              <XAxis
                dataKey="displayLabel"
                stroke="#CBB39C"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#5C321B' }}
              />
              <YAxis
                stroke="#CBB39C"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#5C321B' }}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', color: '#F7E5C8' }}
              />
              <Area
                type="monotone"
                dataKey="presentPct"
                name="Present % (የተገኙ)"
                stroke="#10B981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#presentGrad)"
                activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="absentPct"
                name="Absent % (የቀሩ)"
                stroke="#F43F5E"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#absentGrad)"
                activeDot={{ r: 6, fill: '#F43F5E', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4A2715" vertical={false} opacity={0.6} />
              <XAxis
                dataKey="displayLabel"
                stroke="#CBB39C"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#5C321B' }}
              />
              <YAxis
                stroke="#CBB39C"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#5C321B' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="square"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', color: '#F7E5C8' }}
              />
              <Bar dataKey="present" name="Present / የተገኙ" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" name="Absent / የቀሩ" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="late" name="Late / የዘገዩ" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="excused" name="Excused / ፈቃድ" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
