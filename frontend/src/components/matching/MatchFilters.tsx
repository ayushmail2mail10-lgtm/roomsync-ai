import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

interface FiltersState {
  city: string;
  neighborhood: string;
  max_budget: string;
  dietary_pref: string;
  smoking: string;
  sleep_schedule: string;
  min_cleanliness: string;
  search: string;
}

interface MatchFiltersProps {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  onReset: () => void;
}

export const MatchFilters: React.FC<MatchFiltersProps> = ({
  filters,
  setFilters,
  onReset
}) => {
  const cities = ['All Cities', 'Bengaluru', 'Mumbai', 'Gurgaon', 'Hyderabad', 'Pune'];
  const diets = ['All Diets', 'Pure Veg', 'Eggetarian', 'Non-Veg', 'Jain'];
  const sleepCycles = ['All Schedules', 'Early Bird', 'Normal', 'Night Owl'];

  return (
    <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl space-y-4">
      
      {/* Top Search & City Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by neighborhood (e.g. HSR, Koramangala, Powai) or company (e.g. Razorpay, Swiggy)..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-green transition-colors"
          />
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {cities.map((city) => {
            const isSelected = (city === 'All Cities' && !filters.city) || filters.city === city;
            return (
              <button
                key={city}
                onClick={() => setFilters(prev => ({ ...prev, city: city === 'All Cities' ? '' : city }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected 
                    ? 'bg-neon-green text-black font-semibold shadow-sm'
                    : 'bg-dark-850 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {city}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Filter Dropdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
        
        {/* Max Budget */}
        <div>
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            Max Monthly Budget
          </label>
          <select
            value={filters.max_budget}
            onChange={(e) => setFilters(prev => ({ ...prev, max_budget: e.target.value }))}
            className="w-full py-1.5 px-2.5 rounded-xl bg-dark-850 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-neon-cyan"
          >
            <option value="">Any Budget</option>
            <option value="15000">Up to ₹15,000</option>
            <option value="20000">Up to ₹20,000</option>
            <option value="25000">Up to ₹25,000</option>
            <option value="35000">Up to ₹35,000</option>
          </select>
        </div>

        {/* Dietary Pref */}
        <div>
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            Dietary Habit
          </label>
          <select
            value={filters.dietary_pref}
            onChange={(e) => setFilters(prev => ({ ...prev, dietary_pref: e.target.value }))}
            className="w-full py-1.5 px-2.5 rounded-xl bg-dark-850 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-neon-cyan"
          >
            <option value="">All Diets</option>
            <option value="Pure Veg">Pure Veg Only</option>
            <option value="Eggetarian">Eggetarian</option>
            <option value="Non-Veg">Non-Veg</option>
            <option value="Jain">Jain Diet</option>
          </select>
        </div>

        {/* Sleep Rhythm */}
        <div>
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            Sleep Schedule
          </label>
          <select
            value={filters.sleep_schedule}
            onChange={(e) => setFilters(prev => ({ ...prev, sleep_schedule: e.target.value }))}
            className="w-full py-1.5 px-2.5 rounded-xl bg-dark-850 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-neon-cyan"
          >
            <option value="">All Routines</option>
            <option value="Early Bird">Early Bird (6 AM - 10 PM)</option>
            <option value="Normal">Normal (8 AM - 12 AM)</option>
            <option value="Night Owl">Night Owl / US Shift</option>
          </select>
        </div>

        {/* Min Cleanliness */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Min Cleanliness
            </label>
            <select
              value={filters.min_cleanliness}
              onChange={(e) => setFilters(prev => ({ ...prev, min_cleanliness: e.target.value }))}
              className="w-full py-1.5 px-2.5 rounded-xl bg-dark-850 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-neon-cyan"
            >
              <option value="">Any</option>
              <option value="3">3★ & Above</option>
              <option value="4">4★ & Above</option>
              <option value="5">5★ Strict Neatness</option>
            </select>
          </div>

          <button
            onClick={onReset}
            className="p-2 rounded-xl bg-dark-850 hover:bg-dark-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
