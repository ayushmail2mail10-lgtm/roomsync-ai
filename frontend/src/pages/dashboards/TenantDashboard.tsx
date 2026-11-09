import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Building2,
  IndianRupee,
  Receipt,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Coffee,
  Heart,
  ChevronRight,
  AlertCircle,
  Calendar,
  ExternalLink,
  MapPin,
  BedDouble,
  Search,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { DashboardSummary, FlatGroup, Expense, RoommateMatch, SafeMeet } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { RoommateCard } from '../../components/matching/RoommateCard';
import { CompatibilityModal } from '../../components/matching/CompatibilityModal';
import { UpiPaymentModal } from '../../components/expenses/UpiPaymentModal';
import { SafeMeetModal } from '../../components/verification/SafeMeetModal';

interface TenantDashboardProps {
  onNavigate?: (tab: string) => void;
  onOpenChatWith?: (match: RoommateMatch) => void;
}

export const TenantDashboard: React.FC<TenantDashboardProps> = ({ onNavigate, onOpenChatWith }) => {
  const { user, profile, verification } = useAuth();

  const [topMatches, setTopMatches] = useState<RoommateMatch[]>([]);
  const [safeMeets, setSafeMeets] = useState<SafeMeet[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [selectedMatch, setSelectedMatch] = useState<RoommateMatch | null>(null);
  const [isCompOpen, setIsCompOpen] = useState(false);
  const [isSafeMeetOpen, setIsSafeMeetOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isUpiOpen, setIsUpiOpen] = useState(false);

  // Saved listings / Recommended verified rooms
  const recommendedRooms = [
    {
      id: 301,
      title: "HSR Layout Sector 2 - Skyline Green 3BHK",
      room_type: "Private Master Bedroom with Balcony",
      rent: 18000,
      deposit: 50000,
      city: "Bengaluru",
      neighborhood: "HSR Layout Sector 2",
      flatmate_name: "Arjun Mehta",
      compatibility: 96,
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
      status: "Application Pending"
    },
    {
      id: 302,
      title: "Koramangala 4th Block - Prestige Oasis",
      room_type: "Attached Bedroom with Bath",
      rent: 21000,
      deposit: 60000,
      city: "Bengaluru",
      neighborhood: "Koramangala",
      flatmate_name: "Ananya Sharma",
      compatibility: 92,
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80",
      status: "Saved Listing"
    }
  ];

  const fetchTenantData = async () => {
    try {
      const [sumData, matchData, meetsData] = await Promise.all([
        api.getDashboardSummary(),
        api.exploreRoommates({}),
        api.getSafeMeets(),
      ]);
      setSummary(sumData);
      setTopMatches(matchData.slice(0, 3));
      setSafeMeets(meetsData);
    } catch (e) {
      console.error("Error fetching tenant dashboard data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantData();
  }, []);

  const handleOpenComp = (match: RoommateMatch) => {
    setSelectedMatch(match);
    setIsCompOpen(true);
  };

  const handleOpenSafeMeet = (match: RoommateMatch) => {
    setSelectedMatch(match);
    setIsSafeMeetOpen(true);
  };

  // Calculate profile completion score
  let profileScore = 40;
  if (profile?.bio) profileScore += 15;
  if (profile?.avatar_url) profileScore += 10;
  if (verification?.aadhaar_verified) profileScore += 20;
  if (verification?.work_email_verified) profileScore += 15;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#1E283A]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F59B]/20 to-[#00F59B]/5 border border-[#00F59B]/40 flex items-center justify-center text-[#00F59B] shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#F5F7FA] flex items-center gap-2">
                Welcome back, {user?.full_name?.split(' ')[0] || 'Room Seeker'}!
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00F59B]/15 text-[#00F59B] border border-[#00F59B]/30 uppercase">
                  Room Seeker
                </span>
              </h1>
              <p className="text-xs text-[#929BAA] font-mono mt-0.5">
                Targeting {profile?.neighborhood || 'HSR Layout'}, {profile?.city || 'Bengaluru'} • Budget: ₹{profile?.budget_min?.toLocaleString('en-IN') || '15,000'} - ₹{profile?.budget_max?.toLocaleString('en-IN') || '25,000'}/mo
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate?.('profile')}
            className="flex items-center gap-2 text-xs"
          >
            Edit Preferences
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate?.('explore')}
            className="flex items-center gap-2 text-xs"
          >
            <Search className="w-3.5 h-3.5" />
            Explore Roommates
          </Button>
        </div>
      </div>

      {/* KPI & Status Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Profile Completion Gauge */}
        <Card variant="glass" className="p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#929BAA] mb-1">
              <span>Profile Health</span>
              <ShieldCheck className="w-4 h-4 text-[#00F59B]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#F5F7FA] font-mono">{profileScore}%</span>
              <span className="text-[11px] text-[#00F59B] font-mono">
                {profileScore >= 90 ? 'All Set' : 'Action Needed'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#1E283A] rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00F59B] to-[#00F0FF] rounded-full transition-all"
                style={{ width: `${profileScore}%` }}
              ></div>
            </div>
          </div>
          <p className="text-[10px] text-[#929BAA] mt-2 font-mono">
            {verification?.aadhaar_verified ? 'Aadhaar Verified' : 'Complete Aadhaar for 100% trust'}
          </p>
        </Card>

        {/* AI Matches */}
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between text-xs text-[#929BAA] mb-1">
            <span>High Compatibility Matches</span>
            <Sparkles className="w-4 h-4 text-[#00F0FF]" />
          </div>
          <div className="text-2xl font-black text-[#00F0FF] font-mono">
            {topMatches.length > 0 ? `${topMatches[0]?.compatibility?.overall_score || 94}% Peak` : '94%'}
          </div>
          <div className="text-[10px] text-[#929BAA] mt-1 font-mono">
            {topMatches.length} Compatible Techies in {profile?.city || 'Bengaluru'}
          </div>
        </Card>

        {/* SafeMeets Scheduled */}
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between text-xs text-[#929BAA] mb-1">
            <span>SafeMeets Booked</span>
            <Coffee className="w-4 h-4 text-[#FFD600]" />
          </div>
          <div className="text-2xl font-black text-[#FFD600] font-mono">
            {safeMeets.length}
          </div>
          <div className="text-[10px] text-[#929BAA] mt-1 font-mono">
            Verified Cafe Coffee Meetups
          </div>
        </Card>

        {/* Monthly Expense Share */}
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between text-xs text-[#929BAA] mb-1">
            <span>Monthly Rent Share</span>
            <IndianRupee className="w-4 h-4 text-[#00F59B]" />
          </div>
          <div className="text-2xl font-black text-[#F5F7FA] font-mono">
            ₹{summary?.monthly_rent_share?.toLocaleString('en-IN') || '18,000'}
          </div>
          <div className="text-[10px] text-[#929BAA] mt-1 font-mono">
            Next rent cycle: 5th Dec
          </div>
        </Card>

      </div>

      {/* Main Grid: Recommended Roommates & Saved Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: AI Roommate Matches Feed */}
        <div className="lg:col-span-2 space-y-6">
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#F5F7FA] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00F59B]" />
                Top AI Compatible Roommate Recommendations
              </h2>
              <button
                onClick={() => onNavigate?.('explore')}
                className="text-xs font-mono text-[#00F59B] hover:underline"
              >
                Explore All Matches →
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
                  No matching roommates found. Try expanding your budget filters.
                </div>
              )}
            </div>
          </div>

          {/* Recommended Verified Rooms & Flats */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#F5F7FA] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00F0FF]" />
                Saved & Recommended Rooms in {profile?.city || 'Bengaluru'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedRooms.map((room) => (
                <Card key={room.id} variant="glass" className="overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative h-36 w-full overflow-hidden">
                      <img
                        src={room.image}
                        alt={room.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#00F59B]/90 text-[#06080D]">
                          {room.status}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-[#06080D]/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-[#1E283A] text-xs font-bold text-[#00F59B] font-mono">
                        ₹{room.rent.toLocaleString('en-IN')}/mo
                      </div>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <h4 className="text-xs font-bold text-[#F5F7FA] line-clamp-1">{room.title}</h4>
                      <p className="text-[11px] text-[#929BAA] line-clamp-1">{room.room_type}</p>
                      <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-[#1E283A] text-[#5F697A]">
                        <span>With {room.flatmate_name}</span>
                        <span className="text-[#00F59B] font-bold">{room.compatibility}% Match</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => onNavigate?.('messages')}
                    >
                      Chat with Flatmate
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

        </div>

        {/* Right Col: SafeMeet Appointments & Verification Trust */}
        <div className="space-y-6">
          
          {/* SafeMeets Schedule */}
          <Card variant="glass" className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
                <Coffee className="w-4 h-4 text-[#FFD600]" />
                Upcoming SafeMeets
              </h3>
              <Badge variant="warning">
                {safeMeets.length} Confirmed
              </Badge>
            </div>
            <p className="text-xs text-[#929BAA] mb-3">
              Always meet at verified partner cafes before transferring security deposits.
            </p>

            <div className="space-y-3">
              {safeMeets.map((meet) => (
                <div key={meet.id} className="p-3 rounded-xl bg-[#06080D]/60 border border-[#1E283A] text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F5F7FA]">{meet.cafe_name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00F59B]/10 text-[#00F59B]">
                      {meet.status}
                    </span>
                  </div>
                  <div className="text-[#929BAA] flex items-center gap-1 text-[11px]">
                    <MapPin className="w-3 h-3 text-[#00F0FF]" />
                    {meet.location_address}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-[#5F697A] pt-1 border-t border-[#1E283A]/60">
                    <span>📅 {meet.meetup_date}</span>
                    <span>⏰ {meet.meetup_time}</span>
                  </div>
                </div>
              ))}

              {safeMeets.length === 0 && (
                <div className="text-xs text-[#929BAA] text-center py-4">
                  No meetups scheduled yet. Find a match and click "SafeMeet"!
                </div>
              )}
            </div>
          </Card>

          {/* Verification Badge Assurance */}
          <Card variant="glass" className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#00F59B]/10 border border-[#00F59B]/30 flex items-center justify-center text-[#00F59B]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F5F7FA]">Your Trust & Safety Score</h4>
                <p className="text-[11px] text-[#00F59B] font-mono font-bold">
                  {verification?.trust_score || 95}/100 • Highly Trusted
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#1E283A]">
                <span className="text-[#929BAA]">Aadhaar Masked ID</span>
                <span className="font-mono text-[#00F59B]">
                  {verification?.aadhaar_verified ? 'Verified (Internal Review)' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1E283A]">
                <span className="text-[#929BAA]">PAN Verification</span>
                <span className="font-mono text-[#00F59B]">
                  {verification?.pan_verified ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#929BAA]">Work Email Domain</span>
                <span className="font-mono text-[#00F0FF]">
                  {verification?.work_email_verified ? 'Verified Domain' : 'Optional'}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs mt-3"
              onClick={() => onNavigate?.('safety')}
            >
              Open Trust & Safety Center
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
              await fetchTenantData();
            }}
          />
        </>
      )}

    </div>
  );
};
