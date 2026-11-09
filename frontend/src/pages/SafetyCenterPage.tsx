import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Coffee, 
  AlertTriangle, 
  Building2, 
  UserX, 
  Calendar, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Verification, SafeMeet } from '../types';
import { AadhaarModal } from '../components/verification/AadhaarModal';
import { Modal } from '../components/common/Modal';

export const SafetyCenterPage: React.FC = () => {
  const { user, verification, refreshVerification } = useAuth();
  const [safeMeets, setSafeMeets] = useState<SafeMeet[]>([]);
  const [cafes, setCafes] = useState<any[]>([]);
  const [isAadhaarModalOpen, setIsAadhaarModalOpen] = useState(false);
  const [isPanModalOpen, setIsPanModalOpen] = useState(false);
  const [isWorkEmailModalOpen, setIsWorkEmailModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Forms state
  const [panNumber, setPanNumber] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [companyName, setCompanyName] = useState('Swiggy');
  const [reportTargetId, setReportTargetId] = useState('2');
  const [reportReason, setReportReason] = useState('Suspicious Profile Details');
  const [reportDescription, setReportDescription] = useState('');
  const [alertMsg, setAlertMsg] = useState('');

  const loadData = async () => {
    try {
      const [meets, cafeList] = await Promise.all([
        api.getSafeMeets(),
        api.getSafemeetCafes()
      ]);
      setSafeMeets(meets);
      setCafes(cafeList);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyAadhaar = async (aadhaarNumber: string, otp: string) => {
    await api.verifyAadhaar(aadhaarNumber, otp);
    await refreshVerification();
    setAlertMsg('Aadhaar successfully verified via internal document review! Trust score updated.');
    setTimeout(() => setAlertMsg(''), 5000);
  };

  const handleVerifyPan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!panNumber) return;
    await api.verifyPan(panNumber, user?.full_name || 'User');
    await refreshVerification();
    setIsPanModalOpen(false);
    setAlertMsg('PAN Card successfully verified! Badge active.');
    setTimeout(() => setAlertMsg(''), 5000);
  };

  const handleVerifyWorkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workEmail) return;
    await api.verifyWorkEmail(workEmail, companyName);
    await refreshVerification();
    setIsWorkEmailModalOpen(false);
    setAlertMsg('Corporate work email verified! Trust score boosted.');
    setTimeout(() => setAlertMsg(''), 5000);
  };

  const handleReportBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.reportBlock({
      target_id: Number(reportTargetId),
      action_type: 'report',
      reason: reportReason,
      description: reportDescription
    });
    setIsReportModalOpen(false);
    setAlertMsg('Report submitted to RoomSync Trust & Safety team for review.');
    setTimeout(() => setAlertMsg(''), 5000);
  };

  const trustScore = verification?.trust_score || 95;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>INDIAN TRUST & SAFETY FRAMEWORK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Trust & Safety Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Government ID verification, corporate employee validation, and the SafeMeet public meeting protocol.
          </p>
        </div>

        {/* Overall Trust Score Gauge */}
        <div className="p-4 rounded-2xl bg-dark-900 border border-emerald-500/30 shadow-emerald-500/10 shadow-lg flex items-center gap-4">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Your Trust Score
            </span>
            <div className="text-3xl font-black text-emerald-400 font-mono">
              {trustScore}/100
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {alertMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Verification Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Aadhaar Card */}
        <div className="p-6 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
                verification?.aadhaar_verified 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {verification?.aadhaar_verified ? 'Verified' : 'Pending'}
              </span>
            </div>

            <h3 className="text-base font-bold text-white">Masked Aadhaar Identity</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Verifies identity through internal OTP and document review. Aadhaar number is masked for privacy.
            </p>

            {verification?.aadhaar_verified && (
              <div className="mt-4 p-2.5 rounded-xl bg-dark-850 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                <span>Masked: {verification.aadhaar_masked || 'XXXXXXXX8921'}</span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            {!verification?.aadhaar_verified ? (
              <button
                onClick={() => setIsAadhaarModalOpen(true)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-black bg-neon-green hover:bg-[#05ffa1] shadow-neon-green/30 shadow-md transition-all"
              >
                Verify Aadhaar via OTP
              </button>
            ) : (
              <span className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Identity Authenticated</span>
              </span>
            )}
          </div>
        </div>

        {/* PAN Card */}
        <div className="p-6 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30">
                <Lock className="w-6 h-6" />
              </div>
              <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
                verification?.pan_verified 
                  ? 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {verification?.pan_verified ? 'Verified' : 'Pending'}
              </span>
            </div>

            <h3 className="text-base font-bold text-white">Income Tax PAN</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Confirms legal financial identity with the Indian Income Tax Department. Protects against rental lease fraud.
            </p>

            {verification?.pan_verified && (
              <div className="mt-4 p-2.5 rounded-xl bg-dark-850 border border-slate-800 text-xs font-mono text-neon-cyan flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                <span>Masked: {verification.pan_masked || 'AAAPM****M'}</span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            {!verification?.pan_verified ? (
              <button
                onClick={() => setIsPanModalOpen(true)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-black bg-neon-cyan hover:bg-[#38f8ff] shadow-neon-cyan/30 shadow-md transition-all"
              >
                Verify PAN Card
              </button>
            ) : (
              <span className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-neon-cyan" />
                <span>Financial ID Verified</span>
              </span>
            )}
          </div>
        </div>

        {/* Corporate Work Email */}
        <div className="p-6 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/30">
                <Building2 className="w-6 h-6" />
              </div>
              <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
                verification?.work_email_verified 
                  ? 'bg-neon-yellow/10 text-neon-yellow border-neon-yellow/30' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {verification?.work_email_verified ? 'Verified' : 'Pending'}
              </span>
            </div>

            <h3 className="text-base font-bold text-white">Corporate Work Email</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Verify your professional credentials (e.g. Swiggy, Razorpay, CRED, Google) for high-trust flatmate ranking.
            </p>

            {verification?.work_email_verified && (
              <div className="mt-4 p-2.5 rounded-xl bg-dark-850 border border-slate-800 text-xs font-mono text-neon-yellow flex items-center gap-2 truncate">
                <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{verification.work_email || 'arjun.mehta@swiggy.in'}</span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            {!verification?.work_email_verified ? (
              <button
                onClick={() => setIsWorkEmailModalOpen(true)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-black bg-neon-yellow hover:bg-[#ffe14d] shadow-neon-yellow/30 shadow-md transition-all"
              >
                Verify Work Email
              </button>
            ) : (
              <span className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-neon-yellow" />
                <span>Company Authenticated</span>
              </span>
            )}
          </div>
        </div>

      </div>

      {/* SafeMeet Cafe Protocol & Active Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recommended SafeMeet Cafes */}
        <div className="p-6 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Coffee className="w-4 h-4 text-neon-cyan" />
                <span>Verified SafeMeet Public Cafes</span>
              </h3>
              <p className="text-xs text-slate-400">
                Official partner public coffee hubs for preliminary flatmate meetups.
              </p>
            </div>
            <span className="text-[10px] font-mono text-neon-green bg-neon-green/10 px-2 py-0.5 rounded-md border border-neon-green/30">
              Verified Public
            </span>
          </div>

          <div className="space-y-2.5">
            {cafes.map((c, i) => (
              <div key={i} className="p-3 rounded-xl bg-dark-850/70 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-dark-900 text-neon-cyan">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{c.name}</h4>
                    <p className="text-[11px] text-slate-400">{c.area}, {c.city}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Safe Zone
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Guidelines & Report/Block */}
        <div className="p-6 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-neon-yellow" />
              <span>Flatmate Safety Golden Rules</span>
            </h3>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-400 bg-red-950/40 border border-red-500/30 hover:bg-red-900/40 transition-colors flex items-center gap-1"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Report User</span>
            </button>
          </div>

          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-neon-green/20 text-neon-green flex items-center justify-center font-bold text-[10px] flex-shrink-0">1</span>
              <span><strong>Never wire token money in advance:</strong> Never transfer security deposits or advance rent without visiting the flat in person and verifying landlord papers.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-neon-cyan/20 text-neon-cyan flex items-center justify-center font-bold text-[10px] flex-shrink-0">2</span>
              <span><strong>Always schedule a SafeMeet:</strong> Meet at a crowded public cafe (Third Wave / Blue Tokai) to discuss non-negotiable living habits.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-neon-yellow/20 text-neon-yellow flex items-center justify-center font-bold text-[10px] flex-shrink-0">3</span>
              <span><strong>Insist on Aadhaar verification:</strong> Only commit to flatmates displaying the green DigiLocker verification badge.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0">4</span>
              <span><strong>Register the rental agreement:</strong> Ensure all flatmate names are drafted in the registered rent agreement with the owner.</span>
            </li>
          </ul>

        </div>

      </div>

      {/* Aadhaar Modal */}
      <AadhaarModal
        isOpen={isAadhaarModalOpen}
        onClose={() => setIsAadhaarModalOpen(false)}
        onVerify={handleVerifyAadhaar}
      />

      {/* PAN Modal */}
      <Modal
        isOpen={isPanModalOpen}
        onClose={() => setIsPanModalOpen(false)}
        title="Income Tax PAN Verification"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleVerifyPan} className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
              10-Character PAN Number
            </label>
            <input
              type="text"
              maxLength={10}
              placeholder="e.g. AAAPM8842M"
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono tracking-widest uppercase focus:outline-none focus:border-neon-cyan"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsPanModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-neon-cyan hover:bg-[#38f8ff] transition-all"
            >
              Confirm PAN
            </button>
          </div>
        </form>
      </Modal>

      {/* Work Email Modal */}
      <Modal
        isOpen={isWorkEmailModalOpen}
        onClose={() => setIsWorkEmailModalOpen(false)}
        title="Corporate Work Email Verification"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleVerifyWorkEmail} className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
              Company Name
            </label>
            <input
              type="text"
              placeholder="e.g. Swiggy, Razorpay, CRED"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-yellow"
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
              Corporate Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. arjun.mehta@swiggy.in"
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-yellow"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsWorkEmailModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-neon-yellow hover:bg-[#ffe14d] transition-all"
            >
              Verify Company Domain
            </button>
          </div>
        </form>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report or Flag a Profile"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleReportBlock} className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
              Reason for Report
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value="Suspicious Profile Details">Suspicious Profile Details</option>
              <option value="Inappropriate Behavior or Harassment">Inappropriate Behavior or Harassment</option>
              <option value="Unregistered Broker or Spam">Unregistered Broker or Spam</option>
              <option value="Rental Payment Fraud Attempt">Rental Payment Fraud Attempt</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
              Additional Details
            </label>
            <textarea
              rows={3}
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Describe the incident so our trust team can audit..."
              className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-all"
            >
              Submit Report
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
