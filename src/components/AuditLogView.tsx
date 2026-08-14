import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { AuditLog } from '../types';
import { ShieldAlert, Search, Clock } from 'lucide-react';
import { formatEthiopianDateTime } from '../utils/ethiopianCalendar';

export const AuditLogView: React.FC = () => {
  const { t, language } = useLanguage();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getAuditLogs().then((res) => {
      if (res.success) setLogs(res.data);
    });
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-purple-400" />
            <span>{t('auditLogs')} System</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            System activity tracking, login logs, mark modifications, and administrative action trail.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-slate-850 p-4 border border-slate-800 rounded-2xl shadow-lg flex justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Total Logs: <span className="text-purple-400 font-bold">{filteredLogs.length}</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">{t('timestamp')}</th>
                <th className="p-4">{t('user')}</th>
                <th className="p-4">{t('role')}</th>
                <th className="p-4">{t('action')}</th>
                <th className="p-4">{t('details')}</th>
                <th className="p-4">{t('ipAddress')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-800/60 transition">
                  <td className="p-4 text-[#F7E5C8] font-mono text-[11px]">
                    {formatEthiopianDateTime(l.timestamp, language)}
                  </td>
                  <td className="p-4 font-semibold text-slate-100">{l.userName}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[10px] font-bold rounded">
                      {l.userRole}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-emerald-400">{l.action}</td>
                  <td className="p-4 text-slate-300 max-w-xs truncate">{l.details}</td>
                  <td className="p-4 text-slate-500 font-mono text-[11px]">{l.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
