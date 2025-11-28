

import React, { useState, useEffect } from 'react';
import { Santri, Assessment, SchoolProfile, AttitudeGrade, JilidType, Teacher } from '../types';
import { Printer, BookOpen, Calendar, MapPin, Filter, ArrowLeft, Search, User, AlertCircle } from 'lucide-react';

interface ReportCardProps {
  santris: Santri[];
  assessments: Assessment[];
  teachers: Teacher[]; // Added
  schoolProfile: SchoolProfile;
  initialSantriId?: string | null;
}

export const ReportCard: React.FC<ReportCardProps> = ({ santris, assessments, teachers, schoolProfile, initialSantriId }) => {
  // VIEW MODE: 'LIST' (Tabel Santri) or 'PREVIEW' (Raport)
  const [viewMode, setViewMode] = useState<'LIST' | 'PREVIEW'>('LIST');

  const [selectedSantriId, setSelectedSantriId] = useState<string>('');
  const [filterJilid, setFilterJilid] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Print Settings State
  const [printPlace, setPrintPlace] = useState<string>('Surabaya');
  const [printDate, setPrintDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Effect to handle initial selection from other views (e.g. StudentList)
  useEffect(() => {
    if (initialSantriId) {
      const student = santris.find(s => s.id === initialSantriId);
      if (student) {
        setFilterJilid(student.currentJilid); // Auto set filter
        setSelectedSantriId(initialSantriId);
        setViewMode('PREVIEW'); // Auto switch to preview
      }
    }
  }, [initialSantriId, santris]);

  // Filter Logic for Table
  const filteredSantris = santris.filter(s => {
      const matchesJilid = !filterJilid || s.currentJilid === filterJilid;
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.registrationNumber.includes(searchTerm) || 
                            s.nism.includes(searchTerm);
      return matchesJilid && matchesSearch;
  });

  // Get Data for Preview
  const selectedSantri = santris.find(s => s.id === selectedSantriId);
  
  const studentAssessments = assessments
    .filter(a => a.santriId === selectedSantriId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
  const latestAssessment = studentAssessments[0];
  
  // Logic Fix: Determine Program based on Santri Jilid (Source of Truth), not Assessment fields
  const isPBP = selectedSantri?.currentJilid?.toString().startsWith('PBP');

  // Find Wali Kelas for the current student
  const waliKelas = teachers.find(
    t => t.position === 'WALI_KELAS' && t.assignedClass === selectedSantri?.currentJilid
  );
  const waliKelasName = waliKelas ? waliKelas.name : '( ................................. )';

  // --- LOGIC PENENTUAN PRESTASI & KENAIKAN ---
  const calculateResult = () => {
    if (!latestAssessment) return { grade: '-', status: '-', total: 0 };

    const total = isPBP 
        ? (latestAssessment.fhScore || 0) + (latestAssessment.mhScore || 0) + (latestAssessment.ahScore || 0) + (latestAssessment.tmScore || 0)
        : (latestAssessment.mhScore || 0) + (latestAssessment.ahScore || 0) + (latestAssessment.fashohahScore || 0);

    let grade = '';
    let status = '';

    if (isPBP) {
        // Kriteria PBP
        if (total >= 90) { grade = 'A'; status = 'NAIK KELAS'; }
        else if (total >= 80) { grade = 'B'; status = 'NAIK KELAS'; }
        else if (total >= 70) { grade = 'C'; status = 'NAIK KELAS'; }
        else { grade = 'D'; status = 'TIDAK NAIK'; }
    } else {
        // Kriteria PSQ
        if (total >= 86) { grade = 'A'; status = 'NAIK KELAS'; }
        else if (total >= 70) { grade = 'B'; status = 'NAIK KELAS'; }
        else if (total >= 60) { grade = 'C'; status = 'NAIK KELAS'; }
        else { grade = 'D'; status = 'TIDAK NAIK (REMIDI)'; }
    }

    return { grade, status, total };
  };

  const result = calculateResult();

  const handleSelectSantri = (id: string) => {
    setSelectedSantriId(id);
    setViewMode('PREVIEW');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setViewMode('LIST');
    setSelectedSantriId('');
  };

  const handlePrint = () => {
    window.print();
  };

  const renderAttitudeCheck = (val: AttitudeGrade, target: string) => {
      return val === target ? '✓' : '';
  };

  const formatIndonesianDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Helper Function: Terbilang
  const terbilang = (nilai: number | undefined): string => {
    if (nilai === undefined || nilai === null) return "-";
    const bil = Math.abs(nilai);
    const angka = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];

    let temp = "";
    if (bil < 12) {
      temp = " " + angka[bil];
    } else if (bil < 20) {
      temp = terbilang(bil - 10) + " Belas";
    } else if (bil < 100) {
      temp = terbilang(Math.floor(bil / 10)) + " Puluh" + terbilang(bil % 10);
    } else if (bil === 100) {
      temp = " Seratus";
    } else {
      temp = "";
    }
    return temp.trim();
  };

  // --- VIEW 1: STUDENT LIST TABLE ---
  if (viewMode === 'LIST') {
    return (
      <div className="p-6 animate-fade-in pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Printer className="w-6 h-6 text-emerald-600" />
              Cetak Raport Santri
            </h2>
            <p className="text-sm text-gray-500 mt-1">Pilih kelas dan santri untuk mencetak raport hasil belajar.</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
          
          <div className="w-full md:w-64">
              <label className="block text-xs font-bold text-gray-500 mb-1">Filter Kelas / Jilid</label>
              <div className="relative">
                  <Filter className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                  <select 
                    className="w-full border rounded-lg pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 text-gray-900 font-medium"
                    value={filterJilid}
                    onChange={e => setFilterJilid(e.target.value)}
                  >
                    <option value="">-- Semua Kelas --</option>
                    {Object.values(JilidType).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
              </div>
          </div>

          <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 mb-1">Cari Santri</label>
              <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari Nama, NIS, atau NISM..."
                    className="w-full border rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 text-gray-900 font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>
        </div>

        {/* Table Santri */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 text-gray-900 text-sm font-bold uppercase">
                <tr>
                  <th className="p-4 border-b w-12 text-center">No</th>
                  <th className="p-4 border-b">Nama Santri</th>
                  <th className="p-4 border-b">NIS / NISM</th>
                  <th className="p-4 border-b text-center">L/P</th>
                  <th className="p-4 border-b">Tempat, Tgl Lahir</th>
                  <th className="p-4 border-b">Kelas</th>
                  <th className="p-4 border-b text-center">Status Nilai</th>
                  <th className="p-4 border-b text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredSantris.length > 0 ? (
                  filteredSantris.map((santri, index) => {
                    const hasAssessment = assessments.some(a => a.santriId === santri.id);
                    return (
                      <tr key={santri.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-center text-gray-500">{index + 1}</td>
                        <td className="p-4 font-bold text-gray-900">{santri.name}</td>
                        <td className="p-4 text-gray-600 font-mono">
                           <div>{santri.registrationNumber}</div>
                           <div className="text-xs text-gray-400">{santri.nism}</div>
                        </td>
                        <td className="p-4 text-center">
                           <span className={`px-2 py-0.5 rounded text-xs font-bold ${santri.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                              {santri.gender}
                           </span>
                        </td>
                        <td className="p-4 text-gray-700">
                           {santri.birthPlace}, {formatIndonesianDate(santri.birthDate)}
                        </td>
                        <td className="p-4">
                           <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded text-xs font-bold">
                              {santri.currentJilid}
                           </span>
                        </td>
                        <td className="p-4 text-center">
                           {hasAssessment ? (
                             <span className="text-xs font-bold text-green-600 flex items-center justify-center gap-1">
                               ✓ Ada Nilai
                             </span>
                           ) : (
                             <span className="text-xs font-bold text-gray-400 flex items-center justify-center gap-1">
                               <AlertCircle className="w-3 h-3" /> Belum
                             </span>
                           )}
                        </td>
                        <td className="p-4 text-center">
                           <button
                              onClick={() => handleSelectSantri(santri.id)}
                              className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 shadow-sm font-bold text-xs mx-auto transition-all"
                           >
                              <Printer className="w-4 h-4" /> Cetak
                           </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500 italic">
                       Tidak ada data santri yang sesuai filter.
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

  // --- VIEW 2: PREVIEW REPORT ---
  return (
    <div className="p-6 h-full flex flex-col animate-fade-in pb-20">
      
      {/* Navigation & Controls (Hidden when printing) */}
      <div className="print:hidden mb-6 flex flex-col gap-4">
         <button 
            onClick={handleBackToList}
            className="self-start flex items-center text-gray-600 hover:text-emerald-600 font-bold transition-colors"
         >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali ke Daftar Santri
         </button>

         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
             {/* TEMPAT CETAK */}
            <div className="w-full">
                <label className="block text-xs font-bold text-gray-500 mb-1">Tempat Cetak (Kota)</label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input 
                        type="text"
                        className="w-full border rounded-lg pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 text-gray-900 font-medium"
                        value={printPlace}
                        onChange={e => setPrintPlace(e.target.value)}
                        placeholder="Contoh: Surabaya"
                    />
                </div>
            </div>

            {/* TANGGAL CETAK */}
            <div className="w-full">
                <label className="block text-xs font-bold text-gray-500 mb-1">Tanggal Cetak</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input 
                        type="date"
                        className="w-full border rounded-lg pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 text-gray-900 font-medium"
                        value={printDate}
                        onChange={e => setPrintDate(e.target.value)}
                    />
                </div>
            </div>

            {/* PRINT BUTTON */}
            <div className="w-full">
                <button 
                    onClick={handlePrint}
                    disabled={!latestAssessment}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-700 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all font-bold"
                >
                    <Printer className="w-5 h-5" />
                    <span>Print Sekarang</span>
                </button>
            </div>
         </div>
      </div>

      {/* Report Card Preview Area */}
      <div className="flex-1 bg-gray-100 p-4 md:p-8 overflow-y-auto print:p-0 print:bg-white print:overflow-visible rounded-xl border border-gray-200">
        {selectedSantri && latestAssessment ? (
          <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none p-10 min-h-[297mm] relative print:w-full print:h-full text-black overflow-hidden font-sans">
            
            {/* --- WATERMARK --- */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                {schoolProfile.logoUrl ? (
                    <img 
                        src={schoolProfile.logoUrl} 
                        alt="Watermark" 
                        className="w-[500px] h-[500px] object-contain opacity-[0.04] grayscale" 
                    />
                ) : (
                    <BookOpen className="w-[500px] h-[500px] text-gray-900 opacity-[0.03]" />
                )}
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="text-center border-b-2 border-black pb-4 mb-6">
                <div className="flex flex-col items-center justify-center mb-2">
                    {schoolProfile.logoUrl ? (
                        <img src={schoolProfile.logoUrl} alt="Logo" className="h-24 w-auto object-contain mb-2" />
                    ) : (
                        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white mb-2 print:hidden">
                            <BookOpen className="w-8 h-8" />
                        </div>
                    )}
                    <h1 className="text-2xl font-bold text-black uppercase tracking-wide">{schoolProfile.name}</h1>
                    <p className="text-black text-sm font-medium">{schoolProfile.address}</p>
                    <p className="text-black text-sm">Telp: {schoolProfile.contact}</p>
                </div>
                </div>

                {/* Title & Level Section */}
                <div className="text-center mb-8 border-b-2 border-black pb-4">
                    <h2 className="text-xl font-bold text-black uppercase tracking-widest leading-relaxed px-4">
                        LAPORAN HASIL BELAJAR SANTRI
                        <br />
                        <span className="inline-block mt-1">
                            {isPBP 
                                ? "PROGRAM BUKU PAKET (PBP)" 
                                : "PROGRAM SOROGAN AL-QUR'AN (PSQ)"
                            }
                        </span>
                    </h2>
                    <div className="text-lg font-bold text-black mt-2">
                        TINGKAT: {selectedSantri.currentJilid}
                    </div>
                </div>

                {/* Student Info */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 mb-8 text-sm">
                    <div className="flex"><span className="w-32 font-bold text-black">Nama Santri</span> <span className="uppercase font-bold text-black">: {selectedSantri.name}</span></div>
                    <div className="flex"><span className="w-32 font-bold text-black">Tahun Ajaran</span> <span className="text-black">: 2023/2024</span></div>
                    <div className="flex"><span className="w-32 font-bold text-black">Nomor Induk</span> <span className="text-black font-mono">: {selectedSantri.registrationNumber} / {selectedSantri.nism}</span></div>
                    <div className="flex"><span className="w-32 font-bold text-black">Semester</span> <span className="text-black">: {latestAssessment.term}</span></div>
                    <div className="flex"><span className="w-32 font-bold text-black">Tgl Penilaian</span> <span className="text-black">: {formatIndonesianDate(latestAssessment.date)}</span></div>
                </div>

                {/* === PBP REPORT === */}
                {isPBP ? (
                    <>
                    {/* 1. Bidang Bacaan */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold bg-gray-200 p-1.5 mb-0 border border-black pl-2 text-black uppercase">A. Bidang Penilaian Bacaan (Qira'ah)</h3>
                        <table className="w-full border-collapse border border-black text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border border-black p-1.5 w-10 text-black">No</th>
                                    <th className="border border-black p-1.5 text-left text-black">Aspek Penilaian</th>
                                    <th className="border border-black p-1.5 w-20 text-black">Maks</th>
                                    <th className="border border-black p-1.5 w-20 text-black">Angka</th>
                                    <th className="border border-black p-1.5 text-black">Huruf / Terbilang</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-black p-1.5 text-center text-black">1</td>
                                    <td className="border border-black p-1.5 text-black">Fakta Huruf (FH)</td>
                                    <td className="border border-black p-1.5 text-center text-black">30</td>
                                    <td className="border border-black p-1.5 text-center font-bold text-sm text-black">{latestAssessment.fhScore}</td>
                                    <td className="border border-black p-1.5 text-center font-bold text-sm text-black capitalize italic">{terbilang(latestAssessment.fhScore)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-1.5 text-center text-black">2</td>
                                    <td className="border border-black p-1.5 text-black">Makhorijul & Sifatul Huruf (MH & SH)</td>
                                    <td className="border border-black p-1.5 text-center text-black">30</td>
                                    <td className="border border-black p-1.5 text-center font-bold text-sm text-black">{latestAssessment.mhScore}</td>
                                    <td className="border border-black p-1.5 text-center font-bold text-sm text-black capitalize italic">{terbilang(latestAssessment.mhScore)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-1.5 text-center text-black">3</td>
                                    <td className="border border-black p-1.5 text-black">Ahkamul Huruf (AH)</td>
                                    <td className="border border-black p-1.5 text-center text-black">20</td>
                                    <td className="border border-black p-1.5 text-center font-bold text-sm text-black">{latestAssessment.ahScore}</td>
                                    <td className="border border-black p-1.5 text-center font-bold text-sm text-black capitalize italic">{terbilang(latestAssessment.ahScore)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-1.5 text-center text-black">4</td>
                                    <td className="border border-black p-1.5 text-black">Titian Murottal (TM)</td>
                                    <td className="border border-black p-1.5 text-center text-black">20</td>
                                    <td className="border border-black p-1.5 text-center font-bold text-sm text-black">{latestAssessment.tmScore}</td>
                                    <td className="border border-black p-1.5 text-center font-bold text-sm text-black capitalize italic">{terbilang(latestAssessment.tmScore)}</td>
                                </tr>
                                <tr className="bg-gray-100 font-bold">
                                    <td colSpan={2} className="border border-black p-2 text-right pr-4 text-black">JUMLAH NILAI PRESTASI</td>
                                    <td className="border border-black p-2 text-center text-black">100</td>
                                    <td className="border border-black p-2 text-center text-sm text-black">
                                        {(latestAssessment.fhScore || 0) + (latestAssessment.mhScore || 0) + (latestAssessment.ahScore || 0) + (latestAssessment.tmScore || 0)}
                                    </td>
                                    <td className="border border-black p-2 text-center text-sm text-black capitalize italic">
                                        {terbilang((latestAssessment.fhScore || 0) + (latestAssessment.mhScore || 0) + (latestAssessment.ahScore || 0) + (latestAssessment.tmScore || 0))}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* 2. Materi Tambahan */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold bg-gray-200 p-1.5 mb-0 border border-black pl-2 text-black uppercase">B. Bidang Materi Tambahan</h3>
                        <table className="w-full border-collapse border border-black text-sm">
                            <tbody>
                                <tr>
                                    <td className="border border-black p-2 w-1/3 font-semibold text-black">Hafalan Do'a</td>
                                    <td className="border border-black p-2 font-medium text-black">{latestAssessment.materialDoa || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-2 font-semibold text-black">Surat Terakhir Dihafal</td>
                                    <td className="border border-black p-2 font-medium text-black">{latestAssessment.lastSurah || '-'} (Nilai: {latestAssessment.memorizationScore})</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    </>
                ) : (
                    /* === PSQ REPORT === */
                    <>
                    {/* 1. Bidang Bacaan PSQ */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold bg-gray-200 p-1.5 mb-0 border border-black pl-2 text-black uppercase">A. Bidang Penilaian Bacaan (Qira'ah)</h3>
                        <table className="w-full border-collapse border border-black text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border border-black p-1.5 w-10 text-black">No</th>
                                    <th className="border border-black p-1.5 text-left text-black">Aspek Penilaian</th>
                                    <th className="border border-black p-1.5 w-20 text-black">Maks</th>
                                    <th className="border border-black p-1.5 w-20 text-black">Angka</th>
                                    <th className="border border-black p-1.5 text-black">Huruf / Terbilang</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-black p-1.5 text-center text-black">1</td>
                                    <td className="border border-black p-1.5 text-black">Makhorijul Huruf</td>
                                    <td className="border border-black p-1.5 text-center text-black">30</td>
                                    <td className="border border-black p-1.5 text-center font-bold text-sm text-black">{latestAssessment.mhScore}</td>
                                    <td className="border border-black p-1.5 text-center font-bold text-sm text-black capitalize italic">{terbilang(latestAssessment.mhScore)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-1.5 text-center text-black">2</td>
                                    <td className="border border-black p-1.5 text-black">Tajwid (Ahkamul Huruf)</td>
                                    <td className="border border-black p-1.5 text-center text-black">30</td>
                                    <td className="border border-black p-1.5 text-center font-bold text-sm text-black">{latestAssessment.ahScore}</td>
                                    <td className="border border-black p-1.5 text-center font-bold text-sm text-black capitalize italic">{terbilang(latestAssessment.ahScore)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-1.5 text-center text-black">3</td>
                                    <td className="border border-black p-1.5 text-black">Fashohah</td>
                                    <td className="border border-black p-1.5 text-center text-black">40</td>
                                    <td className="border border-black p-1.5 text-center font-bold text-sm text-black">{latestAssessment.fashohahScore}</td>
                                    <td className="border border-black p-1.5 text-center font-bold text-sm text-black capitalize italic">{terbilang(latestAssessment.fashohahScore)}</td>
                                </tr>
                                <tr className="bg-gray-100 font-bold">
                                    <td colSpan={2} className="border border-black p-2 text-right pr-4 text-black">JUMLAH NILAI PRESTASI</td>
                                    <td className="border border-black p-2 text-center text-black">100</td>
                                    <td className="border border-black p-2 text-center text-sm text-black">
                                        {(latestAssessment.mhScore || 0) + (latestAssessment.ahScore || 0) + (latestAssessment.fashohahScore || 0)}
                                    </td>
                                    <td className="border border-black p-2 text-center text-sm text-black capitalize italic">
                                        {terbilang((latestAssessment.mhScore || 0) + (latestAssessment.ahScore || 0) + (latestAssessment.fashohahScore || 0))}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* 2. Materi Tambahan PSQ */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold bg-gray-200 p-1.5 mb-0 border border-black pl-2 text-black uppercase">B. Bidang Materi Tambahan</h3>
                        <table className="w-full border-collapse border border-black text-sm">
                            <tbody>
                                <tr>
                                    <td className="border border-black p-2 w-1/3 font-semibold text-black">Materi Tajwid</td>
                                    <td className="border border-black p-2 font-medium text-black">{latestAssessment.materialTajwid || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-2 font-semibold text-black">Materi Ubudiyah</td>
                                    <td className="border border-black p-2 font-medium text-black">{latestAssessment.materialUbudiyah || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-2 font-semibold text-black">Surat Terakhir Dihafal</td>
                                    <td className="border border-black p-2 font-medium text-black">{latestAssessment.lastSurah || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-2 font-semibold text-black">Nilai Tahfidz</td>
                                    <td className="border border-black p-2 font-bold text-black">{latestAssessment.memorizationScore} / 100</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    </>
                )}

                {/* 3. Sikap (Shared) */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold bg-gray-200 p-1.5 mb-0 border border-black pl-2 text-black uppercase">C. Pengembangan Sikap & Kepribadian</h3>
                    <table className="w-full border-collapse border border-black text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border border-black p-1 w-10 text-black" rowSpan={2}>No</th>
                                <th className="border border-black p-1 text-left text-black" rowSpan={2}>Aspek Penilaian</th>
                                <th className="border border-black p-1 text-center text-black" colSpan={3}>Nilai</th>
                            </tr>
                            <tr>
                                <th className="border border-black p-1 w-16 text-center text-xs text-black">Baik</th>
                                <th className="border border-black p-1 w-16 text-center text-xs text-black">Cukup</th>
                                <th className="border border-black p-1 w-16 text-center text-xs text-black">Kurang</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                {no:1, label: 'Sopan Santun & Keramahan', key: 'sopanSantun'},
                                {no:2, label: 'Kerjasama & Kesetiakawanan', key: 'kerjasama'},
                                {no:3, label: 'Kepatuhan & Tanggungjawab', key: 'kepatuhan'},
                                {no:4, label: 'Keberanian & Kreatifitas', key: 'keberanian'},
                                {no:5, label: 'Kecakapan & Ketelitian', key: 'kecakapan'},
                                {no:6, label: 'Kebersihan & Kerapian', key: 'kebersihan'},
                                {no:7, label: 'Kerajinan & Kedisiplinan', key: 'kerajinan'},
                            ].map((item: any) => (
                                <tr key={item.key}>
                                    <td className="border border-black p-1 text-center text-black">{item.no}</td>
                                    <td className="border border-black p-1 px-2 text-black">{item.label}</td>
                                    <td className="border border-black p-1 text-center font-bold text-black">{renderAttitudeCheck(latestAssessment.attitude?.[item.key as keyof typeof latestAssessment.attitude] || 'BAIK', 'BAIK')}</td>
                                    <td className="border border-black p-1 text-center font-bold text-black">{renderAttitudeCheck(latestAssessment.attitude?.[item.key as keyof typeof latestAssessment.attitude] || 'BAIK', 'CUKUP')}</td>
                                    <td className="border border-black p-1 text-center font-bold text-black">{renderAttitudeCheck(latestAssessment.attitude?.[item.key as keyof typeof latestAssessment.attitude] || 'BAIK', 'KURANG')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 4. Kehadiran & Catatan */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                            <h3 className="text-sm font-bold bg-gray-200 p-1.5 mb-0 border border-black pl-2 text-black uppercase">D. Kehadiran</h3>
                            <table className="w-full border-collapse border border-black text-sm">
                                <tbody>
                                    <tr><td className="border border-black p-2 font-medium text-black">Sakit</td><td className="border border-black p-2 text-center w-16 font-bold text-black">{latestAssessment.attendanceSakit || 0}</td><td className="border border-black p-2 w-10 text-black">Hari</td></tr>
                                    <tr><td className="border border-black p-2 font-medium text-black">Izin</td><td className="border border-black p-2 text-center w-16 font-bold text-black">{latestAssessment.attendanceIzin || 0}</td><td className="border border-black p-2 w-10 text-black">Hari</td></tr>
                                    <tr><td className="border border-black p-2 font-medium text-black">Alpha</td><td className="border border-black p-2 text-center w-16 font-bold text-black">{latestAssessment.attendanceAlpha || 0}</td><td className="border border-black p-2 w-10 text-black">Hari</td></tr>
                                </tbody>
                            </table>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold bg-gray-200 p-1.5 mb-0 border border-black pl-2 text-black uppercase">E. Catatan Ustadz</h3>
                        <div className="border border-black p-3 h-32 text-sm italic bg-gray-50 leading-relaxed text-black">
                            "{latestAssessment.teacherNote}"
                        </div>
                    </div>
                </div>

                {/* 5. KEPUTUSAN / KESIMPULAN (BARU) */}
                <div className="mb-6 break-inside-avoid">
                    <h3 className="text-sm font-bold bg-gray-200 p-1.5 mb-0 border border-black pl-2 text-black uppercase">F. KEPUTUSAN / KESIMPULAN</h3>
                    <div className="border border-black p-4 text-sm text-black">
                        <p className="mb-2">
                           Dengan memperhatikan hasil nilai yang dicapai pada evaluasi {isPBP ? 'PBP' : 'PSQ'} <strong>{selectedSantri.currentJilid}</strong> maka santri dinyatakan:
                        </p>
                        <div className="flex gap-6 items-start">
                             {/* Tabel Kriteria */}
                             <div className="flex-1">
                                <table className="w-full border-collapse border border-black text-xs text-gray-900">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="border border-black p-1 text-center font-bold text-gray-900">Rentang Nilai</th>
                                            <th className="border border-black p-1 text-center font-bold text-gray-900">Prestasi</th>
                                            <th className="border border-black p-1 text-center font-bold text-gray-900">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-900 font-medium">
                                        {isPBP ? (
                                            <>
                                                <tr><td className="border border-black p-1 text-center">90 - 100</td><td className="border border-black p-1 text-center font-bold">A</td><td className="border border-black p-1 text-center">NAIK KELAS</td></tr>
                                                <tr><td className="border border-black p-1 text-center">80 - 89</td><td className="border border-black p-1 text-center font-bold">B</td><td className="border border-black p-1 text-center">NAIK KELAS</td></tr>
                                                <tr><td className="border border-black p-1 text-center">70 - 79</td><td className="border border-black p-1 text-center font-bold">C</td><td className="border border-black p-1 text-center">NAIK KELAS</td></tr>
                                                <tr><td className="border border-black p-1 text-center">20 - 69</td><td className="border border-black p-1 text-center font-bold">D</td><td className="border border-black p-1 text-center">TIDAK NAIK</td></tr>
                                            </>
                                        ) : (
                                            <>
                                                <tr><td className="border border-black p-1 text-center">86 - 100</td><td className="border border-black p-1 text-center font-bold">A</td><td className="border border-black p-1 text-center">NAIK KELAS</td></tr>
                                                <tr><td className="border border-black p-1 text-center">70 - 85</td><td className="border border-black p-1 text-center font-bold">B</td><td className="border border-black p-1 text-center">NAIK KELAS</td></tr>
                                                <tr><td className="border border-black p-1 text-center">60 - 69</td><td className="border border-black p-1 text-center font-bold">C</td><td className="border border-black p-1 text-center">NAIK KELAS</td></tr>
                                                <tr><td className="border border-black p-1 text-center">50 - 59</td><td className="border border-black p-1 text-center font-bold">D</td><td className="border border-black p-1 text-center">TIDAK NAIK (REMIDI)</td></tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                             </div>

                             {/* Kotak Hasil */}
                             <div className="flex-1 flex flex-col justify-center items-center border border-black p-4 bg-gray-50">
                                 <p className="font-bold mb-2 text-gray-900">HASIL AKHIR:</p>
                                 <p className="text-3xl font-bold mb-1 text-gray-900">{result.grade}</p>
                                 <p className={`font-bold px-3 py-1 text-white text-sm uppercase bg-black`}>
                                     {result.status}
                                 </p>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-4 mt-8 px-4 break-inside-avoid">
                    {/* 1. Wali Santri */}
                    <div className="text-center">
                        <p className="mb-20 text-sm font-bold text-gray-900">Mengetahui,<br/>Orang Tua / Wali Santri</p>
                        <p className="font-bold border-b border-black w-32 mx-auto text-sm uppercase text-gray-900">{selectedSantri.fatherName}</p>
                    </div>

                    {/* 2. Wali Kelas */}
                    <div className="text-center">
                         <p className="mb-20 text-sm font-bold text-gray-900">Wali Kelas</p>
                         <p className="font-bold border-b border-black w-32 mx-auto text-sm uppercase text-gray-900">
                            {waliKelasName}
                         </p>
                    </div>

                    {/* 3. Kepala TPQ */}
                    <div className="text-center">
                        <p className="text-sm font-bold text-gray-900">{printPlace}, {formatIndonesianDate(printDate)}</p>
                        <p className="mb-20 text-sm font-bold text-gray-900">Kepala TPQ</p>
                        <p className="font-bold border-b border-black w-32 mx-auto text-sm uppercase text-gray-900">{schoolProfile.headmaster}</p>
                    </div>
                </div>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
             <div className="bg-red-50 p-6 rounded-full mb-4">
               <AlertCircle className="w-12 h-12 text-red-400" />
             </div>
             <p className="text-lg font-bold text-gray-700">Data Nilai Belum Tersedia</p>
             <p className="text-sm">Santri ini belum memiliki penilaian pada sistem.</p>
             <button onClick={handleBackToList} className="mt-4 text-emerald-600 font-bold hover:underline">Kembali ke Daftar</button>
          </div>
        )}
      </div>
    </div>
  );
};