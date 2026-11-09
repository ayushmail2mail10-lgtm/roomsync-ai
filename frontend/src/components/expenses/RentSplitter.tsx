import React, { useState } from 'react';
import { 
  Building2, 
  IndianRupee, 
  Sliders, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { FlatGroup, FlatMember } from '../../types';

interface RentSplitterProps {
  group: FlatGroup;
  currentUserId: number;
  onPayRent: (member: FlatMember) => void;
}

export const RentSplitter: React.FC<RentSplitterProps> = ({
  group,
  currentUserId,
  onPayRent
}) => {
  const [splitMode, setSplitMode] = useState<'room_based' | 'equal' | 'sqft'>('room_based');

  const totalRent = group.total_rent || 51000;
  const numMembers = group.members.length || 3;

  return (
    <div className="p-6 rounded-2xl bg-dark-900 border border-slate-800 shadow-2xl space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-neon-green" />
            <h3 className="text-lg font-bold text-white">{group.name}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {group.address || 'HSR Layout, Bengaluru'} • {numMembers} Roommates
          </p>
        </div>

        <div className="p-3 rounded-xl bg-dark-850 border border-slate-800 text-right">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
            Total Monthly Apartment Rent
          </span>
          <div className="text-2xl font-black text-white font-mono flex items-center justify-end gap-1">
            <IndianRupee className="w-5 h-5 text-neon-green" />
            <span>{totalRent.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Split Mode Selector */}
      <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-dark-850 border border-slate-800 text-xs">
        <span className="text-[11px] font-mono text-slate-400 px-2 uppercase tracking-wider hidden sm:inline">
          Rent Calculation Model:
        </span>
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            onClick={() => setSplitMode('room_based')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-medium transition-all ${
              splitMode === 'room_based'
                ? 'bg-neon-green text-black font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Room Premium Split
          </button>
          <button
            onClick={() => setSplitMode('equal')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-medium transition-all ${
              splitMode === 'equal'
                ? 'bg-neon-green text-black font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Strict Equal Split
          </button>
        </div>
      </div>

      {/* Roommates Rent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {group.members.map((member, idx) => {
          const isCurrentUser = member.user_id === currentUserId;
          const rentShare = splitMode === 'equal' 
            ? Math.round(totalRent / numMembers)
            : member.monthly_rent_share;

          return (
            <div
              key={member.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isCurrentUser
                  ? 'bg-dark-850/90 border-neon-green/40 shadow-neon-green/10 shadow-md'
                  : 'bg-dark-850/50 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={member.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                      alt={member.full_name || 'Roommate'}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {member.full_name || 'Roommate'}
                        {isCurrentUser && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-neon-green/20 text-neon-green font-mono">
                            YOU
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {member.upi_id || 'roommate@upi'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-dark-900 border border-slate-800/80 mb-3">
                  <span className="text-[10px] text-slate-400 block font-mono">Assigned Space</span>
                  <span className="text-xs font-semibold text-neon-cyan">
                    {member.room_label}
                  </span>
                </div>

                <div className="text-left mb-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Individual Rent Due
                  </span>
                  <div className="text-xl font-black text-white font-mono flex items-center gap-0.5">
                    <IndianRupee className="w-4 h-4 text-neon-green" />
                    <span>{rentShare.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-slate-400 font-normal">/mo</span>
                  </div>
                </div>
              </div>

              {/* Status & CTA */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1 text-[11px] text-amber-400 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  Due on 1st
                </span>

                <button
                  onClick={() => onPayRent({ ...member, monthly_rent_share: rentShare })}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-black bg-neon-green hover:bg-[#05ffa1] shadow-sm transition-all flex items-center gap-1"
                >
                  <span>Pay via UPI</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
