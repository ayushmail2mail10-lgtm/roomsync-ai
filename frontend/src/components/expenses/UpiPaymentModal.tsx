import React, { useState } from 'react';
import { 
  QrCode, 
  IndianRupee, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { UpiPaymentResponse } from '../../types';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: UpiPaymentResponse | null;
  onConfirmSettlement: (utrRef: string) => Promise<void>;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  paymentData,
  onConfirmSettlement
}) => {
  const [copied, setCopied] = useState(false);
  const [utr, setUtr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!paymentData) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(paymentData.payee_upi);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmSettlement(utr || `UPI-TXN-${Math.floor(100000 + Math.random() * 900000)}`);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Instant UPI Payment & Settlement"
      maxWidth="max-w-md"
    >
      <div className="space-y-5 text-center">
        
        {/* Amount Pill */}
        <div className="p-4 rounded-2xl bg-dark-850 border border-slate-800">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Amount Due to {paymentData.payee_name}
          </span>
          <div className="text-3xl font-black text-neon-green font-mono mt-0.5 flex items-center justify-center gap-1">
            <IndianRupee className="w-6 h-6" />
            <span>{paymentData.amount.toLocaleString('en-IN')}</span>
          </div>

          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-xs font-mono text-slate-300 bg-dark-900 px-2.5 py-1 rounded-lg border border-slate-700/80">
              {paymentData.payee_upi}
            </span>
            <button
              onClick={handleCopyUpi}
              className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
              title="Copy UPI ID"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          {copied && <p className="text-[11px] text-neon-green mt-1">UPI ID copied to clipboard!</p>}
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-dark-900 border border-neon-green/30 shadow-neon-green/10 shadow-lg">
          <div 
            className="w-[220px] h-[220px]"
            dangerouslySetInnerHTML={{ __html: paymentData.qr_data_url }} 
          />
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-neon-green" />
            <span>NPCI Verified UPI Deep Link</span>
          </div>
        </div>

        {/* Popular UPI Apps row */}
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block mb-2">
            Scan using any Indian payment app
          </span>
          <div className="flex items-center justify-center gap-3">
            {['Google Pay', 'PhonePe', 'Paytm', 'CRED'].map((app) => (
              <span key={app} className="text-[11px] px-2.5 py-1 rounded-lg bg-dark-800 border border-slate-700 text-slate-300 font-medium">
                {app}
              </span>
            ))}
          </div>
        </div>

        {/* Direct Open in UPI App Button (Mobile Intent) */}
        <a
          href={paymentData.upi_string}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-black bg-neon-cyan hover:bg-[#38f8ff] shadow-neon-cyan/20 shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Smartphone className="w-4 h-4" />
          <span>Pay via Installed UPI App</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Confirm Settlement Manual UTR */}
        <div className="pt-3 border-t border-slate-800 text-left">
          <label className="text-[11px] font-mono text-slate-400 block mb-1">
            Optional: Enter Bank UTR / Transaction Ref
          </label>
          <input
            type="text"
            placeholder="e.g. 429188391021 or leave blank for auto-generate"
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-green mb-3"
          />

          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-black bg-neon-green hover:bg-[#05ffa1] shadow-neon-green/30 shadow-md transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Recording Settlement...' : 'Mark as Paid & Settle Ledger'}</span>
          </button>
        </div>

      </div>
    </Modal>
  );
};
