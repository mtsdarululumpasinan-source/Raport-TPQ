
import React, { useState } from 'react';
import { Santri, JilidType, Institution, Branch, User, UserRole } from '../types';
import { Plus, Search, Edit2, Trash2, Eye, Filter, ArrowUpDown, ArrowUp, ArrowDown, X, Save, MapPin, Building2, Printer } from 'lucide-react';

interface StudentListProps {
  santris: Santri[];
  institutions: Institution[]; // Added to lookup institution names
  branches: Branch[];          // Added to lookup branch names
  currentUser: User | null;    // Needed to determine if institution select should be shown
  addSantri: (santri: Santri) => void;
  editSantri: (santri: Santri) => void;
  deleteSantri: (id: string) => void;
  onViewDetail: (id: string) => void;
  onPrintReport: (id: string) => void; 
}

type SortField = 'NAME' | 'NIS' | 'NISM';
type SortOrder = 'ASC' | 'DESC';
type StatusFilter = 'ALL' | 'AKTIF' | 'NON_AKTIF' | 'LULUS';

export const StudentList: React.FC<StudentListProps> = ({ 
  santris, 
  institutions, 
  branches, 
  currentUser,
  addSantri, 
  editSantri, 
  deleteSantri, 
  onViewDetail, 
  onPrintReport 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL'); 
  const [sortBy, setSortBy] = useState<SortField>('NAME');
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Initial State for New Santri
  const initialFormState: Partial<Santri> = {
    name: '',
    nism: '',
    registrationNumber: '',
    gender: 'L',
    birthPlace: '',
    birthDate: '',
    fatherName: '',
    motherName: '',
    currentJilid: JilidType.PBP_1,
    address: '',
    status: 'AKTIF',
    institutionId: '' // Explicitly empty
  };

  const [newSantri, setNewSantri] = useState<Partial<Santri>>(initialFormState);

  const isAdminLembaga = currentUser?.role === UserRole.ADMIN_LEMBAGA;

  const openAddModal = () => {
    setEditingId(null);
    // If Admin Lembaga, pre-fill institutionId
    setNewSantri({
        ...initialFormState,
        institutionId: isAdminLembaga && currentUser?.entityId ? currentUser.entityId : ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (santri: Santri) => {
    setEditingId(santri.id);
    setNewSantri({ ...santri });
    setIsModalOpen(true);
  };

  const validateForm = (santri: Partial<Santri>): string | null => {
    // 1. Validasi Kolom Wajib
    if (!santri.name || santri.name.length < 3) return "Nama Santri wajib diisi minimal 3 karakter.";
    if (!santri.registrationNumber) return "NIS (Nomor Induk Lokal) wajib diisi.";
    
    // 2. Validasi Format Angka (NIS & NISM)
    const numberRegex = /^[0-9]+$/;
    if (!numberRegex.test(santri.registrationNumber)) return "NIS hanya boleh berisi angka.";
    if (santri.nism && !numberRegex.test(santri.nism)) return "NISM hanya boleh berisi angka.";

    // 3. Validasi Lembaga (Khusus Admin Pusat/Cabang)
    if (!isAdminLembaga && !santri.institutionId) return "Mohon pilih Lembaga TPQ untuk santri ini.";

    // 4. Validasi Tanggal Lahir (Tidak boleh masa depan)
    if (santri.birthDate) {
        const selectedDate = new Date(santri.birthDate);
        const today = new Date();
        if (selectedDate > today) return "Tanggal lahir tidak valid (tidak boleh di masa depan).";
    }

    return null; // Lolos Validasi
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // JALANKAN VALIDASI
    const errorMsg = validateForm(newSantri);
    if (errorMsg) {
        alert(errorMsg);
        return;
    }

    if (editingId) {
      // Logic Update
      const updatedSantri = {
        ...newSantri,
        id: editingId,
      } as Santri;
      
      editSantri(updatedSantri);
      alert('Data santri berhasil diperbarui!');
    } else {
      // Logic Create
      // Ensure institutionId is set correctly based on role
      const finalInstitutionId = isAdminLembaga && currentUser?.entityId 
          ? currentUser.entityId 
          : newSantri.institutionId;

      addSantri({
        id: Date.now().toString(), 
        institutionId: finalInstitutionId!, 
        name: newSantri.name!,
        nism: newSantri.nism || '-',
        registrationNumber: newSantri.registrationNumber!,
        gender: newSantri.gender as 'L' | 'P',
        birthPlace: newSantri.birthPlace || '',
        birthDate: newSantri.birthDate || '',
        fatherName: newSantri.fatherName || '',
        motherName: newSantri.motherName || '',
        currentJilid: newSantri.currentJilid as JilidType,
        address: newSantri.address || '',
        joinDate: new Date().toISOString().split('T')[0],
        status: (newSantri.status as 'AKTIF' | 'NON_AKTIF' | 'LULUS') || 'AKTIF'
      });
      alert('Santri berhasil ditambahkan!');
    }

    setIsModalOpen(false);
    setNewSantri(initialFormState);
    setEditingId(null);
  };

  // Processing Data: Search -> Filter -> Sort
  const processedSantris = santris
    .filter(s => {
      // 1. Search Logic
      const matchesSearch = 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.registrationNumber.includes(searchTerm) ||
        s.nism.includes(searchTerm);
      
      // 2. Status Filter Logic
      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

      // 3. Class Filter Logic
      const matchesClass = classFilter === 'ALL' || s.currentJilid === classFilter;

      return matchesSearch && matchesStatus && matchesClass;
    })
    .sort((a, b) => {
      // 4. Sorting Logic
      let valA = '';
      let valB = '';

      switch (sortBy) {
        case 'NAME':
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case 'NIS':
          valA = a.registrationNumber;
          valB = b.registrationNumber;
          break;
        case 'NISM':
          valA = a.nism;
          valB = b.nism;
          break;
      }

      if (valA < valB) return sortOrder === 'ASC' ? -1 : 1;
      if (valA > valB) return sortOrder === 'ASC' ? 1 : -1;
      return 0;
    });

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC');
  };

  // Filter available institutions for dropdown (based on role)
  const availableInstitutions = institutions; 

  return (
    <div className="p-6 animate-fade-in pb-20">
      <div className="flex flex-col mb-6 gap-4">
        <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-gray-800">Data Santri</h2>
             <button
                onClick={openAddModal}
                className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-bold"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">Tambah Santri</span>
              </button>
        </div>
        
        {/* Filters and Controls Toolbar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-4 items-center">
          
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari Nama, NIS, atau NISM..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-100 text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
             {/* Class Filter */}
             <div className="flex items-center gap-2 w-full md:w-auto">
                 <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="w-full md:w-40 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-100 text-sm text-gray-800 font-medium"
                 >
                    <option value="ALL">Semua Kelas</option>
                    {Object.values(JilidType).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                 </select>
             </div>

             {/* Status Filter */}
             <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                   className="w-full md:w-40 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-100 text-sm text-gray-800 font-medium"
                >
                   <option value="ALL">Semua Status</option>
                   <option value="AKTIF">Aktif</option>
                   <option value="NON_AKTIF">Non Aktif</option>
                   <option value="LULUS">Lulus</option>
                </select>
             </div>

             {/* Sorting */}
             <div className="flex items-center gap-2 w-full md:w-auto">
                 <div className="flex gap-1 w-full md:w-auto">
                     <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortField)}
                        className="flex-1 md:w-40 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-100 text-sm text-gray-800 font-medium"
                     >
                        <option value="NAME">Urut Nama</option>
                        <option value="NIS">Urut NIS</option>
                        <option value="NISM">Urut NISM</option>
                     </select>
                     <button 
                        onClick={toggleSortOrder}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors bg-white"
                        title={sortOrder === 'ASC' ? 'Urutan Naik (A-Z)' : 'Urutan Turun (Z-A)'}
                     >
                        {sortOrder === 'ASC' ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                     </button>
                 </div>
             </div>
          </div>

        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-sm font-semibold uppercase">
              <tr>
                <th className="p-4 border-b text-gray-700">NIS / NISM</th>
                <th className="p-4 border-b text-gray-700">Nama Santri</th>
                <th className="p-4 border-b text-center text-gray-700">L/P</th>
                <th className="p-4 border-b text-gray-700">Jilid/Kelas</th>
                <th className="p-4 border-b text-gray-700">Lembaga & Kortan</th>
                <th className="p-4 border-b text-gray-700">Alamat</th>
                <th className="p-4 border-b text-gray-700">Wali (Ayah)</th>
                <th className="p-4 border-b text-center text-gray-700">Status</th>
                <th className="p-4 border-b text-right text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {processedSantris.length > 0 ? (
                processedSantris.map((santri) => {
                  // Lookup Institution and Branch
                  const institution = institutions.find(i => i.id === santri.institutionId);
                  const branch = branches.find(b => b.id === institution?.branchId);

                  return (
                    <tr key={santri.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-mono text-gray-600">
                          <div>{santri.registrationNumber}</div>
                          <div className="text-xs text-gray-400">{santri.nism}</div>
                      </td>
                      <td className="p-4 font-bold text-gray-900">{santri.name}</td>
                      <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${santri.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                              {santri.gender}
                          </span>
                      </td>
                      <td className="p-4 text-gray-700">
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {santri.currentJilid}
                        </span>
                      </td>
                      
                      {/* NEW DATA RENDER */}
                      <td className="p-4 text-gray-700">
                         {institution ? (
                             <div>
                                <div className="font-bold text-gray-800 flex items-center gap-1">
                                    <Building2 className="w-3 h-3 text-emerald-600" /> {institution.name}
                                </div>
                                <div className="text-xs text-blue-600">{branch?.name || '-'}</div>
                             </div>
                         ) : (
                             <span className="text-gray-400 italic">-</span>
                         )}
                      </td>
                      <td className="p-4 text-gray-600 max-w-[150px] truncate" title={santri.address}>
                          <div className="flex items-center gap-1">
                             <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                             {santri.address || '-'}
                          </div>
                      </td>
                      {/* END NEW DATA RENDER */}

                      <td className="p-4 text-gray-600">{santri.fatherName}</td>
                      <td className="p-4 text-center">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                              santri.status === 'AKTIF' ? 'bg-green-100 text-green-700' : 
                              santri.status === 'LULUS' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                          }`}>
                              {santri.status}
                          </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                           <button 
                            onClick={() => onPrintReport(santri.id)}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
                            title="Cetak Raport"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                           <button 
                            onClick={() => onViewDetail(santri.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => openEditModal(santri)}
                            className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => deleteSantri(santri.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500 italic">
                    Tidak ada data santri yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah/Edit Santri */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0">
              <h3 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edit Data Santri' : 'Tambah Santri Baru'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Institution Selection (For Admin Pusat / Kortan) */}
              {!isAdminLembaga && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-2">
                     <label className="block text-sm font-bold text-blue-800 mb-1">Lembaga TPQ *</label>
                     <select
                        required
                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900 font-medium"
                        value={newSantri.institutionId}
                        onChange={e => setNewSantri({...newSantri, institutionId: e.target.value})}
                     >
                        <option value="">-- Pilih Lembaga TPQ --</option>
                        {availableInstitutions.map(inst => (
                            <option key={inst.id} value={inst.id}>
                                {inst.name} ({branches.find(b => b.id === inst.branchId)?.name || 'Kortan?'})
                            </option>
                        ))}
                     </select>
                     <p className="text-xs text-blue-600 mt-1">Santri akan didaftarkan ke lembaga yang dipilih.</p>
                  </div>
              )}

              {/* Identitas Utama */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-100 text-gray-900"
                      value={newSantri.name}
                      onChange={e => setNewSantri({...newSantri, name: e.target.value})}
                      placeholder="Nama Lengkap Santri"
                    />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIS (Lokal) *</label>
                    <input
                      type="text"
                      required
                      className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-100 text-gray-900"
                      value={newSantri.registrationNumber}
                      onChange={e => setNewSantri({...newSantri, registrationNumber: e.target.value})}
                      placeholder="Nomor Induk Lokal (Angka)"
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NISM (Mabin)</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-100 text-gray-900"
                      value={newSantri.nism}
                      onChange={e => setNewSantri({...newSantri, nism: e.target.value})}
                      placeholder="Nomor Induk Mabin (Angka)"
                    />
                 </div>
              </div>

              {/* Data Kelahiran & Gender */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                    <select
                      className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-100 text-gray-900"
                      value={newSantri.gender}
                      onChange={e => setNewSantri({...newSantri, gender: e.target.value as 'L' | 'P'})}
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-100 text-gray-900"
                      value={newSantri.birthPlace}
                      onChange={e => setNewSantri({...newSantri, birthPlace: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                    <input
                      type="date"
                      className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-100 text-gray-900"
                      value={newSantri.birthDate}
                      onChange={e => setNewSantri({...newSantri, birthDate: e.target.value})}
                    />
                 </div>
              </div>

              {/* Data Orang Tua */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ayah</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-100 text-gray-900"
                      value={newSantri.fatherName}
                      onChange={e => setNewSantri({...newSantri, fatherName: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ibu</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-100 text-gray-900"
                      value={newSantri.motherName}
                      onChange={e => setNewSantri({...newSantri, motherName: e.target.value})}
                    />
                 </div>
              </div>

              <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                  <textarea
                    rows={2}
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-100 text-gray-900 resize-none"
                    value={newSantri.address}
                    onChange={e => setNewSantri({...newSantri, address: e.target.value})}
                  />
               </div>

              {/* Data Akademik */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat / Jilid</label>
                    <select
                      className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-100 text-gray-900"
                      value={newSantri.currentJilid}
                      onChange={e => setNewSantri({...newSantri, currentJilid: e.target.value as JilidType})}
                    >
                      {Object.values(JilidType).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status Santri</label>
                    <select
                      className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-100 text-gray-900 font-medium"
                      value={newSantri.status}
                      onChange={e => setNewSantri({...newSantri, status: e.target.value as 'AKTIF' | 'NON_AKTIF' | 'LULUS'})}
                    >
                      <option value="AKTIF">AKTIF</option>
                      <option value="NON_AKTIF">NON AKTIF</option>
                      <option value="LULUS">LULUS</option>
                    </select>
                 </div>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                 <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                 >
                    Batal
                 </button>
                 <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md transition-all"
                 >
                    <Save className="w-5 h-5" />
                    Simpan Data
                 </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
