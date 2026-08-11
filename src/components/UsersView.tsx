import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { User } from '../types';
import { Settings, Plus, Search, ShieldCheck } from 'lucide-react';

export const UsersView: React.FC = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getUsers().then((res) => {
      if (res.success) setUsers(res.data);
    });
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-400" />
            <span>{t('users')} Directory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            System accounts, user role assignments, contact details, and account statuses.
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
          Total Users: <span className="text-emerald-400 font-bold">{filteredUsers.length}</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">{t('employeeId')}</th>
                <th className="p-4">{t('fullName')}</th>
                <th className="p-4">{t('email')}</th>
                <th className="p-4">{t('role')}</th>
                <th className="p-4">{t('phone')}</th>
                <th className="p-4">{t('status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/60 transition">
                  <td className="p-4 font-mono font-bold text-emerald-400">{u.employeeId}</td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-100">{u.name}</div>
                    <div className="text-slate-400 text-[11px]">{u.amharicName}</div>
                  </td>
                  <td className="p-4 text-slate-300">{u.email}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-200 border border-slate-700 font-mono text-[10px] font-bold rounded">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{u.phone}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded">
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
