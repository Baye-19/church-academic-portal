import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types';
import { ShieldCheck, BookOpen, Globe, Lock, Eye, EyeOff, KeyRound, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { ChurchLogo } from './ChurchLogo';
import { DeveloperBanner } from './DeveloperBanner';

export const LoginModal: React.FC = () => {
  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCredsGuide, setShowCredsGuide] = useState(false);

  const actorCredentials: { role: UserRole; titleAm: string; titleEn: string; email: string; pass: string; badge: string }[] = [
    {
      role: 'ADMIN',
      titleAm: 'አስተዳዳሪ (Admin)',
      titleEn: 'System Administrator',
      email: 'ashu@admin.edu',
      pass: 'Admin@123!',
      badge: 'Admin',
    },
    {
      role: 'DEPT_HEAD',
      titleAm: 'የት/ክፍል ኃላፊ (Dept-Head)',
      titleEn: 'Department Head',
      email: 'head@head.edu',
      pass: 'Head@123!',
      badge: 'Dept Head',
    },
    {
      role: 'TEACHER',
      titleAm: 'መምህር (Teacher)',
      titleEn: 'Course Teacher',
      email: 'teacher@class.edu',
      pass: 'Teacher@123!',
      badge: 'Teacher',
    },
    {
      role: 'COORDINATOR',
      titleAm: 'አስተባባሪ (Coordinator)',
      titleEn: 'Section Coordinator',
      email: 'coordinator@amras.edu',
      pass: 'Coordinator@123!',
      badge: 'Coordinator',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.success) {
      setError(result.message || 'Login failed');
    }
  };

  const handleSelectActor = (cred: typeof actorCredentials[0]) => {
    setEmail(cred.email);
    setPassword(cred.pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#180B05] flex flex-col justify-between relative overflow-y-auto overflow-x-hidden">
      <div className="flex-1 flex items-center justify-center p-4 relative py-8">
        {/* Warm Background Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#F5A623]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#E5921A]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-4xl grid md:grid-cols-5 bg-[#27140B] border border-[#522B17] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl z-10">
          {/* Left Branding Panel */}
          <div className="md:col-span-2 bg-[#180B05] p-8 flex flex-col justify-between text-[#F7E5C8] border-r border-[#4A2715]">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <ChurchLogo size="lg" />
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-white font-serif">{t('shortName')}</h1>
                  <p className="text-xs text-[#F5A623] font-semibold">Academic Portal v2.4</p>
                </div>
              </div>

              <h2 className="text-xl font-bold leading-snug mb-3 text-white">
                {t('appName')}
              </h2>
              <p className="text-xs text-[#CBB39C] leading-relaxed mb-6">
                {t('departmentName')}
              </p>

              <div className="space-y-3 pt-4 border-t border-[#4A2715] text-xs text-[#CBB39C]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
                  <span>Unique & Secure Credentials per Actor</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#F5A623]" />
                  <span>8 Sunday School Academic Classes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#F5A623]" />
                  <span>Bilingual System (English / አማርኛ)</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#4A2715] text-[11px] text-[#A68F7B] flex items-center justify-between">
              <span>Status: <span className="text-[#F5A623] font-bold">Active</span></span>
              <span>2025/2026 E.C.</span>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="md:col-span-3 p-8 flex flex-col justify-center bg-[#27140B]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">{t('loginTitle')}</h3>
                <p className="text-xs text-[#CBB39C] mt-1">{t('loginSubtitle')}</p>
              </div>

              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#180B05] hover:bg-[#351C0F] text-xs text-[#F7E5C8] border border-[#522B17] font-medium transition"
              >
                <Globe className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>{language === 'en' ? 'አማርኛ' : 'English'}</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-shake">
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#CBB39C] mb-1">
                  {t('emailOrUsername')}
                </label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@amras.edu"
                  className="w-full px-3.5 py-2.5 bg-[#180B05] border border-[#5C321B] rounded-xl text-white placeholder-[#A68F7B] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#CBB39C] mb-1">
                  {t('password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full px-3.5 py-2.5 bg-[#180B05] border border-[#5C321B] rounded-xl text-white placeholder-[#A68F7B] pr-10 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#A68F7B] hover:text-[#F5A623] transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-[#E5921A] hover:bg-[#FBB03B] font-bold text-[#1E0C04] text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>{submitting ? 'Authenticating...' : t('loginBtn')}</span>
              </button>
            </form>

            {/* Quick Actor Credentials Helper Dropdown */}
            <div className="mt-5 pt-4 border-t border-[#4A2715]/70">
              <button
                type="button"
                onClick={() => setShowCredsGuide(!showCredsGuide)}
                className="w-full flex items-center justify-between text-[11px] text-[#CBB39C] hover:text-[#F5A623] transition font-medium py-1"
              >
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#F5A623]" />
                  <span>{language === 'am' ? 'የተዋናዮች መግቢያ ምስክር ወረቀት መረጃ' : 'Actor Default Credentials Reference'}</span>
                </span>
                {showCredsGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showCredsGuide && (
                <div className="mt-3 space-y-2 bg-[#180B05]/90 border border-[#522B17] rounded-xl p-3 text-[11px]">
                  <p className="text-[#A68F7B] text-[10px] leading-relaxed mb-2">
                    {language === 'am'
                      ? 'እያንዳንዱ ተዋናይ ልዩ ኢሜይል እና የይለፍ ቃል አለው። ወደ ቅጽ ለመሙላት አንዱን ይጫኑ ወይም በፕሮፋይልዎ ላይ ያዘምኑ።'
                      : 'Each actor has a unique email & password. Click any role to auto-fill or edit credentials in Profile.'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {actorCredentials.map((c) => (
                      <div
                        key={c.role}
                        onClick={() => handleSelectActor(c)}
                        className="p-2 bg-[#27140B] hover:bg-[#351C0F] border border-[#522B17] hover:border-[#F5A623]/50 rounded-lg cursor-pointer transition flex flex-col justify-between group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[#F5A623] text-[10px]">{language === 'am' ? c.titleAm : c.titleEn}</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-[#180B05] rounded text-[#CBB39C] group-hover:text-white">Fill</span>
                        </div>
                        <div className="text-[10px] text-[#CBB39C] truncate">
                          <span className="text-[#A68F7B]">Email: </span>{c.email}
                        </div>
                        <div className="text-[10px] text-[#CBB39C] truncate font-mono">
                          <span className="text-[#A68F7B]">Pass: </span>{c.pass}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Developer Credits Footer */}
      <DeveloperBanner />
    </div>
  );
};
