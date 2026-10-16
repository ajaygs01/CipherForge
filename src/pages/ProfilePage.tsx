import React, { useState } from 'react';
import {
  User,
  Shield,
  KeyRound,
  CheckCircle2,
  Lock,
  Award,
  Save,
  Github,
  Phone,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { LiquidButton } from '../components/LiquidButton';
import { EntropyStrengthMeter } from '../components/EntropyStrengthMeter';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { addNotification } = useNotifications();

  // Profile edit
  const [fullName, setFullName] = useState(user?.fullName || 'Ajay G S');
  const [profileSaved, setProfileSaved] = useState(false);

  // Password change & live entropy meter
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passStatus, setPassStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Entropy calculations
  const hasLength = newPass.length >= 8;
  const hasUpper = /[A-Z]/.test(newPass);
  const hasLower = /[a-z]/.test(newPass);
  const hasDigit = /[0-9]/.test(newPass);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPass);

  const criteriaMet = [hasLength, hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
  const entropyScore = Math.min(100, Math.round((criteriaMet / 5) * 100));

  let entropyLabel = 'Weak';
  let entropyColor = 'text-red-400 bg-red-500';
  if (entropyScore >= 80) {
    entropyLabel = 'Cryptographically Strong (NIST SP 800-63B)';
    entropyColor = 'text-orange-400 bg-orange-500';
  } else if (entropyScore >= 60) {
    entropyLabel = 'Moderate';
    entropyColor = 'text-amber-400 bg-amber-500';
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(fullName);
    setProfileSaved(true);
    addNotification('Profile Updated', 'Display name synchronized across sessions.', 'success');
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setPassStatus({ success: false, message: 'New passwords do not match' });
      return;
    }
    const res = await changePassword(currentPass, newPass);
    setPassStatus(res);
    if (res.success) {
      addNotification('Password Re-Hashed', 'Master password updated with Bcrypt cost factor 12.', 'success');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-orange-400 font-semibold">
          <span>USER IDENTITY</span>
          <span>·</span>
          <span>BCRYPT COST FACTOR 12</span>
          <span>·</span>
          <span>JWT ACCESS SESSION</span>
        </div>
        <h1 className="mt-1 text-2xl font-extrabold text-white">
          Security Profile & Credential Management
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Manage cryptographic identity, institutional credentials, and master password entropy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Academic Credentials Card */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/40 text-orange-400 text-lg font-bold">
                {user?.fullName.charAt(0) || 'A'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{user?.fullName}</h3>
                <span className="text-[11px] text-zinc-400">{user?.email}</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-zinc-800 text-xs">
              <div>
                <span className="text-[11px] text-zinc-500">Developer Profile</span>
                <p className="font-semibold text-white">{user?.fullName || 'Ajay G S'}</p>
              </div>
              <div>
                <span className="text-[11px] text-zinc-500">Mobile Number</span>
                <a href="tel:9686352137" className="font-mono text-orange-400 block hover:underline">
                  {user?.phoneNumber || '9686352137'}
                </a>
              </div>
              <div>
                <span className="text-[11px] text-zinc-500">CipherForge Repository</span>
                <a
                  href="https://github.com/ajaygs01/CipherForge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-orange-400 font-mono hover:underline mt-0.5"
                >
                  <Github className="h-3.5 w-3.5" />
                  <span>github.com/ajaygs01/CipherForge</span>
                  <ExternalLink className="h-2.5 w-2.5 text-zinc-500" />
                </a>
              </div>
              <div>
                <span className="text-[11px] text-zinc-500">Institution & Department</span>
                <p className="font-semibold text-white">{user?.college || 'HKBK College of Engineering'}</p>
                <p className="text-[11px] text-zinc-400">{user?.department || 'Information Science & Engineering'}</p>
              </div>
              <div>
                <span className="text-[11px] text-zinc-500">Project Guide</span>
                <p className="font-semibold text-white">Prof. Syeda Ayesha Amreen</p>
                <p className="text-[11px] text-zinc-400">Assistant Professor, ISE</p>
              </div>
              <div>
                <span className="text-[11px] text-zinc-500">Authentication Status</span>
                <div className="flex items-center gap-1.5 text-orange-400 text-xs font-semibold mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Direct Verified (Active Session)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2 text-white font-semibold text-xs">
              <Award className="h-4 w-4 text-orange-500" />
              <span>Project Viva Presentation</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              CipherForge is certified for 7th Sem Capstone Project evaluation under Visvesvaraya Technological University (VTU) guidelines.
            </p>
          </div>
        </div>

        {/* Right Columns: Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Form 1: Profile Display Name */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <User className="h-4 w-4 text-orange-500" />
              <span>Personal Information</span>
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-300">Display Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-black px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-between">
                <LiquidButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<Save className="h-3.5 w-3.5" />}
                >
                  Save Profile Identity
                </LiquidButton>
                {profileSaved && (
                  <span className="text-xs text-orange-400 font-semibold flex items-center gap-1 bg-orange-950/30 px-2.5 py-1 rounded-lg border border-orange-500/30">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Identity Synced</span>
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Form 2: Password & Entropy Meter */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-orange-500" />
                <span>Password Change & Live Entropy Meter</span>
              </h3>
              <span className="text-[11px] text-zinc-400 font-mono">Bcrypt Cost 12</span>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-300">Current Password</label>
                <input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  required
                  placeholder="Enter current password"
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-black px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">New Password</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  required
                  placeholder="Minimum 8 characters"
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-black px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none font-mono"
                />
              </div>

              {/* Real-time Entropy Strength Meter */}
              {newPass.length > 0 && (
                <div className="mt-2.5">
                  <EntropyStrengthMeter
                    value={newPass}
                    algorithm="general"
                    label="Master Password Entropy & Complexity"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-zinc-300">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  required
                  placeholder="Repeat new password"
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-black px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none font-mono"
                />
              </div>

              {passStatus && (
                <div
                  className={`p-3 rounded-xl border text-xs ${
                    passStatus.success
                      ? 'border-orange-500/30 bg-orange-950/20 text-orange-400'
                      : 'border-red-500/20 bg-red-950/20 text-red-300'
                  }`}
                >
                  {passStatus.message}
                </div>
              )}

              <LiquidButton
                type="submit"
                disabled={criteriaMet < 4}
                variant="primary"
                size="sm"
                icon={<Lock className="h-3.5 w-3.5" />}
              >
                Change Master Password (Bcrypt Hash)
              </LiquidButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
