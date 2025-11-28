
import React from 'react';
import { Santri, Assessment, JilidType } from '../types';
import { Users, Star, TrendingUp, Calendar, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface DashboardProps {
  santris: Santri[];
  assessments: Assessment[];
  institutionName?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ santris, assessments, institutionName }) => {
  const totalSantri = santris.length;
  const recentAssessments = assessments.length;
  
  // Helper to calculate score for a single assessment
  const calculateOverallScore = (assessment: Assessment): number => {
    let totalReadingScore = 0;
    const isPBP = assessment.fhScore !== undefined;

    if (isPBP) {
      // PBP total is 100
      totalReadingScore = (assessment.fhScore || 0) + (assessment.mhScore || 0) + (assessment.ahScore || 0) + (assessment.tmScore || 0);
    } else {
      // PSQ total is 100
      totalReadingScore = (assessment.mhScore || 0) + (assessment.ahScore || 0) + (assessment.fashohahScore || 0);
    }

    // Rata-rata dari 2 komponen utama: Bacaan dan Hafalan (keduanya skala 100)
    const overall = (totalReadingScore + assessment.memorizationScore) / 2;
    return overall;
  };

  // Calculate Average Score Global
  const avgScore = assessments.length > 0
    ? (assessments.reduce((acc, curr) => acc + calculateOverallScore(curr), 0) / assessments.length).toFixed(1)
    : 0;

  // Data for Distribution Chart
  const jilidDistribution = Object.values(JilidType).map(type => {
    return {
      name: type,
      count: santris.filter(s => s.currentJilid === type).length
    };
  });

  // Data for Class Performance Chart (Average Score per Class)
  const classPerformanceData = Object.values(JilidType).map(type => {
    const studentsInClass = santris.filter(s => s.currentJilid === type);
    
    let totalScore = 0;
    let ratedStudentCount = 0;

    studentsInClass.forEach(student => {
      // Find latest assessment
      const studentAssessments = assessments
        .filter(a => a.santriId === student.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      if (studentAssessments.length > 0) {
        const latest = studentAssessments[0];
        totalScore += calculateOverallScore(latest);
        ratedStudentCount++;
      }
    });

    const classAvg = ratedStudentCount > 0 ? (totalScore / ratedStudentCount).toFixed(1) : 0;

    return {
      name: type,
      average: Number(classAvg),
      studentCount: studentsInClass.length
    };
  });

  // Expanded color palette to distinguish PBP (Greens) and PSQ (Blues/Purples)
  // Added a specific dark emerald for PBP Juz Amma
  const COLORS = [
    // PBP 1-6 (Greens/Teals)
    '#2dd4bf', '#14b8a6', '#0d9488', '#0f766e', '#10b981', '#059669', 
    // PBP Juz Amma (Dark Emerald/Special)
    '#047857',
    // PSQ 1-10 (Blues/Indigos/Violets)
    '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#a78bfa', '#7c3aed'
  ];

  return (
    <div className="p-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Ikhtisar</h2>
          {institutionName && (
            <p className="text-emerald-700 font-bold flex items-center gap-2 mt-1">
               <Building2 className="w-4 h-4" />
               {institutionName}
            </p>
          )}
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 mt-2 md:mt-0">
             <span className="text-sm font-medium text-gray-500">Tahun Ajaran:</span>
             <span className="text-sm font-bold text-gray-800 ml-2">2023/2024</span>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 bg-blue-100 rounded-full mr-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Santri</p>
            <p className="text-2xl font-bold text-gray-800">{totalSantri}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 bg-emerald-100 rounded-full mr-4">
            <Star className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Rata-rata Nilai</p>
            <p className="text-2xl font-bold text-gray-800">{avgScore}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 bg-purple-100 rounded-full mr-4">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Penilaian Masuk</p>
            <p className="text-2xl font-bold text-gray-800">{recentAssessments}</p>
          </div>
        </div>

         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 bg-orange-100 rounded-full mr-4">
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-lg font-bold text-emerald-600">AKTIF</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Distribusi Santri per Jilid</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={jilidDistribution}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 10}} interval={0} angle={-45} textAnchor="end" height={60} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} allowDecimals={false} />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {jilidDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Average Score Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Rata-rata Nilai per Kelas</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 10}} interval={0} angle={-45} textAnchor="end" height={60} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                formatter={(value: number) => [`${value}`, 'Rata-rata']}
              />
              <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'KKM', position: 'right', fill: '#f59e0b', fontSize: 10 }} />
              <Bar dataKey="average" radius={[4, 4, 0, 0]} name="Rata-rata Nilai">
                {classPerformanceData.map((entry, index) => (
                    <Cell key={`cell-avg-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
