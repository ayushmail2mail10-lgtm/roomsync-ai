import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  IndianRupee, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Send,
  Loader2
} from 'lucide-react';
import { PropertyListing, RoomListing } from '../../types';
import { api } from '../../services/api';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface ApplyPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyListing | null;
  initialRoom?: RoomListing | null;
  onApplicationSuccess?: () => void;
}

export const ApplyPropertyModal: React.FC<ApplyPropertyModalProps> = ({
  isOpen,
  onClose,
  property,
  initialRoom,
  onApplicationSuccess
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [moveInDate, setMoveInDate] = useState('Immediate');
  const [proposedBudget, setProposedBudget] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (initialRoom) {
      setSelectedRoomId(initialRoom.id);
      setProposedBudget(String(initialRoom.rent));
    } else if (property) {
      const firstVacant = property.rooms?.find(r => r.is_vacant);
      if (firstVacant) {
        setSelectedRoomId(firstVacant.id);
        setProposedBudget(String(firstVacant.rent));
      } else {
        setSelectedRoomId(null);
        setProposedBudget(String(property.monthly_rent));
      }
    }
    setErrorMsg(null);
    setIsSuccess(false);
  }, [property, initialRoom, isOpen]);

  if (!property) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await api.applyForProperty(property.id, {
        room_id: selectedRoomId,
        move_in_date: moveInDate,
        proposed_budget: proposedBudget ? parseInt(proposedBudget) : undefined,
        message: message.trim() || undefined
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        if (onApplicationSuccess) onApplicationSuccess();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRoom = property.rooms?.find(r => r.id === selectedRoomId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Rental Application"
      maxWidth="max-w-lg"
    >
      {isSuccess ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#00F59B]/10 border border-[#00F59B]/40 flex items-center justify-center text-[#00F59B] mx-auto shadow-neon-green/30 shadow-lg">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[#F5F7FA]">Application Sent!</h3>
          <p className="text-xs text-[#929BAA] max-w-sm mx-auto">
            Your application and verified profile have been delivered to the owner. You can track status on your Tenant Dashboard.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Target Property Summary */}
          <div className="p-3 rounded-2xl bg-[#161F2E] border border-[#1E283A] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#06080D] border border-[#00F59B]/30 flex items-center justify-center text-[#00F59B] shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-[#F5F7FA] truncate">{property.title}</h4>
              <p className="text-[10px] text-[#929BAA] font-mono">{property.neighborhood}, {property.city}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-mono font-bold text-[#00F59B]">
                ₹{selectedRoom ? selectedRoom.rent.toLocaleString('en-IN') : property.monthly_rent.toLocaleString('en-IN')}
              </span>
              <span className="text-[9px] text-[#929BAA] block font-mono">/month</span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Select Specific Room (if multiple) */}
          {property.rooms && property.rooms.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#929BAA]">Select Desired Room</label>
              <select
                value={selectedRoomId || ''}
                onChange={(e) => {
                  const rId = e.target.value ? parseInt(e.target.value) : null;
                  setSelectedRoomId(rId);
                  const found = property.rooms?.find(r => r.id === rId);
                  if (found) setProposedBudget(String(found.rent));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111722] border border-[#1E283A] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#00F59B]"
              >
                <option value="">Full Property / Any Available Room</option>
                {property.rooms.map((r) => (
                  <option key={r.id} value={r.id} disabled={!r.is_vacant}>
                    {r.title} — ₹{r.rent.toLocaleString('en-IN')}/mo {r.is_vacant ? '(Vacant)' : '(Occupied)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Move-in Date & Proposed Budget */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#929BAA]">Target Move-In Date</label>
              <select
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#111722] border border-[#1E283A] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#00F59B]"
              >
                <option value="Immediate">Immediate Move-In</option>
                <option value="Within 7 Days">Within 7 Days</option>
                <option value="Within 15 Days">Within 15 Days</option>
                <option value="Next Month (1st)">Next Month (1st)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#929BAA]">Proposed Monthly Rent (₹)</label>
              <Input
                type="number"
                value={proposedBudget}
                onChange={(e) => setProposedBudget(e.target.value)}
                placeholder="20000"
                className="text-xs"
                required
              />
            </div>
          </div>

          {/* Intro Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#929BAA]">
              Intro Note for Landlord / Flatmates
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I am a software engineer working hybrid in HSR. Non-smoker, keep spaces neat, and looking for immediate move-in..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#111722] border border-[#1E283A] text-xs text-[#F5F7FA] placeholder-[#5F697A] focus:outline-none focus:border-[#00F59B] resize-none"
            />
            <p className="text-[10px] text-[#5F697A] font-mono">
              Your verified KYC badge and company domain will be attached with your application.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#1E283A] flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="text-xs px-5 py-2 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Application</span>
                </>
              )}
            </Button>
          </div>

        </form>
      )}
    </Modal>
  );
};
