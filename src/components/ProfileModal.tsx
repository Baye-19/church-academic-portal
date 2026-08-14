import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, Camera, Save, X, Phone, Mail, User as UserIcon, Building, CheckCircle2, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    amharicName: user?.amharicName || '',
    email: user?.email || '',
    password: '',
    phone: user?.phone || '',
    department: user?.department || '',
    avatar: user?.avatar || '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState<string>(user?.avatar || '');

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        amharicName: user.amharicName || '',
        email: user.email || '',
        password: '',
        phone: user.phone || '',
        department: user.department || '',
        avatar: user.avatar || '',
      });
      setPreviewAvatar(user.avatar || '');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewAvatar(base64String);
        setFormData((prev) => ({ ...prev, avatar: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    const payload: any = {
      name: formData.name,
      amharicName: formData.amharicName,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      avatar: formData.avatar,
    };
    if (formData.password && formData.password.trim() !== '') {
      payload.password = formData.password.trim();
    }

    const success = await updateProfile(payload);
    setSaving(false);

    if (success) {
      setSuccessMsg(t('amharic') === 'አማርኛ' ? 'ፕሮፋይልዎ እና የመግቢያ ምስክር ወረቀትዎ በተሳካ ሁኔታ ተዘምኗል!' : 'Profile & credentials updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1400);
    } else {
      setErrorMsg(t('amharic') === 'አማርኛ' ? 'ማዘመን አልተቻለም። እባክዎ ኢሜይሉ ሌላ ቦታ ያልተያዘ መሆኑን ያረጋግጡ።' : 'Failed to update profile. Email might already be taken.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-[#27140B] border border-[#522B17] w-full max-w-lg rounded-2xl p-6 shadow-2xl text-[#F7E5C8] space-y-4 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#4A2715]">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[#F5A623]" />
            <div>
              <h3 className="font-bold text-base text-white">
                {t('amharic') === 'አማርኛ' ? 'የእኔ መለያ እና ፕሮፋይል' : 'My Account & Credentials'}
              </h3>
              <p className="text-[11px] text-[#A68F7B]">
                {t('amharic') === 'አማርኛ' ? 'የግል መረጃዎን፣ ኢሜይልዎን እና የይለፍ ቃልዎን እዚህ ያዘምኑ' : 'Manage your personal info, login email, and password'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#351C0F] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg && (
          <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-[#F5A623] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3.5 text-xs max-h-[72vh] overflow-y-auto pr-1">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full border-2 border-[#F5A623] overflow-hidden bg-[#180B05] flex items-center justify-center shadow-lg">
                {previewAvatar ? (
                  <img src={previewAvatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#351C0F] flex items-center justify-center text-xl font-bold text-[#F5A623]">
                    {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                )}
              </div>

              <label className="absolute bottom-0 right-0 p-1.5 bg-[#E5921A] hover:bg-[#FBB03B] text-[#1E0C04] rounded-full cursor-pointer shadow-lg transition">
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-[10px] text-[#CBB39C]">
              {t('amharic') === 'አማርኛ' ? 'ፎቶ ለመቀየር ካሜራውን ይጫኑ' : 'Click camera to change photo'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#CBB39C] mb-1 font-semibold flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
              />
            </div>

            <div>
              <label className="block text-[#CBB39C] mb-1 font-semibold">
                Amharic Name (ስም በአማርኛ)
              </label>
              <input
                type="text"
                value={formData.amharicName}
                onChange={(e) => setFormData({ ...formData, amharicName: e.target.value })}
                placeholder="ለምሳሌ፡ መምህር አበበ ከበደ"
                className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#CBB39C] mb-1 font-semibold flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>Unique Login Email (የመግቢያ ኢሜይል)</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
              />
            </div>

            <div>
              <label className="block text-[#CBB39C] mb-1 font-semibold flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>Phone Number (ስልክ ቁጥር)</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+251 911 000000"
                className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
              />
            </div>
          </div>

          {/* Password Change Field */}
          <div className="p-3 bg-[#1D0E07] border border-[#5C321B]/70 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[#CBB39C] font-semibold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>Change Password (የይለፍ ቃል ይቀይሩ)</span>
              </label>
              <span className="text-[10px] text-[#A68F7B]">Leave blank to keep unchanged</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter new password to update login credentials..."
                className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white pr-10 placeholder-[#7A6453] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#A68F7B] hover:text-[#F5A623] transition"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[#CBB39C] mb-1 font-semibold flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-[#F5A623]" />
              <span>Department / Role</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="flex-1 px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
              />
              <span className="px-3 py-2 bg-[#351C0F] border border-[#5C321B] text-[#F5A623] font-bold rounded-xl flex items-center text-[11px] uppercase">
                {user.role}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#4A2715]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#351C0F] hover:bg-[#442413] text-[#CBB39C] font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#E5921A] hover:bg-[#FBB03B] text-[#1E0C04] font-bold rounded-xl shadow-lg transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
