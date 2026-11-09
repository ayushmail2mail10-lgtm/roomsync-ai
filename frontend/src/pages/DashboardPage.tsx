import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  IndianRupee, 
  Users, 
  ShieldCheck, 
  Receipt, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  Plus, 
  Coffee,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  DashboardSummary, 
  FlatGroup, 
  Expense, 
  RoommateMatch, 
  SafeMeet,
  FlatMember
} from '../types';
import { RoommateCard } from '../components/matching/RoommateCard';
import { CompatibilityModal } from '../components/matching/CompatibilityModal';
import { UpiPaymentModal } from '../components/expenses/UpiPaymentModal';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { SafeMeetModal } from '../components/verification/SafeMeetModal';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
  onOpenChatWith: (match: RoommateMatch) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onOpenChatWith }) => {
  const { user, profile, verification } = useAuth();
  
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [groups, setGroups] = useState<FlatGroup[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [topMatches, setTopMatches] = useState<RoommateMatch[]>([]);
  const [safeMeets, setSafeMeets] = useState<SafeMeet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedMatch, setSelectedMatch] = useState<RoommateMatch | null>(null);
  const [isCompOpen, setIsCompOpen] = useState(false);
  const [isSafeMeetOpen, setIsSafeMeetOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isUpiOpen, setIsUpiOpen] = useState(false);
  const [pendingSplitId, setPendingSplitId] = useState<number | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [sumData, grpData, matchData, meetsData] = await Promise.all([
        api.getDashboardSummary(),
        api.getGroups(),
        api.exploreRoommates({}),
        api.getSafeMeets(),
      ]);
      setSummary(sumData);
      setGroups(grpData);
      setTopMatches(matchData.slice(0, 3));
      setSafeMeets(meetsData);

      if (grpData.length > 0) {
        const expData = await api.getGroupExpenses(grpData[0].id);
        setRecentExpenses(expData.slice(0, 5));
      }
    } catch (e) {
      console.error("Error fetching dashboard data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handlePaySplit = async (splitId: number, amount: number, payeeName: string, payeeUpi: string) => {
    setPendingSplitId(splitId);
    try {
      const res = await api.generateUpiQr({
        payee_upi: payeeUpi,
        payee_name: payeeName,
        amount: amount,
        note: "RoomSync Rent/Utility Share"
      });
      setPaymentData(res);
      setIsUpiOpen(true);
    } catch (err) {
      console.error("UPI generation failed:", err);
    }
  };

  const handleConfirmUpiSettlement = async (utrRef: string) => {
    if (pendingSplitId) {
      await api.markSplitPaid(pendingSplitId, utrRef);
      await fetchDashboardData();
    }
  };

  const handleAddExpense = async (data: any) => {
    if (groups.length > 0) {
      await api.addExpense(groups[0].id, data);
      await fetchDashboardData();
    }
  };

  const handleScheduleSafeMeet = async (meetData: any) => {
    await api.scheduleSafeMeet(meetData);
    await fetchDashboardData();
  };

  const activeGroup = groups[0] || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome & Context Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Namaste, {user?.full_name.split(' ')[0]} 👋
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              DigiLocker Verified
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Managing <strong className="text-white">{summary?.flat_name || 'Skyline Green 3BHK'}</strong> • HSR Layout Sector 2, Bengaluru
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-black bg-neon-green hover:bg-[#05ffa1] shadow-neon-green/20 shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Split New Bill</span>
          </button>

          <button
            onClick={() => onNavigate('explore')}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-dark-850 hover:bg-dark-800 border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Users className="w-4 h-4 text-neon-cyan" />
            <span>Explore Roommates</span>
          </button>
        </div>
      </div>

      {/* Notifications / SafeMeet Banner if any */}
      {safeMeets.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-neon-cyan/10 via-dark-850 to-dark-850 border border-neon-cyan/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white">Upcoming SafeMeet Confirmed!</h4>
                <span className="text-[10px] bg-neon-cyan/20 text-neon-cyan px-2 py-0.2 rounded-full font-mono">
                  {safeMeets[0].status}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Meeting at <strong className="text-neon-cyan">{safeMeets[0].cafe_name}</strong> on {safeMeets[0].meetup_date} at {safeMeets[0].meetup_time}
              </p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('safety')}
            className="text-xs font-bold text-neon-cyan hover:underline flex items-center gap-1 whitespace-nowrap"
          >
            <span>View Safety Center</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Monthly Rent Share */}
        <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Your Rent Share</span>
            <Building2 className="w-4 h-4 text-neon-green" />
          </div>
          <div className="text-2xl font-black text-white font-mono flex items-center gap-0.5">
            <IndianRupee className="w-5 h-5 text-neon-green" />
            <span>{(summary?.monthly_rent_share || 18500).toLocaleString('en-IN')}</span>
            <span className="text-xs text-slate-400 font-normal">/mo</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-neon-yellow" />
            <span>Next lease cycle due: 1st of month</span>
          </div>
        </div>

        {/* Card 2: Pending to Pay (Utilities) */}
        <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Pending You Owe</span>
            <Receipt className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono flex items-center gap-0.5">
            <IndianRupee className="w-5 h-5 text-amber-400" />
            <span>{(summary?.pending_to_pay || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Electricity, WiFi, Cook</span>
            <button 
              onClick={() => onNavigate('expenses')}
              className="text-neon-cyan hover:underline font-bold text-[10px]"
            >
              Settle via UPI →
            </button>
          </div>
        </div>

        {/* Card 3: Roommates Owe You */}
        <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Roommates Owe You</span>
            <IndianRupee className="w-4 h-4 text-neon-green" />
          </div>
          <div className="text-2xl font-black text-neon-green font-mono flex items-center gap-0.5">
            <IndianRupee className="w-5 h-5 text-neon-green" />
            <span>{(summary?.owed_to_me || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            <span>Net Balance: +₹{(summary?.net_balance || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Card 4: Trust Score */}
        <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Trust Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono flex items-center gap-1">
            <span>{verification?.trust_score || 95}</span>
            <span className="text-xs text-slate-500 font-normal">/100</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400/90 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Aadhaar + Corporate ID</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Active Flat & Expenses (Left 2/3) + Top AI Matches (Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Active Flat & Shared Ledger */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Flat Card */}
          {activeGroup && (
            <div className="p-6 rounded-2xl bg-dark-900 border border-slate-800 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-neon-green" />
                    <span>{activeGroup.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeGroup.address || 'HSR Layout, Bengaluru'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Total Flat Rent</span>
                  <div className="text-lg font-black text-white font-mono flex items-center justify-end">
                    <IndianRupee className="w-4 h-4 text-neon-green" />
                    <span>{(activeGroup.total_rent || 51000).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Roommates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeGroup.members.map((m) => (
                  <div key={m.id} className="p-3.5 rounded-xl bg-dark-850/80 border border-slate-800 flex flex-col justify-between">
                    <div className="flex items-center gap-2.5 mb-2">
                      <img
                        src={m.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                        alt={m.full_name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white truncate max-w-[110px]">
                          {m.full_name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          ₹{m.monthly_rent_share.toLocaleString('en-IN')}/mo
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-neon-cyan bg-neon-cyan/10 px-2 py-0.5 rounded-md border border-neon-cyan/20 truncate">
                      {m.room_label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                <span>Want to recalibrate room rent or add a replacement flatmate?</span>
                <button
                  onClick={() => onNavigate('expenses')}
                  className="font-bold text-neon-green hover:underline flex items-center gap-1"
                >
                  <span>Manage Lease & Bills</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Shared Expenses & Utility Breakdown */}
          <div className="p-6 rounded-2xl bg-dark-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-neon-cyan" />
                  <span>Recent Shared Apartment Expenses</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Track BESCOM electricity, WiFi, cook salary, and Blinkit groceries.
                </p>
              </div>

              <button
                onClick={() => setIsAddExpenseOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-black bg-neon-green hover:bg-[#05ffa1] transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Bill</span>
              </button>
            </div>

            {/* Expenses List */}
            <div className="divide-y divide-slate-800/80">
              {recentExpenses.map((exp) => {
                // Find if current user has a pending split for this
                const mySplit = exp.splits.find(s => s.user_id === user?.id);
                const isPaidByMe = exp.paid_by_id === user?.id;

                return (
                  <div key={exp.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-dark-850 border border-slate-800 text-xs font-mono text-neon-cyan">
                        {exp.category}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{exp.title}</h4>
                        <p className="text-[11px] text-slate-400">
                          Total: ₹{exp.total_amount.toLocaleString('en-IN')} • Paid by {isPaidByMe ? 'You' : exp.paid_by_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {mySplit && (
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-slate-400 uppercase block">Your Share</span>
                          <span className="text-xs font-bold font-mono text-white">
                            ₹{mySplit.amount_owed.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}

                      {mySplit && !mySplit.is_paid ? (
                        <button
                          onClick={() => handlePaySplit(mySplit.id, mySplit.amount_owed, exp.paid_by_name || 'Roommate', 'roommate@upi')}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-black bg-neon-cyan hover:bg-[#38f8ff] shadow-sm transition-all flex items-center gap-1"
                        >
                          <span>Pay via UPI</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-neon-green bg-neon-green/10 px-2 py-0.5 rounded-md border border-neon-green/30 font-mono">
                          Settled
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => onNavigate('expenses')}
                className="text-xs text-neon-cyan hover:underline font-bold"
              >
                View Full Expense Ledger & History →
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Top Compatible Matches */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-neon-green" />
                <span>AI Roommate Recommendations</span>
              </h3>
              <p className="text-xs text-slate-400">
                Matched on dietary, sleep, and budget compatibility.
              </p>
            </div>

            <button
              onClick={() => onNavigate('explore')}
              className="text-xs text-neon-green hover:underline font-bold whitespace-nowrap"
            >
              See All →
            </button>
          </div>

          <div className="space-y-4">
            {topMatches.map((m) => (
              <RoommateCard
                key={m.user_id}
                match={m}
                onViewBreakdown={(match) => {
                  setSelectedMatch(match);
                  setIsCompOpen(true);
                }}
                onStartChat={(match) => onOpenChatWith(match)}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Modals */}
      <CompatibilityModal
        isOpen={isCompOpen}
        onClose={() => setIsCompOpen(false)}
        match={selectedMatch}
        onScheduleMeet={(match) => {
          setSelectedMatch(match);
          setIsSafeMeetOpen(true);
        }}
      />

      <SafeMeetModal
        isOpen={isSafeMeetOpen}
        onClose={() => setIsSafeMeetOpen(false)}
        targetMatch={selectedMatch}
        onConfirmSchedule={handleScheduleSafeMeet}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        groupId={activeGroup?.id || 1}
        members={activeGroup?.members || []}
        onAddExpense={handleAddExpense}
      />

      <UpiPaymentModal
        isOpen={isUpiOpen}
        onClose={() => setIsUpiOpen(false)}
        paymentData={paymentData}
        onConfirmSettlement={handleConfirmUpiSettlement}
      />

    </div>
  );
};
