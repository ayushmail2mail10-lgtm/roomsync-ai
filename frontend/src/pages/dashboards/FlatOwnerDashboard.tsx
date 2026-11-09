import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  BedDouble,
  Users,
  IndianRupee,
  Receipt,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Plus,
  Coffee,
  Heart,
  Settings,
  AlertCircle,
  Calendar,
  UtensilsCrossed,
  Moon,
  Wine,
  Cigarette,
  PawPrint
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { DashboardSummary, FlatGroup, Expense, RoommateMatch, SafeMeet, TenantApplication, PropertyListing } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { RoommateCard } from '../../components/matching/RoommateCard';
import { CompatibilityModal } from '../../components/matching/CompatibilityModal';
import { UpiPaymentModal } from '../../components/expenses/UpiPaymentModal';
import { AddExpenseModal } from '../../components/expenses/AddExpenseModal';
import { SafeMeetModal } from '../../components/verification/SafeMeetModal';

interface FlatOwnerDashboardProps {
  onNavigate?: (tab: string) => void;
  onOpenChatWith?: (match: RoommateMatch) => void;
}

export const FlatOwnerDashboard: React.FC<FlatOwnerDashboardProps> = ({ onNavigate, onOpenChatWith }) => {
  const { user, profile, verification } = useAuth();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [groups, setGroups] = useState<FlatGroup[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [topMatches, setTopMatches] = useState<RoommateMatch[]>([]);
  const [safeMeets, setSafeMeets] = useState<SafeMeet[]>([]);
  const [myProperties, setMyProperties] = useState<PropertyListing[]>([]);
  const [incomingApplications, setIncomingApplications] = useState<TenantApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modals state
  const [selectedMatch, setSelectedMatch] = useState<RoommateMatch | null>(null);
  const [isCompOpen, setIsCompOpen] = useState(false);
  const [isSafeMeetOpen, setIsSafeMeetOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isUpiOpen, setIsUpiOpen] = useState(false);

  // Flat household rules
  const householdRules = [
    { label: "Food Habits", value: "Pure Veg Kitchen (Outside Non-Veg allowed)", icon: UtensilsCrossed },
    { label: "Sleep Schedule", value: "Quiet hours after 11:30 PM", icon: Moon },
    { label: "House Help", value: "Dedicated Cook & Maid (₹2,500/head)", icon: Coffee },
    { label: "Smoking / Drinks", value: "Non-smoker preferred, Social drinks OK", icon: Wine },
    { label: "Pet Friendly", value: "Pet lovers welcome", icon: PawPrint },
    { label: "Guests", value: "Weekend friends welcome with prior notice", icon: Users },
  ];

  const fetchFlatData = async () => {
    try {
      const [sumData, grpData, matchData, meetsData, propsData, appsData] = await Promise.all([
        api.getDashboardSummary(),
        api.getGroups(),
        api.exploreRoommates({}),
        api.getSafeMeets(),
        api.getMyProperties().catch(() => []),
        api.getIncomingApplications().catch(() => []),
      ]);
      setSummary(sumData);
      setGroups(grpData);
      setMyProperties(propsData);
      setIncomingApplications(appsData);

      // Filter candidates looking for flat
      const lookingCandidates = matchData.filter(m => m.profile.housing_status === 'Need Flat & Roommate');
      setTopMatches(lookingCandidates.slice(0, 3));
      setSafeMeets(meetsData);

      if (grpData.length > 0) {
        const expData = await api.getGroupExpenses(grpData[0].id);
        setRecentExpenses(expData.slice(0, 5));
      }
    } catch (e) {
      console.error("Error fetching flat owner dashboard data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplicationDecision = async (appId: number, decision: 'accepted' | 'rejected') => {
    setActionError(null);
    try {
      await api.decideApplication(appId, decision);
      await fetchFlatData();
    } catch (err: any) {
      setActionError(err.message || "Failed to update application decision");
    }
  };

  useEffect(() => {
    fetchFlatData();
  }, []);


  const handleOpenComp = (match: RoommateMatch) => {
    setSelectedMatch(match);
    setIsCompOpen(true);
  };

  const handleOpenSafeMeet = (match: RoommateMatch) => {
    setSelectedMatch(match);
    setIsSafeMeetOpen(true);
  };

  const currentFlat = groups[0] || {
    name: "Skyline Green 3BHK",
    address: "Flat 402, Skyline Green, 14th Main, HSR Layout Sector 2, Bengaluru",
    total_rent: 54000,
    members: []
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#1E283A]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F59B]/20 to-[#00F59B]/5 border border-[#00F59B]/40 flex items-center justify-center text-[#00F59B] shadow-sm">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#F5F7FA] flex items-center gap-2">
                {currentFlat.name} Management
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00F59B]/15 text-[#00F59B] border border-[#00F59B]/30 uppercase">
                  Primary Flatmate
                </span>
              </h1>
              <p className="text-xs text-[#929BAA] font-mono mt-0.5">
                {currentFlat.address || "HSR Layout Sector 2, Bengaluru"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center gap-2 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Flat Bill
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate?.('explore')}
            className="flex items-center gap-2 text-xs"
          >
            <Users className="w-3.5 h-3.5" />
            Find Replacement Roommate
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between text-xs text-[#929BAA] mb-1">
            <span>Total Flat Rent</span>
            <IndianRupee className="w-4 h-4 text-[#00F59B]" />
          </div>
          <div className="text-2xl font-black text-[#F5F7FA] font-mono">
            ₹{currentFlat.total_rent?.toLocaleString('en-IN') || '54,000'}
          </div>
          <div className="text-[10px] text-[#929BAA] mt-1 font-mono">
            Split across 3 bedrooms
          </div>
        </Card>

        <Card variant="glass" className="p-4 border-[#FFD600]/30">
          <div className="flex items-center justify-between text-xs text-[#929BAA] mb-1">
            <span>Vacant Room Status</span>
            <span className="w-2 h-2 rounded-full bg-[#FFD600] animate-pulse"></span>
          </div>
          <div className="text-2xl font-black text-[#FFD600] font-mono">
            1 Room Open
          </div>
          <div className="text-[10px] text-[#929BAA] mt-1 font-mono">
            ₹18,000/mo • Master Bedroom
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between text-xs text-[#929BAA] mb-1">
            <span>My Monthly Share</span>
            <IndianRupee className="w-4 h-4 text-[#00F0FF]" />
          </div>
          <div className="text-2xl font-black text-[#00F0FF] font-mono">
            ₹{summary?.monthly_rent_share?.toLocaleString('en-IN') || '18,000'}
          </div>
          <div className="text-[10px] text-[#929BAA] mt-1 font-mono">
            Due on 5th of each month
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between text-xs text-[#929BAA] mb-1">
            <span>Pending Utility Splits</span>
            <Receipt className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-orange-400 font-mono">
            ₹{summary?.pending_to_pay?.toLocaleString('en-IN') || '3,450'}
          </div>
          <div className="text-[10px] text-[#929BAA] mt-1 font-mono">
            Electricity, Wi-Fi & Cook
          </div>
        </Card>
      </div>

      {/* Main Content Layout: Vacant Room & Replacement Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Vacant Room Card & Compatible Replacement Flatmates */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Vacant Room Details Card */}
          <Card variant="glass" className="p-6 border-[#00F59B]/30 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFD600]/15 text-[#FFD600] border border-[#FFD600]/30 font-bold uppercase">
                  Available Vacancy
                </span>
                <h3 className="text-lg font-bold text-[#F5F7FA] mt-1">
                  Master Bedroom with Attached Balcony & Bath
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono text-[#00F59B]">
                  ₹18,000
                </span>
                <span className="text-xs text-[#929BAA]"> / month</span>
                <div className="text-[11px] font-mono text-[#5F697A]">Deposit: ₹50,000</div>
              </div>
            </div>

            <p className="text-xs text-[#929BAA] mb-4">
              Fully furnished master bedroom in a quiet 3BHK flat in HSR Layout Sector 2. Comes with queen-size bed, 6-door wardrobe, split AC, ergonomic work desk, high-speed fiber Wi-Fi, and private sunlit balcony.
            </p>

            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-[#111722] border border-[#1E283A] text-[#929BAA]">
                🛏️ Queen Bed
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#111722] border border-[#1E283A] text-[#929BAA]">
                ❄️ Split AC
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#111722] border border-[#1E283A] text-[#929BAA]">
                🌿 Private Balcony
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#111722] border border-[#1E283A] text-[#929BAA]">
                🚿 Attached Western Bath
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#111722] border border-[#1E283A] text-[#929BAA]">
                ⚡ 100% Power Backup
              </span>
            </div>
          </Card>

          {/* Incoming Tenant / Roommate Inquiries Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#F5F7FA] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00F0FF]" />
                Incoming Flatmate Applications ({incomingApplications.length})
              </h2>
              <span className="text-xs font-mono text-[#929BAA]">
                {incomingApplications.filter(a => a.status === 'pending').length} Awaiting Review
              </span>
            </div>

            {actionError && (
              <div className="p-3 mb-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="space-y-3">
              {incomingApplications.map((app) => {
                const applicantName = app.applicant?.name || app.applicant_name || "Applicant";
                const applicantAvatar = app.applicant?.avatar_url || app.applicant_avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80";
                const applicantOccupation = app.applicant?.occupation || app.applicant_occupation || "Working Professional";
                const applicantCompany = app.applicant?.company || app.applicant_company || "Verified Tech";
                const budgetMax = app.proposed_budget || app.budget_max || 20000;
                const trustScore = app.applicant?.trust_score || app.trust_score || 88;
                const compScore = app.applicant?.compatibility_score || app.compatibility_score || 94;

                return (
                  <Card key={app.id} variant="glass" className="p-5 border-[#1E283A]">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={applicantAvatar}
                          alt={applicantName}
                          className="w-12 h-12 rounded-xl object-cover border border-[#1E283A]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-[#F5F7FA]">{applicantName}</h4>
                            <span className="px-1.5 py-0.2 rounded bg-[#00F59B]/10 text-[#00F59B] text-[10px] font-mono flex items-center gap-0.5">
                              <Sparkles className="w-3 h-3" /> {compScore}% AI Synergy
                            </span>
                          </div>
                          <p className="text-xs text-[#929BAA]">
                            {applicantOccupation} • <span className="text-[#00F0FF]">{applicantCompany}</span>
                          </p>
                          <div className="flex items-center gap-3 text-[11px] font-mono text-[#5F697A] mt-1">
                            <span>Proposed Rent: ₹{budgetMax.toLocaleString('en-IN')}/mo</span>
                            <span>•</span>
                            <span className="text-[#00F59B]">Trust: {trustScore}/100</span>
                            {app.move_in_date && (
                              <>
                                <span>•</span>
                                <span className="text-[#FFD600]">Move-in: {app.move_in_date}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Decision buttons */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {app.status === 'pending' ? (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApplicationDecision(app.id, 'accepted')}
                              className="text-xs px-3 py-1.5"
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApplicationDecision(app.id, 'rejected')}
                              className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 px-3 py-1.5"
                            >
                              Decline
                            </Button>
                          </>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold capitalize ${
                            app.status === 'accepted'
                              ? 'bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}>
                            {app.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {app.message && (
                      <div className="mt-3 pt-3 border-t border-[#1E283A] text-xs text-[#929BAA] bg-[#06080D]/40 p-2.5 rounded-lg">
                        <span className="text-[#5F697A] font-mono">Intro: </span>
                        "{app.message}"
                      </div>
                    )}
                  </Card>
                );
              })}

              {incomingApplications.length === 0 && (
                <div className="py-6 text-center text-xs text-[#929BAA] bg-[#111722] rounded-2xl border border-[#1E283A]">
                  No incoming applications for your flat right now.
                </div>
              )}
            </div>
          </div>

          {/* Compatible Replacement Flatmates Recommendation Feed */}
          <div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#F5F7FA] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00F59B]" />
                Top Compatible Replacement Flatmates
              </h2>
              <button
                onClick={() => onNavigate?.('explore')}
                className="text-xs font-mono text-[#00F59B] hover:underline"
              >
                Browse All Candidates →
              </button>
            </div>

            <div className="space-y-4">
              {topMatches.map((match) => (
                <RoommateCard
                  key={match.user_id}
                  match={match}
                  onViewBreakdown={handleOpenComp}
                  onStartChat={(m) => onOpenChatWith ? onOpenChatWith(m) : onNavigate?.('messages')}
                />
              ))}

              {topMatches.length === 0 && !isLoading && (
                <div className="py-12 text-center text-xs text-[#929BAA] bg-[#111722] rounded-2xl border border-[#1E283A]">
                  No replacement candidates found matching current budget filter.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Col: Household Rules & Shared Bills Ledger */}
        <div className="space-y-6">
          
          {/* Household Rules & Lifestyle Vibe */}
          <Card variant="glass" className="p-5">
            <h3 className="text-sm font-bold text-[#F5F7FA] mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#00F0FF]" />
              Our Household Rules & Preferences
            </h3>
            <p className="text-xs text-[#929BAA] mb-4">
              These guidelines are used by our AI matching engine to filter incoming roommate applications.
            </p>
            <div className="space-y-3">
              {householdRules.map((rule, idx) => {
                const Icon = rule.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-[#06080D]/60 border border-[#1E283A]">
                    <Icon className="w-4 h-4 text-[#00F59B] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-semibold text-[#F5F7FA]">{rule.label}</div>
                      <div className="text-[#929BAA] text-[11px] mt-0.5">{rule.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent Shared Utility Expenses */}
          <Card variant="glass" className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#00F59B]" />
                Shared Expenses Ledger
              </h3>
              <button
                onClick={() => onNavigate?.('expenses')}
                className="text-[11px] font-mono text-[#00F0FF] hover:underline"
              >
                View Ledger
              </button>
            </div>

            <div className="space-y-2">
              {recentExpenses.map((exp) => (
                <div key={exp.id} className="p-2.5 rounded-xl bg-[#06080D]/60 border border-[#1E283A] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#F5F7FA]">{exp.title}</div>
                    <div className="text-[10px] text-[#929BAA] font-mono">Paid by {exp.paid_by_name || 'Roommate'}</div>
                  </div>
                  <div className="font-mono font-bold text-[#00F59B]">
                    ₹{exp.total_amount.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}

              {recentExpenses.length === 0 && (
                <div className="text-xs text-[#929BAA] text-center py-4">
                  No expenses logged this month yet.
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs mt-3"
              onClick={() => setIsAddExpenseOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Record New Shared Expense
            </Button>
          </Card>

        </div>

      </div>

      {/* Modals */}
      {selectedMatch && (
        <>
          <CompatibilityModal
            isOpen={isCompOpen}
            onClose={() => setIsCompOpen(false)}
            match={selectedMatch}
            onScheduleMeet={(m) => {
              setIsCompOpen(false);
              handleOpenSafeMeet(m);
            }}
          />
          <SafeMeetModal
            isOpen={isSafeMeetOpen}
            onClose={() => setIsSafeMeetOpen(false)}
            targetMatch={selectedMatch}
            onConfirmSchedule={async (data) => {
              await api.scheduleSafeMeet(data);
              setIsSafeMeetOpen(false);
              await fetchFlatData();
            }}
          />
        </>
      )}

      {groups.length > 0 && (
        <AddExpenseModal
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
          groupId={groups[0].id}
          members={groups[0].members || []}
          onAddExpense={async (data) => {
            await api.addExpense(groups[0].id, data);
            setIsAddExpenseOpen(false);
            await fetchFlatData();
          }}
        />
      )}

    </div>
  );
};
