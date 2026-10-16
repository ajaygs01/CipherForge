/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { HistoryProvider } from './context/HistoryContext';
import { NotificationProvider } from './context/NotificationContext';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { ProjectReportModal } from './components/ProjectReportModal';

import { DashboardPage } from './pages/DashboardPage';
import { AESPage } from './pages/AESPage';
import { RSAPage } from './pages/RSAPage';
import { DiffieHellmanPage } from './pages/DiffieHellmanPage';
import { SHA256Page } from './pages/SHA256Page';
import { MD5Page } from './pages/MD5Page';
import { DESPage } from './pages/DESPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { LiquidButton } from './components/LiquidButton';

import {
  LayoutDashboard,
  Lock,
  KeyRound,
  GitCompare,
  Hash,
  AlertTriangle,
  History,
  FileText,
  UserCheck,
  LogIn,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const quickNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'login', label: 'Login / Register', icon: LogIn },
    { id: 'aes', label: 'AES-256-GCM', icon: Lock },
    { id: 'rsa', label: 'RSA-OAEP', icon: KeyRound },
    { id: 'dh', label: 'Diffie-Hellman', icon: GitCompare },
    { id: 'sha256', label: 'SHA-256', icon: Hash },
    { id: 'md5', label: 'MD5', icon: AlertTriangle },
    { id: 'des', label: 'DES-CBC', icon: AlertTriangle },
    { id: 'history', label: 'Audit History', icon: History },
    { id: 'profile', label: 'Security Profile', icon: UserCheck },
  ];

  return (
    <AuthProvider>
      <HistoryProvider>
        <NotificationProvider>
          <div className="h-screen w-screen bg-black text-white flex flex-col font-sans selection:bg-orange-500 selection:text-black overflow-hidden">
            {/* Top Bar Compliant Navbar */}
            <div className="shrink-0 z-30">
              <Navbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                openAuthModal={() => setIsAuthModalOpen(true)}
                openReportModal={() => setIsReportModalOpen(true)}
              />
            </div>

            {/* Quick Access Algorithm Ribbon (Always visible across all viewports) */}
            <div className="shrink-0 z-20 w-full border-b border-zinc-800 bg-[#09090b] px-4 py-2 overflow-x-auto scrollbar-none">
              <div className="mx-auto flex max-w-7xl items-center gap-2">
                <span className="hidden sm:inline text-[10px] font-bold text-orange-400 tracking-wider uppercase shrink-0 mr-1">
                  Engines:
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {quickNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all whitespace-nowrap ${
                          isActive
                            ? 'bg-orange-500 text-black font-extrabold shadow-sm shadow-orange-500/30'
                            : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-black' : 'text-orange-500'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                  <LiquidButton
                    variant="outline"
                    size="xs"
                    onClick={() => setIsReportModalOpen(true)}
                    icon={<FileText className="h-3.5 w-3.5" />}
                  >
                    Report PDF
                  </LiquidButton>
                </div>
              </div>
            </div>

            {/* Modals */}
            <AuthModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
            />

            <ProjectReportModal
              isOpen={isReportModalOpen}
              onClose={() => setIsReportModalOpen(false)}
            />

            {/* Main Application Body - Sidebar is FIXED on left, main scrolls */}
            <div className="flex flex-1 min-h-0 overflow-hidden relative">
              {/* Desktop Sidebar Navigation (Fixed in place, never moves) */}
              <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                openReportModal={() => setIsReportModalOpen(true)}
              />

              {/* Main Content Workspace Viewport (Scrolls independently) */}
              <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-black">
                {activeTab === 'dashboard' && (
                  <DashboardPage
                    setActiveTab={setActiveTab}
                    openReportModal={() => setIsReportModalOpen(true)}
                  />
                )}
                {activeTab === 'login' && (
                  <LoginPage onSuccess={() => setActiveTab('dashboard')} />
                )}
                {activeTab === 'aes' && <AESPage />}
                {activeTab === 'rsa' && <RSAPage />}
                {activeTab === 'dh' && <DiffieHellmanPage />}
                {activeTab === 'sha256' && <SHA256Page />}
                {activeTab === 'md5' && <MD5Page />}
                {activeTab === 'des' && <DESPage />}
                {activeTab === 'history' && <HistoryPage />}
                {activeTab === 'profile' && <ProfilePage />}
              </main>
            </div>
          </div>
        </NotificationProvider>
      </HistoryProvider>
    </AuthProvider>
  );
}
