

import React, { useState, useEffect } from 'react';
import { Santri, Assessment, JilidType, AttitudeGrade, Teacher } from '../types';
import { generateTeacherComment } from '../services/geminiService';
import { Sparkles, Save, Loader2, Calculator, X, Bookmark, BookOpen, ArrowLeft, Search, Filter, CheckCircle, AlertCircle, Edit, Check, UserCircle } from 'lucide-react';

interface GradingFormProps {
  santris: Santri[];
  assessments: Assessment[];
  teachers: Teacher[]; // Added
  addAssessment: (assessment: Assessment) => void;
  updateAssessment: (assessment: Assessment) => void;
}

export const GradingForm: React.FC<GradingFormProps> = ({ santris, assessments, teachers, addAssessment, updateAssessment }) => {
  // VIEW STATE: LIST or FORM
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');

  // STATE: Active Program (PBP vs PSQ) & Filters
  const [activeProgram, setActiveProgram] = useState<'PBP' | 'PSQ'>('PBP');
  const [selectedJilidFilter, setSelectedJilidFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [term, setTerm] = useState('Semester Genap 2023/2024'); // Default Term

  // SUCCESS NOTIFICATION STATE
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // FORM STATES
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedSantriId, setSelectedSantriId] = useState('');
  const [assessingTeacherId, setAssessingTeacherId] = useState<string>(''); // NEW
  
  // --- SHARED SCORES ---
  const [memorizationScore, setMemorizationScore] = useState(0); // Max 100
  const [lastSurah, setLastSurah] = useState('');
  const [teacherNote, setTeacherNote] = useState('');
  
  // Attitude (Shared for PBP & PSQ)
  const [attitude, setAttitude] = useState<{
    sopanSantun: AttitudeGrade;
    kerjasama: AttitudeGrade;
    kepatuhan: AttitudeGrade;
    keberanian: AttitudeGrade;
    kecakapan: AttitudeGrade;
    kebersihan: AttitudeGrade;
    kerajinan: AttitudeGrade;
  }>({
    sopanSantun: 'BAIK', kerjasama: 'BAIK', kepatuhan: 'BAIK', keberanian: 'BAIK',
    kecakapan: 'BAIK', kebersihan: 'BAIK', kerajinan: 'BAIK'
  });

  // Attendance (Shared for PBP & PSQ)
  const [sakit, setSakit] = useState(0);
  const [izin, setIzin] = useState(0);
  const [alpha, setAlpha] = useState(0);

  // --- PBP SPECIFIC SCORES ---
  const [fhScore, setFhScore] = useState(0); // Fakta Huruf (Max 30)
  const [mhScorePbp, setMhScorePbp] = useState(0); // Makhorijul & Sifatul Huruf (Combined Max 30)
  const [ahScorePbp, setAhScorePbp] = useState(0); // Ahkamul Huruf (Max 20)
  const [tmScore, setTmScore] = useState(0); // Titian Murottal (Max 20)
  const [materialDoa, setMaterialDoa] = useState('');

  // --- PSQ SPECIFIC SCORES ---
  const [mhScorePsq, setMhScorePsq] = useState(0); // Max 30
  const [ahScorePsq, setAhScorePsq] = useState(0); // Max 30
  const [fashohahScorePsq, setFashohahScorePsq] = useState(0); // Max 40
  const [matTajwid, setMatTajwid] = useState('');
  const [matUbudiyah, setMatUbudiyah] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);

  // Colors based on Program
  const themeColor = activeProgram === 'PBP' ? 'emerald' : 'blue';
  const bgColor = activeProgram === 'PBP' ? 'bg-emerald-600' : 'bg-blue-600';
  const hoverBgColor = activeProgram === 'PBP' ? 'hover:bg-emerald-700' : 'hover:bg-blue-700';
  const lightBgColor = activeProgram === 'PBP' ? 'bg-emerald-50' : 'bg-blue-50';
  const textColor = activeProgram === 'PBP' ? 'text-emerald-700' : 'text-blue-700';
  const borderColor = activeProgram === 'PBP' ? 'focus:ring-emerald-500' : 'focus:ring-blue-500';

  // --- FILTERING LOGIC FOR LIST VIEW ---
  const filteredSantris = santris.filter(s => {
      // 1. Program Filter
      const matchesProgram = activeProgram === 'PBP' ? s.currentJilid.startsWith('PBP') : s.currentJilid.startsWith('PSQ');
      // 2. Class Filter
      const matchesClass = !selectedJilidFilter || s.currentJilid === selectedJilidFilter;
      // 3. Search Filter
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.registrationNumber.includes(searchTerm);
      
      return matchesProgram && matchesClass && matchesSearch;
  });

  const selectedSantri = santris.find(s => s.id === selectedSantriId);
  const availableTeachers = teachers.filter(t => t.institutionId === selectedSantri?.institutionId);

  // Calculate Totals for Display
  const totalBacaanPBP = fhScore + mhScorePbp + ahScorePbp + tmScore;
  const totalBacaanPSQ = mhScorePsq + ahScorePsq + fashohahScorePsq;

  useEffect(() => {
     // Reset filter when program changes
     setSelectedJilidFilter('');
  }, [activeProgram]);

  const resetForm = () => {
    setEditingId(null);
    setSelectedSantriId('');
    setAssessingTeacherId('');
    setMemorizationScore(0);
    setLastSurah('');
    setTeacherNote('');
    // Reset Shared
    setSakit(0); setIzin(0); setAlpha(0);
    setAttitude({
        sopanSantun: 'BAIK', kerjasama: 'BAIK', kepatuhan: 'BAIK', keberanian: 'BAIK',
        kecakapan: 'BAIK', kebersihan: 'BAIK', kerajinan: 'BAIK'
    });
    // Reset PBP
    setFhScore(0); setMhScorePbp(0); setAhScorePbp(0); setTmScore(0);
    setMaterialDoa('');
    // Reset PSQ
    setMhScorePsq(0); setAhScorePsq(0); setFashohahScorePsq(0); 
    setMatTajwid(''); setMatUbudiyah('');
  };

  const handleGenerateComment = async () => {
    if (!selectedSantri) return;
    setIsGenerating(true);

    const preview: Partial<Assessment> = activeProgram === 'PBP' ? {
        fhScore, mhScore: mhScorePbp, ahScore: ahScorePbp, tmScore,
        memorizationScore, lastSurah, materialDoa,
        attitude,
        attendanceSakit: sakit, attendanceIzin: izin
    } : {
        mhScore: mhScorePsq, ahScore: ahScorePsq, fashohahScore: fashohahScorePsq,
        memorizationScore, lastSurah,
        materialTajwid: matTajwid, materialUbudiyah: matUbudiyah,
        attitude,
        attendanceSakit: sakit, attendanceIzin: izin, attendanceAlpha: alpha
    };
    
    const comment = await generateTeacherComment(selectedSantri, preview);
    setTeacherNote(comment);
    setIsGenerating(false);
  };

  // OPEN FORM FOR GRADING (Create or Edit)
  const openGradingForm = (santriId: string, assessment?: Assessment) => {
    resetForm();
    setSelectedSantriId(santriId);
    
    if (assessment) {
        // EDIT MODE
        setEditingId(assessment.id);
        setTerm(assessment.term);
        setAssessingTeacherId(assessment.teacherId || '');
        setMemorizationScore(assessment.memorizationScore);
        setLastSurah(assessment.lastSurah);
        setTeacherNote(assessment.teacherNote);
        if (assessment.attitude) setAttitude(assessment.attitude);
        setSakit(assessment.attendanceSakit || 0);
        setIzin(assessment.attendanceIzin || 0);
        setAlpha(assessment.attendanceAlpha || 0);

        if (activeProgram === 'PBP') {
            setFhScore(assessment.fhScore || 0);
            setMhScorePbp(assessment.mhScore || 0);
            setAhScorePbp(assessment.ahScore || 0);
            setTmScore(assessment.tmScore || 0);
            setMaterialDoa(assessment.materialDoa || '');
        } else {
            setMhScorePsq(assessment.mhScore || 0);
            setAhScorePsq(assessment.ahScore || 0);
            setFashohahScorePsq(assessment.fashohahScore || 0);
            setMatTajwid(assessment.materialTajwid || '');
            setMatUbudiyah(assessment.materialUbudiyah || '');
        }
    }
    
    setViewMode('FORM');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setViewMode('LIST');
    resetForm();
  };

  // VALIDATION FUNCTION
  const validateAssessment = (): string | null => {
    if (!selectedSantriId) return 'Pilih santri terlebih dahulu';
    if (!assessingTeacherId) return 'Pilih ustadz penilai';
    
    if (memorizationScore < 0 || memorizationScore > 100) return 'Nilai Tahfidz harus antara 0 - 100';
    if (sakit < 0 || izin < 0 || alpha < 0) return 'Jumlah kehadiran tidak boleh negatif';

    if (activeProgram === 'PBP') {
        if (fhScore < 0 || fhScore > 30) return 'Nilai Fakta Huruf (FH) harus antara 0 - 30';
        if (mhScorePbp < 0 || mhScorePbp > 30) return 'Nilai Makhorijul & Sifatul (MH/SH) harus antara 0 - 30';
        if (ahScorePbp < 0 || ahScorePbp > 20) return 'Nilai Ahkamul Huruf (AH) harus antara 0 - 20';
        if (tmScore < 0 || tmScore > 20) return 'Nilai Titian Murottal (TM) harus antara 0 - 20';
    } else {
        if (mhScorePsq < 0 || mhScorePsq > 30) return 'Nilai Makhorijul Huruf (MH) harus antara 0 - 30';
        if (ahScorePsq < 0 || ahScorePsq > 30) return 'Nilai Ahkamul Huruf (AH) harus antara 0 - 30';
        if (fashohahScorePsq < 0 || fashohahScorePsq > 40) return 'Nilai Fashohah harus antara 0 - 40';
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errorMsg = validateAssessment();
    if (errorMsg) {
        alert(errorMsg);
        return;
    }

    const commonData = {
        santriId: selectedSantriId,
        teacherId: assessingTeacherId,
        term,
        memorizationScore,
        lastSurah,
        teacherNote,
        date: new Date().toISOString().split('T')[0],
        attitude,
        attendanceSakit: sakit,
        attendanceIzin: izin,
        attendanceAlpha: alpha,
        attendancePercentage: Math.max(0, 100 - ((sakit + izin + alpha) * 2)), 
        adabScore: 0
    };

    let finalAssessment: Assessment;

    if (activeProgram === 'PBP') {
        finalAssessment = {
            ...commonData,
            id: editingId || crypto.randomUUID(),
            fhScore,
            mhScore: mhScorePbp,
            shScore: 0,
            ahScore: ahScorePbp,
            tmScore,
            fashohahScore: 0, 
            materialDoa,
        };
    } else {
        finalAssessment = {
            ...commonData,
            id: editingId || crypto.randomUUID(),
            mhScore: mhScorePsq,
            ahScore: ahScorePsq,
            fashohahScore: fashohahScorePsq,
            materialTajwid: matTajwid,
            materialUbudiyah: matUbudiyah,
        };
    }

    if (editingId) {
       updateAssessment(finalAssessment);
       setSuccessMessage('Data penilaian berhasil diperbarui!');
    } else {
       addAssessment(finalAssessment);
       setSuccessMessage('Data penilaian berhasil disimpan!');
    }

    handleBackToList();

    // Auto clear notification after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const AttitudeInputRow = ({ label, field }: { label: string, field: keyof typeof attitude }) => (
      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
          <span className="text-sm font-bold text-gray-700 w-1/3">{label}</span>
          <div className="flex gap-4">
              {['BAIK', 'CUKUP', 'KURANG'].map((val) => (
                  <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                          type="radio" 
                          name={`att_${field}`} 
                          value={val}
                          checked={attitude[field] === val}
                          onChange={() => setAttitude(prev => ({...prev, [field]: val as AttitudeGrade}))}
                          className={`w-4 h-4 ${activeProgram === 'PBP' ? 'text-emerald-600 focus:ring-emerald-500' : 'text-blue-600 focus:ring-blue-500'}`}
                      />
                      <span className="text-xs font-medium text-gray-600 capitalize">{val.toLowerCase()}</span>
                  </label>
              ))}
          </div>
      </div>
  );

  // ==================== LIST VIEW RENDER ====================
  if (viewMode === 'LIST') {
      return (
        <div className="p-6 animate-fade-in pb-20 relative">
            
            {/* Success Popup */}
            {successMessage && (
               <div className="fixed top-20 right-6 z-50 animate-fade-in">
                  <div className="bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border border-emerald-500 transform transition-transform duration-300 hover:scale-105">
                     <div className="bg-white/20 p-2 rounded-full">
                        <Check className="w-6 h-6 text-white" />
                     </div>
                     <div>
                        <h4 className="font-bold text-lg">Berhasil!</h4>
                        <p className="text-emerald-100 text-sm font-medium">{successMessage}</p>
                     </div>
                     <button onClick={() => setSuccessMessage(null)} className="ml-2 text-emerald-200 hover:text-white">
                        <X className="w-5 h-5" />
                     </button>
                  </div>
               </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Calculator className={`w-6 h-6 ${textColor}`} />
                    Input Nilai Santri
                </h2>

                {/* PROGRAM SWITCHER */}
                <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                    <button 
                        onClick={() => setActiveProgram('PBP')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                            activeProgram === 'PBP' 
                            ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-black/5' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Bookmark className="w-4 h-4" />
                        <span>Program PBP</span>
                    </button>
                    <button 
                        onClick={() => setActiveProgram('PSQ')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                            activeProgram === 'PSQ' 
                            ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>Program PSQ</span>
                    </button>
                </div>
            </div>

            {/* FILTERS */}
            <div className={`bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 border-t-4 ${activeProgram === 'PBP' ? 'border-t-emerald-500' : 'border-t-blue-500'}`}>
                <div className="w-full md:w-64">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Filter Kelas</label>
                    <div className="relative">
                        <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <select 
                            className="w-full border rounded-lg pl-9 pr-3 py-2.5 bg-gray-100 text-gray-900 font-medium focus:ring-2 outline-none"
                            value={selectedJilidFilter}
                            onChange={(e) => setSelectedJilidFilter(e.target.value)}
                        >
                            <option value="">Semua Kelas {activeProgram}</option>
                            {Object.values(JilidType)
                                .filter(j => activeProgram === 'PBP' ? j.startsWith('PBP') : j.startsWith('PSQ'))
                                .map(j => (
                                    <option key={j} value={j}>{j}</option>
                                ))
                            }
                        </select>
                    </div>
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Cari Nama / NIS</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            className="w-full border rounded-lg pl-9 pr-3 py-2.5 bg-gray-100 text-gray-900 font-medium focus:ring-2 outline-none"
                            placeholder="Cari santri..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="w-full md:w-64">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Periode Penilaian</label>
                    <input 
                        type="text" 
                        className="w-full border rounded-lg px-3 py-2.5 bg-gray-100 text-gray-900 font-medium focus:ring-2 outline-none"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* STUDENT TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className={`bg-gray-100 text-gray-900 text-sm font-bold uppercase`}>
                            <tr>
                                <th className="p-4 border-b w-16 text-center">No</th>
                                <th className="p-4 border-b">Nama Santri</th>
                                <th className="p-4 border-b">NIS</th>
                                <th className="p-4 border-b">Kelas</th>
                                <th className="p-4 border-b text-center">Status Penilaian</th>
                                <th className="p-4 border-b text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredSantris.length > 0 ? (
                                filteredSantris.map((santri, index) => {
                                    const assessment = assessments.find(a => a.santriId === santri.id);
                                    
                                    return (
                                        <tr key={santri.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-center text-gray-500">{index + 1}</td>
                                            <td className="p-4 font-bold text-gray-900">{santri.name}</td>
                                            <td className="p-4 text-gray-600 font-mono">{santri.registrationNumber}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${activeProgram === 'PBP' ? 'bg-emerald-50 text-emerald-800' : 'bg-blue-50 text-blue-800'}`}>
                                                    {santri.currentJilid}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                {assessment ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Sudah Dinilai
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold border border-gray-200">
                                                        <AlertCircle className="w-3.5 h-3.5" /> Belum
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => openGradingForm(santri.id, assessment)}
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white shadow-sm transition-all ${
                                                        assessment 
                                                        ? 'bg-orange-500 hover:bg-orange-600' 
                                                        : (activeProgram === 'PBP' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700')
                                                    }`}
                                                >
                                                    {assessment ? <Edit className="w-3.5 h-3.5" /> : <Calculator className="w-3.5 h-3.5" />}
                                                    {assessment ? 'Edit Nilai' : 'Input Nilai'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                                        Tidak ada santri yang sesuai filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      );
  }

  // ==================== FORM VIEW RENDER ====================
  return (
    <div className="p-6 animate-fade-in max-w-5xl mx-auto pb-20">
      <button 
        onClick={handleBackToList}
        className="flex items-center text-gray-600 hover:text-emerald-600 mb-6 transition-colors font-bold group"
      >
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Daftar Santri
      </button>

      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 border-t-4 ${activeProgram === 'PBP' ? 'border-t-emerald-500' : 'border-t-blue-500'}`}>
        
        <div className={`mb-6 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${lightBgColor} ${textColor}`}>
            <div className="flex items-center gap-3">
                {activeProgram === 'PBP' ? <Bookmark className="w-6 h-6"/> : <BookOpen className="w-6 h-6"/>}
                <div>
                    <h3 className="text-lg font-bold">{activeProgram === 'PBP' ? 'Program Buku Paket (PBP)' : "Program Sorogan Al-Qur'an (PSQ)"}</h3>
                    <p className="text-sm font-medium opacity-80">{selectedSantri?.name} - {selectedSantri?.currentJilid}</p>
                </div>
            </div>
            <div className="w-full sm:w-auto">
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Ustadz Penilai *</label>
                <div className="relative">
                    <UserCircle className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                    <select
                        required
                        className="w-full border rounded-lg pl-8 pr-3 py-2 bg-white text-gray-900 font-medium focus:ring-2 outline-none"
                        value={assessingTeacherId}
                        onChange={e => setAssessingTeacherId(e.target.value)}
                    >
                        <option value="">-- Pilih Pengajar --</option>
                        {availableTeachers.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT COLUMN: ACADEMIC */}
            <div>
                 {/* ================= PBP FORM ================= */}
                {activeProgram === 'PBP' && (
                    <>
                        <h3 className="text-lg font-bold text-emerald-700 mb-4 flex justify-between items-center">
                            <span>A. Bidang Bacaan (Qira'ah)</span>
                            <span className="text-xs bg-emerald-100 px-2 py-1 rounded-full">Total: {totalBacaanPBP}/100</span>
                        </h3>
                        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-emerald-100">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Fakta Huruf (Max 30)</label>
                                    <input type="number" min="0" max="30" required className="w-full border rounded p-2 bg-gray-100 text-gray-900" value={fhScore || ''} onChange={e => setFhScore(Number(e.target.value))} />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Ahkamul Huruf (Max 20)</label>
                                    <input type="number" min="0" max="20" required className="w-full border rounded p-2 bg-gray-100 text-gray-900" value={ahScorePbp || ''} onChange={e => setAhScorePbp(Number(e.target.value))} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Makhorijul & Sifatul Huruf (Max 30)</label>
                                    <input type="number" min="0" max="30" required className="w-full border rounded p-2 bg-gray-100 text-gray-900" value={mhScorePbp || ''} onChange={e => setMhScorePbp(Number(e.target.value))} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Titian Murottal / Irama (Max 20)</label>
                                    <input type="number" min="0" max="20" required className="w-full border rounded p-2 bg-gray-100 text-gray-900" value={tmScore || ''} onChange={e => setTmScore(Number(e.target.value))} />
                                </div>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-emerald-700 mt-6 mb-4">B. Materi Tambahan</h3>
                        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-emerald-100">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Hafalan Do'a Harian</label>
                                <input type="text" placeholder="Contoh: Doa Masuk Masjid" className="w-full border rounded p-2 bg-gray-100 text-gray-900" value={materialDoa} onChange={e => setMaterialDoa(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Hafalan Surat Terakhir</label>
                                    <input type="text" placeholder="Contoh: An-Nas" className="w-full border rounded p-2 bg-gray-100 text-gray-900" value={lastSurah} onChange={e => setLastSurah(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Nilai Tahfidz (Max 100)</label>
                                    <input type="number" min="0" max="100" className="w-full border rounded p-2 bg-gray-100 text-gray-900" value={memorizationScore || ''} onChange={e => setMemorizationScore(Number(e.target.value))} />
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ================= PSQ FORM ================= */}
                {activeProgram === 'PSQ' && (
                    <>
                        <h3 className="text-lg font-bold text-blue-700 mb-4 flex justify-between items-center">
                            <span>A. Nilai Bacaan (Qira'ah)</span>
                            <span className="text-sm bg-blue-100 px-3 py-1 rounded-full">Total: {totalBacaanPSQ}/100</span>
                        </h3>
                        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-blue-100">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                <label className="block text-xs font-bold text-gray-900 mb-1">Makhorijul Huruf (Max 30)</label>
                                <input type="number" min="0" max="30" required className="w-full border rounded p-2 bg-gray-100 text-gray-900" value={mhScorePsq || ''} onChange={e => setMhScorePsq(Number(e.target.value))} />
                                </div>
                                <div>
                                <label className="block text-xs font-bold text-gray-900 mb-1">Ahkamul Huruf (Max 30)</label>
                                <input type="number" min="0" max="30" required className="w-full border rounded p-2 bg-gray-100 text-gray-900" value={ahScorePsq || ''} onChange={e => setAhScorePsq(Number(e.target.value))} />
                                </div>
                                <div>
                                <label className="block text-xs font-bold text-gray-900 mb-1">Fashohah (Max 40)</label>
                                <input type="number" min="0" max="40" required className="w-full border rounded p-2 bg-gray-100 text-gray-900" value={fashohahScorePsq || ''} onChange={e => setFashohahScorePsq(Number(e.target.value))} />
                                </div>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-blue-700 mt-6 mb-4">B. Materi Tambahan</h3>
                        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-blue-100">
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Materi Tajwid</label>
                                    <input type="text" placeholder="Teori..." className="w-full border rounded p-2 bg-gray-100 text-gray-900" value={matTajwid} onChange={e => setMatTajwid(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Materi Ubudiyah</label>
                                    <input type="text" placeholder="Praktik..." className="w-full border rounded p-2 bg-gray-100 text-gray-900" value={matUbudiyah} onChange={e => setMatUbudiyah(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Surah Terakhir Dihafal</label>
                                    <input type="text" placeholder="Contoh: An-Naba" className="w-full border rounded p-2 bg-gray-100 text-gray-900" value={lastSurah} onChange={e => setLastSurah(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Nilai Tahfidz (Max 100)</label>
                                    <input type="number" min="0" max="100" className="w-full border rounded p-2 bg-gray-100 text-gray-900" value={memorizationScore || ''} onChange={e => setMemorizationScore(Number(e.target.value))} />
                                </div>
                             </div>
                        </div>
                    </>
                )}
            </div>

            {/* RIGHT COLUMN: ATTITUDE & ATTENDANCE (SHARED) */}
            <div>
                  <h3 className={`text-lg font-bold ${textColor} mb-4`}>C. Pengembangan Sikap</h3>
                  <div className={`bg-gray-50 p-4 rounded-xl border ${activeProgram === 'PBP' ? 'border-emerald-100' : 'border-blue-100'}`}>
                      <AttitudeInputRow label="1. Sopan Santun" field="sopanSantun" />
                      <AttitudeInputRow label="2. Kerjasama" field="kerjasama" />
                      <AttitudeInputRow label="3. Kepatuhan" field="kepatuhan" />
                      <AttitudeInputRow label="4. Keberanian" field="keberanian" />
                      <AttitudeInputRow label="5. Kecakapan" field="kecakapan" />
                      <AttitudeInputRow label="6. Kebersihan" field="kebersihan" />
                      <AttitudeInputRow label="7. Kedisiplinan" field="kerajinan" />
                  </div>

                  <h3 className={`text-lg font-bold ${textColor} mt-6 mb-4`}>D. Kehadiran</h3>
                  <div className={`bg-gray-50 p-4 rounded-xl border ${activeProgram === 'PBP' ? 'border-emerald-100' : 'border-blue-100'} grid grid-cols-3 gap-4`}>
                      <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Sakit (Hari)</label>
                          <input type="number" min="0" className="w-full border rounded p-2 bg-gray-100 text-gray-900" value={sakit} onChange={e => setSakit(Number(e.target.value))} />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Izin (Hari)</label>
                          <input type="number" min="0" className="w-full border rounded p-2 bg-gray-100 text-gray-900" value={izin} onChange={e => setIzin(Number(e.target.value))} />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Alpha (Hari)</label>
                          <input type="number" min="0" className="w-full border rounded p-2 bg-gray-100 text-gray-900" value={alpha} onChange={e => setAlpha(Number(e.target.value))} />
                      </div>
                  </div>
            </div>
          </div>

          {/* Teacher Note & AI Generation */}
          <div className="pt-4 border-t border-gray-100">
             <div className="flex justify-between items-center mb-4">
               <h3 className={`text-lg font-bold ${textColor}`}>E. Catatan Ustadz/Ustadzah</h3>
               <button
                  type="button"
                  onClick={handleGenerateComment}
                  disabled={isGenerating || !selectedSantri}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    !selectedSantri 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                  title={!selectedSantri ? "Pilih santri dulu" : "Buat catatan otomatis dengan AI"}
               >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isGenerating ? 'Sedang Membuat...' : 'Generate with AI'}
               </button>
             </div>
             
             <textarea
                required
                rows={4}
                className={`w-full border rounded-lg p-3 focus:ring-2 ${borderColor} outline-none resize-none bg-gray-100 text-gray-900 font-medium`}
                placeholder="Tulis catatan evaluasi dan motivasi untuk santri..."
                value={teacherNote}
                onChange={e => setTeacherNote(e.target.value)}
             />
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
             <button
                type="button"
                onClick={handleBackToList}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-bold"
             >
               <X className="w-5 h-5" />
               Batal
             </button>
             <button
                type="submit"
                className={`flex items-center gap-2 px-8 py-3 text-white rounded-lg shadow-lg hover:shadow-xl transition-all font-bold ${editingId ? 'bg-orange-600 hover:bg-orange-700' : `${bgColor} ${hoverBgColor}`}`}
             >
               <Save className="w-5 h-5" />
               {editingId ? 'Update Penilaian' : 'Simpan Penilaian'}
             </button>
          </div>

        </form>
      </div>

    </div>
  );
};