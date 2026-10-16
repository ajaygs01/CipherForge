import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';
import { LiquidButton } from './LiquidButton';
import { EntropyStrengthMeter } from './EntropyStrengthMeter';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('gsajay18@gmail.com');
  const [loginPassword, setLoginPassword] = useState('SecurePass@2026');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [firstName, setFirstName] = useState('Ajay');
  const [lastName, setLastName] = useState('G S');
  const [regEmail, setRegEmail] = useState('gsajay18@gmail.com');
  const [phoneNumber, setPhoneNumber] = useState('9686352137');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setError('Please enter your email or phone number');
      return;
    }
    if (!loginPassword) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(loginIdentifier, loginPassword, rememberMe);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please provide First Name and Last Name');
      return;
    }
    if (!regEmail.trim()) {
      setError('Please provide Email address');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Please provide Phone number');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must contain at least 6 characters');
      return;
    }
    if (regPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirm password field');
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName,
        lastName,
        email: regEmail,
        phoneNumber,
        password: regPassword,
        confirmPassword,
      });
      setSuccessMsg('Account created successfully! Signed in.');
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const passwordMatch = regPassword.length > 0 && confirmPassword.length > 0 && regPassword === confirmPassword;
  const passwordMismatch = confirmPassword.length > 0 && regPassword !== confirmPassword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#0e0e11] p-6 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5">
          <BrandLogo size="md" tagline="IDENTITY & ACCESS MANAGEMENT" />
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-black p-1.5 mb-5 border border-zinc-800">
          <button
            onClick={() => {
              setTab('login');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'login'
                ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Login</span>
          </button>
          <button
            onClick={() => {
              setTab('register');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'register'
                ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Register Now</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-200 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-2xl border border-orange-500/40 bg-orange-950/20 p-3 text-xs text-orange-300 flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= LOGIN FORM ================= */}
        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">Email / Phone No.</label>
                <span className="text-[10px] text-orange-400 font-mono">Default: gsajay18@gmail.com</span>
              </div>
              <div className="mt-1 relative">
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-800 bg-black px-3.5 py-2.5 pl-9 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                  placeholder="gsajay18@gmail.com or phone number"
                />
                <Mail className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-500" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">Password</label>
                <span className="text-[10px] text-zinc-500 font-mono">Bcrypt Cost 12</span>
              </div>
              <div className="mt-1 relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-800 bg-black px-3.5 py-2.5 pl-9 pr-9 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                  placeholder="••••••••••••"
                />
                <Lock className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-500" />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-white"
                >
                  {showLoginPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-zinc-800 bg-zinc-900 text-orange-500 focus:ring-0 accent-orange-500"
                />
                <span>Remember session</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setLoginIdentifier('gsajay18@gmail.com');
                  setLoginPassword('SecurePass@2026');
                }}
                className="text-[11px] text-orange-400 hover:underline font-semibold"
              >
                Use Default Credentials
              </button>
            </div>

            <div className="pt-2">
              <LiquidButton
                type="submit"
                disabled={loading}
                fullWidth
                variant="primary"
                size="sm"
                icon={<ArrowRight className="h-3.5 w-3.5" />}
                iconPosition="right"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </LiquidButton>
            </div>

            <div className="text-center pt-2 border-t border-zinc-800/80">
              <p className="text-xs text-zinc-400">
                New user?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('register');
                    setError(null);
                  }}
                  className="font-bold text-orange-500 hover:underline"
                >
                  Register Now
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* ================= REGISTER NOW FORM (NO OTP) ================= */
          <form onSubmit={handleRegister} className="space-y-3">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300">First Name</label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-800 bg-black px-3.5 py-2 pl-9 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                    placeholder="Ajay"
                  />
                  <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Last Name</label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-800 bg-black px-3.5 py-2 pl-9 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                    placeholder="Kumar"
                  />
                  <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                </div>
              </div>
            </div>

            {/* Email & Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Email Address</label>
                <div className="mt-1 relative">
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-800 bg-black px-3.5 py-2 pl-9 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                    placeholder="gsajay18@gmail.com"
                  />
                  <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Phone Number</label>
                <div className="mt-1 relative">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-800 bg-black px-3.5 py-2 pl-9 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                    placeholder="+91 98765 43210"
                  />
                  <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                </div>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Password</label>
                <div className="mt-1 relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-800 bg-black px-3.5 py-2 pl-9 pr-9 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                    placeholder="Min 6 chars"
                  />
                  <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white"
                  >
                    {showRegPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {regPassword.length > 0 && (
                  <div className="mt-1.5">
                    <EntropyStrengthMeter
                      value={regPassword}
                      algorithm="general"
                      variant="compact"
                    />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">Confirm Password</label>
                  {passwordMatch && (
                    <span className="text-[10px] text-green-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Match
                    </span>
                  )}
                  {passwordMismatch && (
                    <span className="text-[10px] text-red-400 font-semibold">Mismatch</span>
                  )}
                </div>
                <div className="mt-1 relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`w-full rounded-xl border bg-black px-3.5 py-2 pl-9 pr-9 text-xs text-white placeholder-zinc-500 focus:outline-none ${
                      passwordMismatch
                        ? 'border-red-500 focus:border-red-500'
                        : passwordMatch
                        ? 'border-green-500/60 focus:border-green-500'
                        : 'border-zinc-800 focus:border-orange-500'
                    }`}
                    placeholder="Re-enter password"
                  />
                  <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-black/60 p-2 text-[11px] text-zinc-400 flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-orange-400 shrink-0" />
              <span>Direct registration without OTP — instant account access.</span>
            </div>

            <div className="pt-2">
              <LiquidButton
                type="submit"
                disabled={loading}
                fullWidth
                variant="primary"
                size="sm"
                icon={<ArrowRight className="h-3.5 w-3.5" />}
                iconPosition="right"
              >
                {loading ? 'Creating Account...' : 'Register Now'}
              </LiquidButton>
            </div>

            <div className="text-center pt-2 border-t border-zinc-800/80">
              <p className="text-xs text-zinc-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setError(null);
                  }}
                  className="font-bold text-orange-500 hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
