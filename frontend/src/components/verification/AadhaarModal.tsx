import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { Modal } from '../common/Modal';

interface AadhaarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (aadhaarNumber: string, otp: string) => Promise<void>;
}

export const AadhaarModal: React.FC<AadhaarModalProps> = ({
  isOpen,
  onClose,
  onVerify
}) => {
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('123456');
  const [step, setStep] = useState<1 | 2>(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = aadhaar.replace(/\D/g, '');
    if (clean.length !== 12) {
      setError('Aadhaar number must be exactly 12 digits');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setIsVerifying(true);
    setError('');
    try {
      await onVerify(aadhaar, otp);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="DigiLocker Aadhaar Identity Verification"
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        
        {/* DigiLocker & UIDAI Banner */}
        <div className="p-3.5 rounded-xl bg-dark-850 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Government ID Verification</h4>
            <p className="text-[11px] text-slate-400">
              DigiLocker verified badge boosts trust score to 90%+ and increases flatmate match rate by 3.8x.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                Enter 12-Digit Aadhaar Number
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={14}
                  placeholder="e.g. 5421 8842 9012"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono tracking-wider focus:outline-none focus:border-neon-green"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                UIDAI standard: Your Aadhaar is masked (XXXXXXXX1234) and never shared publicly.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-neon-green hover:bg-[#05ffa1] shadow-neon-green/30 shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Request OTP via UIDAI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleConfirmOtp} className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                Enter OTP sent to linked mobile
              </label>
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono text-center tracking-widest text-lg focus:outline-none focus:border-neon-green"
              />
              <p className="text-[10px] text-emerald-400 mt-1 text-center font-mono">
                Simulated Sandbox OTP: 123456
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isVerifying}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-neon-green hover:bg-[#05ffa1] shadow-neon-green/30 shadow-md transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isVerifying ? 'Verifying with UIDAI...' : 'Confirm & Activate Badge'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </Modal>
  );
};
