
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { Dashboard } from './components/Dashboard';
import { StudentList } from './components/StudentList';
import { StudentDetail } from './components/StudentDetail';
import { GradingForm } from './components/GradingForm';
import { ReportCard } from './components/ReportCard';
import { Settings } from './components/Settings';
import { ClassList } from './components/ClassList';
import { Promotion } from './components/Promotion';
import { DataManagement } from './components/DataManagement';
import { InstitutionList } from './components/InstitutionList';
import { TeacherList } from './components/TeacherList';
import { Santri, Assessment, ViewState, JilidType, SchoolProfile, User, UserRole, Branch, Institution, Teacher } from './types';
import { Menu } from 'lucide-react';

// Mock Data Initializer
const initialSantris: Santri[] = [
  { 
    id: '1',
    institutionId: 'i1', // TPQ Al-Hikmah 
    name: 'Ahmad Fulan', 
    nism: '1234567890',
    registrationNumber: '2023001', 
    gender: 'L',
    birthPlace: 'Surabaya',
    birthDate: '2015-05-20',
    fatherName: 'Budi Santoso', 
    motherName: 'Siti Aminah',
    currentJilid: JilidType.PBP_3, 
    joinDate: '2023-01-15', 
    address: 'Jl. Merpati No. 10',
    status: 'AKTIF'
  },
  { 
    id: '2', 
    institutionId: 'i1', // TPQ Al-Hikmah
    name: 'Siti Aminah', 
    nism: '1234567891',
    registrationNumber: '2023002', 
    gender: 'P',
    birthPlace: 'Gresik',
    birthDate: '2016-02-14',
    fatherName: 'Hasan Basri', 
    motherName: 'Nurul Hidayah',
    currentJilid: JilidType.PBP_5, 
    joinDate: '2023-02-10', 
    address: 'Jl. Kenari Blok A',
    status: 'AKTIF'
  },
  { 
    id: '3', 
    institutionId: 'i1', // TPQ Al-Hikmah
    name: 'Umar Khalid', 
    nism: '1234567892',
    registrationNumber: '2023003', 
    gender: 'L',
    birthPlace: 'Lamongan',
    birthDate: '2014-11-30',
    fatherName: 'Zubair', 
    motherName: 'Aisyah',
    currentJilid: JilidType.PSQ_1, 
    joinDate: '2022-06-20', 
    address: 'Komplek Permata Indah',
    status: 'AKTIF'
  },
  { 
    id: '4', 
    institutionId: 'i2', // TPQ Nurul Huda (Bedanya disini untuk testing filter)
    name: 'Fatima Az-Zahra', 
    nism: '1234567893',
    registrationNumber: '2023004', 
    gender: 'P',
    birthPlace: 'Surabaya',
    birthDate: '2017-08-17',
    fatherName: 'Ali', 
    motherName: 'Fatimah',
    currentJilid: JilidType.PBP_1, 
    joinDate: '2024-01-05', 
    address: 'Jl. H. Oemar Said',
    status: 'AKTIF'
  },
  { 
    id: '5', 
    institutionId: 'i2', // TPQ Nurul Huda
    name: 'Yusuf Hamdan', 
    nism: '1234567894',
    registrationNumber: '2023005', 
    gender: 'L',
    birthPlace: 'Sidoarjo',
    birthDate: '2013-09-09',
    fatherName: 'Ibrahim', 
    motherName: 'Sarah',
    currentJilid: JilidType.PSQ_3, 
    joinDate: '2022-11-12', 
    address: 'Dusun Krajan RT 02',
    status: 'NON_AKTIF'
  },
];

const initialAssessments: Assessment[] = [
  {
    id: 'a1',
    santriId: '2',
    teacherId: 't3',
    term: 'Semester Ganjil 2024/2025',
    mhScore: 25,
    ahScore: 25,
    fashohahScore: 35,
    memorizationScore: 90,
    adabScore: 95,
    attendancePercentage: 98,
    lastSurah: 'An-Nazi\'at',
    teacherNote: 'Siti sangat rajin, makhorijul huruf sudah baik. Pertahankan semangatnya ya nak.',
    date: '2024-06-15'
  }
];

const initialTeachers: Teacher[] = [
  {
    id: 't1', institutionId: 'i1', name: 'Ust. Abdullah', gender: 'L', nip: '199001012020011001', phone: '08123456789', address: 'Surabaya', position: 'KEPALA_TPQ', status: 'AKTIF', joinDate: '2020-01-01'
  },
  {
    id: 't2', institutionId: 'i1', name: 'Ust. Budi', gender: 'L', nip: '199202022020021002', phone: '08123456780', address: 'Surabaya', position: 'WALI_KELAS', assignedClass: JilidType.PBP_1, status: 'AKTIF', joinDate: '2021-01-01'
  },
  {
    id: 't3', institutionId: 'i1', name: 'Usth. Siti', gender: 'P', nip: '-', phone: '08123456781', address: 'Sidoarjo', position: 'USTADZ', status: 'AKTIF', joinDate: '2022-01-01'
  }
];

// Mock Data for Branches (Kortan) with Login Credentials
const initialBranches: Branch[] = [
  { 
    id: 'b1', name: 'Kortan Surabaya', code: 'SBY-01', headOfBranch: 'Ust. Ahmad Dahlan', contact: '0812-3456-7890', address: 'Jl. Pahlawan No. 10, Surabaya', activeLembagaCount: 15,
    username: 'cabang', password: '123'
  },
  { 
    id: 'b2', name: 'Kortan Sidoarjo', code: 'SDA-02', headOfBranch: 'Ust. Hasyim Asyari', contact: '0813-4567-8901', address: 'Jl. Jenggolo No. 5, Sidoarjo', activeLembagaCount: 12,
    username: 'sidoarjo', password: '123'
  },
  { 
    id: 'b3', name: 'Kortan Gresik', code: 'GRS-03', headOfBranch: 'Ust. Wahid Hasyim', contact: '0814-5678-9012', address: 'Jl. Veteran No. 8, Gresik', activeLembagaCount: 8,
    username: 'gresik', password: '123'
  },
];

// Mock Data for Institutions with Login Credentials
const initialInstitutions: Institution[] = [
  { 
    id: 'i1', branchId: 'b1', name: 'TPQ Al-Hikmah', nspq: '41123578001', headmaster: 'Ust. Abdullah', address: 'Rungkut, Surabaya', studentCount: 120, status: 'AKTIF',
    username: 'lembaga', password: '123'
  },
  { 
    id: 'i2', branchId: 'b1', name: 'TPQ Nurul Huda', nspq: '41123578002', headmaster: 'Ust. Zainal', address: 'Wonokromo, Surabaya', studentCount: 85, status: 'AKTIF',
    username: 'nurulhuda', password: '123'
  },
  { 
    id: 'i3', branchId: 'b1', name: 'TPQ Ar-Rahman', nspq: '41123578003', headmaster: 'Usth. Fatimah', address: 'Sukolilo, Surabaya', studentCount: 45, status: 'NON_AKTIF',
    username: 'arrahman', password: '123'
  },
  { 
    id: 'i4', branchId: 'b2', name: 'TPQ Darussalam', nspq: '42223578001', headmaster: 'Ust. Karim', address: 'Waru, Sidoarjo', studentCount: 150, status: 'AKTIF',
    username: 'darussalam', password: '123'
  },
  { 
    id: 'i5', branchId: 'b2', name: 'TPQ Al-Ikhlas', nspq: '42223578002', headmaster: 'Ust. Rahim', address: 'Candi, Sidoarjo', studentCount: 90, status: 'AKTIF',
    username: 'alikhlas', password: '123'
  },
  { 
    id: 'i6', branchId: 'b3', name: 'TPQ Al-Amin', nspq: '43323578001', headmaster: 'Ust. Salam', address: 'Kebomas, Gresik', studentCount: 110, status: 'AKTIF',
    username: 'alamin', password: '123'
  },
];

const App: React.FC = () => {
  // User Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [currentView, setView] = useState<ViewState>('LOGIN');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // App Data State
  const [santris, setSantris] = useState<Santri[]>(initialSantris);
  const [assessments, setAssessments] = useState<Assessment[]>(initialAssessments);
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  // Institution Data State (Contains Auth Data)
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [institutions, setInstitutions] = useState<Institution[]>(initialInstitutions);

  // Admin Pusat Credentials State
  const [adminPusatCredentials, setAdminPusatCredentials] = useState({ username: 'pusat', password: '123' });
  
  // Report Card State
  const [reportCardInitialSantriId, setReportCardInitialSantriId] = useState<string | undefined>(undefined);

  // School Profile State (View Only)
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>({
    name: 'TPQ DIGITAL SYSTEM',
    address: 'Pusat Nasional',
    contact: 'admin@tpq-pusat.com',
    logoUrl: null,
    headmaster: 'Administrator Pusat'
  });

  // Load relevant profile when user logs in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === UserRole.ADMIN_LEMBAGA && currentUser.entityId) {
        // Find institution
        const inst = institutions.find(i => i.id === currentUser.entityId); 
        if (inst) {
          setSchoolProfile({
            name: inst.name,
            address: inst.address,
            contact: inst.contact || inst.nspq,
            logoUrl: inst.logoUrl || null,
            headmaster: inst.headmaster
          });
        }
      } else if (currentUser.role === UserRole.ADMIN_CABANG && currentUser.entityId) {
        // Find branch
        const branch = branches.find(b => b.id === currentUser.entityId);
        if (branch) {
          setSchoolProfile({
            name: branch.name,
            address: branch.address,
            contact: branch.contact,
            logoUrl: branch.logoUrl || null,
            headmaster: branch.headOfBranch
          });
        }
      } else {
        // Admin Pusat
         setSchoolProfile({
            name: 'KANTOR PUSAT TPQ',
            address: 'Jl. Nasional No. 1, Jakarta',
            contact: '021-555-999',
            logoUrl: null,
            headmaster: 'KH. Pimpinan Pusat'
          });
      }
    }
  }, [currentUser, institutions, branches]);


  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === UserRole.ADMIN_LEMBAGA) {
      setView('DASHBOARD');
    } else {
      setView('ADMIN_DASHBOARD');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('LOGIN');
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // --- CRUD OPERATIONS ---
  
  const addSantri = (newSantri: Santri) => {
    if (currentUser?.role === UserRole.ADMIN_LEMBAGA && currentUser.entityId) {
      newSantri.institutionId = currentUser.entityId;
    }
    setSantris([...santris, newSantri]);
  };

  const editSantri = (updatedSantri: Santri) => {
    setSantris(prev => prev.map(s => s.id === updatedSantri.id ? updatedSantri : s));
  };

  const deleteSantri = (id: string) => {
    if (confirm('Yakin ingin menghapus data santri ini?')) {
      setSantris(santris.filter(s => s.id !== id));
      setAssessments(assessments.filter(a => a.santriId !== id));
    }
  };

  // Teacher CRUD
  const addTeacher = (newTeacher: Teacher) => {
     setTeachers([...teachers, newTeacher]);
  };
  const editTeacher = (updatedTeacher: Teacher) => {
     setTeachers(prev => prev.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
  };
  const deleteTeacher = (id: string) => {
     if(confirm('Yakin ingin menghapus data pengajar ini?')) {
         setTeachers(prev => prev.filter(t => t.id !== id));
     }
  };

  const addAssessment = (newAssessment: Assessment) => {
    setAssessments([...assessments, newAssessment]);
  };
  
  const updateAssessment = (updatedAssessment: Assessment) => {
      setAssessments(prev => prev.map(a => a.id === updatedAssessment.id ? updatedAssessment : a));
  };

  // Branch CRUD
  const addBranch = (newBranch: Branch) => setBranches([...branches, newBranch]);
  const updateBranch = (updatedBranch: Branch) => setBranches(prev => prev.map(b => b.id === updatedBranch.id ? updatedBranch : b));
  const deleteBranch = (id: string) => setBranches(prev => prev.filter(b => b.id !== id));
  
  // Institution CRUD
  const addInstitution = (newInst: Institution) => setInstitutions([...institutions, newInst]);
  const updateInstitution = (updatedInst: Institution) => setInstitutions(prev => prev.map(i => i.id === updatedInst.id ? updatedInst : i));
  const deleteInstitution = (id: string) => setInstitutions(prev => prev.filter(i => i.id !== id));

  // --- SETTINGS LOGIC ---
  const handleSaveSettingsProfile = (profile: SchoolProfile) => {
     setSchoolProfile(profile);
     
     if (currentUser?.role === UserRole.ADMIN_LEMBAGA && currentUser.entityId) {
        setInstitutions(prev => prev.map(i => i.id === currentUser.entityId ? {
           ...i, 
           name: profile.name, 
           address: profile.address, 
           headmaster: profile.headmaster, 
           contact: profile.contact, 
           logoUrl: profile.logoUrl
        } : i));
     } else if (currentUser?.role === UserRole.ADMIN_CABANG && currentUser.entityId) {
        setBranches(prev => prev.map(b => b.id === currentUser.entityId ? {
           ...b, 
           name: profile.name, 
           address: profile.address, 
           headOfBranch: profile.headmaster, 
           contact: profile.contact,
           logoUrl: profile.logoUrl
        } : b));
     }
  };

  const handleUpdatePassword = (newPassword: string) => {
      if (!currentUser) return;

      if (currentUser.role === UserRole.ADMIN_PUSAT) {
          setAdminPusatCredentials(prev => ({ ...prev, password: newPassword }));
      } else if (currentUser.role === UserRole.ADMIN_CABANG && currentUser.entityId) {
          setBranches(prev => prev.map(b => b.id === currentUser.entityId ? { ...b, password: newPassword } : b));
      } else if (currentUser.role === UserRole.ADMIN_LEMBAGA && currentUser.entityId) {
          setInstitutions(prev => prev.map(i => i.id === currentUser.entityId ? { ...i, password: newPassword } : i));
      }
  };

  const handlePromoteStudents = (santriIds: string[], targetJilid: JilidType) => {
    setSantris(prevSantris => 
      prevSantris.map(s => 
        santriIds.includes(s.id) ? { ...s, currentJilid: targetJilid } : s
      )
    );
    return true;
  };

  const handleViewStudentDetail = (id: string) => {
    setSelectedStudentId(id);
    setView('STUDENT_DETAIL');
  };
  
  const handlePrintReport = (id: string) => {
    setReportCardInitialSantriId(id);
    setView('REPORTS');
  };

  // --- FILTERING DATA BASED ON USER SCOPE ---
  const getFilteredData = () => {
    let filteredSantris = santris;
    let filteredAssessments = assessments;
    let filteredTeachers = teachers;

    if (currentUser?.role === UserRole.ADMIN_LEMBAGA && currentUser.entityId) {
       filteredSantris = santris.filter(s => s.institutionId === currentUser.entityId);
       filteredTeachers = teachers.filter(t => t.institutionId === currentUser.entityId);
    } else if (currentUser?.role === UserRole.ADMIN_CABANG && currentUser.entityId) {
       const instIds = institutions.filter(i => i.branchId === currentUser.entityId).map(i => i.id);
       filteredSantris = santris.filter(s => instIds.includes(s.institutionId));
       filteredTeachers = teachers.filter(t => instIds.includes(t.institutionId));
    }
    
    const visibleSantriIds = filteredSantris.map(s => s.id);
    filteredAssessments = assessments.filter(a => visibleSantriIds.includes(a.santriId));

    return { filteredSantris, filteredAssessments, filteredTeachers };
  };

  const { filteredSantris, filteredAssessments, filteredTeachers } = getFilteredData();


  const renderContent = () => {
    switch (currentView) {
      case 'ADMIN_DASHBOARD':
        return currentUser ? (
          <AdminDashboard 
            user={currentUser} 
            branches={branches} 
            institutions={institutions}
            santris={santris}
          />
        ) : null;
      case 'DASHBOARD':
        return <Dashboard santris={filteredSantris} assessments={filteredAssessments} institutionName={schoolProfile.name} />;
      case 'INSTITUTION_DATA':
        return <InstitutionList 
                  branches={branches} 
                  institutions={institutions} 
                  userRole={currentUser?.role || UserRole.ADMIN_LEMBAGA} 
                  onAddBranch={addBranch}
                  onUpdateBranch={updateBranch}
                  onDeleteBranch={deleteBranch}
                  onAddInstitution={addInstitution}
                  onUpdateInstitution={updateInstitution}
                  onDeleteInstitution={deleteInstitution}
               />;
      case 'TEACHERS':
        return <TeacherList 
                  teachers={filteredTeachers} 
                  currentUser={currentUser}
                  addTeacher={addTeacher}
                  editTeacher={editTeacher}
                  deleteTeacher={deleteTeacher}
               />;
      case 'STUDENTS':
        return <StudentList 
                  santris={filteredSantris} 
                  institutions={institutions}
                  branches={branches}
                  currentUser={currentUser}
                  addSantri={addSantri} 
                  editSantri={editSantri} 
                  deleteSantri={deleteSantri} 
                  onViewDetail={handleViewStudentDetail} 
                  onPrintReport={handlePrintReport}
               />;
      case 'STUDENT_DETAIL':
        const selectedStudent = filteredSantris.find(s => s.id === selectedStudentId);
        if (selectedStudent) {
            return (
                <StudentDetail 
                    santri={selectedStudent} 
                    assessments={filteredAssessments.filter(a => a.santriId === selectedStudentId)}
                    teachers={teachers}
                    onBack={() => setView('STUDENTS')}
                />
            );
        }
        return <StudentList santris={filteredSantris} institutions={institutions} branches={branches} currentUser={currentUser} addSantri={addSantri} editSantri={editSantri} deleteSantri={deleteSantri} onViewDetail={handleViewStudentDetail} onPrintReport={handlePrintReport} />;
      case 'CLASSES':
        return <ClassList santris={filteredSantris} assessments={filteredAssessments} />;
      case 'GRADING':
        return <GradingForm 
                  santris={filteredSantris} 
                  assessments={filteredAssessments} 
                  teachers={filteredTeachers}
                  addAssessment={addAssessment} 
                  updateAssessment={updateAssessment}
                />;
      case 'PROMOTION':
        return <Promotion santris={filteredSantris} onPromote={handlePromoteStudents} />;
      case 'REPORTS':
        return <ReportCard 
                 santris={filteredSantris} 
                 assessments={filteredAssessments} 
                 teachers={filteredTeachers}
                 schoolProfile={schoolProfile} 
                 initialSantriId={reportCardInitialSantriId}
               />;
      case 'SETTINGS':
        return <Settings 
                profile={schoolProfile} 
                currentUsername={currentUser?.username}
                onSaveProfile={handleSaveSettingsProfile} 
                onUpdatePassword={handleUpdatePassword}
               />;
      case 'DATA_MANAGEMENT':
        return <DataManagement 
          santris={filteredSantris} 
          assessments={filteredAssessments} 
          setSantris={setSantris} 
          setAssessments={setAssessments}
          currentUser={currentUser} 
        />;
      default:
        if (currentUser?.role === UserRole.ADMIN_LEMBAGA) return <Dashboard santris={filteredSantris} assessments={filteredAssessments} institutionName={schoolProfile.name} />;
        return <AdminDashboard 
          user={currentUser!} 
          branches={branches} 
          institutions={institutions}
          santris={santris}
        />;
    }
  };

  // Login Screen with props
  if (!currentUser || currentView === 'LOGIN') {
    return (
        <Login 
            onLogin={handleLogin} 
            branches={branches} 
            institutions={institutions} 
            adminCredentials={adminPusatCredentials}
        />
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar}
        schoolProfile={schoolProfile}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-emerald-900 text-white p-4 flex items-center justify-between shadow-md z-20">
          <div className="flex items-center gap-2">
            {schoolProfile.logoUrl && (
              <img src={schoolProfile.logoUrl} alt="logo" className="w-8 h-8 rounded bg-white p-0.5" />
            )}
            <div>
              <h1 className="text-sm font-bold truncate max-w-[150px]">{schoolProfile.name}</h1>
              <span className="text-[10px] bg-emerald-800 px-1 rounded text-emerald-200">{currentUser.name}</span>
            </div>
          </div>
          <button onClick={toggleSidebar} className="p-2 hover:bg-emerald-800 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative">
          {renderContent()}
        </main>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
