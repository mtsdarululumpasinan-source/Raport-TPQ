
import React, { useState } from 'react';
import { Santri, Assessment, JilidType } from '../types';
import { ArrowLeft, Users, TrendingUp, BookOpen, LayoutGrid, List, ChevronRight, Bookmark, Star } from 'lucide-react';

interface ClassListProps {
  santris: Santri[];
  assessments: Assessment[];
}

export const ClassList: React.FC<ClassListProps> = ({ santris, assessments }) => {
  const [selectedJilid, setSelectedJilid] = useState<JilidType | null>(null);
  const [viewMode, setViewMode] = useState<'CARD' | 'LIST'>('CARD');

  // Helper to calculate score for a single assessment
  const calculateOverallScore = (assessment: Assessment): number => {
    let totalReadingScore = 0;
    const isPBP = assessment.fhScore !== undefined;

    if (isPBP) {
      totalReadingScore = (assessment.fhScore || 0) + (assessment.mhScore || 0) + (assessment.ahScore || 0) + (assessment.tmScore || 0);
    } else {
      totalReadingScore = (assessment.mhScore || 0) + (assessment.ahScore || 0) + (assessment.fashohahScore || 0);
    }

    const overall = (totalReadingScore + assessment.memorizationScore) / 2;
    return overall;
  };

  // Helper to calculate average score for a list of students
  const calculateClassAverage = (students: Santri[]) => {
    if (students.length === 0) return 0;
    
    let totalScore = 0;
    let count = 0;

    students.forEach(student => {
      // Find latest assessment for this student
      const studentAssessments = assessments
        .filter(a => a.santriId === student.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      if (studentAssessments.length > 0) {
        const latest = studentAssessments[0];
        totalScore += calculateOverallScore(latest);
        count++;
      }
    });

    return count === 0 ? 0 : (totalScore / count).toFixed(1);
  };

  // Group data by Jilid
  const classGroups = Object.values(JilidType).map(jilid => {
    const studentsInClass = santris.filter(s => s.currentJilid === jilid);
    return {
      type: jilid,
      count: studentsInClass.length,
      average: calculateClassAverage(studentsInClass),
      students: studentsInClass
    };
  });

  const pbpClasses = classGroups.filter(g => g.type.startsWith('PBP'));
  const psqClasses = classGroups.filter(g => g.type.startsWith('PSQ'));

  // --- DETAIL VIEW (STUDENTS IN CLASS) ---
  if (selectedJilid) {
    const selectedClass = classGroups.find(g => g.type === selectedJilid);
    const isPBP = selectedJilid.startsWith('PBP');
    
    return (
      <div className="p-6 animate-fade-in">
        <button 
          onClick={() => setSelectedJilid(null)}
          className={`flex items-center mb-6 transition-colors font-medium ${isPBP ? 'text-emerald-700 hover:text-emerald-800' : 'text-blue-700 hover:text-blue-800'}`}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Kembali ke Daftar Kelas
        </button>

        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-6 p-6 rounded-2xl ${isPBP ? 'bg-emerald-50 border border-emerald-100' : 'bg-blue-50 border border-blue-100'}`}>
          <div>
            <h2 className={`text-2xl font-bold ${isPBP ? 'text-emerald-900' : 'text-blue-900'}`}>Kelas {selectedJilid}</h2>
            <p className={`${isPBP ? 'text-emerald-600' : 'text-blue-600'} font-medium`}>
                {isPBP ? 'Program Buku Paket' : 'Program Sorogan Al-Qur\'an'}
            </p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
             <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 flex items-center">
                <Users className={`w-5 h-5 mr-2 ${isPBP ? 'text-emerald-600' : 'text-blue-600'}`} />
                <span className="font-bold text-gray-800">{selectedClass?.count || 0} Santri</span>
             </div>
             <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                <span className="font-bold text-gray-800">Rata-rata: {selectedClass?.average || 0}</span>
             </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 text-gray-900 text-sm font-bold uppercase">
                <tr>
                  <th className="p-4 border-b">No</th>
                  <th className="p-4 border-b">Nama Santri</th>
                  <th className="p-4 border-b">NIS</th>
                  <th className="p-4 border-b">Kelas</th>
                  <th className="p-4 border-b">Alamat</th>
                  <th className="p-4 border-b">Hafalan Terakhir</th>
                  <th className="p-4 border-b text-center">Nilai Rata-rata</th>
                  <th className="p-4 border-b text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {selectedClass?.students.length ? (
                  selectedClass.students.map((santri, idx) => {
                    const studentAssessments = assessments
                      .filter(a => a.santriId === santri.id)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    const latest = studentAssessments[0];
                    const avg = latest 
                      ? calculateOverallScore(latest).toFixed(1)
                      : '-';

                    return (
                      <tr key={santri.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-gray-700">{idx + 1}</td>
                        <td className="p-4 font-bold text-gray-900">{santri.name}</td>
                        <td className="p-4 text-gray-600 font-mono">{santri.registrationNumber}</td>
                        <td className="p-4 text-gray-700">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${isPBP ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-blue-50 text-blue-800 border-blue-100'}`}>
                            {santri.currentJilid}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600 max-w-[200px] truncate" title={santri.address}>{santri.address || '-'}</td>
                        <td className="p-4 text-gray-800">{latest?.lastSurah || '-'}</td>
                        <td className="p-4 text-center">
                          {avg !== '-' ? (
                              <span className={`px-2 py-1 rounded font-bold ${Number(avg) >= 80 ? 'bg-green-100 text-green-800' : Number(avg) >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                  {avg}
                              </span>
                          ) : (
                              <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {latest ? (
                              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-full">Aktif</span>
                          ) : (
                              <span className="text-xs text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded-full">Belum Dinilai</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      Belum ada santri di kelas ini.
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

  // --- COMPONENT HELPERS ---

  const renderClassCard = (group: typeof classGroups[0], theme: 'EMERALD' | 'BLUE') => {
    const isEmerald = theme === 'EMERALD';
    const bgClass = isEmerald ? 'bg-emerald-600' : 'bg-blue-600';
    const textClass = isEmerald ? 'text-emerald-700' : 'text-blue-700';
    const borderClass = isEmerald ? 'border-emerald-100 hover:border-emerald-300' : 'border-blue-100 hover:border-blue-300';
    const lightBg = isEmerald ? 'bg-emerald-50' : 'bg-blue-50';

    return (
        <div 
            key={group.type}
            onClick={() => setSelectedJilid(group.type)}
            className={`bg-white rounded-xl shadow-sm border ${borderClass} p-5 cursor-pointer hover:shadow-md transition-all group relative overflow-hidden`}
        >
            <div className={`absolute top-0 right-0 p-2 rounded-bl-xl ${lightBg}`}>
                 <span className={`text-xs font-bold ${textClass}`}>
                    {isEmerald ? 'PAKET' : 'SOROGAN'}
                 </span>
            </div>

            <div className="flex items-center gap-4 mb-4 mt-2">
                <div className={`p-3 rounded-lg ${bgClass} text-white shadow-md group-hover:scale-110 transition-transform`}>
                    {isEmerald ? <Bookmark className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{group.type}</h3>
                    <p className="text-xs text-gray-500">{isEmerald ? 'Program Buku Paket' : 'Program Sorogan Al-Qur\'an'}</p>
                </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-gray-600 text-sm font-medium">
                    <Users className="w-4 h-4 mr-1.5" />
                    {group.count} Santri
                </div>
                {Number(group.average) > 0 ? (
                    <div className={`flex items-center text-sm font-bold ${textClass}`}>
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        {group.average}
                    </div>
                ) : (
                    <span className="text-xs text-gray-400 font-medium">Belum ada nilai</span>
                )}
            </div>
        </div>
    );
  };

  const renderTableRows = (groups: typeof classGroups, theme: 'EMERALD' | 'BLUE') => {
      const isPBP = theme === 'EMERALD';
      const badgeColor = isPBP ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800';
      const hoverText = isPBP ? 'hover:text-emerald-600' : 'hover:text-blue-600';

      return groups.map((group) => (
        <tr 
          key={group.type} 
          onClick={() => setSelectedJilid(group.type)}
          className="hover:bg-gray-50 transition-colors cursor-pointer group"
        >
          <td className="p-4 font-bold text-gray-900 flex items-center gap-2">
             <BookOpen className={`w-4 h-4 text-gray-400 ${hoverText} transition-colors`} />
             {group.type}
          </td>
          <td className="p-4">
            <span className={`px-2 py-1 rounded text-xs font-bold ${badgeColor}`}>
              {isPBP ? 'Program Buku Paket' : 'Program Sorogan Al-Qur\'an'}
            </span>
          </td>
          <td className="p-4 text-center">
            <span className="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded-full">{group.count}</span>
          </td>
          <td className="p-4 text-center">
             {Number(group.average) > 0 ? (
                <span className="font-bold text-gray-900">{group.average}</span>
             ) : (
                <span className="text-gray-400 font-medium">-</span>
             )}
          </td>
          <td className="p-4 text-right">
             <button className={`text-gray-400 ${hoverText} transition-colors`}>
                <ChevronRight className="w-5 h-5" />
             </button>
          </td>
        </tr>
       ));
  };

  return (
    <div className="p-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Data Kelas & Tingkatan</h2>
        
        {/* VIEW TOGGLE */}
        <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
           <button 
              onClick={() => setViewMode('CARD')}
              className={`p-2 rounded-md transition-all flex items-center gap-2 text-sm font-bold ${viewMode === 'CARD' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
           >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Card View</span>
           </button>
           <button 
              onClick={() => setViewMode('LIST')}
              className={`p-2 rounded-md transition-all flex items-center gap-2 text-sm font-bold ${viewMode === 'LIST' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
           >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List View</span>
           </button>
        </div>
      </div>
      
      {viewMode === 'CARD' ? (
        <div className="space-y-8">
          {/* PBP SECTION CARD */}
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 border border-emerald-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-emerald-100 pb-4">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                    <Bookmark className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-emerald-900">Program Buku Paket (PBP)</h3>
                    <p className="text-sm text-emerald-600">Program Buku Paket</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {pbpClasses.map(group => renderClassCard(group, 'EMERALD'))}
            </div>
          </div>

          {/* PSQ SECTION CARD */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-blue-100 pb-4">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                    <BookOpen className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-blue-900">Program Sorogan Al-Qur'an (PSQ)</h3>
                    <p className="text-sm text-blue-600">Program Sorogan Al-Qur'an</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {psqClasses.map(group => renderClassCard(group, 'BLUE'))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
            {/* PBP TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
                <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center gap-3">
                    <div className="p-1.5 bg-white text-emerald-600 rounded shadow-sm">
                        <Bookmark className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-emerald-800">Program Buku Paket (PBP)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                    <thead className="bg-white text-gray-900 text-sm font-bold uppercase border-b border-emerald-100">
                        <tr>
                        <th className="p-4">Nama Kelas</th>
                        <th className="p-4">Kategori Program</th>
                        <th className="p-4 text-center">Jumlah Santri</th>
                        <th className="p-4 text-center">Rata-rata Kelas</th>
                        <th className="p-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {renderTableRows(pbpClasses, 'EMERALD')}
                    </tbody>
                    </table>
                </div>
            </div>

            {/* PSQ TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
                    <div className="p-1.5 bg-white text-blue-600 rounded shadow-sm">
                        <BookOpen className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-blue-800">Program Sorogan Al-Qur'an (PSQ)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                    <thead className="bg-white text-gray-900 text-sm font-bold uppercase border-b border-blue-100">
                        <tr>
                        <th className="p-4">Nama Kelas</th>
                        <th className="p-4">Kategori Program</th>
                        <th className="p-4 text-center">Jumlah Santri</th>
                        <th className="p-4 text-center">Rata-rata Kelas</th>
                        <th className="p-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {renderTableRows(psqClasses, 'BLUE')}
                    </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
