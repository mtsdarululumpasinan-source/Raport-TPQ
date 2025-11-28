
import React, { useState, useRef } from 'react';
import { Branch, Institution, UserRole } from '../types';
import { Building2, Map, MapPin, Phone, Search, Users, ShieldCheck, School, Plus, Edit, X, Save, Upload, Trash2, Image as ImageIcon, Lock, Key, Eye } from 'lucide-react';

interface InstitutionListProps {
  branches: Branch[];
  institutions: Institution[];
  userRole: UserRole;
  onAddBranch: (branch: Branch) => void;
  onUpdateBranch: (branch: Branch) => void;
  onDeleteBranch: (id: string) => void;
  onAddInstitution: (institution: Institution) => void;
  onUpdateInstitution: (institution: Institution) => void;
  onDeleteInstitution: (id: string) => void;
}

export const InstitutionList: React.FC<InstitutionListProps> = ({ 
  branches, 
  institutions, 
  userRole,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
  onAddInstitution,
  onUpdateInstitution,
  onDeleteInstitution
}) => {
  const [activeTab, setActiveTab] = useState<'BRANCH' | 'INSTITUTION'>(userRole === UserRole.ADMIN_CABANG ? 'INSTITUTION' : 'BRANCH');
  const [searchTerm, setSearchTerm] = useState('');
  
  // MODAL STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<'BRANCH' | 'INSTITUTION' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // FORM REFS
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Form Data
  const initialBranchState: Partial<Branch> = { name: '', code: '', headOfBranch: '', contact: '', address: '', email: '', logoUrl: null, username: '', password: '' };
  const initialInstitutionState: Partial<Institution> = { name: '', nspq: '', headmaster: '', contact: '', address: '', branchId: '', status: 'AKTIF', logoUrl: null, username: '', password: '' };
  
  const [formData, setFormData] = useState<any>({});

  // --- HANDLERS ---

  const openAddModal = (type: 'BRANCH' | 'INSTITUTION') => {
    setEditingType(type);
    setEditingId(null);
    setFormData(type === 'BRANCH' ? { ...initialBranchState } : { ...initialInstitutionState });
    setIsModalOpen(true);
  };

  const openEditModal = (type: 'BRANCH' | 'INSTITUTION', item: any) => {
    setEditingType(type);
    setEditingId(item.id);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = (type: 'BRANCH' | 'INSTITUTION', id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data ${type === 'BRANCH' ? 'Kortan' : 'Lembaga'} "${name}"? Data yang dihapus tidak dapat dikembalikan.`)) {
        if (type === 'BRANCH') {
            onDeleteBranch(id);
        } else {
            onDeleteInstitution(id);
        }
    }
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
        setFormData((prev: any) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingType === 'BRANCH') {
      if (editingId) {
        onUpdateBranch(formData as Branch);
      } else {
        const newBranch: Branch = {
          ...formData,
          id: Date.now().toString(),
          activeLembagaCount: 0
        };
        onAddBranch(newBranch);
      }
    } else {
      if (editingId) {
        onUpdateInstitution(formData as Institution);
      } else {
        const newInst: Institution = {
          ...formData,
          id: Date.now().toString(),
          studentCount: 0
        };
        onAddInstitution(newInst);
      }
    }
    setIsModalOpen(false);
  };

  // Filter Logic
  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.headOfBranch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInstitutions = institutions.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.headmaster.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
             <Building2 className="w-8 h-8 text-emerald-600" />
             Data Kelembagaan
           </h2>
           <p className="text-gray-500 text-sm mt-1">
             {userRole === UserRole.ADMIN_PUSAT 
                ? 'Manajemen Data Kortan & Lembaga TPQ Nasional' 
                : 'Daftar Lembaga TPQ di Wilayah'}
           </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            {/* Tab Switcher for Admin Pusat */}
            {userRole === UserRole.ADMIN_PUSAT && (
              <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                 <button
                    onClick={() => setActiveTab('BRANCH')}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'BRANCH' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    Data Kortan
                 </button>
                 <button
                    onClick={() => setActiveTab('INSTITUTION')}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'INSTITUTION' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    Data Lembaga
                 </button>
              </div>
            )}
            
            {/* Add Button */}
            {(userRole === UserRole.ADMIN_PUSAT && activeTab === 'BRANCH') && (
                <button 
                  onClick={() => openAddModal('BRANCH')}
                  className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 shadow-sm font-bold"
                >
                  <Plus className="w-4 h-4" /> Tambah Kortan
                </button>
            )}
             {((userRole === UserRole.ADMIN_PUSAT && activeTab === 'INSTITUTION') || userRole === UserRole.ADMIN_CABANG) && (
                <button 
                  onClick={() => openAddModal('INSTITUTION')}
                  className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 shadow-sm font-bold"
                >
                  <Plus className="w-4 h-4" /> Tambah Lembaga
                </button>
            )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center gap-4">
         <Search className="w-5 h-5 text-gray-400" />
         <input 
            type="text" 
            placeholder={`Cari nama ${activeTab === 'BRANCH' ? 'kortan / kepala' : 'TPQ / kepala / alamat'}...`}
            className="flex-1 outline-none bg-transparent text-gray-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
         />
      </div>

      {/* CONTENT: BRANCHES (Card View) */}
      {activeTab === 'BRANCH' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredBranches.map(branch => (
             <div key={branch.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group relative">
                {/* Logo & Info */}
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                       {branch.logoUrl ? (
                         <img src={branch.logoUrl} alt="Logo" className="w-12 h-12 object-contain rounded bg-gray-50 border border-gray-100" />
                       ) : (
                         <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                            <Map className="w-6 h-6 text-blue-600" />
                         </div>
                       )}
                       <div>
                         <h3 className="text-lg font-bold text-gray-900 leading-tight">{branch.name}</h3>
                         <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                           {branch.code}
                        </span>
                       </div>
                   </div>
                </div>
                
                <div className="space-y-3 mt-4">
                   <div className="flex items-center gap-3 text-sm text-gray-600">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium text-gray-900">{branch.headOfBranch}</span>
                   </div>
                   <div className="flex items-center gap-3 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{branch.address}</span>
                   </div>
                   <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{branch.contact}</span>
                   </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                   <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                      <School className="w-4 h-4" />
                      {branch.activeLembagaCount} Lembaga
                   </div>

                   {/* Action Buttons */}
                   {userRole === UserRole.ADMIN_PUSAT && (
                     <div className="flex gap-1">
                        <button 
                           onClick={() => openEditModal('BRANCH', branch)} 
                           className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                           title="Lihat Detail"
                        >
                           <Eye className="w-4 h-4" />
                        </button>
                        <button 
                           onClick={() => openEditModal('BRANCH', branch)} 
                           className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                           title="Edit Data"
                        >
                           <Edit className="w-4 h-4" />
                        </button>
                        <button 
                           onClick={() => handleDelete('BRANCH', branch.id, branch.name)}
                           className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                           title="Hapus Data"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                   )}
                </div>
             </div>
           ))}
           
           {filteredBranches.length === 0 && (
             <div className="col-span-full text-center py-10 text-gray-500 italic">
                Data kortan tidak ditemukan.
             </div>
           )}
        </div>
      )}

      {/* CONTENT: INSTITUTIONS (Table View) */}
      {activeTab === 'INSTITUTION' && (
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 text-gray-900 text-sm font-bold uppercase">
                     <tr>
                        <th className="p-4 border-b">Nama TPQ</th>
                        <th className="p-4 border-b">NSPQ</th>
                        <th className="p-4 border-b">Kepala TPQ</th>
                        {userRole === UserRole.ADMIN_PUSAT && <th className="p-4 border-b">Kortan</th>}
                        <th className="p-4 border-b">Alamat</th>
                        <th className="p-4 border-b text-center">Santri</th>
                        <th className="p-4 border-b text-center">Status</th>
                        <th className="p-4 border-b text-right">Aksi</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                     {filteredInstitutions.map(inst => {
                        const branchName = branches.find(b => b.id === inst.branchId)?.name || '-';
                        return (
                           <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                              <td className="p-4 font-bold text-gray-900 flex items-center gap-2">
                                 {inst.logoUrl ? (
                                    <img src={inst.logoUrl} className="w-6 h-6 rounded object-contain border" alt="logo" />
                                 ) : null}
                                 {inst.name}
                              </td>
                              <td className="p-4 font-mono text-gray-600">{inst.nspq}</td>
                              <td className="p-4 text-gray-700">{inst.headmaster}</td>
                              {userRole === UserRole.ADMIN_PUSAT && (
                                 <td className="p-4 text-blue-700 font-medium">{branchName}</td>
                              )}
                              <td className="p-4 text-gray-600 truncate max-w-[150px]" title={inst.address}>
                                 {inst.address}
                              </td>
                              <td className="p-4 text-center">
                                 <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-bold text-xs">
                                    {inst.studentCount}
                                 </span>
                              </td>
                              <td className="p-4 text-center">
                                 <span className={`px-2 py-1 rounded-full text-xs font-bold ${inst.status === 'AKTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {inst.status}
                                 </span>
                              </td>
                              <td className="p-4 text-right">
                                 <div className="flex justify-end gap-1">
                                    <button 
                                       onClick={() => openEditModal('INSTITUTION', inst)}
                                       className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                       title="Lihat Detail"
                                    >
                                       <Eye className="w-4 h-4" />
                                    </button>
                                    <button 
                                       onClick={() => openEditModal('INSTITUTION', inst)}
                                       className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                                       title="Edit Data"
                                    >
                                       <Edit className="w-4 h-4" />
                                    </button>
                                    <button 
                                       onClick={() => handleDelete('INSTITUTION', inst.id, inst.name)}
                                       className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                       title="Hapus Data"
                                    >
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        );
                     })}

                     {filteredInstitutions.length === 0 && (
                        <tr>
                           <td colSpan={userRole === UserRole.ADMIN_PUSAT ? 8 : 7} className="p-8 text-center text-gray-500 italic">
                              Data lembaga tidak ditemukan.
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* MODAL FORM (Dynamic for Branch & Institution) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                   {editingId ? <Edit className="w-5 h-5"/> : <Plus className="w-5 h-5"/>}
                   {editingId ? 'Edit Identitas' : 'Input Data Baru'} - {editingType === 'BRANCH' ? 'Kortan' : 'Lembaga TPQ'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
             </div>

             <form onSubmit={handleSubmit} className="p-6 space-y-5">
                
                {/* LOGO UPLOAD SECTION */}
                <div className="flex items-center gap-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <div className="w-20 h-20 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {formData.logoUrl ? (
                            <img src={formData.logoUrl} alt="Preview" className="w-full h-full object-contain" />
                        ) : (
                            <ImageIcon className="w-8 h-8 text-gray-300" />
                        )}
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Logo Identitas</label>
                        <p className="text-xs text-gray-500 mb-2">Format PNG/JPG, Maks 2MB.</p>
                        <div className="flex gap-2">
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
                                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded hover:bg-gray-50"
                            >
                                {formData.logoUrl ? 'Ganti Logo' : 'Upload Logo'}
                            </button>
                             {formData.logoUrl && (
                                <button 
                                    type="button" 
                                    onClick={() => setFormData({...formData, logoUrl: null})}
                                    className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded hover:bg-red-100"
                                >
                                    Hapus
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ACCOUNT CREDENTIALS - FOR ADMIN PUSAT/CABANG TO MANAGE */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Akun Login {editingType === 'BRANCH' ? 'Admin Kortan' : 'Admin Lembaga'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Username</label>
                            <div className="relative">
                                <Users className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    className="w-full border rounded-lg pl-9 pr-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    value={formData.username || ''}
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                    placeholder="Username Login"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Password</label>
                            <div className="relative">
                                <Key className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text" // Shown as text for admin to see easily when creating/editing
                                    className="w-full border rounded-lg pl-9 pr-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    value={formData.password || ''}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                    placeholder="Password Login"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* COMMON FIELDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nama {editingType === 'BRANCH' ? 'Kortan' : 'Lembaga TPQ'} *</label>
                        <input
                           type="text"
                           required
                           className="w-full border rounded-lg p-2.5 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                           value={formData.name || ''}
                           onChange={e => setFormData({...formData, name: e.target.value})}
                           placeholder={editingType === 'BRANCH' ? "Contoh: Kortan Surabaya Selatan" : "Contoh: TPQ Al-Hikmah"}
                        />
                    </div>

                    {editingType === 'BRANCH' ? (
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-1">Kode Kortan *</label>
                             <input
                                type="text"
                                required
                                className="w-full border rounded-lg p-2.5 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.code || ''}
                                onChange={e => setFormData({...formData, code: e.target.value})}
                                placeholder="Contoh: K-SBY-01"
                             />
                        </div>
                    ) : (
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-1">Nomor Statistik (NSPQ) *</label>
                             <input
                                type="text"
                                required
                                className="w-full border rounded-lg p-2.5 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.nspq || ''}
                                onChange={e => setFormData({...formData, nspq: e.target.value})}
                                placeholder="Nomor Statistik"
                             />
                        </div>
                    )}

                    <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">{editingType === 'BRANCH' ? 'Ketua Kortan' : 'Kepala TPQ'} *</label>
                         <input
                            type="text"
                            required
                            className="w-full border rounded-lg p-2.5 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={editingType === 'BRANCH' ? (formData.headOfBranch || '') : (formData.headmaster || '')}
                            onChange={e => {
                                if (editingType === 'BRANCH') setFormData({...formData, headOfBranch: e.target.value});
                                else setFormData({...formData, headmaster: e.target.value});
                            }}
                         />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">Nomor Kontak / HP</label>
                         <input
                            type="text"
                            className="w-full border rounded-lg p-2.5 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={formData.contact || ''}
                            onChange={e => setFormData({...formData, contact: e.target.value})}
                         />
                    </div>
                     <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">Email (Opsional)</label>
                         <input
                            type="email"
                            className="w-full border rounded-lg p-2.5 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={formData.email || ''}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                         />
                    </div>
                </div>

                {editingType === 'INSTITUTION' && (
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Kortan Induk (Wilayah)</label>
                        <select
                           className="w-full border rounded-lg p-2.5 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                           value={formData.branchId || ''}
                           onChange={e => setFormData({...formData, branchId: e.target.value})}
                           disabled={userRole === UserRole.ADMIN_CABANG} // Jika admin cabang, otomatis ke cabangnya
                        >
                           <option value="">-- Pilih Kortan --</option>
                           {branches.map(b => (
                             <option key={b.id} value={b.id}>{b.name}</option>
                           ))}
                        </select>
                     </div>
                )}

                <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">Alamat Lengkap</label>
                     <textarea
                        rows={3}
                        className="w-full border rounded-lg p-2.5 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                        value={formData.address || ''}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                     />
                </div>
                
                {/* FOOTER ACTIONS */}
                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                     <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-5 py-2.5 text-gray-700 font-bold hover:bg-gray-100 rounded-lg transition-colors"
                     >
                        Batal
                     </button>
                     <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md transition-all"
                     >
                        <Save className="w-5 h-5" />
                        Simpan Identitas
                     </button>
                </div>
             </form>
          </div>
        </div>
      )}

    </div>
  );
};
