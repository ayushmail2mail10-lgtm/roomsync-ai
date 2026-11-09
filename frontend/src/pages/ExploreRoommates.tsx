import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Sparkles, 
  Filter, 
  MapPin, 
  Search, 
  SlidersHorizontal,
  Coffee,
  CheckCircle2,
  Building2,
  BedDouble,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { RoommateMatch, PropertyListing, RoomListing } from '../types';
import { RoommateCard } from '../components/matching/RoommateCard';
import { MatchFilters } from '../components/matching/MatchFilters';
import { CompatibilityModal } from '../components/matching/CompatibilityModal';
import { SafeMeetModal } from '../components/verification/SafeMeetModal';
import { PropertyCard } from '../components/properties/PropertyCard';
import { PropertyDetailModal } from '../components/properties/PropertyDetailModal';
import { ApplyPropertyModal } from '../components/properties/ApplyPropertyModal';
import { Button } from '../components/common/Button';

interface ExploreRoommatesProps {
  onOpenChatWith: (match: RoommateMatch) => void;
  initialMode?: 'roommates' | 'properties';
}

export const ExploreRoommates: React.FC<ExploreRoommatesProps> = ({ 
  onOpenChatWith,
  initialMode = 'roommates'
}) => {
  const [activeMode, setActiveMode] = useState<'roommates' | 'properties'>(initialMode);

  // --- ROOMMATE MATCHING STATE ---
  const [matches, setMatches] = useState<RoommateMatch[]>([]);
  const [isMatchesLoading, setIsMatchesLoading] = useState(true);
  const [matchFilters, setMatchFilters] = useState({
    city: '',
    neighborhood: '',
    max_budget: '',
    dietary_pref: '',
    smoking: '',
    sleep_schedule: '',
    min_cleanliness: '',
    search: ''
  });

  // --- PROPERTIES DISCOVERY STATE ---
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [isPropsLoading, setIsPropsLoading] = useState(true);
  const [propFilters, setPropFilters] = useState({
    city: '',
    neighborhood: '',
    max_rent: '',
    furnishing: '',
    property_type: '',
    vacant_only: false,
    search: ''
  });

  // Modals state
  const [selectedMatch, setSelectedMatch] = useState<RoommateMatch | null>(null);
  const [isCompOpen, setIsCompOpen] = useState(false);
  const [isSafeMeetOpen, setIsSafeMeetOpen] = useState(false);

  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomListing | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  // 1. Fetch Roommates
  const fetchMatches = async () => {
    setIsMatchesLoading(true);
    try {
      const queryParams: Record<string, any> = {};
      if (matchFilters.city) queryParams.city = matchFilters.city;
      if (matchFilters.max_budget) queryParams.max_budget = Number(matchFilters.max_budget);
      if (matchFilters.dietary_pref) queryParams.dietary_pref = matchFilters.dietary_pref;
      if (matchFilters.sleep_schedule) queryParams.sleep_schedule = matchFilters.sleep_schedule;
      if (matchFilters.min_cleanliness) queryParams.min_cleanliness = Number(matchFilters.min_cleanliness);

      const data: RoommateMatch[] = await api.exploreRoommates(queryParams);
      
      let filtered = data;
      if (matchFilters.search.trim()) {
        const q = matchFilters.search.toLowerCase();
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
      setIsMatchesLoading(false);
    }
  };

  // 2. Fetch Properties
  const fetchProperties = async () => {
    setIsPropsLoading(true);
    try {
      const params: Record<string, any> = {};
      if (propFilters.city) params.city = propFilters.city;
      if (propFilters.neighborhood) params.neighborhood = propFilters.neighborhood;
      if (propFilters.max_rent) params.max_rent = Number(propFilters.max_rent);
      if (propFilters.furnishing) params.furnishing = propFilters.furnishing;
      if (propFilters.property_type) params.property_type = propFilters.property_type;
      if (propFilters.vacant_only) params.vacant_only = true;
      if (propFilters.search) params.search = propFilters.search;

      const data: PropertyListing[] = await api.getProperties(params);
      setProperties(data);
    } catch (e) {
      console.error("Error fetching properties:", e);
    } finally {
      setIsPropsLoading(false);
    }
  };

  useEffect(() => {
    if (activeMode === 'roommates') {
      fetchMatches();
    } else {
      fetchProperties();
    }
  }, [
    activeMode,
    matchFilters.city, matchFilters.max_budget, matchFilters.dietary_pref, matchFilters.sleep_schedule, matchFilters.min_cleanliness, matchFilters.search,
    propFilters.city, propFilters.neighborhood, propFilters.max_rent, propFilters.furnishing, propFilters.property_type, propFilters.vacant_only, propFilters.search
  ]);

  const handleResetMatchFilters = () => {
    setMatchFilters({
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

  const handleResetPropFilters = () => {
    setPropFilters({
      city: '',
      neighborhood: '',
      max_rent: '',
      furnishing: '',
      property_type: '',
      vacant_only: false,
      search: ''
    });
  };

  const handleScheduleSafeMeet = async (meetData: any) => {
    await api.scheduleSafeMeet(meetData);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header & Discovery Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E283A]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/30 text-xs font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI CO-LIVING & PROPERTY DISCOVERY MATRIX</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA]">
            {activeMode === 'roommates' ? 'Explore Compatible Flatmates' : 'Discover Rooms & Shared Flats'}
          </h1>
          <p className="text-xs text-[#929BAA] mt-1">
            {activeMode === 'roommates'
              ? 'Multi-factor alignment across budget, vegetarian/non-veg habits, work rhythm, and cleanliness in Indian tech hubs.'
              : 'Verified property listings, vacant master bedrooms, and shared flats across Bengaluru, Mumbai, and Gurgaon.'}
          </p>
        </div>

        {/* Mode Toggle Switcher Pill */}
        <div className="flex items-center p-1 bg-[#111722] border border-[#1E283A] rounded-2xl shrink-0 self-start md:self-auto shadow-inner">
          <button
            onClick={() => setActiveMode('roommates')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'roommates'
                ? 'bg-[#161F2E] text-[#00F59B] border border-[#00F59B]/40 shadow-sm'
                : 'text-[#929BAA] hover:text-[#F5F7FA]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Find Flatmates</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#00F59B]/15 text-[#00F59B]">AI</span>
          </button>

          <button
            onClick={() => setActiveMode('properties')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'properties'
                ? 'bg-[#161F2E] text-[#00F0FF] border border-[#00F0FF]/40 shadow-sm'
                : 'text-[#929BAA] hover:text-[#F5F7FA]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Rooms & Flats</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#00F0FF]/15 text-[#00F0FF]">Live</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. ROOMMATE MATCHING VIEW                                 */}
      {/* ========================================================= */}
      {activeMode === 'roommates' && (
        <div className="space-y-6">
          <MatchFilters
            filters={matchFilters}
            setFilters={setMatchFilters}
            onReset={handleResetMatchFilters}
          />

          {isMatchesLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#00F59B] border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-[#929BAA] font-mono">Evaluating multidimensional lifestyle compatibility...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="py-16 text-center bg-[#111722] border border-[#1E283A] rounded-2xl p-8 space-y-3">
              <Users className="w-12 h-12 text-[#5F697A] mx-auto" />
              <h3 className="text-base font-bold text-[#F5F7FA]">No exact matches with current filters</h3>
              <p className="text-xs text-[#929BAA] max-w-md mx-auto">
                Try broadening your budget range, choosing "All Diets", or clearing your filters.
              </p>
              <Button variant="primary" size="sm" onClick={handleResetMatchFilters}>
                Reset All Filters
              </Button>
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
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. PROPERTIES & VACANT ROOMS VIEW                         */}
      {/* ========================================================= */}
      {activeMode === 'properties' && (
        <div className="space-y-6">
          
          {/* Property Filter Bar */}
          <div className="p-4 rounded-2xl bg-[#111722] border border-[#1E283A] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              
              {/* City Filter */}
              <div>
                <label className="text-[10px] font-mono uppercase text-[#929BAA] block mb-1">City</label>
                <select
                  value={propFilters.city}
                  onChange={(e) => setPropFilters(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#06080D] border border-[#1E283A] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#00F0FF]"
                >
                  <option value="">All Indian Cities</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Gurgaon">Gurgaon</option>
                  <option value="Pune">Pune</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>

              {/* Max Rent Filter */}
              <div>
                <label className="text-[10px] font-mono uppercase text-[#929BAA] block mb-1">Max Rent (₹)</label>
                <select
                  value={propFilters.max_rent}
                  onChange={(e) => setPropFilters(prev => ({ ...prev, max_rent: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#06080D] border border-[#1E283A] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#00F0FF]"
                >
                  <option value="">Any Budget</option>
                  <option value="20000">Up to ₹20,000</option>
                  <option value="35000">Up to ₹35,000</option>
                  <option value="50000">Up to ₹50,000</option>
                  <option value="70000">Up to ₹70,000</option>
                </select>
              </div>

              {/* Furnishing */}
              <div>
                <label className="text-[10px] font-mono uppercase text-[#929BAA] block mb-1">Furnishing</label>
                <select
                  value={propFilters.furnishing}
                  onChange={(e) => setPropFilters(prev => ({ ...prev, furnishing: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#06080D] border border-[#1E283A] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#00F0FF]"
                >
                  <option value="">Any Furnishing</option>
                  <option value="Fully Furnished">Fully Furnished</option>
                  <option value="Semi Furnished">Semi Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>

              {/* Text Search */}
              <div className="lg:col-span-2">
                <label className="text-[10px] font-mono uppercase text-[#929BAA] block mb-1">Search Locality or Landmark</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#5F697A] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={propFilters.search}
                    onChange={(e) => setPropFilters(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="e.g. HSR Layout, ITPL, Powai, Golf Course Rd..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#06080D] border border-[#1E283A] text-xs text-[#F5F7FA] placeholder-[#5F697A] focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>
              </div>

            </div>

            {/* Bottom Row: Checkbox & Reset */}
            <div className="flex items-center justify-between pt-2 border-t border-[#1E283A]/60 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#929BAA] hover:text-[#F5F7FA]">
                <input
                  type="checkbox"
                  checked={propFilters.vacant_only}
                  onChange={(e) => setPropFilters(prev => ({ ...prev, vacant_only: e.target.checked }))}
                  className="rounded border-[#1E283A] text-[#00F0FF] focus:ring-0 bg-[#06080D]"
                />
                <span>Show vacant rooms / available flats only</span>
              </label>

              <button
                onClick={handleResetPropFilters}
                className="flex items-center gap-1 text-[11px] font-mono text-[#929BAA] hover:text-[#00F0FF] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>

          {/* Properties Grid */}
          {isPropsLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#00F0FF] border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-[#929BAA] font-mono">Fetching verified property listings and room inventory...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="py-16 text-center bg-[#111722] border border-[#1E283A] rounded-2xl p-8 space-y-3">
              <Building2 className="w-12 h-12 text-[#5F697A] mx-auto" />
              <h3 className="text-base font-bold text-[#F5F7FA]">No properties found matching criteria</h3>
              <p className="text-xs text-[#929BAA] max-w-md mx-auto">
                Try selecting "All Indian Cities", increasing your budget ceiling, or clearing the search keyword.
              </p>
              <Button variant="outline" size="sm" onClick={handleResetPropFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onViewDetails={(p) => {
                    setSelectedProperty(p);
                    setIsDetailOpen(true);
                  }}
                  onApply={(p) => {
                    setSelectedProperty(p);
                    setSelectedRoom(null);
                    setIsApplyOpen(true);
                  }}
                />
              ))}
            </div>
          )}

        </div>
      )}

      {/* --- MODALS --- */}
      {/* 1. Compatibility Modal */}
      <CompatibilityModal
        isOpen={isCompOpen}
        onClose={() => setIsCompOpen(false)}
        match={selectedMatch}
        onScheduleMeet={(m) => {
          setSelectedMatch(m);
          setIsSafeMeetOpen(true);
        }}
      />

      {/* 2. SafeMeet Modal */}
      <SafeMeetModal
        isOpen={isSafeMeetOpen}
        onClose={() => setIsSafeMeetOpen(false)}
        targetMatch={selectedMatch}
        onConfirmSchedule={handleScheduleSafeMeet}
      />

      {/* 3. Property Detail Modal */}
      <PropertyDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        property={selectedProperty}
        onApplyForProperty={(p, room) => {
          setSelectedProperty(p);
          setSelectedRoom(room || null);
          setIsApplyOpen(true);
        }}
      />

      {/* 4. Apply Property Modal */}
      <ApplyPropertyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        property={selectedProperty}
        initialRoom={selectedRoom}
        onApplicationSuccess={() => {
          fetchProperties();
        }}
      />

    </div>
  );
};
