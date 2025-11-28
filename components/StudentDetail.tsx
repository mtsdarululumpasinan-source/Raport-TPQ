
import React from 'react';
import { Santri, Assessment, Teacher } from '../types';
import { ArrowLeft, User, Calendar, MapPin, BookOpen, Star, Clock, Heart, Hash, Info, UserCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface StudentDetailProps {
  santri: Santri;
  assessments: Assessment[];
  teachers: Teacher[]; // Added to look up teacher names
  onBack: () => void;
}

export const StudentDetail: React.FC<StudentDetailProps> = ({ santri, assessments, teachers, onBack }) => {
  // Sort assessments by date
  const sortedAssessments = [...assessments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const reversedAssessments = [...sortedAssessments].reverse();

  // Helper calculation
  const getReadingTotal = (a: Assessment) => {
      // If PBP fields exist
      if (a.fhScore !== undefined) {
          // SH score removed from calculation as it is now merged into MH or unused
          return (a.fhScore || 0) + (a.mhScore || 0) + (a.ahScore || 0) + (a.tmScore || 0);
      }
      // Standard PSQ
      return a.mhScore + a.ahScore + a.fashohahScore;
  };

  // Calculate stats
  const totalAssessments = assessments.length;
  
  const latestAssessment = reversedAssessments[0];
  const isPBP = santri.currentJilid.startsWith('PBP');

  // Prepare chart data
  const chartData = sortedAssessments.map(a => ({
    date: new Date(a.date).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
    reading: getReadingTotal(a),
    hafalan: a.memorizationScore,
  }));


  return (
    <div className="p-6 animate-fade-in pb-20">
      <button 
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-emerald-600 mb-6 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Data Santri
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className={`h-24 relative ${isPBP ? 'bg-emerald-600' : 'bg-blue-600'}`}>
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                 <div className="w-24 h-24 bg-white rounded-full p-2 shadow-lg">
                    <div className={`w-full h-full rounded-full flex items-center justify-center text-white text-3xl font-bold ${santri.gender === 'L' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                        {santri.gender === 'L' ? 'L' : 'P'}
                    </div>
                 </div>
              </div>
            </div>
            <div className="pt-16 pb-6 px-6 text-center">
              <h2 className="text-xl font-bold text-gray-900">{santri.name}</h2>
              <p className="text-sm text-gray-500 mb-2">{santri.registrationNumber}</p>
              <div className="flex justify-center gap-2">
                 <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${isPBP ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                    {santri.currentJilid}
                 </span>
                 <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                     santri.status === 'AKTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                 }`}>
                    {santri.status}
                 </span>
              </div>
            </div>
            <div className="border-t border-gray-100 p-6 space-y-4">
               {/* Same profile details as before */}
               <div className="flex items-start gap-3 text-sm">
                  <User className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-xs">Orang Tua</p>
                    <p className="font-medium text-gray-800">{santri.fatherName} & {santri.motherName}</p>
                  </div>
               </div>
               <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-xs">Alamat</p>
                    <p className="font-medium text-gray-800">{santri.address || '-'}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Total Nilai Bacaan</p>
                <div className="flex items-center gap-2">
                   {/* FIX: Corrected the malformed JSX for the Star icon. Changed to use a valid `fill` prop. */}
                   <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                   <span className="text-xl font-bold text-gray-800">{latestAssessment ? getReadingTotal(latestAssessment) : 0}</span>
                </div>
             </div>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Total Penilaian</p>
                <div className="flex items-center gap-2">
                   <Clock className="w-5 h-5 text-blue-500" />
                   <span className="text-xl font-bold text-gray-800">{totalAssessments}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Analytics & History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Progress Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             <h3 className="text-lg font-bold text-gray-800 mb-4">Grafik Perkembangan</h3>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                   <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                   <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                   <Tooltip />
                   <Legend />
                   <Line type="monotone" dataKey="reading" name="Nilai Bacaan" stroke="#10b981" strokeWidth={2} dot={{r: 4}} />
                   <Line type="monotone" dataKey="hafalan" name="Hafalan" stroke="#3b82f6" strokeWidth={2} dot={false} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* History List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Riwayat Penilaian</h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{totalAssessments} Data</span>
             </div>
             
             {reversedAssessments.length > 0 ? (
               <div className="divide-y divide-gray-100">
                 {reversedAssessments.map((item) => {
                   const readingScore = getReadingTotal(item);
                   const isItemPBP = item.fhScore !== undefined;
                   const assessingTeacher = teachers.find(t => t.id === item.teacherId);

                   return (
                     <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col md:flex-row justify-between mb-4 gap-2">
                           <div>
                              <p className="text-sm font-bold text-emerald-800">{item.term}</p>
                              <div className="text-xs text-gray-500 flex items-center gap-2">
                                <p>
                                 {new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                                {assessingTeacher && (
                                  <div className="flex items-center gap-1 text-purple-700 bg-purple-50 px-2 rounded-full border border-purple-100">
                                    <UserCircle className="w-3 h-3"/>
                                    <span>{assessingTeacher.name}</span>
                                  </div>
                                )}
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                               <div className="text-right">
                                  <p className="text-xs text-gray-500">Hafalan</p>
                                  <p className="font-medium text-sm text-gray-800">{item.lastSurah} ({item.memorizationScore})</p>
                               </div>
                               <div className="bg-emerald-50 px-3 py-1 rounded-lg">
                                  <p className="text-xs text-emerald-600 font-bold">Total Bacaan</p>
                                  <p className="text-lg font-bold text-emerald-700">
                                     {readingScore}
                                  </p>
                               </div>
                           </div>
                        </div>
                        
                        {/* Score Grid Dynamic */}
                        <div className="grid grid-cols-4 lg:grid-cols-5 gap-2 text-center mb-4">
                           {isItemPBP ? (
                               <>
                                <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500">FH</p><p className="font-semibold">{item.fhScore}</p></div>
                                <div className="bg-gray-50 p-2 rounded col-span-2"><p className="text-[10px] text-gray-500">MH & SH</p><p className="font-semibold">{item.mhScore}</p></div>
                                <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500">AH</p><p className="font-semibold">{item.ahScore}</p></div>
                                <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500">TM</p><p className="font-semibold">{item.tmScore}</p></div>
                               </>
                           ) : (
                               <>
                                <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500">MH</p><p className="font-semibold">{item.mhScore}</p></div>
                                <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500">AH</p><p className="font-semibold">{item.ahScore}</p></div>
                                <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500">Fash</p><p className="font-semibold">{item.fashohahScore}</p></div>
                                <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500">Tajwid</p><p className="font-semibold text-xs truncate">{item.materialTajwid || '-'}</p></div>
                                <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500">Ubudiyah</p><p className="font-semibold text-xs truncate">{item.materialUbudiyah || '-'}</p></div>
                               </>
                           )}
                        </div>

                        <div className="bg-yellow-50 p-3 rounded text-sm italic text-gray-600 border border-yellow-100 flex gap-2">
                           <BookOpen className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600" />
                           "{item.teacherNote}"
                        </div>
                     </div>
                   );
                 })}
               </div>
             ) : (
                <div className="p-8 text-center text-gray-400">
                   Belum ada data penilaian.
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
