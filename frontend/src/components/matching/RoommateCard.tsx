import React from 'react';
import { 
  MapPin, 
  IndianRupee, 
  Briefcase, 
  Sparkles, 
  MessageSquare, 
  ShieldCheck, 
  Moon, 
  Utensils, 
  Coffee,
  CheckCircle2
} from 'lucide-react';
import { RoommateMatch } from '../../types';
import { Badge } from '../common/Badge';

interface RoommateCardProps {
  match: RoommateMatch;
  onViewBreakdown: (match: RoommateMatch) => void;
  onStartChat: (match: RoommateMatch) => void;
}

export const RoommateCard: React.FC<RoommateCardProps> = ({
  match,
  onViewBreakdown,
  onStartChat
}) => {
  const { profile, verification, compatibility } = match;
  const score = compatibility.overall_score;

  const getScoreColor = (val: number) => {
    if (val >= 90) return 'text-neon-green border-neon-green/40 bg-neon-green/10 shadow-neon-green/20';
    if (val >= 80) return 'text-neon-cyan border-neon-cyan/40 bg-neon-cyan/10 shadow-neon-cyan/20';
    return 'text-neon-yellow border-neon-yellow/40 bg-neon-yellow/10';
  };

  return (
    <div className="group relative bg-dark-900/90 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
      
      {/* Top Header: Avatar, Name, Score Pill */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={profile.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                alt={match.full_name}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-700/80 group-hover:border-neon-cyan/50 transition-all"
              />
              {verification?.aadhaar_verified && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black rounded-full p-0.5 border-2 border-dark-900" title="Aadhaar Verified">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white group-hover:text-neon-cyan transition-colors">
                  {match.full_name}
                </h3>
                {profile.age && (
                  <span className="text-xs text-slate-400 font-mono">
                    {profile.age}y
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                <span>{profile.occupation || 'Professional'}</span>
                {profile.company && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300 font-medium">{profile.company}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-neon-green/80" />
                <span>{profile.neighborhood}, {profile.city}</span>
              </div>
            </div>
          </div>

          {/* AI Compatibility Badge */}
          <div className={`px-2.5 py-1.5 rounded-xl border text-center shadow-md ${getScoreColor(score)}`}>
            <div className="flex items-center justify-center gap-1 text-[11px] font-mono uppercase tracking-wider font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>AI Match</span>
            </div>
            <div className="text-xl font-black font-mono tracking-tight leading-none mt-0.5">
              {score}%
            </div>
          </div>
        </div>

        {/* Bio Snippet */}
        <p className="mt-3.5 text-xs text-slate-300 line-clamp-2 leading-relaxed bg-dark-850/60 p-2.5 rounded-xl border border-slate-800/50">
          "{profile.bio}"
        </p>

        {/* Budget Bar & Housing Status */}
        <div className="mt-3.5 flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-dark-800/50 border border-slate-800">
          <div className="flex items-center gap-1 text-slate-400">
            <IndianRupee className="w-3.5 h-3.5 text-neon-green" />
            <span>Budget:</span>
            <span className="font-semibold text-white font-mono">
              ₹{(profile.budget_min || 12000).toLocaleString('en-IN')} - ₹{(profile.budget_max || 22000).toLocaleString('en-IN')}/mo
            </span>
          </div>
          <span className="text-[10px] font-medium text-neon-cyan px-2 py-0.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/20">
            {profile.housing_status}
          </span>
        </div>

        {/* Lifestyle Chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge variant="neutral">
            <Utensils className="w-3 h-3 text-neon-yellow" />
            <span>{profile.dietary_pref}</span>
          </Badge>
          <Badge variant="neutral">
            <Moon className="w-3 h-3 text-neon-cyan" />
            <span>{profile.sleep_schedule.split(' ')[0]}</span>
          </Badge>
          <Badge variant="neutral">
            <Coffee className="w-3 h-3 text-slate-400" />
            <span>Clean: {profile.cleanliness}/5</span>
          </Badge>
          {verification?.work_email_verified && (
            <Badge variant="green" icon="shield">
              Work Verified
            </Badge>
          )}
        </div>

        {/* AI Match Highlights Pill */}
        {compatibility.highlights.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-[11px] text-neon-green font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{compatibility.highlights[0]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
        <button
          onClick={() => onViewBreakdown(match)}
          className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-slate-200 bg-dark-800 hover:bg-dark-700 hover:text-white border border-slate-700 transition-all flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-neon-cyan" />
          AI Breakdown
        </button>

        <button
          onClick={() => onStartChat(match)}
          className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-black bg-neon-green hover:bg-[#05ffa1] shadow-neon-green/30 shadow-md transition-all flex items-center justify-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Connect & Chat
        </button>
      </div>

    </div>
  );
};
