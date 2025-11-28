
import React from 'react';
import { User, UserRole, Branch, Institution, Santri } from '../types';
import { Building2, Map, Users, TrendingUp, Landmark, School } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AdminDashboardProps {
  user: User;
  branches: Branch[];
  institutions: Institution[];
  santris: Santri[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, branches, institutions, santris }) => {
  const isPusat = user.role === UserRole.ADMIN_PUSAT;

  // --- KALKULASI STATISTIK DINAMIS ---
  let totalKortan = 0;
  let totalLembaga = 0;
  let totalSantri = 0;
  let labelWilayah = 'Nasional';

  if (isPusat) {
    // Admin Pusat melihat SEMUA data
    totalKortan = branches.length;
    totalLembaga = institutions.length;
    totalSantri = santris.length;
  } else if (user.role === UserRole.ADMIN_CABANG && user.entityId) {
    // Admin Cabang/Kortan hanya melihat data wilayahnya
    labelWilayah = user.location || 'Wilayah';
    totalKortan = 1; // Dirinya sendiri
    
    // Filter lembaga milik cabang ini
    const myInstitutions = institutions.filter(i => i.branchId === user.entityId);
    totalLembaga = myInstitutions.length;

    // Filter santri yang ada di lembaga-lembaga milik cabang ini
    const myInstIds = myInstitutions.map(i => i.id);
    const mySantris = santris.filter(s => myInstIds.includes(s.institutionId));
    totalSantri = mySantris.length;
  }

  // Data Statistik untuk UI
  const stats = isPusat ? [
    { label: 'Total Kortan', value: totalKortan, icon: Map, color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Lembaga TPQ', value: totalLembaga, icon: School, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Total Santri Nasional', value: totalSantri.toLocaleString('id-ID'), icon: Users, color: 'bg-purple-100 text-purple-600' },
    { label: 'Rata-rata Kelulusan', value: '92%', icon: TrendingUp, color: 'bg-orange-100 text-orange-600' },
  ] : [
    { label: 'Total Lembaga Binaan', value: totalLembaga, icon: School, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Santri Wilayah', value: totalSantri.toLocaleString('id-ID'), icon: Users, color: 'bg-purple-100 text-purple-600' },
    { label: 'Kecamatan', value: labelWilayah, icon: Map, color: 'bg-blue-100 text-blue-600' }, // Placeholder visual
    { label: 'Rata-rata Nilai', value: '84.5', icon: TrendingUp, color: 'bg-orange-100 text-orange-600' },
  ];

  // --- DYNAMIC CHART DATA ---
  let chartData: any[] = [];
  let chartLabel = "Distribusi Santri";
  let chartDataKey = "count";
  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#14b8a6', '#6366f1'];


  if (isPusat) {
    chartLabel = "Total Santri per Kortan";
    chartDataKey = "santriCount";
    chartData = branches.map(branch => {
      const instIds = institutions.filter(i => i.branchId === branch.id).map(i => i.id);
      const santriCount = santris.filter(s => instIds.includes(s.institutionId)).length;
      return {
        name: branch.name.replace('Kortan ', ''), // Shorten name for chart
        santriCount: santriCount
      };
    });
  } else if (user.role === UserRole.ADMIN_CABANG && user.entityId) {
    chartLabel = "Total Santri per Lembaga TPQ";
    chartDataKey = "santriCount";
    const myInstitutions = institutions.filter(i => i.branchId === user.entityId);
    chartData = myInstitutions.map(inst => {
      const santriCount = santris.filter(s => s.institutionId === inst.id).length;
      return {
        name: inst.name.replace('TPQ ', ''),
        santriCount: santriCount
      };
    });
  }

  return (
    <div className="p-6 animate-fade-in pb-20">
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-2xl p-8 mb-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Selamat Datang, {user.name}</h2>
        <p className="opacity-90 flex items-center gap-2">
           <Landmark className="w-4 h-4" /> 
           {user.location || 'Pusat Data'} | <span className="font-bold bg-white/20 px-2 rounded text-sm uppercase">{user.role.replace('_', ' ')}</span>
        </p>
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-6">Ringkasan Eksekutif {isPusat ? 'Nasional' : 'Wilayah'}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => {
           const Icon = stat.icon;
           return (
             <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
                <div className={`p-4 rounded-full mr-4 ${stat.color}`}>
                   <Icon className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-sm text-gray-500 font-bold">{stat.label}</p>
                   <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
             </div>
           );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-96">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{chartLabel}</h3>
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontWeight: 600, fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} allowDecimals={false} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey={chartDataKey} radius={[4,4,0,0]}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
         </div>

         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Aktivitas Terbaru</h3>
            <ul className="space-y-4">
               {[1,2,3,4,5].map((i) => (
                  <li key={i} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                     <div className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded">INFO</div>
                     <div>
                        <p className="text-sm font-bold text-gray-800">Sinkronisasi data kortan {isPusat ? 'Nasional' : labelWilayah}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Updated: {i * 2} Jam yang lalu</p>
                     </div>
                  </li>
               ))}
            </ul>
         </div>
      </div>
    </div>
  );
};
