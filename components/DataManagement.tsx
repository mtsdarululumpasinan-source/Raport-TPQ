
import React, { useRef, useState } from 'react';
import { Santri, Assessment, JilidType, User, UserRole, AttitudeGrade } from '../types';
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle, FileUp, FileDown, Database, BookOpenCheck } from 'lucide-react';
import * as XLSX from 'xlsx';

interface DataManagementProps {
  santris: Santri[];
  assessments: Assessment[];
  setSantris: (data: Santri[]) => void;
  setAssessments: (data: Assessment[]) => void;
  currentUser: User | null;
}

export const DataManagement: React.FC<DataManagementProps> = ({ santris, assessments, setSantris, setAssessments, currentUser }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const santriInputRef = useRef<HTMLInputElement>(null);
  const assessmentInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  // --- FULL BACKUP & RESTORE LOGIC ---

  const handleExportBackup = () => {
    const wb = XLSX.utils.book_new();

    const santriWs = XLSX.utils.json_to_sheet(santris);
    XLSX.utils.book_append_sheet(wb, santriWs, "Santri_Raw");

    const assessmentWs = XLSX.utils.json_to_sheet(assessments);
    XLSX.utils.book_append_sheet(wb, assessmentWs, "Nilai_Raw");

    XLSX.writeFile(wb, `TPQ_Full_Backup_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        let newSantris: Santri[] = [];
        let newAssessments: Assessment[] = [];
        let successMsg = '';

        if (wb.SheetNames.includes("Santri_Raw")) {
          const ws = wb.Sheets["Santri_Raw"];
          const data = XLSX.utils.sheet_to_json<Santri>(ws);
          if (data.length > 0) {
             newSantris = data;
             successMsg += `Restore ${data.length} data Santri. `;
          }
        }

        if (wb.SheetNames.includes("Nilai_Raw")) {
            const ws = wb.Sheets["Nilai_Raw"];
            const data = XLSX.utils.sheet_to_json<Assessment>(ws);
            if (data.length > 0) {
               newAssessments = data;
               successMsg += `Restore ${data.length} data Nilai. `;
            }
        }

        if (newSantris.length > 0 || newAssessments.length > 0) {
             if (newSantris.length > 0) setSantris(newSantris);
             if (newAssessments.length > 0) setAssessments(newAssessments);
             setImportStatus({ type: 'success', message: 'Restore Berhasil! ' + successMsg });
        } else {
            setImportStatus({ type: 'error', message: 'Format file backup tidak dikenali.' });
        }
      } catch (error) {
        console.error(error);
        setImportStatus({ type: 'error', message: 'Gagal memproses file backup.' });
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  // --- MASS IMPORT SANTRI LOGIC ---

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "NIS Lokal": "2024001",
        "NISM": "123456789",
        "Nama Lengkap": "Contoh Nama Santri",
        "Jenis Kelamin (L/P)": "L",
        "Tempat Lahir": "Surabaya",
        "Tanggal Lahir (YYYY-MM-DD)": "2015-05-20",
        "Nama Ayah": "Fulan",
        "Nama Ibu": "Fulanah",
        "Jilid (PBP 1-6 / PSQ 1-10)": "PBP 1",
        "Alamat": "Jl. Mawar No. 1",
        "Status (AKTIF/LULUS)": "AKTIF"
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, ws, "Template_Santri");
    XLSX.writeFile(wb, "Template_Import_Santri.xlsx");
  };

  const handleImportSantriTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        if (data.length === 0) {
           setImportStatus({ type: 'error', message: 'File kosong.' });
           return;
        }

        const importedSantris: Santri[] = [];
        
        data.forEach((row: any) => {
          if (!row["Nama Lengkap"] || !row["NIS Lokal"]) return;

          let jilid = JilidType.PBP_1;
          const rawJilid = row["Jilid (PBP 1-6 / PSQ 1-10)"] || "";
          if (Object.values(JilidType).includes(rawJilid as JilidType)) {
             jilid = rawJilid as JilidType;
          }

          const newSantri: Santri = {
            id: crypto.randomUUID(),
            institutionId: (currentUser?.role === UserRole.ADMIN_LEMBAGA && currentUser.entityId) ? currentUser.entityId : '',
            registrationNumber: String(row["NIS Lokal"]),
            nism: String(row["NISM"] || "-"),
            name: String(row["Nama Lengkap"]),
            gender: String(row["Jenis Kelamin (L/P)"]).toUpperCase() === 'P' ? 'P' : 'L',
            birthPlace: String(row["Tempat Lahir"] || ""),
            birthDate: String(row["Tanggal Lahir (YYYY-MM-DD)"] || ""),
            fatherName: String(row["Nama Ayah"] || ""),
            motherName: String(row["Nama Ibu"] || ""),
            currentJilid: jilid,
            address: String(row["Alamat"] || ""),
            joinDate: new Date().toISOString().split('T')[0],
            status: String(row["Status (AKTIF/LULUS)"]).toUpperCase() === 'LULUS' ? 'LULUS' : 'AKTIF'
          };
          importedSantris.push(newSantri);
        });

        if (importedSantris.length > 0) {
          setSantris([...santris, ...importedSantris]);
          setImportStatus({ type: 'success', message: `Berhasil import ${importedSantris.length} santri baru.` });
        } else {
          setImportStatus({ type: 'error', message: 'Tidak ada data valid yang ditemukan.' });
        }
      } catch (error) {
        console.error(error);
        setImportStatus({ type: 'error', message: 'Gagal membaca file Excel template.' });
      }
      if (santriInputRef.current) santriInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  // --- MASS IMPORT ASSESSMENT LOGIC ---

  const handleDownloadAssessmentTemplate = () => {
     const templateData = [
      {
        "NIS Santri": "2024001",
        "Semester": "Semester Genap 2023/2024",
        "Program (PBP/PSQ)": "PBP",
        // PBP
        "Fakta Huruf (Max 30)": 0,
        "Makhorijul & Sifatul (Max 30)": 25,
        "Ahkamul Huruf (PBP 20 / PSQ 30)": 15,
        "Titian Murottal (Max 20)": 0,
        "Doa Harian (PBP)": "Masuk Masjid",
        // PSQ
        "Fashohah (PSQ Max 40)": 0,
        "Materi Tajwid (PSQ)": "Idgham",
        "Materi Ubudiyah (PSQ)": "Sholat",
        // Common
        "Hafalan (Max 100)": 90,
        "Surah Terakhir": "An-Naba",
        // Absen
        "Sakit": 0, "Izin": 0, "Alpha": 0,
        // Sikap (BAIK/CUKUP/KURANG)
        "Sikap: Sopan Santun": "BAIK",
        "Sikap: Kerajinan": "BAIK",
        "Catatan Ustadz": "Sangat baik."
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, ws, "Template_Nilai");
    XLSX.writeFile(wb, "Template_Import_Nilai.xlsx");
  };

  const handleImportAssessmentTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        if (data.length === 0) {
           setImportStatus({ type: 'error', message: 'File kosong.' });
           return;
        }

        const importedAssessments: Assessment[] = [];
        let skippedCount = 0;
        
        data.forEach((row: any) => {
          const nis = String(row["NIS Santri"]);
          if (!nis) return;
          const student = santris.find(s => s.registrationNumber === nis);
          if (!student) { skippedCount++; return; }

          const isPBP = String(row["Program (PBP/PSQ)"] || "PBP").toUpperCase() === "PBP";

          // Parse Attitude
          const attitude: any = {
            sopanSantun: (row["Sikap: Sopan Santun"] || 'BAIK'),
            kerjasama: 'BAIK', kepatuhan: 'BAIK', keberanian: 'BAIK', 
            kecakapan: 'BAIK', kebersihan: 'BAIK', 
            kerajinan: (row["Sikap: Kerajinan"] || 'BAIK')
          };

          // Create Assessment
          const newAssessment: Assessment = {
            id: crypto.randomUUID(),
            santriId: student.id,
            term: String(row["Semester"] || "Semester Ini"),
            date: new Date().toISOString().split('T')[0],
            
            // Common
            memorizationScore: Number(row["Hafalan (Max 100)"] || 0),
            lastSurah: String(row["Surah Terakhir"] || "-"),
            teacherNote: String(row["Catatan Ustadz"] || "-"),
            
            // PBP Fields (if PBP, otherwise ignored/undefined or 0)
            fhScore: isPBP ? Number(row["Fakta Huruf (Max 30)"] || 0) : undefined,
            // MH merged with SH in PBP mode
            shScore: 0, 
            tmScore: isPBP ? Number(row["Titian Murottal (Max 20)"] || 0) : undefined,
            materialDoa: String(row["Doa Harian (PBP)"] || ""),
            
            // PSQ Fields
            materialTajwid: !isPBP ? String(row["Materi Tajwid (PSQ)"] || "") : undefined,
            materialUbudiyah: !isPBP ? String(row["Materi Ubudiyah (PSQ)"] || "") : undefined,

            attitude: attitude,
            attendanceSakit: Number(row["Sakit"] || 0),
            attendanceIzin: Number(row["Izin"] || 0),
            attendanceAlpha: Number(row["Alpha"] || 0),

            // Shared / PSQ Fields (And combined MH for PBP)
            mhScore: isPBP ? Number(row["Makhorijul & Sifatul (Max 30)"] || 0) : Number(row["Makhorijul Huruf (PBP 15 / PSQ 30)"] || 0),
            ahScore: Number(row["Ahkamul Huruf (PBP 20 / PSQ 30)"] || 0),
            fashohahScore: Number(row["Fashohah (PSQ Only Max 40)"] || 0),
            
            attendancePercentage: isPBP ? 0 : 100, // Simplification
            adabScore: 80 // Default
          };

          importedAssessments.push(newAssessment);
        });

        if (importedAssessments.length > 0) {
          setAssessments([...assessments, ...importedAssessments]);
          setImportStatus({ type: 'success', message: `Berhasil import ${importedAssessments.length} data nilai.` });
        } else {
          setImportStatus({ type: 'error', message: 'Tidak ada data valid.' });
        }

      } catch (error) {
        console.error(error);
        setImportStatus({ type: 'error', message: 'Gagal membaca file Excel template nilai.' });
      }
      if (assessmentInputRef.current) assessmentInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-6 animate-fade-in max-w-6xl mx-auto pb-20">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Database className="w-8 h-8 text-emerald-700" />
        Manajemen Database
      </h2>

      {/* Status Message */}
      {importStatus.type && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 shadow-sm ${importStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {importStatus.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
              <div>
                  <h4 className="font-bold">{importStatus.type === 'success' ? 'Berhasil' : 'Gagal'}</h4>
                  <p className="text-sm mt-1">{importStatus.message}</p>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* SECTION 1: MASS IMPORT SANTRI */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                <div className="bg-emerald-100 p-2 rounded-lg"><FileSpreadsheet className="w-6 h-6 text-emerald-600" /></div>
                <div><h3 className="text-lg font-bold text-gray-800">1. Import Santri</h3></div>
            </div>
            <div className="flex-1 space-y-4 text-sm">
                <button onClick={handleDownloadTemplate} className="w-full py-2.5 border border-emerald-500 text-emerald-700 rounded-lg font-medium flex justify-center items-center gap-2"><FileDown className="w-4 h-4" /> Download Template</button>
                <input type="file" accept=".xlsx, .xls" ref={santriInputRef} onChange={handleImportSantriTemplate} className="hidden" />
                <button onClick={() => santriInputRef.current?.click()} className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-medium shadow-md flex justify-center items-center gap-2"><FileUp className="w-4 h-4" /> Upload Data Santri</button>
            </div>
        </div>

        {/* SECTION 2: MASS IMPORT GRADES */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                <div className="bg-purple-100 p-2 rounded-lg"><BookOpenCheck className="w-6 h-6 text-purple-600" /></div>
                <div><h3 className="text-lg font-bold text-gray-800">2. Import Nilai</h3></div>
            </div>
            <div className="flex-1 space-y-4 text-sm">
                <button onClick={handleDownloadAssessmentTemplate} className="w-full py-2.5 border border-purple-500 text-purple-700 rounded-lg font-medium flex justify-center items-center gap-2"><FileDown className="w-4 h-4" /> Download Template</button>
                <input type="file" accept=".xlsx, .xls" ref={assessmentInputRef} onChange={handleImportAssessmentTemplate} className="hidden" />
                <button onClick={() => assessmentInputRef.current?.click()} className="w-full py-2.5 bg-purple-600 text-white rounded-lg font-medium shadow-md flex justify-center items-center gap-2"><FileUp className="w-4 h-4" /> Upload Data Nilai</button>
            </div>
        </div>

        {/* SECTION 3: FULL BACKUP RESTORE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                <div className="bg-blue-100 p-2 rounded-lg"><Database className="w-6 h-6 text-blue-600" /></div>
                <div><h3 className="text-lg font-bold text-gray-800">3. Backup & Restore</h3></div>
            </div>
            <div className="flex-1 space-y-4 text-sm">
                <button onClick={handleExportBackup} className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow-md flex justify-center items-center gap-2"><Download className="w-4 h-4" /> Backup Full (.xlsx)</button>
                <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleRestoreBackup} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="w-full py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-medium flex justify-center items-center gap-2"><Upload className="w-4 h-4" /> Restore Data</button>
            </div>
        </div>
      </div>
    </div>
  );
};
