import React, { useState, useEffect } from 'react';
import { Santri, JilidType } from '../types';
import { TrendingUp, CheckSquare, Square, ArrowRight, CheckCircle2 } from 'lucide-react';

interface PromotionProps {
  santris: Santri[];
  onPromote: (santriIds: string[], targetJilid: JilidType) => void;
}

export const Promotion: React.FC<PromotionProps> = ({ santris, onPromote }) => {
  const [sourceJilid, setSourceJilid] = useState<JilidType>(JilidType.PBP_1);
  const [targetJilid, setTargetJilid] = useState<JilidType>(JilidType.PBP_2);
  const [selectedSantriIds, setSelectedSantriIds] = useState<Set<string>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Logic to determine the next level automatically
  const getNextJilid = (current: JilidType): JilidType => {
    const jilids = Object.values(JilidType);
    const currentIndex = jilids.indexOf(current);
    if (currentIndex >= 0 && currentIndex < jilids.length - 1) {
      return jilids[currentIndex + 1];
    }
    return current; // If last level, stay same
  };

  useEffect(() => {
    setTargetJilid(getNextJilid(sourceJilid));
    setSelectedSantriIds(new Set()); // Reset selection on source change
    setSuccessMessage(null);
  }, [sourceJilid]);

  // Filter students based on source class
  const studentsInClass = santris.filter(s => s.currentJilid === sourceJilid);

  const toggleSelectAll = () => {
    if (selectedSantriIds.size === studentsInClass.length) {
      setSelectedSantriIds(new Set());
    } else {
      const allIds = studentsInClass.map(s => s.id);
      setSelectedSantriIds(new Set(allIds));
    }
  };

  const toggleSelectOne = (id: string) => {
    const newSelection = new Set(selectedSantriIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedSantriIds(newSelection);
  };

  const handleSubmit = () => {
    if (selectedSantriIds.size === 0) {
      alert("Pilih minimal satu santri untuk dinaikkan.");
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menaikkan ${selectedSantriIds.size} santri dari ${sourceJilid} ke ${targetJilid}?`)) {
      const count = selectedSantriIds.size;
      onPromote(Array.from(selectedSantriIds), targetJilid);
      setSelectedSantriIds(new Set());
      setSuccessMessage(`Berhasil menaikkan ${count} santri ke kelas ${targetJilid}.`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  return (
    <div className="p-6 animate-fade-in max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-emerald-600" />
        Kenaikan Kelas Massal
      </h2>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-200 text-green-800 rounded-xl flex items-center gap-3 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Control Panel */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row items-end gap-6">
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-gray-800 mb-2">Pilih Kelas Asal</label>
            <select
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-100 text-gray-900 font-medium"
              value={sourceJilid}
              onChange={(e) => setSourceJilid(e.target.value as JilidType)}
            >
              {Object.values(JilidType).map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>
          
          <div className="hidden md:flex items-center pb-3 text-emerald-600">
            <div className="bg-emerald-50 p-2 rounded-full">
                <ArrowRight className="w-6 h-6" />
            </div>
          </div>

          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-gray-800 mb-2">Ke Tingkat (Tujuan)</label>
            <select
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-100 text-gray-900 font-medium border-emerald-200"
              value={targetJilid}
              onChange={(e) => setTargetJilid(e.target.value as JilidType)}
            >
              {Object.values(JilidType).map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">
            Daftar Santri Kelas {sourceJilid} <span className="ml-2 text-xs font-normal bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">{studentsInClass.length} Santri</span>
          </h3>
          <button 
            onClick={toggleSelectAll}
            className="text-sm text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1.5 bg-white border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            {studentsInClass.length > 0 && selectedSantriIds.size === studentsInClass.length ? (
                <><CheckSquare className="w-4 h-4" /> Batal Pilih Semua</>
            ) : (
                <><Square className="w-4 h-4" /> Pilih Semua</>
            )}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-sm font-bold uppercase border-b border-gray-200">
              <tr>
                <th className="p-4 w-12 text-center text-gray-900">#</th>
                <th className="p-4 text-gray-900">NIS</th>
                <th className="p-4 text-gray-900">Nama Santri</th>
                <th className="p-4 text-gray-900">Wali (Ayah)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {studentsInClass.length > 0 ? (
                studentsInClass.map((santri) => (
                  <tr 
                    key={santri.id} 
                    className={`hover:bg-emerald-50 transition-colors cursor-pointer ${selectedSantriIds.has(santri.id) ? 'bg-emerald-50/70' : ''}`}
                    onClick={() => toggleSelectOne(santri.id)}
                  >
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox"
                        checked={selectedSantriIds.has(santri.id)}
                        onChange={() => toggleSelectOne(santri.id)}
                        className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="p-4 font-mono text-gray-700 font-medium">{santri.registrationNumber}</td>
                    <td className="p-4 font-bold text-gray-900">{santri.name}</td>
                    <td className="p-4 text-gray-700">{santri.fatherName}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-400 italic bg-gray-50">
                    <p>Tidak ada santri di kelas {sourceJilid}.</p>
                    <p className="text-xs mt-1">Pilih kelas lain pada dropdown "Kelas Asal".</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mt-8 flex justify-end sticky bottom-6 z-10">
        <button
          onClick={handleSubmit}
          disabled={selectedSantriIds.size === 0}
          className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white shadow-xl transition-all transform ${
            selectedSantriIds.size === 0
              ? 'bg-gray-400 cursor-not-allowed shadow-none opacity-70'
              : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-105 active:scale-95 ring-4 ring-emerald-100'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          Proses Kenaikan ({selectedSantriIds.size} Santri)
        </button>
      </div>
    </div>
  );
};