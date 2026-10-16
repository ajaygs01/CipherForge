import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  FileCheck2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/BrandLogo';
import { LiquidButton } from '../components/LiquidButton';
import { EntropyStrengthMeter } from '../components/EntropyStrengthMeter';

interface LoginPageProps {
  onSuccess?: () => void;
  initialMode?: 'login' | 'register';
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, initialMode = 'login' }) => {
  const { login, register, isAuthenticated, user, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setError('Please enter your email address or phone number.');
      return;
    }
    if (!loginPassword) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await login(loginIdentifier, loginPassword, rememberMe);
      setSuccessMsg('Authentication successful! Welcome to CipherForge.');
      if (onSuccess) {
        setTimeout(onSuccess, 600);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please provide both First Name and Last Name.');
      return;
    }
    if (!regEmail.trim()) {
      setError('Please provide your Email address.');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Please provide your Phone number.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (regPassword !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords match identically.');
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
      setSuccessMsg(`Account created successfully for ${firstName} ${lastName}! Signed in without OTP.`);
      if (onSuccess) {
        setTimeout(onSuccess, 700);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please review your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const passwordMatch = regPassword.length > 0 && confirmPassword.length > 0 && regPassword === confirmPassword;
  const passwordMismatch = confirmPassword.length > 0 && regPassword !== confirmPassword;

  return (
    <div className="min-h-full py-6 px-4 flex flex-col justify-center items-center">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Brand Visual & Security Assurance (Orange/Black/White) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-zinc-800 bg-[#09090b] p-6 lg:p-8 relative overflow-hidden shadow-2xl">
          {/* Subtle Ambient Orange Glow */}
          <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-orange-600/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <BrandLogo size="lg" tagline="CRYPTOGRAPHIC DEFENSE PLATFORM" />

            <div className="mt-8 space-y-4">
              <h2 className="text-xl lg:text-2xl font-black text-white tracking-tight leading-snug">
                Zero-Knowledge <br />
                <span className="text-orange-500">Cryptographic Workbench</span>
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Adhering to VTU Capstone & NIST guidelines for mathematical integrity, client-side encryption, and tamper-evident audit logging.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="mt-8 space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-zinc-800/80 bg-black/60 p-3">
                <ShieldCheck className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">NIST & FIPS Certified Ciphers</h4>
                  <p className="text-[11px] text-zinc-400">AES-256-GCM, RSA-OAEP, Diffie-Hellman & SHA-256.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-zinc-800/80 bg-black/60 p-3">
                <FileCheck2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Instant Direct Access</h4>
                  <p className="text-[11px] text-zinc-400">Streamlined authentication with zero OTP barrier.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-zinc-800/80 bg-black/60 p-3">
                <KeyRound className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Client-Side Key Protection</h4>
                  <p className="text-[11px] text-zinc-400">Keys never leave your browser memory unencrypted.</p>
                </div>
              </div>
            </div>
          </div>

          {/* User state badge if already logged in */}
          {isAuthenticated && user && (
            <div className="mt-8 pt-4 border-t border-zinc-800/80 relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-orange-500 text-black font-bold flex items-center justify-center text-xs">
                  {user.fullName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-white truncate max-w-[150px]">{user.fullName}</p>
                  <p className="text-[10px] text-orange-400 font-mono">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-[11px] text-zinc-400 hover:text-red-400 underline"
              >
                Sign Out
              </button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-zinc-800/60 relative z-10 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>HKBK COLLEGE OF ENG</span>
            <span className="text-orange-400 font-semibold">DEV: AJAY G S</span>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="lg:col-span-7 flex flex-col justify-center rounded-3xl border border-zinc-800 bg-[#0e0e11] p-6 lg:p-8 shadow-2xl relative">
          
          {/* Top Mode Selector Buttons */}
          <div className="flex rounded-2xl bg-black p-1.5 border border-zinc-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                mode === 'register'
                  ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Register Now</span>
            </button>
          </div>

          {/* Error & Success Banners */}
          {error && (
            <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-950/20 p-3.5 text-xs text-red-200 flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 rounded-2xl border border-orange-500/40 bg-orange-950/20 p-3.5 text-xs text-orange-300 flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMsg}</div>
            </div>
          )}

          {/* ===================== LOGIN FORM ===================== */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">
                    Email / Phone No.
                  </label>
                  <span className="text-[10px] text-orange-400 font-mono">Default: gsajay18@gmail.com</span>
                </div>
                <div className="mt-1.5 relative">
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    required
                    placeholder="gsajay18@gmail.com or +91 9876543210"
                    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 pl-10 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-all"
                  />
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                </div>
                <p className="mt-1 text-[10px] text-zinc-500">
                  Enter your registered email address or phone number to sign in.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">
                    Password
                  </label>
                  <span className="text-[10px] text-zinc-400 font-mono">Bcrypt Encrypted</span>
                </div>
                <div className="mt-1.5 relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 pl-10 pr-10 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-all"
                  />
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-3 text-zinc-500 hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-zinc-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-zinc-800 bg-zinc-900 text-orange-500 focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5 accent-orange-500"
                  />
                  <span>Remember session</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setLoginIdentifier('gsajay18@gmail.com');
                    setLoginPassword('SecurePass@2026');
                    setSuccessMsg('Default master credentials applied: gsajay18@gmail.com');
                  }}
                  className="text-[11px] text-orange-400 hover:text-orange-300 font-medium hover:underline cursor-pointer"
                >
                  Quick Fill Master Credentials
                </button>
              </div>

              <div className="pt-2">
                <LiquidButton
                  type="submit"
                  disabled={loading}
                  fullWidth
                  variant="primary"
                  size="md"
                  icon={<ArrowRight className="h-4 w-4" />}
                  iconPosition="right"
                >
                  {loading ? 'Verifying Credentials...' : 'Sign In to Workbench'}
                </LiquidButton>
              </div>

              <div className="text-center pt-3 border-t border-zinc-800/80">
                <p className="text-xs text-zinc-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
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
            /* ===================== REGISTER NOW FORM ===================== */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Row 1: First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300">First Name</label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      placeholder="e.g. Ajay"
                      className="w-full rounded-xl border border-zinc-800 bg-black px-3.5 py-2 pl-9 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none transition-all"
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
                      placeholder="e.g. Kumar"
                      className="w-full rounded-xl border border-zinc-800 bg-black px-3.5 py-2 pl-9 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none transition-all"
                    />
                    <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  </div>
                </div>
              </div>

              {/* Row 2: Email & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-300">Email Address</label>
                  </div>
                  <div className="mt-1 relative">
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      placeholder="gsajay18@gmail.com"
                      className="w-full rounded-xl border border-zinc-800 bg-black px-3.5 py-2 pl-9 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none transition-all"
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
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-zinc-800 bg-black px-3.5 py-2 pl-9 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none transition-all"
                    />
                    <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  </div>
                </div>
              </div>

              {/* Row 3: Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300">Password</label>
                  <div className="mt-1 relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      placeholder="Min 6 characters"
                      className="w-full rounded-xl border border-zinc-800 bg-black px-3.5 py-2 pl-9 pr-9 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none transition-all"
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
                      placeholder="Re-enter password"
                      className={`w-full rounded-xl border bg-black px-3.5 py-2 pl-9 pr-9 text-xs text-white placeholder-zinc-500 focus:outline-none transition-all ${
                        passwordMismatch
                          ? 'border-red-500 focus:border-red-500'
                          : passwordMatch
                          ? 'border-green-500/60 focus:border-green-500'
                          : 'border-zinc-800 focus:border-orange-500'
                      }`}
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

              {/* Direct Registration Notice (No OTP) */}
              <div className="rounded-xl border border-zinc-800 bg-black/60 p-2.5 text-[11px] text-zinc-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0" />
                <span>Instant Registration: OTP verification removed for seamless developer onboarding.</span>
              </div>

              <div className="pt-2">
                <LiquidButton
                  type="submit"
                  disabled={loading}
                  fullWidth
                  variant="primary"
                  size="md"
                  icon={<ArrowRight className="h-4 w-4" />}
                  iconPosition="right"
                >
                  {loading ? 'Generating Developer Account...' : 'Register Developer Account'}
                </LiquidButton>
              </div>

              <div className="text-center pt-2 border-t border-zinc-800/80">
                <p className="text-xs text-zinc-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
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
    </div>
  );
};
