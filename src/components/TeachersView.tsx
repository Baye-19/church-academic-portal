import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { User } from '../types';
import { UserCheck, Plus, Search, Mail, Phone, ShieldCheck } from 'lucide-react';

export const TeachersView: React.FC = () => {
  const { t, language } = useLanguage();
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    amharicName: '',
    email: '',
    phone: '',
    employeeId: '',
    role: 'TEACHER' as any,
    department: 'Computer Science',
  });

  const loadData = () => {
    api.getUsers().then((res) => {
      if (res.success) setUsers(res.data);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const teachers = users.filter(
    (u) =>
      (u.role === 'TEACHER' || u.role === 'COORDINATOR') &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.employeeId.toLowerCase().includes(search.toLowerCase()))
  );

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      employeeId: formData.employeeId || `TCH-${Math.floor(300 + Math.random() * 600)}`,
    };
    const res = await api.createUser(payload);
    if (res.success) {
      toast.success(
        language === 'am'
          ? `መምህር/አስተባባሪ ${formData.amharicName || formData.name} በተሳካ ሁኔታ ተመዝግቧል!`
          : `Faculty member "${formData.name}" registered successfully!`
      );
      setShowAddModal(false);
      setFormData({
        name: '',
        amharicName: '',
        email: '',
        phone: '',
        employeeId: '',
        role: 'TEACHER' as any,
        department: 'Computer Science',
      });
      loadData();
    } else {
      toast.error(language === 'am' ? 'መምህር መመዝገብ አልተቻለም።' : 'Failed to register faculty member.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-400" />
            <span>{t('teachers')} & Coordinators Roster</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Faculty member accounts, departmental roles, contact details, and status management.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-semibold text-white text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addNewTeacher')}</span>
        </button>
      </div>

      {/* Filter */}
      <div className="flex justify-between items-center bg-slate-850 p-4 border border-slate-800 rounded-2xl shadow-lg">
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
          Total Faculty: <span className="text-emerald-400 font-bold">{teachers.length}</span>
        </div>
      </div>

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((tch) => (
          <div key={tch.id} className="p-5 bg-slate-850 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start">
                {tch.employeeId ? (
                  <span className="px-2.5 py-1 bg-slate-900 text-slate-300 border border-slate-700 text-[11px] font-mono font-bold rounded-lg">
                    {tch.employeeId}
                  </span>
                ) : <div />}
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  tch.role === 'COORDINATOR' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {tch.role}
                </span>
              </div>

              <h3 className="font-bold text-base text-white mt-3">{tch.name}</h3>
              {tch.amharicName && <p className="text-xs text-emerald-400 font-medium">{tch.amharicName}</p>}
            </div>

            <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800 pt-3">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">{tch.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{tch.phone}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-800 pt-3">
              <span>Status: <strong className="text-emerald-400">{tch.status}</strong></span>
              <span className="text-[11px] text-slate-500">{tch.department}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-850 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl text-white space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <span>{t('addNewTeacher')}</span>
            </h3>

            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">{t('fullName')} (English)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Instructor Solomon Haile"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">{t('amharicName')} (አማርኛ)</label>
                <input
                  type="text"
                  required
                  value={formData.amharicName}
                  onChange={(e) => setFormData({ ...formData, amharicName: e.target.value })}
                  placeholder="e.g. መምህር ሰለሞን ሀይሌ"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">{t('role')}</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="TEACHER">TEACHER</option>
                  <option value="COORDINATOR">COORDINATOR</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">{t('email')}</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="solomon@amras.edu"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">{t('phone')}</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+251 911 000000"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-600"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500"
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
