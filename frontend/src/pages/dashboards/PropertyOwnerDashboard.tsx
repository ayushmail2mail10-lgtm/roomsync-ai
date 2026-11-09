import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Plus,
  Users,
  IndianRupee,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  BedDouble,
  ShieldCheck,
  AlertCircle,
  Eye,
  Check,
  X,
  ChevronRight,
  TrendingUp,
  FileText,
  Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { PropertyListing, TenantApplication } from '../../types';

interface PropertyOwnerDashboardProps {
  onNavigate?: (tab: string) => void;
  onOpenChatWith?: (match: any) => void;
}

export const PropertyOwnerDashboard: React.FC<PropertyOwnerDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  // Initial realistic sample properties for owner (e.g. Bangalore & Mumbai listings)
  const [properties, setProperties] = useState<PropertyListing[]>([
    {
      id: 101,
      title: "Prestige Silver Oak - Luxury 3 BHK",
      city: "Bengaluru",
      neighborhood: "Whitefield / ITPL Main Rd",
      property_type: "3 BHK Luxury Apartment",
      total_bedrooms: 3,
      available_bedrooms: 1,
      monthly_rent: 45000,
      deposit_amount: 150000,
      furnishing_status: "Fully Furnished",
      amenities: ["Swimming Pool", "Gym", "High-speed Wi-Fi", "100% Power Backup", "Covered Parking", "Cook Service"],
      image_urls: [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80"
      ],
      preferred_gender: "Any",
      food_preference: "Flexible",
      status: "active",
      applications_count: 3
    },
    {
      id: 102,
      title: "Hiranandani Gardens - Regent Hill 2 BHK",
      city: "Mumbai",
      neighborhood: "Powai",
      property_type: "2 BHK High-Rise",
      total_bedrooms: 2,
      available_bedrooms: 0,
      monthly_rent: 62000,
      deposit_amount: 200000,
      furnishing_status: "Semi Furnished",
      amenities: ["Clubhouse", "Lake View Balcony", "Piped Gas", "Security 24/7"],
      image_urls: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80"
      ],
      preferred_gender: "Working Professionals",
      food_preference: "Vegetarian Preferred",
      status: "occupied",
      applications_count: 0
    }
  ]);

  // Initial tenant applications awaiting owner decision
  const [applications, setApplications] = useState<TenantApplication[]>([
    {
      id: 201,
      listing_id: 101,
      applicant_id: 2,
      applicant_name: "Rohan Verma",
      applicant_email: "rohan.verma@roomsync.ai",
      applicant_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      applicant_occupation: "Backend Platform Engineer",
      applicant_company: "Razorpay",
      compatibility_score: 94,
      status: "pending",
      applied_at: "2026-11-08T10:30:00Z",
      message: "Looking for immediate move-in. Clean, non-smoker, hybrid work schedule. Verified on Razorpay domain.",
      budget_max: 25000,
      trust_score: 92
    },
    {
      id: 202,
      listing_id: 101,
      applicant_id: 4,
      applicant_name: "Ananya Sharma",
      applicant_email: "ananya.sharma@roomsync.ai",
      applicant_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      applicant_occupation: "Product Designer",
      applicant_company: "CRED",
      compatibility_score: 91,
      status: "pending",
      applied_at: "2026-11-07T14:15:00Z",
      message: "Passionate about keeping home quiet and clean. Need dedicated space for remote work.",
      budget_max: 28000,
      trust_score: 94
    }
  ]);

  // Add Property Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCity, setNewCity] = useState('Bengaluru');
  const [newLocality, setNewLocality] = useState('');
  const [newRent, setNewRent] = useState('');
  const [newDeposit, setNewDeposit] = useState('');
  const [newBedrooms, setNewBedrooms] = useState('3');
  const [newAvailable, setNewAvailable] = useState('1');
  const [newFurnishing, setNewFurnishing] = useState<'Fully Furnished' | 'Semi Furnished' | 'Unfurnished'>('Fully Furnished');

  // Stats calculation
  const totalProperties = properties.length;
  const activeListings = properties.filter(p => p.status === 'active').length;
  const totalRooms = properties.reduce((acc, p) => acc + p.total_bedrooms, 0);
  const vacantRooms = properties.reduce((acc, p) => acc + p.available_bedrooms, 0);
  const occupiedRooms = totalRooms - vacantRooms;
  const totalMonthlyRent = properties.reduce((acc, p) => acc + p.monthly_rent, 0);
  const pendingAppsCount = applications.filter(a => a.status === 'pending').length;

  const handleApplicationAction = (appId: number, decision: 'accepted' | 'rejected') => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: decision } : a));
  };

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newRent) return;

    const newProp: PropertyListing = {
      id: Date.now(),
      title: newTitle.trim(),
      city: newCity,
      neighborhood: newLocality.trim() || 'HSR Layout Sector 1',
      property_type: `${newBedrooms} BHK Apartment`,
      total_bedrooms: Number(newBedrooms),
      available_bedrooms: Number(newAvailable),
      monthly_rent: Number(newRent),
      deposit_amount: Number(newDeposit) || Number(newRent) * 3,
      furnishing_status: newFurnishing,
      amenities: ["Wi-Fi", "Power Backup", "Security 24/7"],
      image_urls: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80"
      ],
      preferred_gender: "Any",
      food_preference: "Flexible",
      status: Number(newAvailable) > 0 ? 'active' : 'occupied',
      applications_count: 0
    };

    setProperties([newProp, ...properties]);
    setIsAddModalOpen(false);
    // Reset form
    setNewTitle('');
    setNewRent('');
    setNewDeposit('');
    setNewLocality('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#1E283A]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F0FF]/20 to-[#00F0FF]/5 border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF] shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#F5F7FA] flex items-center gap-2">
                Property Owner Portfolio
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 uppercase">
                  Verified Landlord
                </span>
              </h1>
              <p className="text-xs text-[#929BAA] font-mono mt-0.5">
                Manage listings, review AI compatibility scores of tenant applicants, and track rent collection.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 text-xs"
          >
            <Plus className="w-4 h-4" />
            Add New Property Listing
          </Button>
        </div>
      </div>

      {/* Summary KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between text-xs text-[#929BAA] mb-1">
            <span>Portfolio Size</span>
            <Building2 className="w-4 h-4 text-[#00F0FF]" />
          </div>
          <div className="text-2xl font-black text-[#F5F7FA] font-mono">
            {totalProperties}
          </div>
          <div className="text-[10px] text-[#00F59B] mt-1 font-mono">
            {activeListings} Active Listings
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between text-xs text-[#929BAA] mb-1">
            <span>Occupancy Rate</span>
            <BedDouble className="w-4 h-4 text-[#00F59B]" />
          </div>
          <div className="text-2xl font-black text-[#00F59B] font-mono">
            {Math.round((occupiedRooms / (totalRooms || 1)) * 100)}%
          </div>
          <div className="text-[10px] text-[#929BAA] mt-1 font-mono">
            {occupiedRooms} Occupied / {totalRooms} Total
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between text-xs text-[#929BAA] mb-1">
            <span>Vacant Bedrooms</span>
            <span className="w-2 h-2 rounded-full bg-[#FFD600] animate-pulse"></span>
          </div>
          <div className="text-2xl font-black text-[#FFD600] font-mono">
            {vacantRooms}
          </div>
          <div className="text-[10px] text-[#929BAA] mt-1 font-mono">
            Available for Rent
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between text-xs text-[#929BAA] mb-1">
            <span>Monthly Rent Yield</span>
            <IndianRupee className="w-4 h-4 text-[#00F59B]" />
          </div>
          <div className="text-2xl font-black text-[#F5F7FA] font-mono">
            ₹{(totalMonthlyRent / 1000).toFixed(0)}k
          </div>
          <div className="text-[10px] text-[#929BAA] mt-1 font-mono">
            Direct UPI to your account
          </div>
        </Card>

        <Card variant="glass" className="p-4 border-[#00F0FF]/30">
          <div className="flex items-center justify-between text-xs text-[#929BAA] mb-1">
            <span>Pending Applications</span>
            <Users className="w-4 h-4 text-[#00F0FF]" />
          </div>
          <div className="text-2xl font-black text-[#00F0FF] font-mono">
            {pendingAppsCount}
          </div>
          <div className="text-[10px] text-[#929BAA] mt-1 font-mono">
            Awaiting your review
          </div>
        </Card>
      </div>

      {/* Main Content Grid: Applications & Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Tenant Applications & Property List */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: Pending Tenant Applications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#F5F7FA] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00F59B]" />
                Tenant Applications & AI Compatibility Review
              </h2>
              <span className="text-xs font-mono text-[#929BAA]">
                {applications.filter(a => a.status === 'pending').length} Action Required
              </span>
            </div>

            <div className="space-y-3">
              {applications.map((app) => (
                <Card key={app.id} variant="glass" className="p-5 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={app.applicant_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                        alt={app.applicant_name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#1E283A]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#F5F7FA]">{app.applicant_name}</h4>
                          <span className="px-1.5 py-0.2 rounded bg-[#00F59B]/10 text-[#00F59B] text-[10px] font-mono flex items-center gap-0.5">
                            <Sparkles className="w-3 h-3" /> {app.compatibility_score}% AI Synergy
                          </span>
                        </div>
                        <p className="text-xs text-[#929BAA]">
                          {app.applicant_occupation} • <span className="text-[#00F0FF]">{app.applicant_company}</span>
                        </p>
                        <div className="flex items-center gap-3 text-[11px] font-mono text-[#5F697A] mt-1">
                          <span>Max Budget: ₹{app.budget_max.toLocaleString('en-IN')}/mo</span>
                          <span>•</span>
                          <span className="text-[#00F59B]">Trust Score: {app.trust_score}/100</span>
                        </div>
                      </div>
                    </div>

                    {/* Decision Actions */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {app.status === 'pending' ? (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApplicationAction(app.id, 'accepted')}
                            className="text-xs flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" /> Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApplicationAction(app.id, 'rejected')}
                            className="text-xs text-red-400 border-red-500/30 hover:bg-red-500/10 flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" /> Decline
                          </Button>
                        </>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold capitalize ${
                          app.status === 'accepted'
                            ? 'bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}>
                          {app.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {app.message && (
                    <div className="mt-3 pt-3 border-t border-[#1E283A] text-xs text-[#929BAA] bg-[#06080D]/40 p-2.5 rounded-lg">
                      <span className="text-[#5F697A] font-mono">Applicant note: </span>
                      "{app.message}"
                    </div>
                  )}
                </Card>
              ))}

              {applications.length === 0 && (
                <div className="py-8 text-center text-xs text-[#929BAA] bg-[#111722] rounded-2xl border border-[#1E283A]">
                  No tenant applications at the moment.
                </div>
              )}
            </div>
          </div>

          {/* Section: My Property Listings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#F5F7FA] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00F0FF]" />
                My Rental Listings ({properties.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {properties.map((prop) => (
                <Card key={prop.id} variant="glass" className="overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative h-40 w-full overflow-hidden">
                      <img
                        src={prop.image_urls[0]}
                        alt={prop.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          prop.status === 'active'
                            ? 'bg-[#00F59B] text-[#06080D]'
                            : 'bg-[#1E283A] text-[#929BAA]'
                        }`}>
                          {prop.status}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-[#06080D]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#1E283A] text-xs font-bold text-[#00F59B] font-mono">
                        ₹{prop.monthly_rent.toLocaleString('en-IN')}/mo
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="text-sm font-bold text-[#F5F7FA] leading-snug">{prop.title}</h3>
                      <p className="text-xs text-[#929BAA] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#00F0FF]" />
                        {prop.neighborhood}, {prop.city}
                      </p>

                      <div className="pt-2 flex items-center justify-between text-xs font-mono text-[#929BAA] border-t border-[#1E283A]">
                        <span>Bedrooms: {prop.total_bedrooms} BHK</span>
                        <span className={prop.available_bedrooms > 0 ? 'text-[#FFD600]' : 'text-[#00F59B]'}>
                          {prop.available_bedrooms > 0 ? `${prop.available_bedrooms} Room Vacant` : 'Fully Occupied'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => alert(`Managing listing: ${prop.title}`)}
                    >
                      Manage Property & Tenants
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

        </div>

        {/* Right Col: Property Owner Utilities & Guidelines */}
        <div className="space-y-6">
          
          {/* Quick Stats Card */}
          <Card variant="glass" className="p-5 border-[#00F59B]/20">
            <h3 className="text-sm font-bold text-[#F5F7FA] mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00F59B]" />
              Owner Financial Overview
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#1E283A]">
                <span className="text-[#929BAA]">Expected Gross Rent</span>
                <span className="font-mono text-[#F5F7FA] font-bold">₹{totalMonthlyRent.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#1E283A]">
                <span className="text-[#929BAA]">Deposits Held</span>
                <span className="font-mono text-[#00F59B] font-bold">₹3,50,000</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#1E283A]">
                <span className="text-[#929BAA]">Next Payout Date</span>
                <span className="font-mono text-[#00F0FF]">5th Dec 2026</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#929BAA]">Direct UPI Account</span>
                <span className="font-mono text-[#FFD600]">sneha.k@icici</span>
              </div>
            </div>
          </Card>

          {/* Verification Assurance */}
          <Card variant="glass" className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#00F59B]/10 border border-[#00F59B]/30 flex items-center justify-center text-[#00F59B]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F5F7FA]">RoomSync Landlord Guarantee</h4>
                <p className="text-[11px] text-[#929BAA]">100% Aadhaar & Employment Verified Tenants</p>
              </div>
            </div>
            <p className="text-xs text-[#929BAA] leading-relaxed">
              Every tenant applicant is pre-screened with UIDAI masked Aadhaar validation, corporate work email verification, and behavioural compatibility scoring to minimize default risk and flat disputes.
            </p>
          </Card>

        </div>

      </div>

      {/* Add Property Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Rental Listing"
        description="List an apartment or individual vacant rooms for verified tech tenants"
      >
        <form onSubmit={handleCreateProperty} className="space-y-4">
          <Input
            label="Property Name / Title"
            placeholder="e.g. Sobha Dream Acres 3 BHK"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#929BAA] mb-1">City</label>
              <select
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="w-full bg-[#06080D] border border-[#1E283A] rounded-xl px-3 py-2 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#00F59B]"
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Gurgaon">Gurgaon</option>
                <option value="Pune">Pune</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>
            <Input
              label="Locality / Sector"
              placeholder="e.g. HSR Sector 2"
              value={newLocality}
              onChange={(e) => setNewLocality(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Monthly Rent (₹)"
              type="number"
              placeholder="e.g. 45000"
              value={newRent}
              onChange={(e) => setNewRent(e.target.value)}
              required
            />
            <Input
              label="Security Deposit (₹)"
              type="number"
              placeholder="e.g. 150000"
              value={newDeposit}
              onChange={(e) => setNewDeposit(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#929BAA] mb-1">Total Rooms</label>
              <select
                value={newBedrooms}
                onChange={(e) => setNewBedrooms(e.target.value)}
                className="w-full bg-[#06080D] border border-[#1E283A] rounded-xl px-3 py-2 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#00F59B]"
              >
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#929BAA] mb-1">Vacant Rooms</label>
              <select
                value={newAvailable}
                onChange={(e) => setNewAvailable(e.target.value)}
                className="w-full bg-[#06080D] border border-[#1E283A] rounded-xl px-3 py-2 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#00F59B]"
              >
                <option value="1">1 Vacant</option>
                <option value="2">2 Vacant</option>
                <option value="3">3 Vacant</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#929BAA] mb-1">Furnishing</label>
              <select
                value={newFurnishing}
                onChange={(e) => setNewFurnishing(e.target.value as any)}
                className="w-full bg-[#06080D] border border-[#1E283A] rounded-xl px-3 py-2 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#00F59B]"
              >
                <option value="Fully Furnished">Fully Furnished</option>
                <option value="Semi Furnished">Semi Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-[#1E283A]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Publish Listing
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
