import React, { useState } from 'react';
import { Coffee, MapPin, Calendar, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { RoommateMatch } from '../../types';

interface SafeMeetModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMatch: RoommateMatch | null;
  onConfirmSchedule: (meetData: any) => Promise<void>;
}

export const SafeMeetModal: React.FC<SafeMeetModalProps> = ({
  isOpen,
  onClose,
  targetMatch,
  onConfirmSchedule
}) => {
  const [cafeName, setCafeName] = useState('Third Wave Coffee');
  const [area, setArea] = useState('HSR Layout Sector 4');
  const [date, setDate] = useState('2026-11-15');
  const [time, setTime] = useState('17:30');
  const [notes, setNotes] = useState('Catch up over coffee, discuss kitchen rules, and see the flat!');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!targetMatch) return null;

  const cafes = [
    { name: 'Third Wave Coffee', area: 'HSR Layout Sector 4, Bengaluru' },
    { name: 'Blue Tokai Coffee Roasters', area: 'Indiranagar 100ft Rd, Bengaluru' },
    { name: 'Starbucks Coffee', area: 'Koramangala 5th Block, Bengaluru' },
    { name: 'Subko Coffee Roasters', area: 'Bandra West, Mumbai' },
    { name: 'Dunkin\' Donuts', area: 'Cyber Hub, Gurgaon' },
    { name: 'Roastery Coffee House', area: 'Banjara Hills, Hyderabad' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirmSchedule({
        receiver_id: targetMatch.user_id,
        cafe_name: cafeName,
        location_address: area,
        meetup_date: date,
        meetup_time: time,
        notes
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SafeMeet — Pre-Move-in Public Meetup"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* SafeMeet Guidelines Banner */}
        <div className="p-3.5 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <span className="font-bold text-neon-cyan block mb-0.5">SafeMeet Verification Protocol</span>
            Always meet potential flatmates at verified, well-lit public coffee spots before signing lease agreements or sharing keys.
          </div>
        </div>

        {/* Selected Flatmate */}
        <div className="p-3 rounded-xl bg-dark-850 border border-slate-800 flex items-center gap-3">
          <img
            src={targetMatch.profile.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"}
            alt={targetMatch.full_name}
            className="w-10 h-10 rounded-xl object-cover border border-slate-700"
          />
          <div>
            <h4 className="text-xs font-bold text-white">Meeting with {targetMatch.full_name}</h4>
            <p className="text-[11px] text-slate-400">
              {targetMatch.profile.occupation} • {targetMatch.compatibility.overall_score}% AI Match
            </p>
          </div>
        </div>

        {/* Select Verified Cafe */}
        <div>
          <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
            Choose Verified Public Cafe
          </label>
          <select
            value={`${cafeName} - ${area}`}
            onChange={(e) => {
              const selected = cafes.find(c => `${c.name} - c.area` === e.target.value || `${c.name} - ${c.area}` === e.target.value);
              if (selected) {
                setCafeName(selected.name);
                setArea(selected.area);
              }
            }}
            className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white focus:outline-none focus:border-neon-cyan"
          >
            {cafes.map((c, i) => (
              <option key={i} value={`${c.name} - ${c.area}`}>
                {c.name} ({c.area})
              </option>
            ))}
          </select>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white focus:outline-none focus:border-neon-green"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white focus:outline-none focus:border-neon-green"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
            Agenda / Topics to discuss
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-green"
          />
        </div>

        {/* Buttons */}
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
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-neon-cyan hover:bg-[#38f8ff] shadow-neon-cyan/30 shadow-md transition-all flex items-center gap-1.5"
          >
            <Coffee className="w-4 h-4" />
            <span>{isSubmitting ? 'Sending Request...' : 'Send SafeMeet Invitation'}</span>
          </button>
        </div>

      </form>
    </Modal>
  );
};
