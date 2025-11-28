

export enum JilidType {
  PBP_1 = 'PBP 1',
  PBP_2 = 'PBP 2',
  PBP_3 = 'PBP 3',
  PBP_4 = 'PBP 4',
  PBP_5 = 'PBP 5',
  PBP_6 = 'PBP 6',
  PBP_JUZ_AMMA = 'PBP Juz Amma',
  PSQ_1 = 'PSQ 1',
  PSQ_2 = 'PSQ 2',
  PSQ_3 = 'PSQ 3',
  PSQ_4 = 'PSQ 4',
  PSQ_5 = 'PSQ 5',
  PSQ_6 = 'PSQ 6',
  PSQ_7 = 'PSQ 7',
  PSQ_8 = 'PSQ 8',
  PSQ_9 = 'PSQ 9',
  PSQ_10 = 'PSQ 10'
}

export enum UserRole {
  ADMIN_PUSAT = 'ADMIN_PUSAT',     // Level Tertinggi (Nasional/Pusat)
  ADMIN_CABANG = 'ADMIN_CABANG',   // Level Wilayah (Kortan)
  ADMIN_LEMBAGA = 'ADMIN_LEMBAGA'  // Level Operator Unit TPQ (Yang input nilai)
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  location?: string; // Untuk Cabang/Lembaga
  entityId?: string; // ID dari Branch atau Institution yang terkait user ini
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  headOfBranch: string;
  contact: string;
  address: string;
  email?: string;
  logoUrl?: string | null;
  activeLembagaCount: number;
  // Auth
  username?: string;
  password?: string;
}

export interface Institution {
  id: string;
  branchId: string; // Link to Branch
  name: string;
  nspq: string; // Nomor Statistik TPQ
  headmaster: string;
  contact?: string;
  address: string;
  email?: string;
  logoUrl?: string | null;
  studentCount: number;
  status: 'AKTIF' | 'NON_AKTIF';
  // Auth
  username?: string;
  password?: string;
}

export interface Teacher {
  id: string;
  institutionId: string;
  name: string;
  gender: 'L' | 'P';
  nip: string; // Nomor Induk Pengajar / KTP
  phone: string;
  address: string;
  position: 'USTADZ' | 'WALI_KELAS' | 'KEPALA_TPQ';
  assignedClass?: JilidType; // Jika Wali Kelas, pegang kelas apa
  status: 'AKTIF' | 'NON_AKTIF';
  joinDate: string;
}

export interface Santri {
  id: string;
  institutionId: string; // Link ke Institution (Wajib)
  nism: string; // Nomor Induk Santri Mabin Langitan
  registrationNumber: string; // NIS Lokal
  name: string;
  gender: 'L' | 'P';
  birthPlace: string;
  birthDate: string;
  fatherName: string;
  motherName: string;
  currentJilid: JilidType;
  address: string;
  joinDate: string;
  status: 'AKTIF' | 'NON_AKTIF' | 'LULUS';
}

export type AttitudeGrade = 'BAIK' | 'CUKUP' | 'KURANG';

export interface Assessment {
  id: string;
  santriId: string;
  teacherId?: string; // ID Ustadz yang melakukan penilaian
  term: string; // e.g., "Semester Ganjil 2023/2024"
  date: string;
  
  // Standard / Shared Scores
  mhScore: number; // Makhorijul Huruf (PBP Max 15, PSQ Max 30)
  ahScore: number; // Ahkamul Huruf (PBP Max 20, PSQ Max 30)
  fashohahScore: number; // Fashohah (PBP/PSQ Max 40 - Note: PBP total logic uses FH/SH/TM too)
  
  // PBP Specific Scores
  fhScore?: number; // Fakta Huruf (Max 30)
  shScore?: number; // Sifatul Huruf (Max 15)
  tmScore?: number; // Titian Murottal (Max 20)
  materialDoa?: string; // PBP Specific
  
  // PSQ Specific Fields
  materialTajwid?: string; // Materi Tambahan Tajwid
  materialUbudiyah?: string; // Materi Tambahan Ubudiyah

  // Materi Tambahan Common
  memorizationScore: number; // Tahfidz 0-100
  lastSurah: string;

  // Adab & Sikap (Shared for PBP & PSQ)
  adabScore: number; // Numeric score (Backwards compatibility / Summary)
  attitude?: {       // Detailed Attitude
    sopanSantun: AttitudeGrade;
    kerjasama: AttitudeGrade;
    kepatuhan: AttitudeGrade;
    keberanian: AttitudeGrade;
    kecakapan: AttitudeGrade;
    kebersihan: AttitudeGrade;
    kerajinan: AttitudeGrade;
  };

  // Attendance (Detailed for PBP & PSQ)
  attendancePercentage: number; // Calculated
  attendanceSakit?: number;
  attendanceIzin?: number;
  attendanceAlpha?: number;

  teacherNote: string;
}

export interface SchoolProfile {
  name: string;
  address: string;
  contact: string;
  logoUrl: string | null;
  headmaster: string;
}

export type ViewState = 'LOGIN' | 'DASHBOARD' | 'ADMIN_DASHBOARD' | 'INSTITUTION_DATA' | 'TEACHERS' | 'STUDENTS' | 'STUDENT_DETAIL' | 'CLASSES' | 'GRADING' | 'REPORTS' | 'PROMOTION' | 'SETTINGS' | 'DATA_MANAGEMENT';