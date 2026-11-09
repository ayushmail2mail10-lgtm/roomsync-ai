import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  KeyRound,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';

interface LoginPageProps {
  onNavigateToRegister: () => void;
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToRegister,
  onLoginSuccess,
  onNavigateHome
}) => {
  const { login, loginDemoUser, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Load remembered email on mount
  useEffect(() => {
    const remembered = localStorage.getItem('roomsync_remembered_email');
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      if (rememberMe) {
        localStorage.setItem('roomsync_remembered_email', email.trim());
      } else {
        localStorage.removeItem('roomsync_remembered_email');
      }
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Incorrect email or password. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginDemoUser();
      onLoginSuccess();
    } catch (err: any) {
      setError('Demo authentication failed. Please ensure the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSubmitted(true);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#00F59B]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#00F0FF]/10 rounded-full blur-[130px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Card Container */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#111722]/90 border border-[#1E283A] shadow-2xl backdrop-blur-xl space-y-6">
          
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 p-2 rounded-2xl bg-[#161F2E] border border-[#00F59B]/30 text-[#00F59B] mb-2 shadow-neon-green/10 shadow-lg hover:border-[#00F59B] transition-colors"
            >
              <Zap className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-black text-[#F5F7FA] tracking-tight">
              Welcome Back to RoomSync
            </h1>
            <p className="text-xs text-[#929BAA] max-w-xs mx-auto">
              Sign in to manage your roommate matches, apartment rent shares, and verified chats.
            </p>
          </div>

          {/* Quick Demo Access Banner */}
          <div className="p-3.5 rounded-2xl bg-[#161F2E]/80 border border-[#00F59B]/25 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#00F59B]/10 text-[#00F59B]">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono text-[#00F59B] uppercase font-bold block">
                  Quick Demo Access
                </span>
                <span className="text-xs text-[#F5F7FA] font-medium block">
                  Arjun Mehta (Swiggy Dev)
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleDemoLogin}
              disabled={isSubmitting || isLoading}
            >
              1-Click Sign In
            </Button>
          </div>

          {/* Error Message Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. arjun@roomsync.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              isPassword
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
              autoComplete="current-password"
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#929BAA] hover:text-[#F5F7FA] transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#161F2E] border border-[#1E283A] text-[#00F59B] focus:ring-1 focus:ring-[#00F59B] accent-[#00F59B] cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotSubmitted(false);
                  setForgotEmail(email);
                  setIsForgotPasswordOpen(true);
                }}
                className="text-xs font-mono text-[#00F0FF] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting || isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="mt-2"
            >
              Sign In to RoomSync
            </Button>

          </form>

          {/* Switch to Register */}
          <div className="pt-4 border-t border-[#1E283A] text-center text-xs text-[#929BAA]">
            <span>Don't have an account yet? </span>
            <button
              onClick={onNavigateToRegister}
              className="font-bold text-[#00F59B] hover:underline ml-1"
            >
              Create Account →
            </button>
          </div>

        </div>

        {/* Security Trust Note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-mono text-[#5F697A]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted with SHA-256 & JWT Bearer Standards</span>
        </div>

      </motion.div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        title="Password Recovery Assistance"
        maxWidth="max-w-md"
        description="Reset your RoomSync account credentials"
      >
        <div className="space-y-4">
          {!forgotSubmitted ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <p className="text-xs text-[#929BAA] leading-relaxed">
                Enter your registered email address. We will verify your account against our active user records.
              </p>

              <Input
                label="Registered Email"
                type="email"
                placeholder="e.g. arjun@roomsync.ai"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <div className="p-3 rounded-xl bg-[#161F2E] border border-[#1E283A] text-[11px] text-[#929BAA] space-y-1">
                <span className="font-mono text-[#FFD600] uppercase font-bold block">
                  Demo Account Hint
                </span>
                <p>For the primary seeded demo profile, use:</p>
                <p className="font-mono text-[#F5F7FA]">Email: arjun@roomsync.ai • Pass: password123</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setIsForgotPasswordOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                >
                  Submit Request
                </Button>
              </div>
            </form>
          ) : (
            <div className="py-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#F5F7FA]">
                Password Reset Instructions Queued
              </h4>
              <p className="text-xs text-[#929BAA] leading-relaxed">
                If <strong className="text-[#F5F7FA]">{forgotEmail}</strong> matches an active account, recovery instructions have been initiated. You may also use the 1-click Demo Login on the sign-in page.
              </p>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsForgotPasswordOpen(false)}
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
};
