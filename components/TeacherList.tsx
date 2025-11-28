
import React, { useState } from 'react';
import { Teacher, JilidType, User, UserRole } from '../types';
import { Plus, Search, Edit2, Trash2, X, Save, UsersRound, Phone, MapPin, Briefcase, GraduationCap } from 'lucide-react';

interface TeacherListProps {
  teachers: Teacher[];
  currentUser: User | null;
  addTeacher: (teacher: Teacher) => void;
  editTeacher: (teacher: Teacher) => void;
  deleteTeacher: (id: string) => void;
}

export const TeacherList: React.FC<TeacherListProps> = ({ 
  teachers, 
  currentUser, 
  addTeacher, 
  editTeacher, 
  deleteTeacher 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USTADZ' | 'WALI_KELAS' | 'KEPALA_TPQ'>('ALL');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialFormState: Partial<Teacher> = {
    name: '',
    gender: 'L',
    nip: '',
    phone: '',
    address: '',
    position: 'USTADZ',
    assignedClass: undefined,
    status: 'AKTIF',
    institutionId: ''
  };

  const [formData, setFormData] = useState<Partial<Teacher>>(initialFormState);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
        ...initialFormState,
        institutionId: currentUser?.entityId || ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setEditingId(teacher.id);
    setFormData({ ...teacher });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
        alert("Nama wajib diisi!");
        return;
    }

    // Jika jabatan bukan Wali Kelas, hapus assignedClass
    if (formData.position !== 'WALI_KELAS') {
        formData.assignedClass = undefined;
    }

    if (editingId) {
      editTeacher({ ...formData, id: editingId } as Teacher);
      alert('Data ustadz berhasil diperbarui!');
    } else {
      addTeacher({
        ...formData,
        id: Date.now().toString(),
        joinDate: new Date().toISOString().split('T')[0],
        status: 'AKTIF',
        institutionId: currentUser?.entityId || 'i1' // Default if logic fails
      } as Teacher);
      alert('Ustadz baru berhasil ditambahkan!');
    }
    setIsModalOpen(false);
  };

  const processedTeachers = teachers.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.nip.includes(searchTerm);
      const matchesRole = roleFilter === 'ALL' || t.position === roleFilter;
      return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 animate-fade-in pb-20">
      <div className="flex flex-col mb-6 gap-4">
        <div className="flex justify-between items-center">
             <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <UsersRound className="w-8 h-8 text-emerald-600" />
                    Data Ustadz & Wali Kelas
                </h2>
                <p className="text-sm text-gray-500 mt-1">Manajemen data pengajar dan penugasan wali kelas.</p>
             </div>
             <button
                onClick={openAddModal}
                className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-bold"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">Tambah Pengajar</span>
              </button>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari Nama atau NIP..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-100 text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="w-full md:w-48 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-100 text-gray-900 font-medium"
          >
            <option value="ALL">Semua Jabatan</option>
            <option value="USTADZ">Ustadz / Pengajar</option>
            <option value="WALI_KELAS">Wali Kelas</option>
            <option value="KEPALA_TPQ">Kepala TPQ</option>
          </select>
        </div>
      </div>

      {/* NEW TABLE LAYOUT */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-900 text-sm font-bold uppercase">
              <tr>
                <th className="p-4 border-b">Nama Pengajar</th>
                <th className="p-4 border-b">NIP</th>
                <th className="p-4 border-b">Jabatan</th>
                <th className="p-4 border-b">Kelas Binaan</th>
                <th className="p-4 border-b">Kontak</th>
                <th className="p-4 border-b text-center">Status</th>
                <th className="p-4 border-b text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {processedTeachers.length > 0 ? (
                processedTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-900 flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold ${teacher.gender === 'P' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                        {teacher.name.charAt(0)}
                      </div>
                      {teacher.name}
                    </td>
                    <td className="p-4 text-gray-600 font-mono">{teacher.nip || '-'}</td>
                    <td className="p-4 text-gray-700">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        teacher.position === 'WALI_KELAS' ? 'bg-emerald-100 text-emerald-800' :
                        teacher.position === 'KEPALA_TPQ' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {teacher.position.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-emerald-700 font-bold">
                        {teacher.position === 'WALI_KELAS' && teacher.assignedClass ? teacher.assignedClass : '-'}
                    </td>
                    <td className="p-4 text-gray-600">{teacher.phone || '-'}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${teacher.status === 'AKTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {teacher.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                          <button 
                              onClick={() => openEditModal(teacher)}
                              className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded"
                              title="Edit"
                          >
                              <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                              onClick={() => deleteTeacher(teacher.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Hapus"
                          >
                              <Trash2 className="h-4 w-4" />
                          </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 italic">
                    Tidak ada data pengajar yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg animate-fade-in">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? 'Edit Data Pengajar' : 'Tambah Pengajar Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg p-2.5 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Nama Lengkap Ustadz/Ustadzah"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Jenis Kelamin</label>
                    <select
                        className="w-full border rounded-lg p-2.5 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={formData.gender || 'L'}
                        onChange={e => setFormData({...formData, gender: e.target.value as 'L' | 'P'})}
                    >
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">NIP / KTP</label>
                    <input
                        type="text"
                        className="w-full border rounded-lg p-2.5 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={formData.nip}
                        onChange={e => setFormData({...formData, nip: e.target.value})}
                        placeholder="Nomor Identitas"
                    />
                  </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">No. HP / WA</label>
                <input
                    type="text"
                    className="w-full border rounded-lg p-2.5 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="08..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Alamat</label>
                <textarea
                  rows={2}
                  className="w-full border rounded-lg p-2.5 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  placeholder="Alamat domisili"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Jabatan / Posisi</label>
                    <select
                        className="w-full border rounded-lg p-2.5 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                        value={formData.position}
                        onChange={e => setFormData({...formData, position: e.target.value as any})}
                    >
                        <option value="USTADZ">Ustadz (Pengajar)</option>
                        <option value="WALI_KELAS">Wali Kelas</option>
                        <option value="KEPALA_TPQ">Kepala TPQ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                    <select
                        className="w-full border rounded-lg p-2.5 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value as any})}
                    >
                        <option value="AKTIF">Aktif</option>
                        <option value="NON_AKTIF">Non Aktif</option>
                    </select>
                  </div>
              </div>

              {/* Tampil hanya jika jabatan adalah Wali Kelas */}
              {formData.position === 'WALI_KELAS' && (
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 animate-fade-in">
                      <label className="block text-sm font-bold text-emerald-800 mb-1 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" /> Kelas Binaan
                      </label>
                      <select
                        required
                        className="w-full border rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                        value={formData.assignedClass || ''}
                        onChange={e => setFormData({...formData, assignedClass: e.target.value as JilidType})}
                      >
                          <option value="">-- Pilih Kelas --</option>
                          {Object.values(JilidType).map(type => (
                              <option key={type} value={type}>{type}</option>
                          ))}
                      </select>
                  </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
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
                    Simpan
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
