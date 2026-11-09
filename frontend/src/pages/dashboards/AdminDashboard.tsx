import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Users,
  Building,
  KeyRound,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Activity,
  Sliders,
  ShieldCheck,
  ExternalLink,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AdminMetrics, AdminUserItem, AdminReportItem } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface AdminDashboardProps {
  onNavigate?: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [reports, setReports] = useState<AdminReportItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'users' | 'verifications' | 'reports' | 'system'>('users');

  const fetchAdminData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [m, u, r] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminUsers(),
        api.getAdminReports(),
      ]);
      setMetrics(m);
      setUsers(u);
      setReports(r);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      setError(err.message || 'Unauthorized or failed to connect to administrative API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUser = async (userId: number) => {
    try {
      const res = await api.toggleUserStatus(userId);
      setActionSuccess(res.message);
      // Refresh local users list
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: res.is_active } : u));
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to toggle user status');
    }
  };

  const handleApproveVerification = async (userId: number) => {
    try {
      const res = await api.approveVerification(userId);
      setActionSuccess(res.message);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, aadhaar_verified: true, trust_score: res.trust_score } : u));
      if (metrics) {
        setMetrics({
          ...metrics,
          pending_verifications_count: Math.max(0, metrics.pending_verifications_count - 1),
          verified_users_count: metrics.verified_users_count + 1
        });
      }
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to approve verification');
    }
  };

  // If user is not admin, show strict 403 Forbidden screen
  if (user && user.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Card variant="glass" className="border-red-500/40 bg-red-950/10 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-red-400">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#F5F7FA] mb-2 font-mono">
            403 Forbidden: Administrator Privilege Required
          </h2>
          <p className="text-sm text-[#929BAA] max-w-lg mx-auto mb-6">
            The authenticated account <span className="text-[#F5F7FA] font-mono">({user.email})</span> holds the role <span className="text-[#00F0FF] font-mono font-bold">"{user.role}"</span>. Administrative endpoints are strictly locked by backend dependency <code className="text-xs bg-[#161F2E] px-2 py-0.5 rounded text-[#00F59B]">require_admin</code>.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111722] border border-[#1E283A] text-xs font-mono text-[#929BAA]">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            Backend Authorization Enforced • Token Tamper Protected
          </div>
        </Card>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    const matchQuery = !searchQuery || 
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && u.is_active) || 
      (statusFilter === 'suspended' && !u.is_active) ||
      (statusFilter === 'unverified' && !u.aadhaar_verified);
    return matchQuery && matchRole && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#1E283A]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFD600]/20 to-[#FFD600]/5 border border-[#FFD600]/40 flex items-center justify-center text-[#FFD600] shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#F5F7FA] flex items-center gap-2">
                RoomSync Security & Admin Center
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFD600]/15 text-[#FFD600] border border-[#FFD600]/30 uppercase">
                  Superadmin
                </span>
              </h1>
              <p className="text-xs text-[#929BAA] font-mono mt-0.5">
                Backend RBAC Protected • Real-time Platform Telemetry & KYC Moderation
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAdminData}
            disabled={isLoading}
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </Button>
          <div className="px-3 py-1 rounded-lg bg-[#00F59B]/10 border border-[#00F59B]/30 text-[#00F59B] text-xs font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00F59B] animate-pulse"></span>
            System Live
          </div>
        </div>
      </div>

      {/* Action Notifications */}
      {actionSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-[#00F59B]/10 border border-[#00F59B]/40 text-[#00F59B] text-xs flex items-center justify-between font-mono"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-[#929BAA] hover:text-[#F5F7FA]">✕</button>
        </motion.div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-[#929BAA] hover:text-[#F5F7FA]">✕</button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card variant="glass" className="p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[#929BAA] mb-1">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-[#00F59B]" />
          </div>
          <div className="text-2xl font-black text-[#F5F7FA] font-mono">
            {metrics?.total_users ?? (isLoading ? '...' : 0)}
          </div>
          <div className="text-[10px] text-[#929BAA] mt-1 font-mono">
            Active Indian Users
          </div>
        </Card>

        <Card variant="glass" className="p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[#929BAA] mb-1">
            <span>Room Seekers</span>
            <span className="w-2 h-2 rounded-full bg-[#00F0FF]"></span>
          </div>
          <div className="text-2xl font-black text-[#00F0FF] font-mono">
            {metrics?.tenants_count ?? 0}
          </div>
          <div className="text-[10px] text-[#929BAA] mt-1 font-mono">
            Tenants Looking
          </div>
        </Card>

        <Card variant="glass" className="p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[#929BAA] mb-1">
            <span>Property Owners</span>
            <Building className="w-4 h-4 text-[#FFD600]" />
          </div>
          <div className="text-2xl font-black text-[#FFD600] font-mono">
            {metrics?.property_owners_count ?? 0}
          </div>
          <div className="text-[10px] text-[#929BAA] mt-1 font-mono">
            Verified Landlords
          </div>
        </Card>

        <Card variant="glass" className="p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[#929BAA] mb-1">
            <span>Primary Flatmates</span>
            <KeyRound className="w-4 h-4 text-[#00F59B]" />
          </div>
          <div className="text-2xl font-black text-[#00F59B] font-mono">
            {metrics?.flat_owners_count ?? 0}
          </div>
          <div className="text-[10px] text-[#929BAA] mt-1 font-mono">
            Flats with Vacancy
          </div>
        </Card>

        <Card variant="glass" className="p-4 relative overflow-hidden border-orange-500/20">
          <div className="flex items-center justify-between text-xs text-[#929BAA] mb-1">
            <span>Pending KYC</span>
            <FileCheck className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-orange-400 font-mono">
            {metrics?.pending_verifications_count ?? 0}
          </div>
          <div className="text-[10px] text-[#929BAA] mt-1 font-mono">
            Internal Review Queue
          </div>
        </Card>

        <Card variant="glass" className="p-4 relative overflow-hidden border-red-500/20">
          <div className="flex items-center justify-between text-xs text-[#929BAA] mb-1">
            <span>Audit Reports</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400 font-mono">
            {metrics?.total_reports_count ?? 0}
          </div>
          <div className="text-[10px] text-[#929BAA] mt-1 font-mono">
            Flagged Incidents
          </div>
        </Card>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-2 border-b border-[#1E283A] pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'users'
              ? 'bg-[#161F2E] text-[#00F59B] border border-[#00F59B]/40 shadow-sm'
              : 'text-[#929BAA] hover:text-[#F5F7FA] hover:bg-[#111722]'
          }`}
        >
          User Accounts & Access ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('verifications')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'verifications'
              ? 'bg-[#161F2E] text-[#00F0FF] border border-[#00F0FF]/40 shadow-sm'
              : 'text-[#929BAA] hover:text-[#F5F7FA] hover:bg-[#111722]'
          }`}
        >
          KYC & Identity Verification ({metrics?.pending_verifications_count ?? 0})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'reports'
              ? 'bg-[#161F2E] text-red-400 border border-red-500/40 shadow-sm'
              : 'text-[#929BAA] hover:text-[#F5F7FA] hover:bg-[#111722]'
          }`}
        >
          Moderation & Flagged Reports ({reports.length})
        </button>
      </div>

      {/* TAB 1: USER ACCOUNTS & ACCESS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#111722] p-3 rounded-2xl border border-[#1E283A]">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#929BAA] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or city..."
                className="w-full bg-[#06080D] border border-[#1E283A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#00F59B]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-[#06080D] border border-[#1E283A] rounded-xl px-3 py-2 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#00F59B]"
              >
                <option value="all">All Roles</option>
                <option value="tenant">Tenants (Room Seekers)</option>
                <option value="property_owner">Property Owners</option>
                <option value="flat_owner">Existing Flat Owners</option>
                <option value="admin">Administrators</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#06080D] border border-[#1E283A] rounded-xl px-3 py-2 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#00F59B]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
                <option value="unverified">Aadhaar Pending</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#1E283A] bg-[#111722]">
            <table className="w-full text-left text-xs text-[#929BAA]">
              <thead className="bg-[#0D131F] text-[#F5F7FA] border-b border-[#1E283A] uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Trust Score</th>
                  <th className="py-3 px-4">Aadhaar KYC</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E283A]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#161F2E]/60 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold text-[#F5F7FA] flex items-center gap-1.5">
                          {u.full_name}
                          {u.id === user?.id && (
                            <span className="text-[9px] bg-[#00F59B]/10 text-[#00F59B] px-1.5 py-0.2 rounded font-mono">You</span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-[#929BAA]">{u.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold capitalize ${
                        u.role === 'admin' 
                          ? 'bg-[#FFD600]/15 text-[#FFD600] border border-[#FFD600]/30'
                          : u.role === 'property_owner'
                          ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30'
                          : u.role === 'flat_owner'
                          ? 'bg-[#00F59B]/15 text-[#00F59B] border border-[#00F59B]/30'
                          : 'bg-[#929BAA]/15 text-[#F5F7FA] border border-[#929BAA]/30'
                      }`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px]">
                      {u.neighborhood}, {u.city}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-[#00F59B] font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {u.trust_score}/100
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {u.aadhaar_verified ? (
                        <span className="inline-flex items-center gap-1 text-[#00F59B] font-mono text-[10px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-orange-400 font-mono text-[10px]">
                          <XCircle className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {u.is_active ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/30 text-[10px] font-mono">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-mono">
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {!u.aadhaar_verified && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveVerification(u.id)}
                          className="text-[10px] py-1 px-2.5 h-auto text-[#00F0FF] border-[#00F0FF]/30 hover:bg-[#00F0FF]/10"
                        >
                          Verify Identity
                        </Button>
                      )}
                      {u.id !== user?.id && (
                        <Button
                          variant={u.is_active ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => handleToggleUser(u.id)}
                          className={`text-[10px] py-1 px-2.5 h-auto ${
                            u.is_active 
                              ? 'text-red-400 border-red-500/30 hover:bg-red-500/10' 
                              : 'bg-[#00F59B] text-[#06080D]'
                          }`}
                        >
                          {u.is_active ? 'Suspend' : 'Reactivate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: KYC VERIFICATIONS */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#111722] border border-[#1E283A] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#F5F7FA]">Government ID & Work Verification Queue</h3>
              <p className="text-xs text-[#929BAA]">
                Review manual Aadhaar masked uploads and institutional work domain authentications.
              </p>
            </div>
            <Badge variant="warning">
              {users.filter(u => !u.aadhaar_verified).length} Awaiting Verification
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.filter(u => !u.aadhaar_verified).map((u) => (
              <Card key={u.id} variant="glass" className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30 uppercase font-bold">
                      Aadhaar Review
                    </span>
                    <span className="text-xs text-[#929BAA] font-mono">ID #{u.id}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#F5F7FA]">{u.full_name}</h4>
                  <p className="text-xs text-[#929BAA] font-mono">{u.email}</p>
                  
                  <div className="mt-4 space-y-1.5 text-xs text-[#929BAA] border-t border-[#1E283A] pt-3">
                    <div className="flex justify-between">
                      <span>Role:</span>
                      <span className="text-[#F5F7FA] capitalize">{u.role.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>City:</span>
                      <span className="text-[#F5F7FA]">{u.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Work Email:</span>
                      <span className={u.work_email_verified ? 'text-[#00F59B]' : 'text-[#929BAA]'}>
                        {u.work_email_verified ? 'Domain Verified' : 'Not Provided'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#1E283A] flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => handleApproveVerification(u.id)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    Approve KYC
                  </Button>
                </div>
              </Card>
            ))}

            {users.filter(u => !u.aadhaar_verified).length === 0 && (
              <div className="col-span-full py-12 text-center text-[#929BAA] bg-[#111722] rounded-2xl border border-[#1E283A]">
                <CheckCircle2 className="w-10 h-10 text-[#00F59B] mx-auto mb-2 opacity-80" />
                <p className="text-sm font-medium text-[#F5F7FA]">All users are verified!</p>
                <p className="text-xs text-[#929BAA]">Zero pending identity documents in the verification queue.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MODERATION & REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#111722] border border-[#1E283A] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#F5F7FA]">Trust & Safety Incident Log</h3>
              <p className="text-xs text-[#929BAA]">
                Community reports submitted via chat, SafeMeet, and listing complaints.
              </p>
            </div>
            <Badge variant="outline">
              {reports.length} Incidents Logged
            </Badge>
          </div>

          <div className="space-y-3">
            {reports.map((rep) => (
              <Card key={rep.id} variant="glass" className="p-4 border-l-4 border-l-red-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 uppercase font-bold">
                      {rep.action_type}
                    </span>
                    <span className="text-xs font-bold text-[#F5F7FA]">{rep.reason}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#929BAA]">
                    {new Date(rep.created_at).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-[#929BAA] mb-3">
                  {rep.description || 'No additional narrative details provided by reporter.'}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono pt-3 border-t border-[#1E283A]">
                  <div>
                    <span className="text-[#929BAA]">Reported by: </span>
                    <span className="text-[#00F0FF]">{rep.reporter_name}</span>
                  </div>
                  <div>
                    <span className="text-[#929BAA]">Target Account: </span>
                    <span className="text-[#FFD600]">{rep.target_name} ({rep.target_role})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={rep.target_is_active ? 'text-[#00F59B]' : 'text-red-400'}>
                      {rep.target_is_active ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}

            {reports.length === 0 && (
              <div className="py-12 text-center text-[#929BAA] bg-[#111722] rounded-2xl border border-[#1E283A]">
                <ShieldCheck className="w-10 h-10 text-[#00F59B] mx-auto mb-2 opacity-80" />
                <p className="text-sm font-medium text-[#F5F7FA]">Platform Reputation Clean</p>
                <p className="text-xs text-[#929BAA]">Zero safety reports or abuse flags registered.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
