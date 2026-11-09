import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  Receipt, 
  Coffee, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  IndianRupee, 
  Users,
  Building2,
  Key,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  Star,
  ExternalLink,
  Shield,
  FileCheck2,
  Lock,
  Compass
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';

interface LandingPageProps {
  onEnterApp: () => void;
  onExploreMatches: () => void;
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onExploreMatches,
  onNavigateToLogin,
  onNavigateToRegister
}) => {
  // Interactive compatibility simulator state
  const [diet, setDiet] = useState('Pure Veg');
  const [sleep, setSleep] = useState('Normal (8 AM - 12 AM)');
  const [clean, setClean] = useState(4);
  const [budget, setBudget] = useState(18000);

  // Compute live match score dynamically
  const calculatedScore = Math.min(
    99,
    65 + 
    (diet === 'Pure Veg' ? 14 : 9) + 
    (sleep.includes('Normal') ? 10 : 6) + 
    (clean >= 4 ? 8 : 4) +
    (budget >= 15000 && budget <= 22000 ? 5 : 2)
  );

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does the AI Compatibility Algorithm score roommates?",
      a: "Our algorithm evaluates six core Indian co-living pillars: Budget overlap (25%), Dietary harmony (20% - Pure Veg, Eggetarian, Non-Veg kitchen rules), Sleep routines (15% - Night Owl vs. Early Bird quiet hours), Cleanliness standards (15% - 1 to 5 rating & maid/cook sharing), Social and guest expectations (15%), and Locality commute proximity (10%)."
    },
    {
      q: "How does UPI Rent & Shared Utility Splitting work?",
      a: "RoomSync AI calculates fair room-by-room rent (e.g. Master Bedroom with attached washroom vs standard bedroom) and aggregates recurring expenses (BESCOM electricity, WiFi, cook salary, and Blinkit groceries). It generates NPCI-compliant UPI deep links and dynamic QR codes scanned via Google Pay, PhonePe, Paytm, or CRED with zero platform transaction fees."
    },
    {
      q: "How does Masked Aadhaar Verification protect me from rental scams?",
      a: "All verified users complete internal document review with OTP verification. In compliance with Indian data privacy best practices, your 12-digit Aadhaar number is masked (e.g., XXXXXXXX8921) and trust badges confirm authenticity without exposing private documents."
    },
    {
      q: "What is the SafeMeet Public Cafe Protocol?",
      a: "SafeMeet encourages prospective flatmates to meet in verified, crowded public third-spaces (such as Third Wave Coffee, Blue Tokai, or Starbucks in HSR Layout, Koramangala, Indiranagar, and Cyber City) before signing leases or exchanging security deposits."
    },
    {
      q: "Can property owners or existing tenants with a vacant room list here?",
      a: "Yes! During registration, you can choose 'Property Owner / Landlord' to list an entire flat or 'Existing Flat Owner / Primary Tenant' to list a vacant bedroom and find a compatible replacement roommate."
    },
    {
      q: "Is there any broker fee or hidden commission?",
      a: "Zero brokerage. RoomSync AI is built to eliminate predatory middleman fees in Indian tech hubs by connecting verified tenants, flatmates, and owners directly."
    }
  ];

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#06080D] text-[#F5F7FA] selection:bg-[#00F59B] selection:text-[#06080D]">
      
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#00F59B]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-96 right-1/4 w-[500px] h-[500px] bg-[#00F0FF]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* 1. Sub-Navbar on Landing Page */}
      <header className="sticky top-0 z-30 w-full border-b border-[#1E283A]/80 bg-[#06080D]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand */}
          <div 
            onClick={onEnterApp}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#111722] to-[#161F2E] border border-[#00F59B]/40 flex items-center justify-center shadow-neon-green/20 shadow-md group-hover:border-[#00F59B] transition-all">
              <Zap className="w-5 h-5 text-[#00F59B] group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-[#F5F7FA] flex items-center gap-1.5 leading-none">
                RoomSync <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/30">AI</span>
              </span>
              <span className="text-[9px] text-[#929BAA] block font-mono tracking-widest mt-0.5 uppercase">
                CO-LIVING INTELLIGENCE
              </span>
            </div>
          </div>

          {/* Nav Anchor Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#929BAA]">
            <button onClick={() => handleScrollTo('how-it-works')} className="hover:text-[#F5F7FA] transition-colors">
              How It Works
            </button>
            <button onClick={() => handleScrollTo('features')} className="hover:text-[#F5F7FA] transition-colors">
              AI Features
            </button>
            <button onClick={() => handleScrollTo('trust-safety')} className="hover:text-[#F5F7FA] transition-colors">
              Trust & Safety
            </button>
            <button onClick={() => handleScrollTo('faq')} className="hover:text-[#F5F7FA] transition-colors">
              FAQ
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateToLogin}
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onNavigateToRegister}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Get Started
            </Button>
          </div>

        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        
        {/* Top Tag Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111722] border border-[#00F59B]/30 text-[#00F59B] text-xs font-mono mb-8 shadow-neon-green/10 shadow-lg"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>MODERN INDIAN CO-LIVING & SHARED RENT PLATFORM</span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1]"
        >
          Find Your Space. <br />
          <span className="bg-gradient-to-r from-[#00F59B] via-[#00F0FF] to-[#FFD600] bg-clip-text text-transparent">
            Find Your People.
          </span>
        </motion.h1>

        {/* Supporting Text */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="mt-6 text-sm sm:text-lg text-[#929BAA] max-w-2xl mx-auto leading-relaxed"
        >
          RoomSync AI powers verified roommate matching and shared rental intelligence for young professionals in <strong className="text-[#F5F7FA]">Bengaluru</strong>, <strong className="text-[#F5F7FA]">Mumbai</strong>, <strong className="text-[#F5F7FA]">Gurgaon</strong>, and <strong className="text-[#F5F7FA]">Hyderabad</strong>. Match by dietary choices, sleep rhythms, and fair room rent splits with DigiLocker Aadhaar trust badges.
        </motion.p>

        {/* Primary and Secondary CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={onNavigateToRegister}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Find Your Roommate
          </Button>

          <Button
            variant="surface"
            size="lg"
            onClick={onExploreMatches}
            leftIcon={<Compass className="w-4 h-4 text-[#00F0FF]" />}
          >
            Explore Properties & Flatmates
          </Button>
        </motion.div>

        {/* Indian Tech Hub Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-[#929BAA]">
          <span className="px-3 py-1 rounded-full bg-[#111722] border border-[#1E283A] text-[#00F59B]">
            📍 Bengaluru (HSR • Koramangala • Indiranagar)
          </span>
          <span className="px-3 py-1 rounded-full bg-[#111722] border border-[#1E283A] text-[#00F0FF]">
            📍 Mumbai (Powai • Bandra • Andheri)
          </span>
          <span className="px-3 py-1 rounded-full bg-[#111722] border border-[#1E283A] text-[#FFD600]">
            📍 Gurgaon (Cyber City • Golf Course Rd)
          </span>
        </div>

      </section>

      {/* 3. Animated Roommate Compatibility Preview Card */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#111722] via-[#161F2E] to-[#111722] border border-[#00F59B]/35 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#1E283A]">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00F0FF] uppercase mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interactive AI Lifestyle Simulation</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA]">
                Live Roommate Compatibility Radar
              </h2>
              <p className="text-xs text-[#929BAA] mt-1">
                Toggle your lifestyle preferences to test how our multi-dimensional engine matches with Bangalore flatmates.
              </p>
            </div>

            {/* Live Score Display */}
            <div className="flex items-center gap-4 bg-[#06080D] px-6 py-4 rounded-2xl border border-[#00F59B]/40 shadow-neon-green/20 shadow-lg self-start md:self-auto">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#929BAA] block">
                  Simulated Synergy
                </span>
                <span className="text-xs font-semibold text-[#00F59B]">
                  Arjun Mehta (Swiggy, HSR)
                </span>
              </div>
              <div className="text-4xl font-black text-[#00F59B] font-mono">
                {calculatedScore}%
              </div>
            </div>
          </div>

          {/* Interactive Lifestyle Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            
            {/* Diet */}
            <div className="p-4 rounded-xl bg-[#06080D]/70 border border-[#1E283A]">
              <label className="text-xs font-mono text-[#929BAA] block mb-2">Dietary Habit</label>
              <div className="flex flex-wrap gap-1.5">
                {['Pure Veg', 'Eggetarian', 'Non-Veg'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDiet(d)}
                    className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                      diet === d 
                        ? 'bg-[#00F59B] text-[#06080D] font-bold shadow-sm' 
                        : 'bg-[#161F2E] text-[#929BAA] hover:text-[#F5F7FA]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep Routine */}
            <div className="p-4 rounded-xl bg-[#06080D]/70 border border-[#1E283A]">
              <label className="text-xs font-mono text-[#929BAA] block mb-2">Sleep Routine</label>
              <div className="flex flex-wrap gap-1.5">
                {['Early Bird', 'Normal', 'Night Owl'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSleep(s)}
                    className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                      sleep.includes(s)
                        ? 'bg-[#00F0FF] text-[#06080D] font-bold shadow-sm' 
                        : 'bg-[#161F2E] text-[#929BAA] hover:text-[#F5F7FA]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Cleanliness */}
            <div className="p-4 rounded-xl bg-[#06080D]/70 border border-[#1E283A]">
              <label className="text-xs font-mono text-[#929BAA] block mb-2">Hygiene Standard</label>
              <div className="flex gap-2">
                {[3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setClean(lvl)}
                    className={`flex-1 text-xs py-1 rounded-lg transition-all ${
                      clean === lvl 
                        ? 'bg-[#FFD600] text-[#06080D] font-bold shadow-sm' 
                        : 'bg-[#161F2E] text-[#929BAA] hover:text-[#F5F7FA]'
                    }`}
                  >
                    {lvl}★
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="p-4 rounded-xl bg-[#06080D]/70 border border-[#1E283A]">
              <div className="flex items-center justify-between text-xs font-mono text-[#929BAA] mb-2">
                <span>Budget Target</span>
                <span className="text-[#00F59B] font-bold">₹{budget.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="12000"
                max="35000"
                step="1000"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-[#00F59B] cursor-pointer"
              />
            </div>

          </div>

          {/* Live Rationale */}
          <div className="mt-6 p-4 rounded-xl bg-[#06080D] border border-[#1E283A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-[#929BAA] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00F59B] flex-shrink-0" />
              <span>
                <strong className="text-[#F5F7FA]">AI Synergy Analysis:</strong> High alignment on quiet hours past 11 PM, shared cook preference, and rental budget window in HSR Layout Sector 2.
              </span>
            </div>
            <button
              onClick={onExploreMatches}
              className="text-xs font-bold text-[#00F59B] hover:underline whitespace-nowrap flex items-center gap-1"
            >
              <span>Explore Verified Profiles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </motion.div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="cyan" size="md" className="mb-2">
            SIMPLE & INTUITIVE
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F7FA]">
            How RoomSync AI Works
          </h2>
          <p className="text-xs sm:text-sm text-[#929BAA] mt-2">
            A structured three-step journey to finding the right flat, verified flatmates, and fair rent splits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <Card variant="surface" isInteractive className="p-6 relative">
            <div className="w-12 h-12 rounded-2xl bg-[#00F59B]/10 border border-[#00F59B]/30 flex items-center justify-center text-[#00F59B] font-mono font-bold text-lg mb-4">
              01
            </div>
            <h3 className="text-base font-bold text-[#F5F7FA] mb-2">
              Create Lifestyle Profile & Verify
            </h3>
            <p className="text-xs text-[#929BAA] leading-relaxed">
              Define your food habits, sleep rhythm, budget, and desired Bangalore/Mumbai locality. Complete instant DigiLocker Aadhaar verification for maximum trust.
            </p>
          </Card>

          {/* Step 2 */}
          <Card variant="surface" isInteractive className="p-6 relative">
            <div className="w-12 h-12 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF] font-mono font-bold text-lg mb-4">
              02
            </div>
            <h3 className="text-base font-bold text-[#F5F7FA] mb-2">
              Match with AI Compatibility
            </h3>
            <p className="text-xs text-[#929BAA] leading-relaxed">
              Our 6-dimensional matching engine evaluates compatibility scores. View dimensional breakdowns, synergies, and discussion watchouts before connecting.
            </p>
          </Card>

          {/* Step 3 */}
          <Card variant="surface" isInteractive className="p-6 relative">
            <div className="w-12 h-12 rounded-2xl bg-[#FFD600]/10 border border-[#FFD600]/30 flex items-center justify-center text-[#FFD600] font-mono font-bold text-lg mb-4">
              03
            </div>
            <h3 className="text-base font-bold text-[#F5F7FA] mb-2">
              SafeMeet & Settle Rent via UPI
            </h3>
            <p className="text-xs text-[#929BAA] leading-relaxed">
              Chat in-app with Indian roommate icebreakers, schedule a SafeMeet coffee chat, and manage room-based rent splits and utility bills with direct UPI QR codes.
            </p>
          </Card>

        </div>
      </section>

      {/* 5. Key Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#1E283A]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="green" size="md" className="mb-2">
            CORE PLATFORM CAPABILITIES
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F7FA]">
            Built Specifically For Indian Flatsharing Realities
          </h2>
          <p className="text-xs sm:text-sm text-[#929BAA] mt-2">
            Solving the core problems associated with chaotic Facebook groups, unvetted brokers, and roommate conflicts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Feature 1: AI Matching */}
          <Card variant="surface" className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#00F59B]/10 border border-[#00F59B]/30 flex items-center justify-center text-[#00F59B]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F5F7FA]">AI Lifestyle Matrix</h3>
            <p className="text-xs text-[#929BAA] leading-relaxed">
              Matches roommates based on pure veg vs non-veg kitchen tolerance, sleep routine alignment (Early Bird vs Night Owl), hygiene standards, and work rhythms.
            </p>
          </Card>

          {/* Feature 2: Smart Rent Splitting */}
          <Card variant="surface" className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F5F7FA]">Smart Rent & UPI Splitting</h3>
            <p className="text-xs text-[#929BAA] leading-relaxed">
              Master bedroom vs standard bedroom rent division, automated monthly tracking for BESCOM electricity, broadband WiFi, maid salaries, and instant UPI QR payments.
            </p>
          </Card>

          {/* Feature 3: Verified Profiles */}
          <Card variant="surface" className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F5F7FA]">DigiLocker Verified Profiles</h3>
            <p className="text-xs text-[#929BAA] leading-relaxed">
              Eliminate scams with government-backed Aadhaar and PAN verification, plus corporate work domain validation (`@swiggy.in`, `@cred.club`, `@google.com`).
            </p>
          </Card>

          {/* Feature 4: Secure Pre-Move-in Chat */}
          <Card variant="surface" className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD600]/10 border border-[#FFD600]/30 flex items-center justify-center text-[#FFD600]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F5F7FA]">Pre-Move-In In-App Chat</h3>
            <p className="text-xs text-[#929BAA] leading-relaxed">
              Contextual messaging with pre-configured Indian roommate icebreakers regarding kitchen cookware, guest rules, and AC bills before committing to a lease.
            </p>
          </Card>

          {/* Feature 5: SafeMeet Protocol */}
          <Card variant="surface" className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
              <Coffee className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F5F7FA]">SafeMeet Public Protocol</h3>
            <p className="text-xs text-[#929BAA] leading-relaxed">
              Scheduler linking to verified public cafes (Third Wave Coffee, Starbucks, Blue Tokai) across HSR, Koramangala, and Powai for preliminary in-person alignment.
            </p>
          </Card>

          {/* Feature 6: Zero Brokerage */}
          <Card variant="surface" className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#00F59B]/10 border border-[#00F59B]/30 flex items-center justify-center text-[#00F59B]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F5F7FA]">Direct Flatmate & Owner Connect</h3>
            <p className="text-xs text-[#929BAA] leading-relaxed">
              No brokers, no deposit gouging, and no hidden fees. Connect directly with flatmates and verified property owners with total transparency.
            </p>
          </Card>

        </div>
      </section>

      {/* 6. Trust & Safety Section */}
      <section id="trust-safety" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#1E283A]">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#111722]/80 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            <div className="space-y-4">
              <Badge variant="verified" size="md">
                INDIA TRUST & SAFETY FRAMEWORK
              </Badge>
              <h2 className="text-3xl font-extrabold text-[#F5F7FA]">
                Co-Living Built on Authentic Verification
              </h2>
              <p className="text-xs sm:text-sm text-[#929BAA] leading-relaxed">
                Traditional flat-hunting on Facebook and WhatsApp exposes renters to unverified accounts, deposit fraud, and ghosting. RoomSync AI enforces multi-layered verification:
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex-shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#F5F7FA]">Masked Aadhaar Verification</h4>
                    <p className="text-[11px] text-[#929BAA]">
                      Internal document review with OTP verification. Aadhaar is encrypted, masked (XXXXXXXX8921), and never displayed publicly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 flex-shrink-0 mt-0.5">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#F5F7FA]">Corporate Work Domain Validation</h4>
                    <p className="text-[11px] text-[#929BAA]">
                      Confirms employment credentials with Indian tech firms (Swiggy, Razorpay, CRED, Zomato, Microsoft).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#FFD600]/10 text-[#FFD600] border border-[#FFD600]/30 flex-shrink-0 mt-0.5">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#F5F7FA]">SafeMeet Public Protocol</h4>
                    <p className="text-[11px] text-[#929BAA]">
                      Guaranteed public meetup guidelines before any lease agreement or monetary exchange takes place.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual Trust Card */}
            <div className="p-6 rounded-2xl bg-[#06080D] border border-[#1E283A] shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E283A]">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold text-[#F5F7FA]">RoomSync Trust Score</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">95 / 100</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#111722] border border-[#1E283A] flex items-center justify-between">
                  <span className="text-[#929BAA]">DigiLocker Aadhaar ID</span>
                  <span className="text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#111722] border border-[#1E283A] flex items-center justify-between">
                  <span className="text-[#929BAA]">Corporate Work Domain</span>
                  <span className="text-[#00F0FF] font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> swiggy.in
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#111722] border border-[#1E283A] flex items-center justify-between">
                  <span className="text-[#929BAA]">PAN Financial Verification</span>
                  <span className="text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active Record
                  </span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={onNavigateToRegister}
                >
                  Verify Your Profile Now
                </Button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="cyan" size="md" className="mb-2">
            FREQUENTLY ASKED QUESTIONS
          </Badge>
          <h2 className="text-3xl font-extrabold text-[#F5F7FA]">
            Got Questions? We Have Answers.
          </h2>
          <p className="text-xs sm:text-sm text-[#929BAA] mt-2">
            Everything you need to know about roommate matching, rent splitting, and safety.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-[#111722] border border-[#1E283A] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-[#F5F7FA] hover:text-[#00F59B] transition-colors focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#929BAA] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#00F59B]' : ''}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-4 text-xs text-[#929BAA] leading-relaxed border-t border-[#1E283A]/50 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Call to Action Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#111722] via-[#161F2E] to-[#111722] border border-[#00F59B]/40 shadow-neon-green/10 shadow-2xl text-center space-y-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F5F7FA]">
            Find Your Compatible Flatmate Today
          </h2>
          <p className="text-xs sm:text-sm text-[#929BAA] max-w-lg mx-auto">
            Join hundreds of verified software developers, product designers, and professionals in Bangalore, Mumbai, and Gurgaon.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={onNavigateToRegister}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Get Started for Free
            </Button>
            <Button
              variant="surface"
              size="lg"
              onClick={onNavigateToLogin}
            >
              Sign In to Existing Account
            </Button>
          </div>
        </div>
      </section>

      {/* 9. Landing Footer */}
      <footer className="border-t border-[#1E283A] bg-[#06080D] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#111722] border border-[#00F59B]/40 flex items-center justify-center text-[#00F59B]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-[#F5F7FA]">RoomSync AI</span>
              <p className="text-[11px] text-[#929BAA]">Co-Living & Shared Rent Intelligence Platform</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#929BAA]">
            <button onClick={() => handleScrollTo('faq')} className="hover:text-[#F5F7FA] transition-colors">
              Help Center & FAQ
            </button>
            <button onClick={() => alert("Support: support@roomsync.ai • Dedicated Contact Center coming in Phase 5")} className="hover:text-[#F5F7FA] transition-colors">
              Contact Support
            </button>
            <span className="hover:text-[#F5F7FA] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#F5F7FA] cursor-pointer">Terms of Service</span>
          </div>

          <div className="text-[11px] font-mono text-[#5F697A]">
            © 2026 RoomSync Technologies Pvt Ltd.
          </div>

        </div>
      </footer>

    </div>
  );
};
