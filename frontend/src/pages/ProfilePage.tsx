import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  IndianRupee, 
  Briefcase, 
  Utensils, 
  Moon, 
  Coffee, 
  Sparkles, 
  Save, 
  CheckCircle2,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Profile } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, profile, refreshProfile, verification } = useAuth();
  
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleChange = (field: keyof Profile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateMyProfile(formData);
      await refreshProfile();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/30 text-xs font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI MATCHING MATRIX CONFIGURATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            My Co-Living Profile & Preferences
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            These preferences power your compatibility score calculation across Bangalore, Mumbai, and Gurgaon.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Preferences Updated! AI matches refreshed.</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Personal Details & Location Card */}
        <div className="p-6 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl space-y-5">
          <h3 className="text-sm font-mono uppercase tracking-wider text-neon-green flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>1. Identity, Career & Location</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Occupation / Role</label>
              <input
                type="text"
                value={formData.occupation || ''}
                onChange={(e) => handleChange('occupation', e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white focus:outline-none focus:border-neon-green"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Company / Organization</label>
              <input
                type="text"
                value={formData.company || ''}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="e.g. Swiggy, Razorpay, Google"
                className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white focus:outline-none focus:border-neon-green"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Target City</label>
              <select
                value={formData.city || 'Bengaluru'}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white focus:outline-none focus:border-neon-cyan"
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Gurgaon">Gurgaon / NCR</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Target Neighborhood / Hub</label>
              <input
                type="text"
                value={formData.neighborhood || ''}
                onChange={(e) => handleChange('neighborhood', e.target.value)}
                placeholder="e.g. HSR Layout, Koramangala, Indiranagar"
                className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white focus:outline-none focus:border-neon-cyan"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">About Me / Bio</label>
            <textarea
              rows={3}
              value={formData.bio || ''}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Tell potential flatmates about your work, interests, and how you like to spend your time at home..."
              className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-green"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">UPI ID for Rent Reimbursements</label>
            <input
              type="text"
              value={formData.upi_id || ''}
              onChange={(e) => handleChange('upi_id', e.target.value)}
              placeholder="e.g. arjun.mehta@oksbi"
              className="w-full sm:w-1/2 px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-neon-green"
            />
          </div>
        </div>

        {/* Budget & Housing Status Card */}
        <div className="p-6 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl space-y-5">
          <h3 className="text-sm font-mono uppercase tracking-wider text-neon-cyan flex items-center gap-2">
            <IndianRupee className="w-4 h-4" />
            <span>2. Rental Budget & Housing Intent</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Min Budget (₹/mo)</label>
              <input
                type="number"
                step="1000"
                value={formData.budget_min || 15000}
                onChange={(e) => handleChange('budget_min', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-neon-cyan"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Max Budget (₹/mo)</label>
              <input
                type="number"
                step="1000"
                value={formData.budget_max || 25000}
                onChange={(e) => handleChange('budget_max', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-neon-cyan"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Housing Status</label>
              <select
                value={formData.housing_status || 'Need Flat & Roommate'}
                onChange={(e) => handleChange('housing_status', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white focus:outline-none focus:border-neon-cyan"
              >
                <option value="Has Flat / Has Room">Has Flat / Looking for Roommate</option>
                <option value="Need Flat & Roommate">Looking for Flat & Flatmates together</option>
              </select>
            </div>
          </div>
        </div>

        {/* Indian Lifestyle Matrix Card */}
        <div className="p-6 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl space-y-5">
          <h3 className="text-sm font-mono uppercase tracking-wider text-neon-yellow flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>3. Indian Co-Living Lifestyle Preferences</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Dietary Preference */}
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Dietary Habit</label>
              <select
                value={formData.dietary_pref || 'Pure Veg'}
                onChange={(e) => handleChange('dietary_pref', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white focus:outline-none focus:border-neon-yellow"
              >
                <option value="Pure Veg">Pure Veg Only</option>
                <option value="Eggetarian">Eggetarian</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Jain">Jain Diet</option>
                <option value="Vegan">Vegan</option>
              </select>
            </div>

            {/* Non-veg Cooking Allowed */}
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Non-Veg Cooking in Flat</label>
              <select
                value={formData.non_veg_cooking_allowed || 'Yes'}
                onChange={(e) => handleChange('non_veg_cooking_allowed', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white focus:outline-none focus:border-neon-yellow"
              >
                <option value="Yes">Allowed in Kitchen</option>
                <option value="Outside only">Outside Orders Only (No Cooking)</option>
                <option value="No">Strictly Vegetarian Kitchen</option>
              </select>
            </div>

            {/* Sleep Schedule */}
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Sleep Schedule</label>
              <select
                value={formData.sleep_schedule || 'Normal (8 AM - 12 AM)'}
                onChange={(e) => handleChange('sleep_schedule', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white focus:outline-none focus:border-neon-yellow"
              >
                <option value="Early Bird (6 AM - 10 PM)">Early Bird (6 AM - 10 PM)</option>
                <option value="Normal (8 AM - 12 AM)">Normal (8 AM - 12 AM)</option>
                <option value="Night Owl (2 PM - 3 AM)">Night Owl / US Shift (2 PM - 3 AM)</option>
              </select>
            </div>

            {/* Cleanliness Rating */}
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                Cleanliness Standard: {formData.cleanliness || 4}/5★
              </label>
              <select
                value={formData.cleanliness || 4}
                onChange={(e) => handleChange('cleanliness', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white focus:outline-none focus:border-neon-yellow"
              >
                <option value={5}>5★ - Extremely Neat / Strict Hygiene</option>
                <option value={4}>4★ - Tidy & Organized</option>
                <option value={3}>3★ - Moderate / Relaxed</option>
              </select>
            </div>

            {/* Smoking Policy */}
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Smoking Habit</label>
              <select
                value={formData.smoking || 'Never'}
                onChange={(e) => handleChange('smoking', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white focus:outline-none focus:border-neon-yellow"
              >
                <option value="Never">Never Smoke</option>
                <option value="Balcony Only">Balcony Only</option>
                <option value="Socially">Socially</option>
                <option value="Regularly">Regularly</option>
              </select>
            </div>

            {/* Drinking */}
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Drinking</label>
              <select
                value={formData.drinking || 'Socially'}
                onChange={(e) => handleChange('drinking', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white focus:outline-none focus:border-neon-yellow"
              >
                <option value="Never">Never</option>
                <option value="Socially">Socially on Weekends</option>
                <option value="Regularly">Regularly</option>
              </select>
            </div>

            {/* WFH Status */}
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Work From Home Rhythm</label>
              <select
                value={formData.wfh_status || 'Hybrid'}
                onChange={(e) => handleChange('wfh_status', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white focus:outline-none focus:border-neon-yellow"
              >
                <option value="Hybrid">Hybrid (2-3 days office)</option>
                <option value="Full Remote">Full Remote from Flat</option>
                <option value="Office (5 Days)">Office 5 Days a week</option>
              </select>
            </div>

            {/* Maid & Cook */}
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Cook & Maid Preference</label>
              <select
                value={formData.cook_maid_pref || 'Wants Cook & Maid'}
                onChange={(e) => handleChange('cook_maid_pref', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white focus:outline-none focus:border-neon-yellow"
              >
                <option value="Wants Cook & Maid">Wants Daily Cook & Maid</option>
                <option value="Only Maid">Only Maid (Cooks own food)</option>
                <option value="Cook Own Meals">No Cook / Independent</option>
              </select>
            </div>

            {/* Guest Policy */}
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Guest & Visitor Policy</label>
              <select
                value={formData.guest_policy || 'Weekend Guests Allowed'}
                onChange={(e) => handleChange('guest_policy', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white focus:outline-none focus:border-neon-yellow"
              >
                <option value="Weekend Guests Allowed">Weekend Friends & Guests Allowed</option>
                <option value="Day Guests Only">Day Guests Only (No Overnights)</option>
                <option value="No Guests">Strictly Quiet / No Outside Guests</option>
                <option value="Very Flexible">Very Social & Party Friendly</option>
              </select>
            </div>

          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 rounded-2xl text-xs font-bold text-black bg-neon-green hover:bg-[#05ffa1] shadow-neon-green/30 shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Recalculating AI Matches...' : 'Save & Update Compatibility Matrix'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
