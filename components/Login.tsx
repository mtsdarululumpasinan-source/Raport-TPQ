
import React, { useState } from 'react';
import { User, UserRole, Branch, Institution } from '../types';
import { LogIn, BookOpen, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  branches: Branch[];
  institutions: Institution[];
  adminCredentials: { username: string; password: string };
}

export const Login: React.FC<LoginProps> = ({ onLogin, branches, institutions, adminCredentials }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. CEK ADMIN PUSAT
    if (username === adminCredentials.username && password === adminCredentials.password) {
      onLogin({
        id: 'u1',
        username: adminCredentials.username,
        name: 'Administrator Pusat',
        role: UserRole.ADMIN_PUSAT,
        location: 'Kantor Pusat Nasional'
      });
      return;
    }

    // 2. CEK ADMIN KORTAN (BRANCH)
    const foundBranch = branches.find(b => b.username === username && b.password === password);
    if (foundBranch) {
       onLogin({
        id: `user-${foundBranch.id}`,
        username: foundBranch.username || username,
        name: `Admin ${foundBranch.name}`,
        role: UserRole.ADMIN_CABANG,
        location: foundBranch.address,
        entityId: foundBranch.id
      });
      return;
    }

    // 3. CEK ADMIN LEMBAGA (INSTITUTION)
    const foundInst = institutions.find(i => i.username === username && i.password === password);
    if (foundInst) {
      onLogin({
        id: `user-${foundInst.id}`,
        username: foundInst.username || username,
        name: `Admin ${foundInst.name}`,
        role: UserRole.ADMIN_LEMBAGA,
        location: foundInst.name,
        entityId: foundInst.id
      });
      return;
    }

    setError('Username atau password salah!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-fade-in">
        
        {/* Header */}
        <div className="bg-emerald-700 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
          <div className="relative z-10 flex flex-col items-center">
             <div className="bg-white p-3 rounded-full mb-4 shadow-lg">
                <BookOpen className="w-10 h-10 text-emerald-700" />
             </div>
             <h1 className="text-2xl font-bold text-white tracking-wide">TPQ DIGITAL RAPORT</h1>
             <p className="text-emerald-100 text-sm mt-1">Sistem Informasi Manajemen Santri</p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6 text-center">Silakan Login</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-gray-900"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-gray-900"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Masuk Aplikasi
            </button>
          </form>

          {/* Info Akun Demo */}
          <div className="mt-8 pt-6 border-t border-gray-100">
             <p className="text-xs text-center text-gray-500 mb-3 uppercase font-bold tracking-wider">Akun Demo Default</p>
             <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
                   <span className="font-bold text-emerald-800 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Admin Pusat</span>
                   <code className="bg-white px-1 border rounded">user: pusat / pass: 123</code>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
                   <span className="font-bold text-blue-800 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Admin Kortan</span>
                   <code className="bg-white px-1 border rounded">user: cabang / pass: 123</code>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
                   <span className="font-bold text-gray-800 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Admin Lembaga</span>
                   <code className="bg-white px-1 border rounded">user: lembaga / pass: 123</code>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};