import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Building2, 
  IndianRupee, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Filter, 
  ArrowRight,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FlatGroup, Expense, FlatMember } from '../types';
import { RentSplitter } from '../components/expenses/RentSplitter';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { UpiPaymentModal } from '../components/expenses/UpiPaymentModal';

export const ExpensesPage: React.FC = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<FlatGroup[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isUpiOpen, setIsUpiOpen] = useState(false);
  const [pendingSplitId, setPendingSplitId] = useState<number | null>(null);

  const fetchExpensesData = async () => {
    try {
      const grpData = await api.getGroups();
      setGroups(grpData);
      if (grpData.length > 0) {
        const expData = await api.getGroupExpenses(grpData[0].id);
        setExpenses(expData);
      }
    } catch (e) {
      console.error("Error fetching expenses:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesData();
  }, []);

  const activeGroup = groups[0] || null;

  const handlePayRentOrBill = async (payeeName: string, payeeUpi: string, amount: number, splitId?: number) => {
    setPendingSplitId(splitId || null);
    try {
      const res = await api.generateUpiQr({
        payee_upi: payeeUpi,
        payee_name: payeeName,
        amount: amount,
        note: "RoomSync Rent/Expense Settlement"
      });
      setPaymentData(res);
      setIsUpiOpen(true);
    } catch (err) {
      console.error("UPI generation failed:", err);
    }
  };

  const handleConfirmUpiSettlement = async (utrRef: string) => {
    if (pendingSplitId) {
      await api.markSplitPaid(pendingSplitId, utrRef);
      await fetchExpensesData();
    }
  };

  const handleAddExpense = async (data: any) => {
    if (activeGroup) {
      await api.addExpense(activeGroup.id, data);
      await fetchExpensesData();
    }
  };

  const categories = ['All', 'Electricity', 'WiFi', 'Maid/Cook', 'Groceries', 'Maintenance', 'Rent'];
  const filteredExpenses = activeCategory === 'All'
    ? expenses
    : expenses.filter(e => e.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 text-xs font-mono mb-2">
            <Receipt className="w-3.5 h-3.5" />
            <span>INDIAN UPI & EXPENSE LEDGER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Rent & Shared Bills Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Fair apartment rent splitting, room premiums, BESCOM electricity, cook salary, and instant UPI settlement.
          </p>
        </div>

        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-neon-green hover:bg-[#05ffa1] shadow-neon-green/30 shadow-md transition-all flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Shared Expense</span>
        </button>
      </div>

      {/* 1. Apartment Master Rent Splitter Component */}
      {activeGroup && (
        <RentSplitter
          group={activeGroup}
          currentUserId={user?.id || 1}
          onPayRent={(member) => handlePayRentOrBill(member.full_name || 'Landlord', member.upi_id || 'landlord@upi', member.monthly_rent_share)}
        />
      )}

      {/* 2. Utility & Shared Expenses Section */}
      <div className="p-6 rounded-2xl bg-dark-900 border border-slate-800 shadow-2xl space-y-6">
        
        {/* Subheader & Category Filter Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-neon-cyan" />
              <span>Shared Utility & Groceries Ledger</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live ledger of who paid what and individual shares owed.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                  activeCategory === c
                    ? 'bg-neon-cyan text-black font-bold'
                    : 'bg-dark-850 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Expenses Table / Cards */}
        {filteredExpenses.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No expenses recorded in this category yet. Click "Add Shared Expense" to record a bill.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((exp) => {
              const mySplit = exp.splits.find(s => s.user_id === user?.id);
              const isPaidByMe = exp.paid_by_id === user?.id;

              return (
                <div
                  key={exp.id}
                  className="p-4 rounded-xl bg-dark-850/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-xl bg-dark-900 border border-slate-750 text-xs font-mono text-neon-green">
                      {exp.category}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{exp.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-mono text-slate-300">
                          Total: ₹{exp.total_amount.toLocaleString('en-IN')}
                        </span>
                        <span>•</span>
                        <span>Paid by <strong className="text-white">{isPaidByMe ? 'You' : exp.paid_by_name}</strong></span>
                        <span>•</span>
                        <span>{new Date(exp.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Individual Split Status for Roommates */}
                  <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="flex items-center gap-2">
                      {exp.splits.map((s) => (
                        <span
                          key={s.id}
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-mono ${
                            s.is_paid
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                          title={`${s.user_name}: ₹${s.amount_owed} (${s.is_paid ? 'Paid' : 'Pending'})`}
                        >
                          {s.user_name?.split(' ')[0]}: {s.is_paid ? 'Paid' : `₹${s.amount_owed}`}
                        </span>
                      ))}
                    </div>

                    {/* Pay Button for Current User */}
                    {mySplit && (
                      <div>
                        {!mySplit.is_paid ? (
                          <button
                            onClick={() => handlePayRentOrBill(exp.paid_by_name || 'Roommate', 'roommate@upi', mySplit.amount_owed, mySplit.id)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-black bg-neon-cyan hover:bg-[#38f8ff] shadow-sm transition-all flex items-center gap-1"
                          >
                            <span>Pay ₹{mySplit.amount_owed.toLocaleString('en-IN')} via UPI</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-neon-green font-mono bg-neon-green/10 px-2.5 py-1 rounded-lg border border-neon-green/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Your Share Settled</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        groupId={activeGroup?.id || 1}
        members={activeGroup?.members || []}
        onAddExpense={handleAddExpense}
      />

      <UpiPaymentModal
        isOpen={isUpiOpen}
        onClose={() => setIsUpiOpen(false)}
        paymentData={paymentData}
        onConfirmSettlement={handleConfirmUpiSettlement}
      />

    </div>
  );
};
