import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  Users, 
  Building2, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ShieldAlert,
  IndianRupee,
  MapPin,
  Utensils,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: () => void;
  onNavigateHome: () => void;
}

export type UserRole = 'tenant' | 'landlord' | 'flat_owner';

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
  onNavigateHome
}) => {
  const { register, refreshProfile, isLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Personal Details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Role Selection
  const [selectedRole, setSelectedRole] = useState<UserRole>('tenant');

  // Step 3: Role-specific onboarding fields
  const [city, setCity] = useState('Bengaluru');
  const [locality, setLocality] = useState('HSR Layout Sector 2');
  // Tenant fields
  const [budgetMin, setBudgetMin] = useState(15000);
  const [budgetMax, setBudgetMax] = useState(25000);
  const [dietaryPref, setDietaryPref] = useState('Pure Veg');
  const [sleepSchedule, setSleepSchedule] = useState('Normal (8 AM - 12 AM)');
  // Landlord fields
  const [propertyConfig, setPropertyConfig] = useState('3 BHK Apartment');
  const [expectedRent, setExpectedRent] = useState(48000);
  const [securityDeposit, setSecurityDeposit] = useState(150000);
  // Flat Owner fields
  const [roomLabel, setRoomLabel] = useState('Master Bedroom with Balcony');
  const [vacantRoomRent, setVacantRoomRent] = useState(18000);

  const validateStep1 = (): boolean => {
    setError(null);
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleStep2Next = () => {
    setCurrentStep(3);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // 1. Register with backend API with mapped role
      const backendRole = selectedRole === 'landlord' ? 'property_owner' : selectedRole;
      await register(email.trim(), password, fullName.trim(), phone.trim() || undefined, backendRole);

      // 2. Prepare profile updates based on selected role
      const housingStatus = selectedRole === 'tenant' 
        ? 'Need Flat & Roommate' 
        : selectedRole === 'flat_owner' 
        ? 'Has Flat / Has Room' 
        : 'Property Owner / Listing';

      const profilePayload: Record<string, any> = {
        city,
        neighborhood: locality,
        housing_status: housingStatus,
      };

      if (selectedRole === 'tenant') {
        profilePayload.budget_min = Number(budgetMin);
        profilePayload.budget_max = Number(budgetMax);
        profilePayload.dietary_pref = dietaryPref;
        profilePayload.sleep_schedule = sleepSchedule;
        profilePayload.bio = `Hi! I'm ${fullName.split(' ')[0]}. Looking for a great flat and like-minded flatmates in ${locality}, ${city}.`;
      } else if (selectedRole === 'landlord') {
        profilePayload.budget_min = Number(expectedRent);
        profilePayload.budget_max = Number(expectedRent);
        profilePayload.bio = `Property Owner leasing a verified ${propertyConfig} in ${locality}, ${city}. Rent: ₹${expectedRent.toLocaleString('en-IN')}/mo.`;
      } else if (selectedRole === 'flat_owner') {
        profilePayload.budget_min = Number(vacantRoomRent);
        profilePayload.budget_max = Number(vacantRoomRent);
        profilePayload.dietary_pref = dietaryPref;
        profilePayload.bio = `Existing primary flatmate in ${locality}. Looking to fill the ${roomLabel} at ₹${vacantRoomRent.toLocaleString('en-IN')}/mo.`;
      }

      // Update backend profile
      await api.updateMyProfile(profilePayload);
      await refreshProfile();

      // Store role preference locally for UI state
      localStorage.setItem('roomsync_user_role', selectedRole);

      onRegisterSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your network and details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-[#00F59B]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-[#00F0FF]/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-xl"
      >
        <div className="p-8 sm:p-10 rounded-3xl bg-[#111722]/90 border border-[#1E283A] shadow-2xl backdrop-blur-xl space-y-6">
          
          {/* Brand Header */}
          <div className="text-center space-y-1">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 p-2 rounded-2xl bg-[#161F2E] border border-[#00F59B]/30 text-[#00F59B] mb-2 shadow-neon-green/10 shadow-lg hover:border-[#00F59B] transition-colors"
            >
              <Zap className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-black text-[#F5F7FA] tracking-tight">
              Create Your RoomSync Account
            </h1>
            <p className="text-xs text-[#929BAA]">
              Join India's AI co-living network across Bengaluru, Mumbai, Gurgaon, and Hyderabad.
            </p>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-between max-w-sm mx-auto pt-2">
            {[
              { num: 1, label: 'Credentials' },
              { num: 2, label: 'Role' },
              { num: 3, label: 'Onboarding' }
            ].map((step, idx) => {
              const isPassed = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <React.Fragment key={step.num}>
                  <div className="flex flex-col items-center gap-1">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                        isPassed 
                          ? 'bg-[#00F59B] text-[#06080D]' 
                          : isCurrent 
                          ? 'bg-[#00F59B]/10 text-[#00F59B] border-2 border-[#00F59B]' 
                          : 'bg-[#161F2E] text-[#5F697A] border border-[#1E283A]'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                    </div>
                    <span className={`text-[10px] font-mono tracking-wider ${isCurrent ? 'text-[#00F59B] font-bold' : 'text-[#5F697A]'}`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div className={`flex-1 h-[2px] mx-2 -mt-4 transition-colors ${currentStep > idx + 1 ? 'bg-[#00F59B]' : 'bg-[#1E283A]'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 1: Personal Details */}
          {currentStep === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleStep1Next}
              className="space-y-4"
            >
              <Input
                label="Full Name"
                placeholder="e.g. Aarav Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Mobile Number (Optional)"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  isPassword
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Confirm Password"
                  isPassword
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="mt-2"
              >
                Proceed to Role Selection
              </Button>
            </motion.form>
          )}

          {/* STEP 2: Role Selection */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <div className="text-left">
                <h3 className="text-sm font-bold text-[#F5F7FA]">
                  How will you be using RoomSync AI?
                </h3>
                <p className="text-xs text-[#929BAA] mt-0.5">
                  Choose your primary persona to configure your specialized dashboard experience.
                </p>
              </div>

              {/* 3 Role Selection Cards */}
              <div className="space-y-3">
                
                {/* 1. Tenant / Room Seeker */}
                <div
                  onClick={() => setSelectedRole('tenant')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    selectedRole === 'tenant'
                      ? 'bg-[#161F2E] border-[#00F59B] shadow-card-glow'
                      : 'bg-[#111722] border-[#1E283A] hover:border-[#2E3D56]'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${selectedRole === 'tenant' ? 'bg-[#00F59B]/15 text-[#00F59B]' : 'bg-[#161F2E] text-[#929BAA]'}`}>
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#F5F7FA]">Tenant / Room Seeker</h4>
                      {selectedRole === 'tenant' && <CheckCircle2 className="w-4 h-4 text-[#00F59B]" />}
                    </div>
                    <p className="text-[11px] text-[#929BAA] mt-1 leading-relaxed">
                      I want to discover compatible roommates, explore vacant rooms in 2BHK/3BHK flats, and split rent fairly via UPI.
                    </p>
                  </div>
                </div>

                {/* 2. Property Owner / Landlord */}
                <div
                  onClick={() => setSelectedRole('landlord')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    selectedRole === 'landlord'
                      ? 'bg-[#161F2E] border-[#00F0FF] shadow-card-glow-cyan'
                      : 'bg-[#111722] border-[#1E283A] hover:border-[#2E3D56]'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${selectedRole === 'landlord' ? 'bg-[#00F0FF]/15 text-[#00F0FF]' : 'bg-[#161F2E] text-[#929BAA]'}`}>
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#F5F7FA]">Property Owner / Landlord</h4>
                      {selectedRole === 'landlord' && <CheckCircle2 className="w-4 h-4 text-[#00F0FF]" />}
                    </div>
                    <p className="text-[11px] text-[#929BAA] mt-1 leading-relaxed">
                      I own a rental property/flat and want to list vacant units, screen verified working professionals, and manage tenants.
                    </p>
                  </div>
                </div>

                {/* 3. Existing Flat Owner / Primary Tenant */}
                <div
                  onClick={() => setSelectedRole('flat_owner')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    selectedRole === 'flat_owner'
                      ? 'bg-[#161F2E] border-[#FFD600] shadow-[0_0_20px_-3px_rgba(255,214,0,0.35)]'
                      : 'bg-[#111722] border-[#1E283A] hover:border-[#2E3D56]'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${selectedRole === 'flat_owner' ? 'bg-[#FFD600]/15 text-[#FFD600]' : 'bg-[#161F2E] text-[#929BAA]'}`}>
                    <Key className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#F5F7FA]">Existing Flat Owner / Primary Tenant</h4>
                      {selectedRole === 'flat_owner' && <CheckCircle2 className="w-4 h-4 text-[#FFD600]" />}
                    </div>
                    <p className="text-[11px] text-[#929BAA] mt-1 leading-relaxed">
                      I have an existing rental apartment with a vacant bedroom and need a compatible flatmate to replace an outgoing roommate.
                    </p>
                  </div>
                </div>

              </div>

              {/* Security Admin Note */}
              <div className="p-3 rounded-xl bg-[#06080D] border border-[#1E283A] flex items-center gap-2 text-[10px] text-[#5F697A] font-mono">
                <ShieldAlert className="w-3.5 h-3.5 text-[#929BAA] flex-shrink-0" />
                <span>Administrator accounts require authorized enterprise verification and cannot be self-registered.</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="surface"
                  size="lg"
                  onClick={() => setCurrentStep(1)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleStep2Next}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Configure Onboarding
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Role-Specific Onboarding */}
          {currentStep === 3 && (
            <motion.form
              key="step3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleFinalSubmit}
              className="space-y-4"
            >
              <div className="text-left pb-1 border-b border-[#1E283A]">
                <h3 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00F59B]" />
                  <span>
                    {selectedRole === 'tenant' && 'Room Seeker Preferences'}
                    {selectedRole === 'landlord' && 'Property Listing Details'}
                    {selectedRole === 'flat_owner' && 'Flat & Replacement Room Details'}
                  </span>
                </h3>
                <p className="text-xs text-[#929BAA] mt-0.5">
                  These details will initialize your profile and recommendation feed.
                </p>
              </div>

              {/* Common Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#929BAA] mb-1.5">
                    Target City
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full py-2.5 px-3.5 rounded-xl text-xs bg-[#111722] text-[#F5F7FA] border border-[#1E283A] focus:border-[#00F59B] focus:outline-none"
                  >
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Gurgaon">Gurgaon / NCR</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                  </select>
                </div>

                <Input
                  label="Locality / Neighborhood"
                  placeholder="e.g. HSR Sector 2, Koramangala"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  leftIcon={<MapPin className="w-4 h-4" />}
                  required
                />
              </div>

              {/* Conditional: Tenant Fields */}
              {selectedRole === 'tenant' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Min Budget (₹/mo)"
                      type="number"
                      step="1000"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(Number(e.target.value))}
                      leftIcon={<IndianRupee className="w-4 h-4" />}
                      required
                    />
                    <Input
                      label="Max Budget (₹/mo)"
                      type="number"
                      step="1000"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(Number(e.target.value))}
                      leftIcon={<IndianRupee className="w-4 h-4" />}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#929BAA] mb-1.5">
                        Dietary Habit
                      </label>
                      <select
                        value={dietaryPref}
                        onChange={(e) => setDietaryPref(e.target.value)}
                        className="w-full py-2.5 px-3.5 rounded-xl text-xs bg-[#111722] text-[#F5F7FA] border border-[#1E283A] focus:border-[#00F59B] focus:outline-none"
                      >
                        <option value="Pure Veg">Pure Veg Only</option>
                        <option value="Eggetarian">Eggetarian</option>
                        <option value="Non-Veg">Non-Veg</option>
                        <option value="Jain">Jain Diet</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#929BAA] mb-1.5">
                        Sleep Routine
                      </label>
                      <select
                        value={sleepSchedule}
                        onChange={(e) => setSleepSchedule(e.target.value)}
                        className="w-full py-2.5 px-3.5 rounded-xl text-xs bg-[#111722] text-[#F5F7FA] border border-[#1E283A] focus:border-[#00F59B] focus:outline-none"
                      >
                        <option value="Normal (8 AM - 12 AM)">Normal (8 AM - 12 AM)</option>
                        <option value="Early Bird (6 AM - 10 PM)">Early Bird (6 AM - 10 PM)</option>
                        <option value="Night Owl (2 PM - 3 AM)">Night Owl / US Shift</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Conditional: Landlord Fields */}
              {selectedRole === 'landlord' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#929BAA] mb-1.5">
                        Property Configuration
                      </label>
                      <select
                        value={propertyConfig}
                        onChange={(e) => setPropertyConfig(e.target.value)}
                        className="w-full py-2.5 px-3.5 rounded-xl text-xs bg-[#111722] text-[#F5F7FA] border border-[#1E283A] focus:border-[#00F0FF] focus:outline-none"
                      >
                        <option value="1 BHK Apartment">1 BHK Apartment</option>
                        <option value="2 BHK Apartment">2 BHK Apartment</option>
                        <option value="3 BHK Apartment">3 BHK Apartment</option>
                        <option value="4 BHK Luxury Flat">4 BHK Luxury Flat</option>
                        <option value="Independent House / Villa">Independent Villa</option>
                      </select>
                    </div>

                    <Input
                      label="Monthly Rent (₹)"
                      type="number"
                      step="1000"
                      value={expectedRent}
                      onChange={(e) => setExpectedRent(Number(e.target.value))}
                      leftIcon={<IndianRupee className="w-4 h-4" />}
                      required
                    />
                  </div>

                  <Input
                    label="Security Deposit (₹)"
                    type="number"
                    step="5000"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                    leftIcon={<IndianRupee className="w-4 h-4" />}
                    required
                  />
                </>
              )}

              {/* Conditional: Flat Owner Fields */}
              {selectedRole === 'flat_owner' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Vacant Room Description"
                      placeholder="e.g. Master Bedroom with Balcony"
                      value={roomLabel}
                      onChange={(e) => setRoomLabel(e.target.value)}
                      required
                    />

                    <Input
                      label="Vacant Room Rent (₹/mo)"
                      type="number"
                      step="500"
                      value={vacantRoomRent}
                      onChange={(e) => setVacantRoomRent(Number(e.target.value))}
                      leftIcon={<IndianRupee className="w-4 h-4" />}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#929BAA] mb-1.5">
                      Required Flatmate Dietary Preference
                    </label>
                    <select
                      value={dietaryPref}
                      onChange={(e) => setDietaryPref(e.target.value)}
                      className="w-full py-2.5 px-3.5 rounded-xl text-xs bg-[#111722] text-[#F5F7FA] border border-[#1E283A] focus:border-[#FFD600] focus:outline-none"
                    >
                      <option value="Any Food Habit">Any Food Habit (Open minded)</option>
                      <option value="Pure Veg">Pure Vegetarian Only</option>
                      <option value="Eggetarian">Eggetarian</option>
                      <option value="Non-Veg">Non-Veg Friendly</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="surface"
                  size="lg"
                  onClick={() => setCurrentStep(2)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isSubmitting || isLoading}
                  rightIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Complete Registration & Launch
                </Button>
              </div>
            </motion.form>
          )}

          {/* Switch to Sign In */}
          <div className="pt-4 border-t border-[#1E283A] text-center text-xs text-[#929BAA]">
            <span>Already have an account? </span>
            <button
              onClick={onNavigateToLogin}
              className="font-bold text-[#00F59B] hover:underline ml-1"
            >
              Sign In →
            </button>
          </div>

        </div>
      </motion.div>

    </div>
  );
};
