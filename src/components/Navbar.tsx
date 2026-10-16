import React, { useState } from 'react';
import {
  Shield,
  Bell,
  User,
  LogOut,
  FileText,
  Menu,
  X,
  Lock,
  KeyRound,
  GitCompare,
  Hash,
  AlertTriangle,
  History,
  LayoutDashboard,
  Github,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { BrandLogo } from './BrandLogo';
import { LiquidButton } from './LiquidButton';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAuthModal: () => void;
  openReportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openAuthModal,
  openReportModal,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'aes', label: 'AES-256-GCM', icon: Lock },
    { id: 'rsa', label: 'RSA-OAEP', icon: KeyRound },
    { id: 'dh', label: 'Diffie-Hellman', icon: GitCompare },
    { id: 'sha256', label: 'SHA-256', icon: Hash },
    { id: 'md5', label: 'MD5', icon: AlertTriangle },
    { id: 'des', label: 'DES-CBC', icon: AlertTriangle },
    { id: 'history', label: 'Audit Log', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-black/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand & Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setMobileMenuOpen(false);
            }}
            className="group flex items-center transition-transform hover:scale-[1.02]"
            aria-label="CipherForge Home"
          >
            <BrandLogo size="md" tagline="BY AJAY G S" />
          </button>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-zinc-300">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'dashboard' ? 'text-orange-500 font-bold border-b-2 border-orange-500 pb-0.5' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('aes')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              ['aes', 'rsa', 'dh', 'sha256', 'md5', 'des'].includes(activeTab)
                ? 'text-orange-500 font-bold border-b-2 border-orange-500 pb-0.5'
                : ''
            }`}
          >
            Workbenches
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'history' ? 'text-orange-500 font-bold border-b-2 border-orange-500 pb-0.5' : ''
            }`}
          >
            Audit History
          </button>
          <button
            onClick={openReportModal}
            className="flex items-center gap-1.5 whitespace-nowrap text-zinc-300 transition-colors hover:text-white"
          >
            <FileText className="h-4 w-4 text-orange-500" />
            <span>Academic Report</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'profile' ? 'text-orange-500 font-bold border-b-2 border-orange-500 pb-0.5' : ''
            }`}
          >
            Security Profile
          </button>
        </nav>

        {/* Action Controls & Menus */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 transition-colors hover:border-orange-500/50 hover:text-white"
              aria-label="Activity Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-black">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-zinc-800 bg-black p-3 shadow-2xl backdrop-blur-xl z-50">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-xs font-bold text-white">Security Activity Feed</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-orange-400 hover:underline font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="mt-2 max-h-64 space-y-2 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`cursor-pointer rounded-lg p-2.5 transition-colors ${
                        n.read ? 'bg-zinc-900/40 text-zinc-400' : 'bg-zinc-900 text-white border border-orange-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-orange-400">{n.title}</span>
                        <span className="text-[10px] text-zinc-500">{n.timestamp}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-zinc-300">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* GitHub Repository Link */}
          <a
            href="https://github.com/ajaygs01/CipherForge"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:border-orange-500/50 hover:text-white transition-colors"
            title="CipherForge GitHub Repository"
          >
            <Github className="h-4 w-4 text-orange-500" />
            <span className="font-mono text-[11px]">CipherForge</span>
          </a>

          {/* User Account or Auth Button */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-orange-500/50 hover:text-white"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-black font-bold text-[11px]">
                  {user.fullName.charAt(0)}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate text-white font-medium">{user.fullName}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-800 bg-black p-3 shadow-2xl z-50">
                  <div className="pb-2 border-b border-zinc-800">
                    <p className="text-xs font-bold text-white">{user.fullName}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                    <p className="mt-1 text-[10px] text-orange-400 font-mono font-semibold">
                      Mobile: {user.phoneNumber || '9686352137'}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      {user.college}
                    </p>
                  </div>
                  <div className="mt-2 space-y-1">
                    <a
                      href="https://github.com/ajaygs01/CipherForge"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    >
                      <span className="flex items-center gap-2">
                        <Github className="h-3.5 w-3.5 text-orange-500" />
                        CipherForge Repository
                      </span>
                      <ExternalLink className="h-3 w-3 text-zinc-500" />
                    </a>
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setShowUserMenu(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    >
                      <User className="h-3.5 w-3.5 text-orange-500" />
                      Security Profile & Entropy
                    </button>
                    <button
                      onClick={() => {
                        openReportModal();
                        setShowUserMenu(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    >
                      <FileText className="h-3.5 w-3.5 text-orange-500" />
                      Academic Project Report
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <LiquidButton
              variant="primary"
              size="xs"
              onClick={openAuthModal}
              icon={<User className="h-3.5 w-3.5" />}
            >
              Sign In / Register
            </LiquidButton>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-white hover:border-orange-500/50"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-orange-500" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-800 bg-black/98 px-4 py-3 space-y-2 backdrop-blur-xl animate-in slide-in-from-top-2">
          <div className="text-[10px] font-bold text-orange-400 tracking-wider uppercase px-2 py-1">
            Navigation Menu
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-orange-500 text-black font-bold shadow-sm'
                      : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-black' : 'text-orange-500'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-zinc-800 flex gap-2">
            <button
              onClick={() => {
                openReportModal();
                setMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-orange-500/40 bg-orange-950/20 py-2 text-xs font-bold text-orange-400"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Project Report</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('profile');
                setMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 py-2 text-xs font-semibold text-white"
            >
              <User className="h-3.5 w-3.5 text-orange-500" />
              <span>Profile</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
