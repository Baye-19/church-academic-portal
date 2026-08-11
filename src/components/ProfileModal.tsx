import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, Camera, Save, X, Phone, Mail, User as UserIcon, Building, CheckCircle2 } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();

  if (!isOpen || !user) return null;

  const [formData, setFormData] = useState({
    name: user.name || '',
    amharicName: user.amharicName || '',
    email: user.email || '',
    phone: user.phone || '',
    department: user.department || '',
    avatar: user.avatar || '',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState<string>(user.avatar || '');

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

    const success = await updateProfile(formData);
    setSaving(false);

    if (success) {
      setSuccessMsg(t('amharic') === 'አማርኛ' ? 'ፕሮፋይልዎ በተሳካ ሁኔታ ተዘምኗል!' : 'Profile updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-[#27140B] border border-[#522B17] w-full max-w-lg rounded-2xl p-6 shadow-2xl text-[#F7E5C8] space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#4A2715]">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[#F5A623]" />
            <h3 className="font-bold text-lg text-white">
              {t('amharic') === 'አማርኛ' ? 'የእኔ ፕሮፋይል' : 'My Account Profile'}
            </h3>
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

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-2 border-[#F5A623] overflow-hidden bg-[#180B05] flex items-center justify-center shadow-lg">
                {previewAvatar ? (
                  <img src={previewAvatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#351C0F] flex items-center justify-center text-xl font-bold text-[#F5A623]">
                    {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                )}
              </div>

              <label className="absolute bottom-0 right-0 p-2 bg-[#E5921A] hover:bg-[#FBB03B] text-[#1E0C04] rounded-full cursor-pointer shadow-lg transition">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-[11px] text-[#CBB39C]">
              {t('amharic') === 'አማርኛ' ? 'ፎቶዎን ለመቀየር ካሜራውን ይጫኑ' : 'Click camera icon to upload profile photo'}
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
                <span>Email Address</span>
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
                <span>Phone Number</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+251 911 000000"
                className="w-full px-3 py-2 bg-[#180B05] border border-[#5C321B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"
              />
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

          <div className="flex justify-end gap-3 pt-4 border-t border-[#4A2715]">
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
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
