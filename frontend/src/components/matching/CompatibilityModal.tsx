import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Coffee, 
  ShieldCheck, 
  MapPin, 
  IndianRupee,
  Calendar,
  Utensils,
  Moon,
  Users
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { RoommateMatch } from '../../types';

interface CompatibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: RoommateMatch | null;
  onScheduleMeet: (match: RoommateMatch) => void;
}

export const CompatibilityModal: React.FC<CompatibilityModalProps> = ({
  isOpen,
  onClose,
  match,
  onScheduleMeet
}) => {
  if (!match) return null;

  const { profile, compatibility, verification } = match;

  const metrics = [
    { label: 'Rental Budget', value: compatibility.budget_score, icon: IndianRupee, color: 'bg-neon-green' },
    { label: 'Dietary & Kitchen', value: compatibility.dietary_score, icon: Utensils, color: 'bg-neon-cyan' },
    { label: 'Sleep & Work Rhythm', value: compatibility.sleep_score, icon: Moon, color: 'bg-neon-yellow' },
    { label: 'Hygiene & Cleanliness', value: compatibility.cleanliness_score, icon: Coffee, color: 'bg-emerald-400' },
    { label: 'Social & Guests', value: compatibility.social_score, icon: Users, color: 'bg-purple-400' },
    { label: 'Neighborhood Proximity', value: compatibility.location_score, icon: MapPin, color: 'bg-blue-400' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Compatibility Deep Dive"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        
        {/* Match Header Summary Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-dark-850 via-dark-800 to-dark-850 border border-slate-700/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={profile.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
              alt={match.full_name}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white">{match.full_name}</h4>
                {verification?.aadhaar_verified && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                    Aadhaar Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {profile.occupation} at {profile.company || 'Tech'} • {profile.neighborhood}, {profile.city}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neon-green block">Overall Synergy</span>
            <div className="text-3xl font-black text-neon-green font-mono">
              {compatibility.overall_score}%
            </div>
          </div>
        </div>

        {/* AI Narrative Vibe */}
        <div className="p-4 rounded-xl bg-neon-cyan/5 border border-neon-cyan/20">
          <div className="flex items-center gap-2 text-neon-cyan text-xs font-semibold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Executive Analysis</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {compatibility.vibe_summary}
          </p>
        </div>

        {/* Dimensional Compatibility Matrix Bars */}
        <div>
          <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
            Lifestyle Dimension Breakdown
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {metrics.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={idx} className="p-3 rounded-xl bg-dark-850/80 border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{m.label}</span>
                    </div>
                    <span className="font-mono font-bold text-white">{m.value}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${m.color}`}
                      style={{ width: `${m.value}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Synergy Highlights & Watchouts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Highlights */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Synergies & Alignment</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {compatibility.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Watchouts */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span>Recommended Discussion Points</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {compatibility.watchouts.length > 0 ? (
                compatibility.watchouts.map((w, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-400 italic">No significant lifestyle friction points detected.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onScheduleMeet(match);
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-neon-green hover:bg-[#05ffa1] shadow-neon-green/30 shadow-md transition-all flex items-center gap-2"
          >
            <Coffee className="w-4 h-4" />
            Schedule SafeMeet at Public Cafe
          </button>
        </div>

      </div>
    </Modal>
  );
};
