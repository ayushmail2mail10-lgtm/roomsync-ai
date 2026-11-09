import React, { useState } from 'react';
import { IndianRupee, Plus, Receipt } from 'lucide-react';
import { Modal } from '../common/Modal';
import { FlatMember } from '../../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
  members: FlatMember[];
  onAddExpense: (expenseData: any) => Promise<void>;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  groupId,
  members,
  onAddExpense
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Utilities');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Electricity',
    'WiFi',
    'Maid/Cook',
    'Groceries',
    'Maintenance',
    'Rent',
    'Miscellaneous'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title || isNaN(numAmount) || numAmount <= 0) return;

    setIsSubmitting(true);
    try {
      await onAddExpense({
        group_id: groupId,
        title,
        category,
        total_amount: numAmount,
        split_type: splitType
      });
      setTitle('');
      setAmount('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Shared Apartment Expense"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Title */}
        <div>
          <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
            Expense Title
          </label>
          <input
            type="text"
            placeholder="e.g. BESCOM Electricity (Nov) or Blinkit Groceries"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-green"
          />
        </div>

        {/* Category & Amount */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white focus:outline-none focus:border-neon-cyan"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
              Total Amount (₹)
            </label>
            <div className="relative">
              <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                placeholder="0"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-green font-mono"
              />
            </div>
          </div>
        </div>

        {/* Split Breakdown Preview */}
        <div className="p-3 rounded-xl bg-dark-850/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Split Equally Between ({members.length || 3} Flatmates):</span>
            <span className="font-mono text-neon-green font-bold">
              ₹{amount && !isNaN(parseFloat(amount)) ? (parseFloat(amount) / (members.length || 3)).toFixed(2) : '0.00'}/each
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {members.map((m) => (
              <span key={m.id} className="text-[10px] px-2 py-0.5 rounded-md bg-dark-800 text-slate-300 border border-slate-700">
                {m.full_name || 'Flatmate'}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-neon-green hover:bg-[#05ffa1] shadow-neon-green/30 shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{isSubmitting ? 'Adding...' : 'Add Expense & Split'}</span>
          </button>
        </div>

      </form>
    </Modal>
  );
};
