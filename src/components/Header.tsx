import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Notification } from '../types';
import { Bell, Globe, LogOut, User as UserIcon, Menu, X, ArrowLeft } from 'lucide-react';
import { ProfileModal } from './ProfileModal';
import { ChurchLogo } from './ChurchLogo';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  onGoBack?: () => void;
  canGoBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, isMobileMenuOpen, onGoBack, canGoBack }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (user) {
      api.getNotifications(user.id).then((res) => {
        if (res.success && res.data) {
          setNotifications(res.data);
        }
      });
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="bg-[#E5921A] text-[#1E0C04] px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
            Admin
          </span>
        );
      case 'DEPT_HEAD':
        return (
          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded text-[10px] font-semibold">
            Dept Head
          </span>
        );
      case 'TEACHER':
        return (
          <span className="bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/30 px-1.5 py-0.5 rounded text-[10px] font-semibold">
            Teacher
          </span>
        );
      case 'COORDINATOR':
        return (
          <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded text-[10px] font-semibold">
            Coordinator
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <header className="h-16 bg-[#180B05] border-b border-[#4A2715] text-[#F7E5C8] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xl">
        {/* Left Branding with Logo Domes Emblem & Mobile Hamburger Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {canGoBack && onGoBack && (
            <button
              onClick={onGoBack}
              className="p-2 rounded-xl bg-[#27140B] hover:bg-[#351C0F] text-[#F5A623] border border-[#522B17] transition flex items-center justify-center"
              title={t('back')}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="p-2 rounded-xl bg-[#27140B] hover:bg-[#351C0F] text-[#F5A623] border border-[#522B17] lg:hidden transition"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <ChurchLogo size="md" />

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm tracking-wide text-white font-serif truncate max-w-[120px] sm:max-w-none">
                {t('shortName')}
              </span>
              <span className="hidden md:inline text-xs text-[#CBB39C] font-normal">
                | {t('appName')}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#F5A623] font-medium hidden sm:block">
              {t('departmentName')}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#27140B] hover:bg-[#351C0F] text-[11px] sm:text-xs font-semibold text-[#F7E5C8] border border-[#522B17] transition shadow"
            title="Switch Language / ቋንቋ ይቀይሩ"
          >
            <Globe className="w-3.5 h-3.5 text-[#F5A623]" />
            <span>{language === 'en' ? 'EN | አማ' : 'አማ | EN'}</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-2 rounded-xl bg-[#27140B] hover:bg-[#351C0F] text-[#CBB39C] hover:text-white border border-[#522B17] transition relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#27140B] border border-[#522B17] rounded-xl shadow-2xl z-50 overflow-hidden text-xs text-[#F7E5C8]">
                <div className="p-3 border-b border-[#4A2715] font-semibold flex justify-between items-center bg-[#180B05]">
                  <span>{t('notifications')}</span>
                  <span className="text-[10px] text-[#F5A623] font-bold">{unreadCount} unread</span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-[#3A1E10]">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-[#A68F7B]">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={`p-3 cursor-pointer transition hover:bg-[#351C0F] ${
                          !n.read ? 'bg-[#351C0F]/80 border-l-2 border-[#F5A623]' : ''
                        }`}
                      >
                        <div className="font-semibold text-white">{n.title}</div>
                        <div className="text-[#CBB39C] text-[11px] mt-0.5">{n.message}</div>
                        <div className="text-[10px] text-[#A68F7B] mt-1">
                          {new Date(n.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Button */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-[#4A2715]">
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 hover:opacity-80 transition group text-left"
              title="Click to view/edit profile"
            >
              <div className="w-8 h-8 rounded-full border border-[#F5A623] bg-[#351C0F] overflow-hidden flex items-center justify-center text-[#F5A623] font-bold text-xs shadow-md shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
                )}
              </div>

              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-white group-hover:text-[#F5A623] transition flex items-center gap-1 truncate max-w-[100px] md:max-w-none">
                  <span className="truncate">{language === 'am' && user?.amharicName ? user.amharicName : user?.name}</span>
                  <UserIcon className="w-3 h-3 text-[#CBB39C] shrink-0" />
                </div>
                <div className="mt-0.5">{getRoleBadge(user?.role)}</div>
              </div>
            </button>

            <button
              onClick={logout}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition flex items-center gap-1.5 text-xs font-semibold"
              title={t('logout')}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">{t('logout')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </>
  );
};
