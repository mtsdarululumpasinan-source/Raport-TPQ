
import React, { useState, useRef, useEffect } from 'react';
import { SchoolProfile } from '../types';
import { Upload, Save, Building2, Trash2, Image as ImageIcon, UserCircle, MapPin, Phone, Lock, Shield } from 'lucide-react';

interface SettingsProps {
  profile: SchoolProfile;
  currentUsername?: string;
  onSaveProfile: (profile: SchoolProfile) => void;
  onUpdatePassword: (newPassword: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ profile, currentUsername, onSaveProfile, onUpdatePassword }) => {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'SECURITY'>('PROFILE');
  const [formData, setFormData] = useState<SchoolProfile>(profile);
  
  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setStatusMessage(null);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        alert('Ukuran file terlalu besar (Maksimal 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logoUrl: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setStatusMessage({ type: 'success', text: 'Profil identitas berhasil diperbarui!' });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 3) {
        setStatusMessage({ type: 'error', text: 'Password minimal 3 karakter!' });
        return;
    }
    if (newPassword !== confirmPassword) {
        setStatusMessage({ type: 'error', text: 'Konfirmasi password tidak cocok!' });
        return;
    }
    
    onUpdatePassword(newPassword);
    setNewPassword('');
    setConfirmPassword('');
    setStatusMessage({ type: 'success', text: 'Password berhasil diubah!' });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="p-6 animate-fade-in max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="w-8 h-8 text-emerald-600" />
            Pengaturan
          </h2>
          <p className="text-gray-500 text-sm mt-1">Kelola profil lembaga dan keamanan akun.</p>
        </div>
        
        {statusMessage && (
          <div className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center animate-fade-in shadow-sm ${statusMessage.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
             {statusMessage.text}
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
         <button 
            onClick={() => setActiveTab('PROFILE')}
            className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'PROFILE' ? 'bg-white border-x border-t border-gray-200 text-emerald-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
         >
            <Building2 className="w-4 h-4" />
            Profil Identitas
         </button>
         <button 
            onClick={() => setActiveTab('SECURITY')}
            className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'SECURITY' ? 'bg-white border-x border-t border-gray-200 text-emerald-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
         >
            <Shield className="w-4 h-4" />
            Keamanan Akun
         </button>
      </div>

      {/* CONTENT: PROFILE */}
      {activeTab === 'PROFILE' && (
        <form onSubmit={handleSubmitProfile}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                 <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Identitas Utama</h3>
                 
                 <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Nama Lembaga / Institusi</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input 
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-100 text-gray-900 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1.5">Alamat Lengkap</label>
                       <div className="relative">
                          <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          <textarea 
                            name="address"
                            rows={3}
                            required
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-100 text-gray-900 font-medium resize-none"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Kontak (Telp/Email)</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          <input 
                            type="text"
                            name="contact"
                            required
                            value={formData.contact}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-100 text-gray-900 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Pimpinan / Kepala</label>
                        <div className="relative">
                          <UserCircle className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          <input 
                            type="text"
                            name="headmaster"
                            required
                            value={formData.headmaster}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-100 text-gray-900 font-medium"
                          />
                        </div>
                      </div>
                    </div>
                 </div>
              </div>

              <div className="flex justify-end lg:hidden">
                 <button 
                   type="submit"
                   className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg font-bold"
                 >
                   <Save className="w-5 h-5" />
                   Simpan Perubahan
                 </button>
              </div>
            </div>

            <div className="lg:col-span-1">
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Logo Identitas</h3>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="relative w-48 h-48 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group mb-4">
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Logo Preview" className="w-full h-full object-contain p-4" />
                      ) : (
                        <div className="text-gray-400">
                          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <span className="text-sm font-medium">Belum ada logo</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-3 w-full">
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex justify-center items-center px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-bold border border-emerald-200"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {formData.logoUrl ? 'Ganti Logo' : 'Upload Logo Baru'}
                      </button>
                      
                      {formData.logoUrl && (
                        <button 
                          type="button"
                          onClick={handleRemoveLogo}
                          className="w-full flex justify-center items-center px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-bold border border-red-200"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus Logo
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100 hidden lg:block">
                     <button 
                       type="submit"
                       className="w-full flex justify-center items-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-md font-bold"
                     >
                       <Save className="w-5 h-5" />
                       Simpan Pengaturan
                     </button>
                  </div>
               </div>
            </div>

          </div>
        </form>
      )}

      {/* CONTENT: SECURITY */}
      {activeTab === 'SECURITY' && (
         <div className="max-w-2xl mx-auto">
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                 <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-emerald-600" />
                    Ganti Password
                 </h3>

                 <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm flex items-start gap-3 border border-blue-100">
                    <UserCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">Akun Pengguna</p>
                        <p>Anda sedang mengubah password untuk username: <strong>{currentUsername || 'User'}</strong></p>
                    </div>
                 </div>

                 <form onSubmit={handleSubmitPassword} className="space-y-5">
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1.5">Password Baru</label>
                       <input 
                          type="password"
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                          placeholder="Masukkan password baru"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1.5">Konfirmasi Password Baru</label>
                       <input 
                          type="password"
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                          placeholder="Ulangi password baru"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                       />
                    </div>

                    <div className="pt-4">
                       <button 
                         type="submit"
                         className="w-full flex justify-center items-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-md font-bold"
                       >
                         <Save className="w-5 h-5" />
                         Update Password
                       </button>
                    </div>
                 </form>
             </div>
         </div>
      )}
    </div>
  );
};
