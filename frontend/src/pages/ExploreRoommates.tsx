import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Sparkles, 
  Filter, 
  MapPin, 
  Search, 
  SlidersHorizontal,
  Coffee,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { RoommateMatch } from '../types';
import { RoommateCard } from '../components/matching/RoommateCard';
import { MatchFilters } from '../components/matching/MatchFilters';
import { CompatibilityModal } from '../components/matching/CompatibilityModal';
import { SafeMeetModal } from '../components/verification/SafeMeetModal';

interface ExploreRoommatesProps {
  onOpenChatWith: (match: RoommateMatch) => void;
}

export const ExploreRoommates: React.FC<ExploreRoommatesProps> = ({ onOpenChatWith }) => {
  const [matches, setMatches] = useState<RoommateMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState({
    city: '',
    neighborhood: '',
    max_budget: '',
    dietary_pref: '',
    smoking: '',
    sleep_schedule: '',
    min_cleanliness: '',
    search: ''
  });

  // Modals state
  const [selectedMatch, setSelectedMatch] = useState<RoommateMatch | null>(null);
  const [isCompOpen, setIsCompOpen] = useState(false);
  const [isSafeMeetOpen, setIsSafeMeetOpen] = useState(false);

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const queryParams: Record<string, any> = {};
      if (filters.city) queryParams.city = filters.city;
      if (filters.max_budget) queryParams.max_budget = Number(filters.max_budget);
      if (filters.dietary_pref) queryParams.dietary_pref = filters.dietary_pref;
      if (filters.sleep_schedule) queryParams.sleep_schedule = filters.sleep_schedule;
      if (filters.min_cleanliness) queryParams.min_cleanliness = Number(filters.min_cleanliness);

      const data: RoommateMatch[] = await api.exploreRoommates(queryParams);
      
      // Client-side text search (for neighborhood, company, bio, name)
      let filtered = data;
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(m => 
          m.full_name.toLowerCase().includes(q) ||
          (m.profile.company && m.profile.company.toLowerCase().includes(q)) ||
          (m.profile.neighborhood && m.profile.neighborhood.toLowerCase().includes(q)) ||
          (m.profile.bio && m.profile.bio.toLowerCase().includes(q))
        );
      }

      setMatches(filtered);
    } catch (e) {
      console.error("Error exploring roommates:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [filters.city, filters.max_budget, filters.dietary_pref, filters.sleep_schedule, filters.min_cleanliness, filters.search]);

  const handleResetFilters = () => {
    setFilters({
      city: '',
      neighborhood: '',
      max_budget: '',
      dietary_pref: '',
      smoking: '',
      sleep_schedule: '',
      min_cleanliness: '',
      search: ''
    });
  };

  const handleScheduleSafeMeet = async (meetData: any) => {
    await api.scheduleSafeMeet(meetData);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/30 text-xs font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI COMPATIBILITY MATRIX ACTIVE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Explore Compatible Flatmates
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Filtered by budget alignment, dietary choices (veg/non-veg), sleep schedules, and cleanliness in Indian tech hubs.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono text-slate-400 block">
            {isLoading ? 'Scanning candidates...' : `Found ${matches.length} Verified Profiles`}
          </span>
          <span className="text-[10px] text-neon-cyan font-mono">
            Sorted by highest AI synergy
          </span>
        </div>
      </div>

      {/* Filter Bar Component */}
      <MatchFilters
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
      />

      {/* Roommates Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-neon-green border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Evaluating multidimensional lifestyle compatibility...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="py-16 text-center bg-dark-900 border border-slate-800 rounded-2xl p-8 space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No exact match with current filters</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try broadening your budget range, selecting "All Diets", or resetting the filter options.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-neon-green hover:bg-[#05ffa1] transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <RoommateCard
              key={match.user_id}
              match={match}
              onViewBreakdown={(m) => {
                setSelectedMatch(m);
                setIsCompOpen(true);
              }}
              onStartChat={(m) => onOpenChatWith(m)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CompatibilityModal
        isOpen={isCompOpen}
        onClose={() => setIsCompOpen(false)}
        match={selectedMatch}
        onScheduleMeet={(m) => {
          setSelectedMatch(m);
          setIsSafeMeetOpen(true);
        }}
      />

      <SafeMeetModal
        isOpen={isSafeMeetOpen}
        onClose={() => setIsSafeMeetOpen(false)}
        targetMatch={selectedMatch}
        onConfirmSchedule={handleScheduleSafeMeet}
      />

    </div>
  );
};
